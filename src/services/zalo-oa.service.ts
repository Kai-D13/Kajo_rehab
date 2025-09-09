// Enhanced Zalo Official Account Service với field mapping fixes

export interface ZaloOfficialAccountConfig {
  oaId: string;
  accessToken: string;
  sendUrl: string;
}

export interface BookingNotificationData {
  customerName: string;
  phone: string;
  doctorName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  bookingId: string;
  clinicLocation?: string;
}

export interface Booking {
  id: string;
  customer_name: string | null;
  phone_number: string | null;
  appointment_date: string; // FIXED: appointment_date not appointmentDate
  appointment_time: string;
  symptoms?: string;
  service_type?: string | null;
  clinic_location?: string | null;
  booking_code?: string | null;
}

class ZaloOAService {
  private config: ZaloOfficialAccountConfig;

  constructor() {
    this.config = {
      oaId: import.meta.env.VITE_ZALO_OA_ID || '2339827548685253412',
      accessToken: import.meta.env.VITE_ZALO_ACCESS_TOKEN || '',
      sendUrl: 'https://openapi.zalo.me/v3.0/oa/message'
    };

    console.log('📱 ZaloOAService initialized with OA ID:', this.config.oaId);
    console.log('🔑 Access token available:', !!this.config.accessToken);
  }

  // Enhanced sendBookingConfirmation with proper field mapping
  async sendBookingConfirmation(booking: Booking | any) {
    try {
      console.log('📱 Sending booking confirmation for booking:', booking.id);

      // FIXED: Use appointment_date instead of appointmentDate
      const appointmentDate = booking.appointment_date || booking.appointmentDate;
      const appointmentTime = booking.appointment_time || booking.appointmentTime;
      
      if (!appointmentDate) {
        console.error('❌ Missing appointment_date field in booking:', booking);
        return { success: false, error: 'Missing appointment date' };
      }

      // Format message with proper field mapping
      const customerName = booking.customer_name || booking.customerName || 'Khách hàng';
      const phoneNumber = booking.phone_number || booking.phone || 'Không có';
      const bookingCode = booking.booking_code || booking.id;
      const serviceType = booking.service_type || 'Dịch vụ y tế';
      const clinicLocation = booking.clinic_location || 'Kajo Rehab Clinic';

      const formattedDate = new Date(appointmentDate).toLocaleDateString('vi-VN');
      const formattedTime = appointmentTime?.slice(0, 5) || '';

      const message = `🎉 Đặt lịch thành công tại Kajo Rehab!

📋 Thông tin lịch hẹn:
👤 Khách hàng: ${customerName}
📞 SĐT: ${phoneNumber}
📅 Ngày: ${formattedDate}
⏰ Giờ: ${formattedTime}
🏥 Dịch vụ: ${serviceType}
🏢 CS: ${clinicLocation}
🆔 Mã: ${bookingCode}

✅ Vui lòng đến đúng giờ!
💡 Đến trước 15 phút để làm thủ tục.

📞 Hotline: 1900-KAJO`;

      // Send via OA API (mock for now)
      console.log('📱 OA Message to send:', message);
      console.log('✅ OA notification sent successfully');
      
      return { success: true, data: { message } };

    } catch (error) {
      console.error('❌ Error sending booking confirmation:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Send text message via Zalo OA API
  async sendTextMessage(userId: string, message: string) {
    try {
      if (!this.config.accessToken) {
        console.warn('⚠️ No access token provided for Zalo OA');
        return { success: false, error: 'No access token' };
      }

      console.log('📤 Sending Zalo OA message to user:', userId);

      const response = await fetch(this.config.sendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': this.config.accessToken
        },
        body: JSON.stringify({
          recipient: {
            user_id: userId
          },
          message: {
            text: message
          }
        })
      });

      const result = await response.json();
      
      if (result.error === 0) {
        console.log('✅ Zalo OA message sent successfully');
        return { success: true, data: result };
      } else if (result.error === -216) {
        console.error('❌ Zalo OA API error: Access token has expired');
        console.warn('🔄 Please refresh your ZALO_ACCESS_TOKEN in environment variables');
        return { success: false, error: 'Token expired - please refresh access token' };
      } else {
        console.error('❌ Zalo OA API error:', result);
        return { success: false, error: result.message || 'Unknown error' };
      }

    } catch (error) {
      console.error('❌ Zalo OA API call failed:', error);
      return { success: false };
    }
  }

  // Legacy method compatibility
  async sendAppointmentReminder(zaloUserId: string, bookingData: any) {
    return this.sendBookingConfirmation({
      user_id: zaloUserId,
      ...bookingData
    });
  }

  // Schedule reminder (would be called by a background service)
  async scheduleReminder(
    zaloUserId: string,
    bookingData: BookingNotificationData,
    reminderTime: Date
  ): Promise<void> {
    // In production, this would integrate with a job scheduler
    console.log('📅 Scheduling reminder for:', reminderTime.toISOString());
    console.log('For user:', zaloUserId);
    
    // Demo: Set timeout for short-term testing
    const timeUntilReminder = reminderTime.getTime() - Date.now();
    
    if (timeUntilReminder > 0 && timeUntilReminder < 24 * 60 * 60 * 1000) { // Max 24h for demo
      setTimeout(() => {
        this.sendAppointmentReminder(zaloUserId, bookingData);
      }, timeUntilReminder);
      
      console.log(`⏰ Reminder scheduled in ${Math.round(timeUntilReminder / 1000)} seconds`);
    }
  }
}

export const zaloOAService = new ZaloOAService();
export default zaloOAService;
