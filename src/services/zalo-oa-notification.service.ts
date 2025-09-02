// Zalo OA Notification Service
// Integration với Zalo Official Account để gửi thông báo
import { createClient } from '@supabase/supabase-js';
import { config } from '@/config/production';

// Supabase client cho server-side operations
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || config.supabase.url;
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || config.supabase.serviceRoleKey;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Zalo OA Config - Use config fallback
const ZALO_OA_ACCESS_TOKEN = import.meta.env.VITE_ZALO_OA_ACCESS_TOKEN || config.zalo.oaAccessToken;
const ZALO_OA_ID = import.meta.env.VITE_ZALO_OA_ID || config.zalo.oaId;

// Zalo API Endpoints
const ZALO_API_BASE = 'https://openapi.zalo.me/v3.0/oa';
const ZNS_API_BASE = 'https://business.openapi.zalo.me';

export interface NotificationTemplate {
  template_id: string;
  template_data: Record<string, string>;
}

// Notification templates theo tài liệu Zalo
export const NotificationTemplates = {
  BOOKING_CREATED: {
    template_id: 'booking_created_template', // Cần tạo template trong Zalo OA
    getMessage: (data: any) => ({
      template_data: {
        customer_name: data.customer_name,
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        clinic_name: 'KajoTai Rehab Clinic',
        booking_id: data.id
      }
    })
  },
  
  BOOKING_CONFIRMED: {
    template_id: 'booking_confirmed_template',
    getMessage: (data: any) => ({
      template_data: {
        customer_name: data.customer_name,
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        clinic_address: '123 Đường ABC, Quận XYZ, TP.HCM',
        qr_checkin_url: `https://zalo.me/s/${process.env.REACT_APP_ZALO_MINI_APP_ID}?page=checkin`
      }
    })
  },
  
  BOOKING_REMINDER: {
    template_id: 'booking_reminder_template',
    getMessage: (data: any) => ({
      template_data: {
        customer_name: data.customer_name,
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        reminder_time: '1 hour before'
      }
    })
  },
  
  CHECKIN_SUCCESS: {
    template_id: 'checkin_success_template',
    getMessage: (data: any) => ({
      template_data: {
        customer_name: data.customer_name,
        checkin_time: new Date().toLocaleString('vi-VN'),
        wait_number: data.wait_number || '1'
      }
    })
  }
};

export class ZaloOANotificationService {
  
  // 1. Gửi thông báo qua Zalo OA Message API
  static async sendOAMessage(userId: string, template: NotificationTemplate): Promise<{
    success: boolean;
    message: string;
  }> {
    if (!ZALO_OA_ACCESS_TOKEN) {
      console.warn('Zalo OA Access Token not configured');
      return { success: false, message: 'OA token not configured' };
    }

    try {
      const response = await fetch(`${ZALO_API_BASE}/message/template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': ZALO_OA_ACCESS_TOKEN
        },
        body: JSON.stringify({
          recipient: {
            user_id: userId
          },
          message: {
            template_id: template.template_id,
            template_data: template.template_data
          }
        })
      });

      const result = await response.json();
      
      if (result.error === 0) {
        console.log('✅ OA message sent successfully:', result.data?.message_id);
        return { success: true, message: 'Message sent' };
      } else {
        console.error('❌ OA message failed:', result);
        return { success: false, message: result.message || 'Failed to send' };
      }

    } catch (error) {
      console.error('❌ Error sending OA message:', error);
      return { success: false, message: 'Network error' };
    }
  }

  // 2. Gửi ZNS (Zalo Notification Service) qua phone number
  static async sendZNS(phoneNumber: string, template: NotificationTemplate): Promise<{
    success: boolean;
    message: string;
  }> {
    if (!ZALO_OA_ACCESS_TOKEN) {
      console.warn('ZNS Access Token not configured');
      return { success: false, message: 'ZNS token not configured' };
    }

    try {
      const response = await fetch(`${ZNS_API_BASE}/message/template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': ZALO_OA_ACCESS_TOKEN
        },
        body: JSON.stringify({
          phone: phoneNumber,
          template_id: template.template_id,
          template_data: template.template_data,
          tracking_id: `booking_${Date.now()}`
        })
      });

      const result = await response.json();
      
      if (result.error === 0) {
        console.log('✅ ZNS sent successfully:', result.data?.msg_id);
        return { success: true, message: 'ZNS sent' };
      } else {
        console.error('❌ ZNS failed:', result);
        return { success: false, message: result.message || 'Failed to send ZNS' };
      }

    } catch (error) {
      console.error('❌ Error sending ZNS:', error);
      return { success: false, message: 'Network error' };
    }
  }

  // 3. Send booking confirmation notification
  static async sendBookingConfirmation(bookingData: any): Promise<void> {
    try {
      // Skip notifications in development mode to avoid CORS errors
      if (import.meta.env.DEV) {
        console.log('🔧 Development mode: Skipping OA notifications to avoid CORS');
        return;
      }

      const template = {
        template_id: NotificationTemplates.BOOKING_CONFIRMED.template_id,
        template_data: NotificationTemplates.BOOKING_CONFIRMED.getMessage(bookingData).template_data
      };

      // Gửi qua OA nếu có user_id
      if (bookingData.user_id) {
        await this.sendOAMessage(bookingData.user_id, template);
      }

      // Gửi qua ZNS nếu có phone number
      if (bookingData.phone_number) {
        await this.sendZNS(bookingData.phone_number, template);
      }

      // Log notification history
      await this.logNotificationHistory({
        booking_id: bookingData.id,
        type: 'booking_confirmed',
        recipient: bookingData.user_id || bookingData.phone_number,
        template_id: template.template_id,
        status: 'sent'
      });

    } catch (error) {
      console.error('❌ Error sending booking confirmation:', error);
    }
  }

  // 4. Send check-in success notification
  static async sendCheckInSuccess(bookingData: any): Promise<void> {
    try {
      const template = {
        template_id: NotificationTemplates.CHECKIN_SUCCESS.template_id,
        template_data: NotificationTemplates.CHECKIN_SUCCESS.getMessage(bookingData).template_data
      };

      if (bookingData.user_id) {
        await this.sendOAMessage(bookingData.user_id, template);
      }

      if (bookingData.phone_number) {
        await this.sendZNS(bookingData.phone_number, template);
      }

    } catch (error) {
      console.error('❌ Error sending check-in notification:', error);
    }
  }

  // 5. Send booking reminders (to be called by cron job)
  static async sendBookingReminders(): Promise<void> {
    try {
      // Get bookings for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const { data: bookings, error } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('appointment_date', tomorrowStr)
        .eq('booking_status', 'confirmed')
        .eq('checkin_status', 'not_arrived');

      if (error) throw error;

      console.log(`📅 Sending reminders for ${bookings?.length || 0} bookings tomorrow`);

      // Send reminder for each booking
      for (const booking of bookings || []) {
        const template = {
          template_id: NotificationTemplates.BOOKING_REMINDER.template_id,
          template_data: NotificationTemplates.BOOKING_REMINDER.getMessage(booking).template_data
        };

        if (booking.user_id) {
          await this.sendOAMessage(booking.user_id, template);
        }

        if (booking.phone_number) {
          await this.sendZNS(booking.phone_number, template);
        }

        // Wait 1 second between sends to avoid rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error('❌ Error sending booking reminders:', error);
    }
  }

  // 6. Log notification history  
  private static async logNotificationHistory(data: {
    booking_id: string;
    type: string;
    recipient: string;
    template_id: string;
    status: string;
  }): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('notification_history')
        .insert([{
          ...data,
          sent_at: new Date().toISOString()
        }]);

      if (error) console.warn('Failed to log notification:', error);
    } catch (error) {
      console.warn('Failed to log notification history:', error);
    }
  }

  // 7. Get Zalo User ID from phone number (if needed)
  static async getZaloUserIdByPhone(phoneNumber: string): Promise<string | null> {
    if (!ZALO_OA_ACCESS_TOKEN) return null;

    try {
      const params = new URLSearchParams({
        data: JSON.stringify({ phone: phoneNumber })
      });

      const response = await fetch(`${ZALO_API_BASE}/user/detail?${params.toString()}`, {
        method: 'GET',
        headers: {
          'access_token': ZALO_OA_ACCESS_TOKEN
        }
      });

      const result = await response.json();
      
      if (result.error === 0 && result.data) {
        return result.data.user_id;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting Zalo user ID:', error);
      return null;
    }
  }
}

// Export cho sử dụng trong booking service
export default ZaloOANotificationService;
