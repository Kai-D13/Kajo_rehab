/**
 * KAJO REHAB - END-TO-END BOOKING FLOW TESTER
 * Test toàn bộ luồng từ Mini App -> Backend -> Reception
 */

import { bookingServiceV2 } from './services/booking-v2.service';
import { AuthService } from './services/auth.service';
import { QRService } from './services/qr.service';
import { MockDatabaseService } from './services/mock-database.service';

interface TestBookingData {
  customer_name: string;
  phone_number: string;
  facility_id: string;
  service_id: string;
  service_name: string;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  symptoms: string;
  detailed_description: string;
}

export class BookingFlowTester {
  private bookingService: typeof bookingServiceV2;

  constructor() {
    this.bookingService = bookingServiceV2;
  }

  /**
   * TEST PHASE 1: AUTHENTICATION & USER SETUP
   */
  async testAuthentication(): Promise<boolean> {
    try {
      console.log('🔐 Phase 1: Testing Authentication...');
      
      // Simulate user authentication
      const mockUser = {
        id: 'patient-dev-123',
        name: 'Nguyễn Test User',
        avatar: 'https://via.placeholder.com/100',
        phone: '0123456789',
        zalopayUserId: 'zalo-123',
        accessToken: 'mock-token-123'
      };

      // Set authenticated user
      AuthService.setCurrentUser(mockUser);
      
      const currentUser = AuthService.getCurrentUser();
      console.log('✅ User authenticated:', currentUser?.name);
      
      return !!currentUser;
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      return false;
    }
  }

  /**
   * TEST PHASE 2: CREATE BOOKING
   */
  async testBookingCreation(): Promise<{ success: boolean; appointmentId?: string; qrCode?: string }> {
    try {
      console.log('📋 Phase 2: Testing Booking Creation...');
      
      // Generate dynamic time to avoid conflicts
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const randomHour = 14 + Math.floor(Math.random() * 3); // 14-16h
      const randomMinute = Math.floor(Math.random() * 2) * 30; // 0 or 30 minutes
      
      const testBooking: TestBookingData = {
        customer_name: 'Nguyễn Test User',
        phone_number: '0123456789',
        facility_id: 'facility-001',
        service_id: 'service-001',
        service_name: 'Vật lý trị liệu',
        doctor_name: 'BS. Trần Thị Test',
        appointment_date: tomorrow.toISOString().split('T')[0],
        appointment_time: `${randomHour.toString().padStart(2, '0')}:${randomMinute.toString().padStart(2, '0')}`,
        symptoms: 'Đau lưng, mỏi vai',
        detailed_description: 'Đau từ 2 tuần nay, tăng khi ngồi lâu. Cần khám và điều trị.'
      };

      const result = await this.bookingService.createBooking({
        doctor_name: testBooking.doctor_name,
        service_name: testBooking.service_name,
        service_id: testBooking.service_id,
        appointment_date: testBooking.appointment_date,
        appointment_time: testBooking.appointment_time,
        symptoms: testBooking.symptoms,
        notes: testBooking.detailed_description
      });

      if (result.success) {
        console.log('✅ Booking created successfully:', result.appointment.id);
        console.log('📅 Appointment details:', {
          date: result.appointment.appointment_date,
          time: result.appointment.appointment_time,
          symptoms: result.appointment.notes
        });
        
        return {
          success: true,
          appointmentId: result.appointment.id,
          qrCode: result.qrCode
        };
      } else {
        console.error('❌ Booking creation failed:', result.message);
        return { success: false };
      }

    } catch (error) {
      console.error('❌ Booking creation error:', error);
      return { success: false };
    }
  }

  /**
   * TEST PHASE 3: QR CODE GENERATION & DATA
   */
  async testQRCodeGeneration(appointmentId: string): Promise<{ success: boolean; qrData?: any }> {
    try {
      console.log('🔲 Phase 3: Testing QR Code Generation...');
      
      // Get appointment data
      const appointments = await this.bookingService.getUserAppointments();
      const appointment = appointments.find(apt => apt.id === appointmentId);
      
      if (!appointment) {
        console.error('❌ Appointment not found');
        return { success: false };
      }

      // Generate QR code
      const qrCode = await QRService.generateQRCode(appointment);
      console.log('✅ QR Code generated');

      // Test QR data extraction (what Reception App will receive)
      const qrData = await QRService.extractQRData(qrCode);
      console.log('📱 Reception App will receive:', {
        appointmentId: qrData.appointmentId,
        patientName: qrData.appointmentData.patient_name,
        doctorName: qrData.appointmentData.doctor_name,
        date: qrData.appointmentData.appointment_date,
        time: qrData.appointmentData.appointment_time,
        symptoms: qrData.appointmentData.notes?.includes('Triệu chứng:'),
        fullNotes: qrData.appointmentData.notes
      });

      return {
        success: true,
        qrData: qrData
      };

    } catch (error) {
      console.error('❌ QR Code generation error:', error);
      return { success: false };
    }
  }

  /**
   * TEST PHASE 4: RECEPTION APP SIMULATION
   */
  async testReceptionWorkflow(qrCode: string): Promise<boolean> {
    try {
      console.log('🏥 Phase 4: Testing Reception App Workflow...');
      
      // Simulate QR scanning
      const scannedData = await QRService.extractQRData(qrCode);
      
      if (!scannedData || !scannedData.appointmentData) {
        console.error('❌ Invalid QR code data');
        return false;
      }

      // Display what reception sees
      console.log('👥 Reception App Display:');
      console.log('┌─────────────────────────────────────┐');
      console.log('│ 🏥 KAJO REHAB - CHECK IN            │');
      console.log('├─────────────────────────────────────┤');
      console.log('│ ✅ QR Code Valid                    │');
      console.log('│                                     │');
      console.log(`│ 👤 Bệnh nhân: ${scannedData.appointmentData.patient_name || 'N/A'}`);
      console.log(`│ 👨‍⚕️ Bác sĩ: ${scannedData.appointmentData.doctor_name || 'N/A'}`);
      console.log(`│ 📅 Ngày: ${scannedData.appointmentData.appointment_date || 'N/A'}`);
      console.log(`│ ⏰ Giờ: ${scannedData.appointmentData.appointment_time || 'N/A'}`);
      console.log(`│ ✅ Trạng thái: ${scannedData.appointmentData.status || 'N/A'}`);
      console.log('│                                     │');
      console.log('│ 💬 THÔNG TIN KHÁM:                  │');
      console.log(`│ ${scannedData.appointmentData.notes || 'Không có thông tin'}`);
      console.log('│                                     │');
      console.log('│ [✅ XÁC NHẬN CHECK-IN]              │');
      console.log('└─────────────────────────────────────┘');

      // Simulate check-in
      const appointmentId = scannedData.appointmentId;
      if (appointmentId) {
        // Update appointment status to checked_in
        MockDatabaseService.updateAppointmentStatus(appointmentId, 'checked_in');
        console.log('✅ Patient checked in successfully');
        
        return true;
      }

      return false;

    } catch (error) {
      console.error('❌ Reception workflow error:', error);
      return false;
    }
  }

  /**
   * FULL END-TO-END TEST
   */
  async runCompleteTest(): Promise<void> {
    console.log('🚀 Starting Complete End-to-End Booking Test...\n');
    
    try {
      // Phase 1: Authentication
      const authSuccess = await this.testAuthentication();
      if (!authSuccess) {
        throw new Error('Authentication failed');
      }
      console.log('');

      // Phase 2: Booking Creation
      const bookingResult = await this.testBookingCreation();
      if (!bookingResult.success || !bookingResult.appointmentId) {
        throw new Error('Booking creation failed');
      }
      console.log('');

      // Phase 3: QR Code Generation
      const qrResult = await this.testQRCodeGeneration(bookingResult.appointmentId);
      if (!qrResult.success || !qrResult.qrData) {
        throw new Error('QR code generation failed');
      }
      console.log('');

      // Phase 4: Reception Workflow
      const receptionSuccess = await this.testReceptionWorkflow(bookingResult.qrCode!);
      if (!receptionSuccess) {
        throw new Error('Reception workflow failed');
      }
      console.log('');

      // Final Summary
      console.log('🎉 END-TO-END TEST COMPLETED SUCCESSFULLY!');
      console.log('✅ All phases working:');
      console.log('  1. User Authentication');
      console.log('  2. Booking Creation & Data Storage');
      console.log('  3. QR Code Generation & Data Embedding');
      console.log('  4. Reception App Workflow & Check-in');
      console.log('');
      console.log('🏥 System ready for production deployment!');

    } catch (error) {
      console.error('❌ END-TO-END TEST FAILED:', error);
      console.log('🔧 Please fix the issues and run test again');
    }
  }

  /**
   * HELPER METHODS
   */
  private getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
}

// Export singleton for testing
export const bookingFlowTester = new BookingFlowTester();
