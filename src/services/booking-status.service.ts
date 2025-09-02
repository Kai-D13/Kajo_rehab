import { supabase } from './supabase.config';
import { Appointment } from './supabase.config';

export type BookingStatus = 
  | 'pending'      // Chờ xác nhận
  | 'confirmed'    // Đã xác nhận
  | 'cancelled'    // Khách tự hủy
  | 'no_show'      // Không đến khám
  | 'expired';     // Hệ thống tự hủy

export type CheckinStatus = 
  | 'waiting'      // Chờ check-in
  | 'checked_in'   // Đã check-in
  | 'completed'    // Hoàn thành khám
  | 'missed';      // Bỏ lỡ

export interface BookingStatusUpdate {
  id: string;
  old_status: BookingStatus;
  new_status: BookingStatus;
  updated_by: 'system' | 'patient' | 'staff';
  updated_at: string;
  reason?: string;
}

/**
 * Enhanced Booking Status Management Service
 * Handles all booking status transitions according to clinic workflow
 */
export class BookingStatusService {
  
  /**
   * Auto-confirm booking after checking for conflicts (10 minutes delay)
   */
  static async autoConfirmBooking(bookingId: string): Promise<boolean> {
    try {
      console.log('🔄 Auto-confirming booking after conflict check:', bookingId);
      
      // Check for time conflicts
      const hasConflict = await this.checkTimeConflicts(bookingId);
      
      if (hasConflict) {
        console.log('⚠️ Time conflict detected, keeping pending status');
        return false;
      }

      // Update status to confirmed
      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          booking_status: 'confirmed',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .eq('booking_status', 'pending'); // Only update if still pending

      if (error) {
        console.error('❌ Error auto-confirming booking:', error);
        return false;
      }

      console.log('✅ Booking auto-confirmed:', bookingId);
      return true;

    } catch (error) {
      console.error('❌ Auto-confirm failed:', error);
      return false;
    }
  }

  /**
   * Check for time conflicts with other bookings
   */
  static async checkTimeConflicts(bookingId: string): Promise<boolean> {
    try {
      const { data: booking } = await supabase
        .from('bookings')
        .select('appointment_date, appointment_time, doctor_id')
        .eq('id', bookingId)
        .single();

      if (!booking) return false;

      const { data: conflicts } = await supabase
        .from('bookings')
        .select('id')
        .eq('doctor_id', booking.doctor_id)
        .eq('appointment_date', booking.appointment_date)
        .eq('appointment_time', booking.appointment_time)
        .eq('booking_status', 'confirmed')
        .neq('id', bookingId);

      return conflicts && conflicts.length > 0;

    } catch (error) {
      console.error('❌ Error checking time conflicts:', error);
      return false;
    }
  }

  /**
   * Patient cancels their own booking
   */
  static async cancelBooking(bookingId: string, reason?: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          booking_status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason || 'Khách hàng tự hủy'
        })
        .eq('id', bookingId)
        .in('booking_status', ['pending', 'confirmed']);

      if (error) {
        console.error('❌ Error cancelling booking:', error);
        return false;
      }

      console.log('✅ Booking cancelled by patient:', bookingId);
      return true;

    } catch (error) {
      console.error('❌ Cancel booking failed:', error);
      return false;
    }
  }

  /**
   * Mark patient as checked in when they arrive at clinic
   */
  static async checkInPatient(bookingId: string, staffId?: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          checkin_status: 'checked_in',
          checkin_at: new Date().toISOString(),
          staff_id: staffId
        })
        .eq('id', bookingId)
        .eq('booking_status', 'confirmed')
        .eq('checkin_status', 'waiting');

      if (error) {
        console.error('❌ Error checking in patient:', error);
        return false;
      }

      console.log('✅ Patient checked in:', bookingId);
      return true;

    } catch (error) {
      console.error('❌ Check-in failed:', error);
      return false;
    }
  }

  /**
   * Run scheduled job to update expired bookings (run every hour)
   */
  static async updateExpiredBookings(): Promise<number> {
    try {
      console.log('🔄 Running expired bookings update job...');
      
      const now = new Date();
      const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Find confirmed bookings that are past their appointment time and not checked in
      const { data: expiredBookings, error: fetchError } = await supabase
        .from('bookings')
        .select('id, appointment_date, appointment_time, patient_name')
        .eq('booking_status', 'confirmed')
        .eq('checkin_status', 'waiting')
        .lt('appointment_date', yesterdayDate);

      if (fetchError) {
        console.error('❌ Error fetching expired bookings:', fetchError);
        return 0;
      }

      if (!expiredBookings || expiredBookings.length === 0) {
        console.log('✅ No expired bookings found');
        return 0;
      }

      // Update all expired bookings to "no_show"
      const expiredIds = expiredBookings.map(booking => booking.id);
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          booking_status: 'no_show',
          checkin_status: 'missed',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'Hệ thống tự động hủy - Khách không đến khám'
        })
        .in('id', expiredIds);

      if (updateError) {
        console.error('❌ Error updating expired bookings:', updateError);
        return 0;
      }

      console.log(`✅ Updated ${expiredBookings.length} expired bookings to no_show`);
      return expiredBookings.length;

    } catch (error) {
      console.error('❌ Update expired bookings failed:', error);
      return 0;
    }
  }

  /**
   * Get booking status history for audit trail
   */
  static async getBookingStatusHistory(bookingId: string): Promise<BookingStatusUpdate[]> {
    try {
      const { data, error } = await supabase
        .from('booking_status_history')
        .select('*')
        .eq('booking_id', bookingId)
        .order('updated_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching status history:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('❌ Get status history failed:', error);
      return [];
    }
  }

  /**
   * Initialize auto-confirmation timer for new bookings
   */
  static scheduleAutoConfirmation(bookingId: string, delayMinutes: number = 10): void {
    setTimeout(async () => {
      await this.autoConfirmBooking(bookingId);
    }, delayMinutes * 60 * 1000);
  }

  /**
   * Development helper: Get all bookings with their statuses
   */
  static async getAllBookingStatuses(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, patient_name, appointment_date, appointment_time, booking_status, checkin_status, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching booking statuses:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('❌ Get booking statuses failed:', error);
      return [];
    }
  }
}

/**
 * Initialize status management service with scheduled jobs
 */
export function initializeStatusManagement() {
  console.log('🚀 Initializing Booking Status Management Service...');

  // Run expired bookings check every hour in production
  if (!import.meta.env.DEV) {
    setInterval(() => {
      BookingStatusService.updateExpiredBookings();
    }, 60 * 60 * 1000); // Every hour
  }

  console.log('✅ Booking Status Management Service initialized');
}
