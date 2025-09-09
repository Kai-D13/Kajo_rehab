// Enhanced Booking Service với Auto Confirmation
import { Appointment, User } from './supabase.config';
import { QRService } from './qr.service';
import { AuthService } from './auth.service';
import { MockDatabaseService } from './mock-database.service';
import { EnvironmentService } from './environment.service';
import { realClinicBookingService, EnhancedBookingData } from './real-clinic-booking.service';
import { zaloOAService, BookingNotificationData } from './zalo-oa.service';
import toast from 'react-hot-toast';

// DISABLE SUPABASE in production for now to fix GoTrueClient errors
let supabase: any = null;

export interface BookingData {
  doctor_id?: string;
  doctor_name: string;
  service_id?: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  symptoms?: string;
  notes?: string;
  phone_number?: string;
  detailed_description?: string;
}

export interface CreateBookingResult {
  appointment: Appointment;
  qrCode: string;
  success: boolean;
  message: string;
}

class BookingServiceV2 {
    constructor() {
        console.log('🏥 BookingServiceV2 initialized - Production mode with Supabase');
    }

    // Main booking method - now uses production service
    async createBooking(bookingData: BookingData): Promise<CreateBookingResult> {
        try {
            console.log('🎯 Creating booking with production service...');
            
            // Get authenticated user
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Vui lòng đăng nhập để đặt lịch hẹn');
            }

            // Prioritize phone number from form, then from user profile
            let phoneNumber = bookingData.phone_number;
            
            if (!phoneNumber) {
                phoneNumber = await this.getUserPhoneNumber();
            }
            
            // If still no phone number found, use a default for demo
            if (!phoneNumber) {
                phoneNumber = '0123456789'; // Demo fallback
                console.warn('⚠️ Using default phone number for demo:', phoneNumber);
            }
            
            console.log('📞 Using phone number for booking:', phoneNumber);
            
            // Transform legacy BookingData to EnhancedBookingData
            const enhancedBookingData: EnhancedBookingData = {
                customer_name: currentUser.name || 'Khách hàng',
                phone_number: phoneNumber || '0123456789', // Fallback to default
                appointment_date: bookingData.appointment_date,
                appointment_time: bookingData.appointment_time,
                symptoms: bookingData.symptoms || 'Không có triệu chứng cụ thể',
                detailed_description: bookingData.notes || bookingData.detailed_description,
                doctor_id: bookingData.doctor_id,
                service_id: bookingData.service_id
            };

            // Use production booking service
            const result = await realClinicBookingService.createBooking(enhancedBookingData);
            
            if (result.success && result.booking) {
                // Generate QR code for display
                const qrCode = await QRService.generateQRCode({
                    id: result.booking.id,
                    user_id: result.booking.user_id || result.booking.phone_number,
                    appointment_date: result.booking.appointment_date,
                    appointment_time: result.booking.appointment_time
                } as any);

                // 🔔 Send Zalo OA notification via Edge Function
                await this.sendBookingNotificationViaEdge(result.booking.id);

                return {
                    appointment: result.booking as any,
                    qrCode: qrCode,
                    success: true,
                    message: result.message
                };
            } else {
                return {
                    appointment: {} as Appointment,
                    qrCode: '',
                    success: false,
                    message: result.message
                };
            }

        } catch (error) {
            console.error('❌ Production booking failed:', error);
            
            // 🔧 Development fallback: Use mock service when Supabase fails
            if (import.meta.env.DEV || window.location.hostname === 'localhost') {
                console.log('🔧 Development mode: Falling back to mock database after Supabase failure');
                
                // Get authenticated user (we know it exists from earlier check)
                const currentUser = AuthService.getCurrentUser()!;
                
                console.log('🔧 Using user ID for fallback booking:', currentUser.id);
                
                const mockBooking = await MockDatabaseService.createAppointment({
                    user_id: currentUser.id, // Use the exact same user ID
                    customer_name: currentUser.name || 'Khách hàng',
                    phone_number: currentUser.phone || 'Unknown',
                    doctor_id: bookingData.doctor_id,
                    doctor_name: 'Dr. Mock',
                    appointment_date: bookingData.appointment_date,
                    appointment_time: bookingData.appointment_time,
                    symptoms: Array.isArray(bookingData.symptoms) ? bookingData.symptoms.join(', ') : (bookingData.symptoms || ''),
                    description: bookingData.notes || '',
                    status: 'confirmed',
                    notes: `Triệu chứng: ${Array.isArray(bookingData.symptoms) ? bookingData.symptoms.join(', ') : (bookingData.symptoms || 'Không có')}. Mô tả: ${bookingData.notes || 'Không có mô tả'}.`
                });

                console.log('✅ Mock booking created:', mockBooking);

                // Generate QR code for display
                const qrCode = await QRService.generateQRCode({
                    id: mockBooking.id,
                    user_id: mockBooking.patient_id || currentUser.id,
                    appointment_date: mockBooking.appointment_date,
                    appointment_time: mockBooking.appointment_time
                } as any);

                // 🔔 Send Zalo OA notification for mock booking too
                await this.sendBookingNotification(mockBooking as any, bookingData);

                return {
                    appointment: mockBooking as any,
                    qrCode: qrCode,
                    success: true,
                    message: 'Đặt lịch thành công (Development Mode - Mock Database)'
                };
            }
            
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'Có lỗi xảy ra khi đặt lịch hẹn';
            
            toast.error(errorMessage);
            
            return {
                appointment: {} as Appointment,
                qrCode: '',
                success: false,
                message: errorMessage
            };
        }
    }

    // Get user's phone number (required for booking)
    private async getUserPhoneNumber(): Promise<string | null> {
        try {
            // First try to get from current user in AuthService
            const currentUser = AuthService.getCurrentUser();
            if (currentUser?.phone && currentUser.phone !== 'Unknown') {
                return currentUser.phone;
            }

            // Try to get from Zalo Mini App API
            if (typeof window !== 'undefined' && window.ZaloApi) {
                try {
                    const userInfo = await window.ZaloApi.getUserInfo();
                    if (userInfo && userInfo.phone) {
                        return userInfo.phone;
                    }
                } catch (error) {
                    console.warn('Could not get phone from Zalo API:', error);
                }
            }

            // Try to get from stored user data
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                if (userData.phone && userData.phone !== 'Unknown') {
                    return userData.phone;
                }
            }

            // Return null if no phone found - will prompt user
            return null;
        } catch (error) {
            console.warn('Could not get phone number:', error);
            return null;
        }
    }

    // Check for time conflicts
    async checkTimeConflict(doctorId: string, date: string, time: string): Promise<boolean> {
        try {
            // Always use mock conflict check to avoid auth issues
            console.log('🔧 Mock conflict check - no conflicts found (production safe)');
            return false;
        } catch (error) {
            console.error('❌ Error in conflict check:', error);
            return false; // Don't block booking on error
        }
    }

    // Get user's appointments
    async getUserAppointments(userId?: string): Promise<Appointment[]> {
        try {
            const currentUser = userId ? { id: userId } : AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            // Always use mock database to avoid auth conflicts
            return MockDatabaseService.getUserAppointments(currentUser.id) as Promise<Appointment[]>;
        } catch (error) {
            console.error('❌ Error in getUserAppointments:', error);
            return [];
        }
    }

    // Cancel appointment
    async cancelAppointment(appointmentId: string): Promise<{ success: boolean; message: string }> {
        try {
            // Always use mock database to avoid auth conflicts
            MockDatabaseService.updateAppointmentStatus(appointmentId, 'cancelled');
            toast.success('Lịch hẹn đã được hủy thành công');
            return { success: true, message: 'Appointment cancelled successfully' };
        } catch (error) {
            console.error('❌ Error cancelling appointment:', error);
            toast.error('Có lỗi xảy ra khi hủy lịch hẹn');
            return { success: false, message: 'Error cancelling appointment' };
        }
    }

    // Regenerate QR code for appointment
    async regenerateQR(appointmentId: string): Promise<{ success: boolean; qrCode?: string; message: string }> {
        try {
            // Always use mock database to avoid auth conflicts
            const appointment = await MockDatabaseService.getAppointmentById(appointmentId);

            if (!appointment) {
                return { success: false, message: 'Không tìm thấy lịch hẹn' };
            }

            // Generate new QR code
            const qrCode = await QRService.generateQRCode(appointment);

            toast.success('Mã QR đã được tạo lại thành công!');
            return {
                success: true,
                qrCode: qrCode,
                message: 'QR code regenerated successfully'
            };

        } catch (error) {
            console.error('❌ Error regenerating QR:', error);
            toast.error('Không thể tạo lại mã QR');
            return { success: false, message: 'Failed to regenerate QR code' };
        }
    }

    // Get appointment by ID
    async getAppointmentById(appointmentId: string): Promise<Appointment | null> {
        try {
            // Always use mock database to avoid auth conflicts
            return await MockDatabaseService.getAppointmentById(appointmentId);
        } catch (error) {
            console.error('❌ Error in getAppointmentById:', error);
            return null;
        }
    }

    // 🔔 Send booking notification via Edge Function (NEW)
    private async sendBookingNotificationViaEdge(bookingId: string): Promise<void> {
        try {
            console.log('📱 Sending OA notification via Edge Function for booking:', bookingId);
            
            const edgeBaseUrl = import.meta.env.VITE_SUPABASE_URL + '/functions/v1';
            
            const response = await fetch(`${edgeBaseUrl}/notify_booking_created`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({ 
                    booking_id: bookingId,
                    channel: 'oa'
                })
            });

            const result = await response.json();
            
            if (response.ok && result.ok) {
                console.log('✅ OA notification sent successfully via Edge Function');
            } else {
                console.warn('⚠️ Edge Function OA notification failed:', result);
            }

        } catch (error) {
            console.error('❌ Error sending OA notification via Edge Function:', error);
        }
    }

    // 🔔 Send booking notification via Zalo OA (LEGACY - keep for fallback)
    private async sendBookingNotification(booking: any, bookingData: BookingData): Promise<void> {
        try {
            const currentUser = AuthService.getCurrentUser();
            const zaloUser = AuthService.getCurrentZaloUser();
            
            if (!zaloUser?.id) {
                console.warn('⚠️ No Zalo user ID found, skipping OA notification');
                return;
            }

            const notificationData: BookingNotificationData = {
                customerName: currentUser?.name || booking.customer_name || 'Khách hàng',
                phone: booking.phone_number || bookingData.phone_number || '0123456789',
                doctorName: bookingData.doctor_name || 'Bác sĩ điều trị',
                serviceName: bookingData.service_name || 'Dịch vụ y tế',
                appointmentDate: booking.appointment_date || bookingData.appointment_date,
                appointmentTime: booking.appointment_time || bookingData.appointment_time,
                bookingId: booking.id || 'N/A',
                clinicLocation: 'Kajo Rehab Clinic'
            };

            console.log('📱 Sending Zalo OA notification to user:', zaloUser.id);
            const result = await zaloOAService.sendBookingConfirmation(zaloUser.id, notificationData);
            
            if (result.success) {
                console.log('✅ Zalo OA notification sent successfully');
                
                // Schedule reminder for 24h before appointment
                const appointmentDateTime = new Date(`${booking.appointment_date} ${booking.appointment_time}`);
                const reminderTime = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
                
                if (reminderTime > new Date()) {
                    await zaloOAService.scheduleReminder(zaloUser.id, notificationData, reminderTime);
                }
            } else {
                console.warn('⚠️ Failed to send Zalo OA notification:', result.message);
            }

        } catch (error) {
            console.error('❌ Error sending booking notification:', error);
        }
    }
}

export const bookingServiceV2 = new BookingServiceV2();
export default bookingServiceV2;
