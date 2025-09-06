// Enhanced Zalo OA Messaging Service với credentials thực tế
import { BookingRecord } from './real-clinic-booking.service';

export interface ZaloOAConfig {
  oaId: string;
  appSecret: string;
  accessToken: string;
  refreshToken: string;
}

export interface OAMessageResponse {
  error: number;
  message: string;
  data?: any;
}

export class ZaloOAMessagingService {
  private static readonly config: ZaloOAConfig = {
    oaId: import.meta.env.VITE_ZALO_OA_ID || '2339827548685253412',
    appSecret: import.meta.env.VITE_ZALO_OA_APP_SECRET || '1Yb5YMVFGwGB7J7mSR9C',
    accessToken: import.meta.env.VITE_ZALO_OA_ACCESS_TOKEN || '',
    refreshToken: import.meta.env.VITE_ZALO_OA_REFRESH_TOKEN || ''
  };

  private static readonly API_BASE = 'https://openapi.zalo.me/v2.0/oa';

  /**
   * Gửi tin nhắn xác nhận booking
   */
  static async sendBookingConfirmation(booking: BookingRecord): Promise<boolean> {
    try {
      console.log('📨 Sending booking confirmation via Zalo OA...', booking.id);
      
      if (!booking.user_id) {
        console.error('❌ No user_id found for booking');
        return false;
      }
      
      const message = this.buildBookingConfirmationMessage(booking);
      
      const response = await this.sendTextMessage(booking.user_id, message);
      
      if (response.error === 0) {
        console.log('✅ OA message sent successfully');
        return true;
      } else {
        console.error('❌ OA message failed:', response.message);
        return false;
      }
      
    } catch (error) {
      console.error('❌ OA message error:', error);
      return false;
    }
  }

  /**
   * Gửi tin nhắn check-in reminder
   */
  static async sendCheckinReminder(booking: BookingRecord): Promise<boolean> {
    try {
      if (!booking.user_id) {
        console.error('❌ No user_id found for reminder');
        return false;
      }
      
      const message = this.buildCheckinReminderMessage(booking);
      const response = await this.sendTextMessage(booking.user_id, message);
      return response.error === 0;
    } catch (error) {
      console.error('❌ Check-in reminder failed:', error);
      return false;
    }
  }

  /**
   * Gửi tin nhắn text theo chuẩn Zalo OA API
   */
  private static async sendTextMessage(userId: string, text: string): Promise<OAMessageResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/message`, {
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
            text: text
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Zalo OA API response format: { error: 0, message: "Success", data: {...} }
      return {
        error: result.error || 0,
        message: result.message || 'Success',
        data: result.data
      };
      
    } catch (error) {
      console.error('❌ Send message API error:', error);
      return { 
        error: -1, 
        message: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  /**
   * Xây dựng tin nhắn xác nhận booking
   */
  private static buildBookingConfirmationMessage(booking: BookingRecord): string {
    const appointmentDate = new Date(booking.appointment_date).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `🏥 XÁC NHẬN ĐẶT LỊCH KHÁM - KAJOTAI REHAB CLINIC

✅ Đặt lịch thành công!

👤 Bệnh nhân: ${booking.customer_name}
📞 Số điện thoại: ${booking.phone_number}
📅 Ngày khám: ${appointmentDate}
⏰ Thời gian: ${booking.appointment_time}
🏥 Địa chỉ: KajoTai Rehab Clinic

📋 Triệu chứng: ${booking.symptoms || 'Không có'}
${booking.detailed_description ? `📝 Mô tả chi tiết: ${booking.detailed_description}` : ''}

📍 VUI LÒNG LƯU Ý:
• Đến đúng giờ hẹn (sớm 15 phút)
• Mang theo CMND/CCCD
• Quét QR tại quầy lễ tân để check-in

❓ Cần hỗ trợ? Liên hệ: [SĐT phòng khám]

Cảm ơn bạn đã tin tưởng KajoTai! 🙏`;
  }

  /**
   * Xây dựng tin nhắn nhắc nhở check-in
   */
  private static buildCheckinReminderMessage(booking: BookingRecord): string {
    return `⏰ NHẮC NHỞ LỊCH KHÁM - KAJOTAI REHAB CLINIC

Chào ${booking.customer_name}!

Bạn có lịch khám hôm nay:
📅 Thời gian: ${booking.appointment_time}
🏥 Tại: KajoTai Rehab Clinic

Vui lòng đến sớm 15 phút để check-in.
Quét QR tại quầy lễ tân khi đến phòng khám.

Chúc bạn một ngày tốt lành! 🌟`;
  }

  /**
   * Refresh access token khi hết hạn
   */
  static async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: this.config.refreshToken,
          app_id: import.meta.env.VITE_ZALO_APP_ID,
          grant_type: 'refresh_token'
        })
      });

      const result = await response.json();
      
      if (result.access_token) {
        // Cập nhật token mới (trong production, lưu vào database)
        this.config.accessToken = result.access_token;
        console.log('✅ Access token refreshed successfully');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Test connection với Zalo OA
   */
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.API_BASE}/getoa`, {
        method: 'GET',
        headers: {
          'access_token': this.config.accessToken
        }
      });

      const result = await response.json();
      
      if (result.error === 0) {
        return {
          success: true,
          message: `Connected to OA: ${result.data.name}`
        };
      } else {
        return {
          success: false,
          message: `Connection failed: ${result.message}`
        };
      }
      
    } catch (error) {
      return {
        success: false,
        message: `Network error: ${error}`
      };
    }
  }
}

export default ZaloOAMessagingService;
