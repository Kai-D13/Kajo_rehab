// Real Clinic Enhanced Booking Service 
// Implementation theo use case thực tế của phòng khám
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { QRService } from './qr.service';
import { AuthService } from './auth.service';
import ZaloOANotificationService from './zalo-oa-notification.service';
import toast from 'react-hot-toast';

// Supabase config - Production ready với credentials thực tế
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vekrhqotmgszgsredkud.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla3JocW90bWdzemdzcmVka3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NjU1NjksImV4cCI6MjA1MTA0MTU2OX0.r1ztZfPluvLtQEGGVUxpMZlpjyFKkHxCO5yDRXK0YyM';

// Enhanced booking interface theo use case
export interface EnhancedBookingData {
  customer_name: string;
  phone_number: string;
  appointment_date: string;
  appointment_time: string;
  symptoms?: string;
  detailed_description?: string;
  image_urls?: string[];
  video_urls?: string[];
  doctor_id?: string;
  service_id?: string;
}

// Booking status enum
export enum BookingStatus {
  PENDING = 'pending',               // Chờ xác nhận
  CONFIRMED = 'confirmed',           // Đặt lịch thành công (hệ thống xác nhận)
  CANCELLED_BY_USER = 'cancelled_by_user', // Khách tự hủy
  AUTO_CANCELLED = 'auto_cancelled', // Hệ thống tự hủy (không đến)
  COMPLETED = 'completed'            // Hoàn thành
}

// Check-in status enum
export enum CheckinStatus {
  NOT_ARRIVED = 'not_arrived',  // Chưa đến
  CHECKED_IN = 'checked_in',    // Đã check-in
  NO_SHOW = 'no_show'           // Không đến (auto update)
}

export interface BookingRecord {
  id: string;
  customer_name: string;
  phone_number: string;
  user_id?: string;
  appointment_date: string;
  appointment_time: string;
  symptoms?: string;
  detailed_description?: string;
  image_urls?: string[];
  video_urls?: string[];
  booking_timestamp: string;
  updated_at: string;
  booking_status: BookingStatus;
  checkin_status: CheckinStatus;
  checkin_timestamp?: string;
  qr_code_data?: string;
  doctor_id?: string;
  service_id?: string;
  created_via: string;
}

export class RealClinicBookingService {
  private supabase: SupabaseClient;
  
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('🏥 Real Clinic Booking Service initialized');
  }

  // 1. Tạo booking mới (trạng thái pending theo use case)
  async createBooking(bookingData: EnhancedBookingData): Promise<{
    success: boolean;
    booking?: BookingRecord;
    message: string;
  }> {
    try {
      console.log('📅 Creating new booking with pending status...', bookingData);

      // Get current user (optional for bookings from other channels)
      const currentUser = AuthService.getCurrentUser();
      
      // 1. Check time conflict
      const conflict = await this.checkTimeConflict(
        bookingData.appointment_date,
        bookingData.appointment_time
      );
      
      if (conflict) {
        throw new Error('Thời gian này đã có lịch hẹn khác. Vui lòng chọn thời gian khác!');
      }

      // 2. Create booking record với trạng thái PENDING
      const bookingRecord = {
        customer_name: bookingData.customer_name,
        phone_number: bookingData.phone_number,
        user_id: currentUser?.id,
        appointment_date: bookingData.appointment_date,
        appointment_time: bookingData.appointment_time,
        symptoms: bookingData.symptoms,
        detailed_description: bookingData.detailed_description,
        image_urls: bookingData.image_urls || [],
        video_urls: bookingData.video_urls || [],
        booking_status: BookingStatus.PENDING, // Chờ xác nhận theo use case
        checkin_status: CheckinStatus.NOT_ARRIVED,
        doctor_id: bookingData.doctor_id,
        service_id: bookingData.service_id,
        created_via: 'zalo_miniapp'
      };

      const { data, error } = await this.supabase
        .from('bookings')
        .insert([bookingRecord])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Booking created successfully with pending status:', data.id);
      toast.success('Đặt lịch thành công! Đang chờ xác nhận từ phòng khám.');

      // 3. Generate QR code for future check-in
      if (data) {
        const qrCodeData = await QRService.generateQRText({
          id: data.id,
          user_id: data.user_id || data.phone_number,
          appointment_date: data.appointment_date,
          appointment_time: data.appointment_time
        } as any);

        // Update booking with QR code data
        await this.supabase
          .from('bookings')
          .update({ qr_code_data: qrCodeData })
          .eq('id', data.id);
        
        // 4. Send booking created notification
        await ZaloOANotificationService.sendBookingConfirmation(data);
      }

      return {
        success: true,
        booking: data,
        message: 'Đặt lịch thành công! Chờ xác nhận từ phòng khám.'
      };

    } catch (error) {
      console.error('❌ Error creating booking:', error);
      const message = error instanceof Error ? error.message : 'Có lỗi xảy ra khi đặt lịch';
      toast.error(message);
      
      return {
        success: false,
        message: message
      };
    }
  }

  // 2. Check time conflict (disabled in development)
  async checkTimeConflict(date: string, time: string): Promise<boolean> {
    try {
      // Skip conflict check in development to avoid blocking bookings
      if (import.meta.env.DEV) {
        console.log('🔧 Development mode: Skipping time conflict check');
        return false;
      }

      const { data, error } = await this.supabase
        .from('bookings')
        .select('id')
        .eq('appointment_date', date)
        .eq('appointment_time', time)
        .in('booking_status', ['pending', 'confirmed']);

      if (error) throw error;
      
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking time conflict:', error);
      return false; // Don't block booking on error
    }
  }

  // 3. Cancel booking by user (Khách tự hủy)
  async cancelBookingByUser(bookingId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const { error } = await this.supabase
        .from('bookings')
        .update({ 
          booking_status: BookingStatus.CANCELLED_BY_USER,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success('Lịch hẹn đã được hủy thành công');
      return {
        success: true,
        message: 'Đã hủy lịch hẹn thành công'
      };

    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Có lỗi xảy ra khi hủy lịch hẹn');
      return {
        success: false,
        message: 'Lỗi khi hủy lịch hẹn'
      };
    }
  }

  // 4. Get user's bookings
  async getUserBookings(phoneNumber?: string): Promise<BookingRecord[]> {
    try {
      const currentUser = AuthService.getCurrentUser();
      let query = this.supabase.from('bookings').select('*');

      if (currentUser) {
        query = query.eq('user_id', currentUser.id);
      } else if (phoneNumber) {
        query = query.eq('phone_number', phoneNumber);
      } else {
        return [];
      }

      const { data, error } = await query
        .order('booking_timestamp', { ascending: false });

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  }

  // 5. Admin: Confirm booking (chuyển từ pending -> confirmed)
  async confirmBooking(bookingId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Kiểm tra lại conflict trước khi confirm
      const { data: booking } = await this.supabase
        .from('bookings')
        .select('appointment_date, appointment_time')
        .eq('id', bookingId)
        .single();

      if (booking) {
        const hasConflict = await this.checkTimeConflict(
          booking.appointment_date,
          booking.appointment_time
        );

        if (hasConflict) {
          return {
            success: false,
            message: 'Không thể xác nhận: Thời gian đã có lịch khác'
          };
        }
      }

      const { error } = await this.supabase
        .from('bookings')
        .update({ 
          booking_status: BookingStatus.CONFIRMED,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      return {
        success: true,
        message: 'Xác nhận lịch hẹn thành công'
      };

    } catch (error) {
      console.error('Error confirming booking:', error);
      return {
        success: false,
        message: 'Lỗi khi xác nhận lịch hẹn'
      };
    }
  }

  // 6. Check-in booking (for reception webapp)
  async checkInBooking(bookingId: string, staffId?: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const now = new Date().toISOString();

      // Update booking status
      const { error: bookingError } = await this.supabase
        .from('bookings')
        .update({
          checkin_status: CheckinStatus.CHECKED_IN,
          checkin_timestamp: now,
          updated_at: now
        })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      // Log check-in history
      const { error: historyError } = await this.supabase
        .from('checkin_history')
        .insert([{
          booking_id: bookingId,
          checkin_timestamp: now,
          checkin_method: 'qr_scan',
          reception_staff_id: staffId,
          notes: 'Customer checked in via QR scan'
        }]);

      if (historyError) console.warn('Failed to log check-in history:', historyError);

      toast.success('Check-in thành công!');
      return {
        success: true,
        message: 'Check-in thành công'
      };

    } catch (error) {
      console.error('Error checking in booking:', error);
      toast.error('Lỗi khi check-in');
      return {
        success: false,
        message: 'Lỗi trong quá trình check-in'
      };
    }
  }

  // 7. Auto-cancel expired bookings (to be called by cron job)
  async autoCancelExpiredBookings(): Promise<void> {
    try {
      const { error } = await this.supabase.rpc('auto_cancel_expired_bookings');
      if (error) throw error;
      console.log('✅ Auto-cancelled expired bookings');
    } catch (error) {
      console.error('❌ Error auto-cancelling bookings:', error);
    }
  }

  // 8. Get all bookings for admin dashboard
  async getAllBookings(filters?: {
    date?: string;
    status?: BookingStatus;
    limit?: number;
  }): Promise<BookingRecord[]> {
    try {
      let query = this.supabase
        .from('bookings')
        .select('*');

      if (filters?.date) {
        query = query.eq('appointment_date', filters.date);
      }
      
      if (filters?.status) {
        query = query.eq('booking_status', filters.status);
      }

      const { data, error } = await query
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })
        .limit(filters?.limit || 100);

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error fetching all bookings:', error);
      return [];
    }
  }

  // 9. Subscribe to real-time booking updates (for reception webapp)
  subscribeToBookingUpdates(callback: (payload: any) => void) {
    return this.supabase
      .channel('bookings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings'
      }, callback)
      .subscribe();
  }

  // 10. Get booking by QR code data
  async getBookingByQR(qrData: string): Promise<BookingRecord | null> {
    try {
      const { data, error } = await this.supabase
        .from('bookings')
        .select('*')
        .eq('qr_code_data', qrData)
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error fetching booking by QR:', error);
      return null;
    }
  }
}

// Singleton instance
export const realClinicBookingService = new RealClinicBookingService();
export default realClinicBookingService;
