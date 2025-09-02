// QR Code Service for Appointment Check-in System
import QRCode from 'qrcode';
import CryptoJS from 'crypto-js';
import { Appointment } from './supabase.config';

// QR Payload Structure
export interface QRPayload {
  appointmentId: string;
  userId: string;
  clinicId?: string;
  timestamp: number;
  expiresAt: number;
  signature: string;
}

// QR Scan Result
export interface QRScanResult {
  isValid: boolean;
  payload?: QRPayload;
  appointment?: Appointment;
  error?: string;
}

export class QRService {
  private static readonly SECRET_KEY = 'kajo-rehab-qr-secret-2025'; // TODO: Move to env
  private static readonly QR_EXPIRY_HOURS = 24; // QR code expires after 24 hours

  /**
   * Generate QR code for an appointment
   */
  static async generateQRCode(appointment: Appointment): Promise<string> {
    try {
      // Create payload
      const now = Date.now();
      const expiresAt = now + (this.QR_EXPIRY_HOURS * 60 * 60 * 1000);
      
      const payload: QRPayload = {
        appointmentId: appointment.id,
        userId: appointment.user_id,
        clinicId: appointment.service_id, // Using service_id as clinic identifier
        timestamp: now,
        expiresAt: expiresAt,
        signature: this.generateSignature(appointment, now, expiresAt)
      };

      // Encrypt payload
      const encryptedPayload = this.encryptPayload(payload);
      
      // Generate QR code
      const qrDataURL = await QRCode.toDataURL(encryptedPayload, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        width: 300
      });

      console.log('✅ QR Code generated for appointment:', appointment.id);
      return qrDataURL;
    } catch (error) {
      console.error('❌ Error generating QR code:', error);
      throw new Error('Không thể tạo mã QR. Vui lòng thử lại!');
    }
  }

  /**
   * Generate QR code as text (for storage)
   */
  static async generateQRText(appointment: Appointment): Promise<string> {
    try {
      const now = Date.now();
      const expiresAt = now + (this.QR_EXPIRY_HOURS * 60 * 60 * 1000);
      
      const payload: QRPayload = {
        appointmentId: appointment.id,
        userId: appointment.user_id,
        clinicId: appointment.service_id,
        timestamp: now,
        expiresAt: expiresAt,
        signature: this.generateSignature(appointment, now, expiresAt)
      };

      return this.encryptPayload(payload);
    } catch (error) {
      console.error('❌ Error generating QR text:', error);
      throw new Error('Không thể tạo dữ liệu QR');
    }
  }

  /**
   * Validate and parse QR code
   */
  static async validateQRCode(qrData: string): Promise<QRScanResult> {
    try {
      // Decrypt payload
      const payload = this.decryptPayload(qrData);
      
      if (!payload) {
        return {
          isValid: false,
          error: 'Mã QR không hợp lệ hoặc đã bị hỏng'
        };
      }

      // Check expiry
      const now = Date.now();
      if (now > payload.expiresAt) {
        return {
          isValid: false,
          error: 'Mã QR đã hết hạn. Vui lòng tạo mã mới!'
        };
      }

      // Validate timestamp (not too old or in future)
      const timeDiff = Math.abs(now - payload.timestamp);
      const maxTimeDiff = this.QR_EXPIRY_HOURS * 60 * 60 * 1000;
      
      if (timeDiff > maxTimeDiff) {
        return {
          isValid: false,
          error: 'Mã QR không hợp lệ (timestamp issue)'
        };
      }

      console.log('✅ QR code validated successfully:', payload.appointmentId);
      
      return {
        isValid: true,
        payload: payload
      };

    } catch (error) {
      console.error('❌ Error validating QR code:', error);
      return {
        isValid: false,
        error: 'Không thể đọc mã QR. Vui lòng thử lại!'
      };
    }
  }

  /**
   * Generate HMAC signature for security
   */
  private static generateSignature(appointment: Appointment, timestamp: number, expiresAt: number): string {
    const data = `${appointment.id}-${appointment.user_id}-${timestamp}-${expiresAt}`;
    return CryptoJS.HmacSHA256(data, this.SECRET_KEY).toString();
  }

  /**
   * Verify HMAC signature
   */
  private static verifySignature(payload: QRPayload, appointment?: Appointment): boolean {
    if (!appointment) return false;
    
    const expectedSignature = this.generateSignature(appointment, payload.timestamp, payload.expiresAt);
    return payload.signature === expectedSignature;
  }

  /**
   * Encrypt QR payload
   */
  private static encryptPayload(payload: QRPayload): string {
    const payloadStr = JSON.stringify(payload);
    return CryptoJS.AES.encrypt(payloadStr, this.SECRET_KEY).toString();
  }

  /**
   * Decrypt QR payload
   */
  private static decryptPayload(encryptedData: string): QRPayload | null {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.SECRET_KEY);
      const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedStr) {
        return null;
      }

      return JSON.parse(decryptedStr) as QRPayload;
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  /**
   * Generate QR code options for different use cases
   */
  static getQROptions() {
    return {
      // For display on phone screen
      display: {
        errorCorrectionLevel: 'M' as const,
        type: 'image/png' as const,
        quality: 0.92,
        margin: 2,
        color: {
          dark: '#2563eb', // Blue color
          light: '#ffffff',
        },
        width: 280
      },
      
      // For printing
      print: {
        errorCorrectionLevel: 'H' as const,
        type: 'image/png' as const,
        quality: 1,
        margin: 3,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        width: 400
      },

      // For small screens
      compact: {
        errorCorrectionLevel: 'L' as const,
        type: 'image/png' as const,
        quality: 0.8,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        width: 200
      }
    };
  }

  /**
   * Create QR code with custom options
   */
  static async generateCustomQR(appointment: Appointment, optionType: 'display' | 'print' | 'compact'): Promise<string> {
    try {
      const payload = await this.generateQRText(appointment);
      const options = this.getQROptions()[optionType];
      
      return await QRCode.toDataURL(payload, options);
    } catch (error) {
      console.error('❌ Error generating custom QR:', error);
      throw new Error('Không thể tạo mã QR tùy chỉnh');
    }
  }

  /**
   * Extract QR data for reception app (what reception will see)
   */
  static async extractQRData(qrCode: string): Promise<{
    appointmentId: string;
    appointmentData: any;
  } | null> {
    try {
      // For data URL QR codes, we need to decode the actual QR content
      // In this implementation, we'll extract from the encrypted payload
      
      // This is a simplified version - in reality, you'd scan the QR code
      // and get the encrypted payload, then decrypt it
      console.log('🔍 Extracting QR data for reception app...');
      
      // Mock extraction for testing (replace with actual QR decode in production)
      const mockAppointmentData = {
        id: 'appointment-123',
        patient_name: 'Test User',
        doctor_name: 'BS. Test Doctor', 
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '14:00',
        status: 'confirmed',
        notes: 'Triệu chứng: Đau lưng, mỏi vai. Mô tả: Đau từ 2 tuần nay, tăng khi ngồi lâu.'
      };

      return {
        appointmentId: mockAppointmentData.id,
        appointmentData: mockAppointmentData
      };
    } catch (error) {
      console.error('❌ Error extracting QR data:', error);
      return null;
    }
  }
}
