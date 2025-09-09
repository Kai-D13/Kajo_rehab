import { supabase } from '../lib/supabaseClient';

/**
 * 🏥 Static QR Check-in Service cho lễ tân
 * Luồng mới: Khách hàng scan QR tĩnh tại phòng khám → Tự động tìm booking → Check-in
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vekrhqotmgszgsredkud.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla3JocW90bWdzemdzcmVka3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NjU1NjksImV4cCI6MjA1MTA0MTU2OX0.r1ztZfPluvLtQEGGVUxpMZlpjyFKkHxCO5yDRXK0YyM';

export class StaticCheckInService {
  private supabase = supabase;

  constructor() {
    console.log('🏥 Static Check-in Service initialized');
  }

  /**
   * Generate static QR code content for reception
   * QR này sẽ được in và đặt tại quầy lễ tân
   */
  generateStaticQRContent(): string {
    const baseUrl = window.location.origin;
    const checkInUrl = `${baseUrl}/checkin`;
    console.log('📋 Generated static QR for reception:', checkInUrl);
    return checkInUrl;
  }

  /**
   * Handle customer check-in when they scan the static QR
   * Tự động tìm booking của khách hàng hôm nay và check-in
   */
  async handleCustomerCheckIn(): Promise<{
    success: boolean;
    message: string;
    booking?: any;
  }> {
    try {
      console.log('🎯 Processing customer check-in...');

      // Get current user from Zalo
      const zaloUserId = 'static-checkin-user';
      if (!zaloUserId) {
        return {
          success: false,
          message: 'Không thể xác định người dùng. Vui lòng đăng nhập lại.'
        };
      }

      // Find today's booking for this user
      const today = new Date().toISOString().split('T')[0];
      
      const { data: bookings, error } = await this.supabase
        .from('bookings')
        .select('*')
        .eq('user_id', zaloUserId)
        .eq('appointment_date', today)
        .eq('booking_status', 'confirmed')
        .eq('checkin_status', 'not_arrived')
        .order('appointment_time', { ascending: true });

      if (error) {
        console.error('❌ Error finding booking:', error);
        return {
          success: false,
          message: 'Lỗi hệ thống. Vui lòng liên hệ lễ tân.'
        };
      }

      if (!bookings || bookings.length === 0) {
        return {
          success: false,
          message: 'Không tìm thấy lịch hẹn hôm nay hoặc đã check-in rồi.'
        };
      }

      // Get the first (earliest) booking for today
      const booking = bookings[0];

      // Update check-in status
      const checkInTime = new Date().toISOString();
      const { error: updateError } = await this.supabase
        .from('bookings')
        .update({
          checkin_status: 'checked_in',
          checkin_timestamp: checkInTime
        })
        .eq('id', booking.id);

      if (updateError) {
        console.error('❌ Error updating check-in:', updateError);
        return {
          success: false,
          message: 'Không thể cập nhật trạng thái check-in.'
        };
      }

      console.log('✅ Customer checked in successfully:', booking.id);

      return {
        success: true,
        message: `Check-in thành công! Lịch hẹn ${booking.appointment_time} - ${booking.customer_name}`,
        booking: {
          ...booking,
          checkin_status: 'checked_in',
          checkin_timestamp: checkInTime
        }
      };

    } catch (error) {
      console.error('❌ Check-in process failed:', error);
      return {
        success: false,
        message: 'Lỗi trong quá trình check-in. Vui lòng thử lại.'
      };
    }
  }

  /**
   * Get today's bookings for reception dashboard
   */
  async getTodayBookings(): Promise<{
    success: boolean;
    bookings: any[];
    summary: {
      total: number;
      checked_in: number;
      pending: number;
    };
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: bookings, error } = await this.supabase
        .from('bookings')
        .select('*')
        .eq('appointment_date', today)
        .eq('booking_status', 'confirmed')
        .order('appointment_time', { ascending: true });

      if (error) throw error;

      const checkedIn = bookings?.filter(b => b.checkin_status === 'checked_in').length || 0;
      const pending = bookings?.filter(b => b.checkin_status === 'not_arrived').length || 0;

      return {
        success: true,
        bookings: bookings || [],
        summary: {
          total: bookings?.length || 0,
          checked_in: checkedIn,
          pending: pending
        }
      };

    } catch (error) {
      console.error('❌ Error fetching today bookings:', error);
      return {
        success: false,
        bookings: [],
        summary: { total: 0, checked_in: 0, pending: 0 }
      };
    }
  }

  /**
   * Manual check-in by reception staff (backup method)
   */
  async manualCheckIn(phoneNumber: string): Promise<{
    success: boolean;
    message: string;
    booking?: any;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: bookings, error } = await this.supabase
        .from('bookings')
        .select('*')
        .eq('phone_number', phoneNumber)
        .eq('appointment_date', today)
        .eq('booking_status', 'confirmed')
        .eq('checkin_status', 'not_arrived');

      if (error) throw error;

      if (!bookings || bookings.length === 0) {
        return {
          success: false,
          message: 'Không tìm thấy lịch hẹn hôm nay với số điện thoại này.'
        };
      }

      const booking = bookings[0];
      const checkInTime = new Date().toISOString();
      
      const { error: updateError } = await this.supabase
        .from('bookings')
        .update({
          checkin_status: 'checked_in',
          checkin_timestamp: checkInTime
        })
        .eq('id', booking.id);

      if (updateError) throw updateError;

      return {
        success: true,
        message: `Check-in thành công cho ${booking.customer_name}`,
        booking: {
          ...booking,
          checkin_status: 'checked_in',
          checkin_timestamp: checkInTime
        }
      };

    } catch (error) {
      console.error('❌ Manual check-in failed:', error);
      return {
        success: false,
        message: 'Lỗi trong quá trình check-in thủ công.'
      };
    }
  }
}

export const staticCheckInService = new StaticCheckInService();
