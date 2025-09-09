// Admin Reception Service - Connect to Supabase production
import { createClient } from '@supabase/supabase-js';

// Production Supabase config
const supabaseUrl = 'https://vekrhqotmgszgsredkud.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla3JocW90bWdzemdzO' +
  'mVka3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU2OTc0OTUsImV4cCI6MjA0MTI3MzQ5NX0.aGn75q7fUUIB2v' +
  'DDRvEXnqKkfZAVPGzB8M-_Jp2WU-Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface BookingRecord {
  id: string;
  customer_name: string;
  phone_number: string;
  appointment_date: string;
  appointment_time: string;
  booking_status: string;
  checkin_status: string;
  checkin_timestamp?: string;
  doctor_id: string;
  service_type: string;
  symptoms?: string;
  detailed_description?: string;
  user_id: string;
  clinic_location: string;
}

class AdminReceptionService {
  constructor() {
    console.log('🏥 AdminReceptionService initialized with Supabase production');
  }

  // Search bookings by phone number
  async searchBookingsByPhone(phoneNumber: string): Promise<BookingRecord[]> {
    try {
      console.log('🔍 Searching bookings for phone:', phoneNumber);
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('phone_number', phoneNumber)
        .order('appointment_date', { ascending: false });

      if (error) {
        console.error('❌ Supabase search error:', error);
        throw error;
      }

      console.log('✅ Found bookings:', data?.length || 0);
      return data || [];

    } catch (error) {
      console.error('❌ Error searching bookings:', error);
      return [];
    }
  }

  // Get today's appointments
  async getTodayAppointments(): Promise<BookingRecord[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('📅 Getting appointments for today:', today);

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('appointment_date', today)
        .order('appointment_time', { ascending: true });

      if (error) {
        console.error('❌ Supabase today appointments error:', error);
        throw error;
      }

      console.log('✅ Found today appointments:', data?.length || 0);
      return data || [];

    } catch (error) {
      console.error('❌ Error getting today appointments:', error);
      return [];
    }
  }

  // Check-in a booking
  async checkInBooking(bookingId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('✅ Checking in booking:', bookingId);

      const checkinTime = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('bookings')
        .update({
          checkin_status: 'checked_in',
          checkin_timestamp: checkinTime,
          updated_at: checkinTime
        })
        .eq('id', bookingId)
        .select();

      if (error) {
        console.error('❌ Supabase check-in error:', error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log('✅ Check-in successful:', data[0]);
        return {
          success: true,
          message: 'Check-in thành công!'
        };
      } else {
        return {
          success: false,
          message: 'Không tìm thấy booking để check-in!'
        };
      }

    } catch (error) {
      console.error('❌ Error checking in booking:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Lỗi khi check-in!'
      };
    }
  }

  // Get booking statistics
  async getBookingStatistics(date?: string): Promise<{
    total: number;
    checkedIn: number;
    waiting: number;
    completed: number;
  }> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('bookings')
        .select('checkin_status')
        .eq('appointment_date', targetDate);

      if (error) {
        console.error('❌ Supabase statistics error:', error);
        throw error;
      }

      const stats = {
        total: data?.length || 0,
        checkedIn: data?.filter(b => b.checkin_status === 'checked_in').length || 0,
        waiting: data?.filter(b => b.checkin_status === 'not_arrived').length || 0,
        completed: data?.filter(b => b.checkin_status === 'completed').length || 0
      };

      console.log('📊 Booking statistics:', stats);
      return stats;

    } catch (error) {
      console.error('❌ Error getting statistics:', error);
      return { total: 0, checkedIn: 0, waiting: 0, completed: 0 };
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId: string, status: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📝 Updating booking status:', bookingId, 'to', status);

      const { data, error } = await supabase
        .from('bookings')
        .update({
          checkin_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select();

      if (error) {
        console.error('❌ Supabase update error:', error);
        throw error;
      }

      return {
        success: true,
        message: 'Cập nhật trạng thái thành công!'
      };

    } catch (error) {
      console.error('❌ Error updating booking status:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Lỗi khi cập nhật!'
      };
    }
  }
}

export const adminReceptionService = new AdminReceptionService();
export default adminReceptionService;
