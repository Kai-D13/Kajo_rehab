// Database Helper for Testing
import { supabase } from '../services/supabase.config';

export class DatabaseHelper {
  // Clear test bookings (useful for development testing)
  static async clearTestBookings(testPhone: string = '0123456789'): Promise<void> {
    try {
      console.log(`🧹 Clearing test bookings for phone: ${testPhone}`);
      
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('phone_number', testPhone);
      
      if (error) {
        console.error('❌ Error clearing test bookings:', error);
        throw error;
      }
      
      console.log('✅ Test bookings cleared successfully');
    } catch (error) {
      console.error('❌ Failed to clear test bookings:', error);
      throw error;
    }
  }

  // Get booking conflicts for date/time
  static async getBookingConflicts(date: string, time: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('appointment_date', date)
        .eq('appointment_time', time);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error checking conflicts:', error);
      return [];
    }
  }

  // Get all test bookings
  static async getTestBookings(testPhone: string = '0123456789'): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('phone_number', testPhone)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error getting test bookings:', error);
      return [];
    }
  }
}
