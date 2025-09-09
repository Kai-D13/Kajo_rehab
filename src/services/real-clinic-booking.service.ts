// Real Clinic Enhanced Booking Service 
// Implementation theo use case thực tế của phòng khám
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { QRService } from './qr.service';
import { AuthService } from './auth.service';
import { zaloOAService } from './zalo-oa.service';
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
  service_type?: string; // Added for invoice
  clinic_location?: string; // Added for invoice
  created_via: string;
  created_at?: string; // Added for invoice
  confirmed_by?: string;
  confirmed_at?: string;
}

export class RealClinicBookingService {
  private supabase: SupabaseClient;
  
  constructor() {
    this.supabase = supabase;
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
      
      // Get Zalo User ID for OA messaging
      const zaloUserId = AuthService.getCurrentUser()?.id || 'unknown';
      
      // 1. Check capacity control theo luồng mới (Max 3 per time slot)
      const capacityCheck = await this.checkCapacityAndConflict(
        bookingData.appointment_date,
        bookingData.appointment_time,
        bookingData.doctor_id
      );
      
      if (!capacityCheck.canBook) {
        // Return error message cho frontend hiển thị
        toast.error(capacityCheck.message);
        throw new Error(capacityCheck.message);
      }

      console.log(`✅ Capacity check passed: ${capacityCheck.currentCount + 1}/${capacityCheck.maxCapacity} after booking`);

      // 2. Create booking record với auto-confirmed status theo luồng mới
      const bookingRecord = {
        customer_name: bookingData.customer_name,
        phone_number: bookingData.phone_number,
        user_id: zaloUserId || currentUser?.id, // Ưu tiên Zalo User ID
        appointment_date: bookingData.appointment_date,
        appointment_time: bookingData.appointment_time,
        symptoms: bookingData.symptoms,
        detailed_description: bookingData.detailed_description,
        image_urls: bookingData.image_urls || [],
        video_urls: bookingData.video_urls || [],
        booking_status: BookingStatus.CONFIRMED, // 🔧 Auto-confirm để cải thiện UX
        checkin_status: CheckinStatus.NOT_ARRIVED,
        doctor_id: bookingData.doctor_id,
        service_id: bookingData.service_id,
        created_via: 'zalo_miniapp',
        confirmed_by: 'system_auto', // Đánh dấu auto-confirm
        confirmed_at: new Date().toISOString() // Thời gian auto-confirm
      };

      const { data, error } = await this.supabase
        .from('bookings')
        .insert([bookingRecord])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Booking auto-confirmed successfully:', data.id);
      toast.success('Đặt lịch thành công! Lịch hẹn đã được xác nhận tự động.');

      // 3. Send booking confirmation via Zalo OA theo luồng mới (không cần QR code động)
      if (data && data.user_id) {
        console.log('📨 Sending detailed booking info to customer via Zalo OA...');
        await zaloOAService.sendBookingConfirmation(data);
      } else {
        console.log('ℹ️ No Zalo User ID - skipping OA notification');
      }

      return {
        success: true,
        booking: data,
        message: 'Đặt lịch thành công! Chờ xác nhận từ phòng khám.'
      };

    } catch (error: any) {
      console.error('❌ Error creating booking:', error);
      
      // Handle specific database constraint errors
      let message = 'Có lỗi xảy ra khi đặt lịch';
      if (error?.code === '23505') {
        // Unique constraint violation
        if (error?.message?.includes('unique_booking_slot')) {
          message = 'Thời gian này đã được đặt trước. Vui lòng chọn thời gian khác!';
        } else {
          message = 'Lịch hẹn này đã tồn tại. Vui lòng kiểm tra lại!';
        }
      } else if (error instanceof Error) {
        message = error.message;
      }
      
      toast.error(message);
      
      return {
        success: false,
        message: message
      };
    }
  }

  // 2. Check capacity control - ENHANCED for new workflow (Max 3 per time slot)
  async checkCapacityAndConflict(date: string, time: string, doctorId?: string): Promise<{
    canBook: boolean;
    currentCount: number;
    maxCapacity: number;
    message: string;
  }> {
    try {
      console.log(`🎯 Checking capacity for ${date} ${time} (doctor: ${doctorId || 'any'})`);
      
      let query = this.supabase
        .from('bookings')
        .select('id, customer_name, doctor_id, user_id')
        .eq('appointment_date', date)
        .eq('appointment_time', time)
        .in('booking_status', ['pending', 'confirmed']);

      // If doctor_id is specified, check for that specific doctor
      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error checking capacity:', error);
        throw error;
      }
      
      const currentCount = data ? data.length : 0;
      const maxCapacity = 3; // Max 3 customers per time slot
      const canBook = currentCount < maxCapacity;
      
      let message = '';
      if (!canBook) {
        message = 'Khung giờ đặt lịch của bạn đã kín, vui lòng chọn khung thời gian khác, Kajo xin cảm ơn';
        console.log(`⚠️ CAPACITY FULL: ${currentCount}/${maxCapacity} bookings at ${date} ${time}`);
      } else {
        message = `Còn ${maxCapacity - currentCount}/${maxCapacity} slot available`;
        console.log(`✅ Capacity available: ${currentCount}/${maxCapacity} bookings`);
      }
      
      return {
        canBook,
        currentCount,
        maxCapacity,
        message
      };
    } catch (error) {
      console.error('❌ Capacity check failed:', error);
      throw error;
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

  // Get bookings by specific date (for admin dashboard)
  async getBookingsByDate(date: string): Promise<BookingRecord[]> {
    try {
      console.log(`📅 Fetching bookings for date: ${date}`);
      
      const { data, error } = await this.supabase
        .from('bookings')
        .select('*')
        .eq('appointment_date', date)
        .order('appointment_time', { ascending: true });

      if (error) throw error;

      console.log(`✅ Found ${data?.length || 0} bookings for ${date}`);
      return data || [];
      
    } catch (error) {
      console.error('❌ Error fetching bookings by date:', error);
      return [];
    }
  }

  // 4. Get user's bookings
  async getUserBookings(phoneNumber?: string): Promise<BookingRecord[]> {
    try {
      // 🔧 Get Zalo user ID instead of mock user ID
      let currentUserId: string | null = null;
      
      try {
        currentUserId = AuthService.getCurrentUser()?.id || null;
        console.log('🔍 Fetching bookings for user ID:', currentUserId);
      } catch (error) {
        console.warn('⚠️ Could not get user ID, trying fallback methods');
      }
      
      // Fallback to auth service if Zalo user ID is not available
      if (!currentUserId) {
        const currentUser = AuthService.getCurrentUser();
        currentUserId = currentUser?.id || null;
        console.log('🔍 Using fallback user ID:', currentUserId);
      }

      let query = this.supabase.from('bookings').select('*');

      if (currentUserId) {
        query = query.eq('user_id', currentUserId);
      } else if (phoneNumber) {
        query = query.eq('phone_number', phoneNumber);
      } else {
        console.warn('⚠️ No user ID or phone number provided for getUserBookings');
        return [];
      }

      const { data, error } = await query
        .order('booking_timestamp', { ascending: false });

      if (error) {
        console.error('❌ Supabase error fetching bookings:', error);
        throw error;
      }
      
      console.log('✅ Successfully fetched bookings:', data?.length || 0);
      return data || [];

    } catch (error) {
      console.error('❌ Error fetching user bookings:', error);
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
        const capacityCheck = await this.checkCapacityAndConflict(
          booking.appointment_date,
          booking.appointment_time
        );

        if (!capacityCheck.canBook) {
          return {
            success: false,
            message: 'Không thể xác nhận: ' + capacityCheck.message
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
