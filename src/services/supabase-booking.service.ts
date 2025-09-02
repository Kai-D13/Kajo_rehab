// Real Supabase Booking Service - Production Ready
import { supabase } from './supabase.config';
import { WorkingHoursService } from './working-hours.service';
import { QRService } from './qr.service';
import { AuthService } from './auth.service';
import toast from 'react-hot-toast';

export interface SupabaseBookingData {
    customer_name: string;
    phone_number: string;
    appointment_date: string;
    appointment_time: string;
    symptoms?: string;
    detailed_description?: string;
    doctor_id?: string;
    service_id?: string;
}

export interface SupabaseBookingResult {
    success: boolean;
    booking?: any;
    qrCode?: string;
    message: string;
}

export class SupabaseBookingService {
    
    /**
     * Create booking directly in Supabase with validation
     */
    static async createBooking(bookingData: SupabaseBookingData): Promise<SupabaseBookingResult> {
        try {
            console.log('🏥 Creating booking with real Supabase integration:', bookingData);

            // Step 1: Validate working hours
            const timeValidation = WorkingHoursService.validateBookingTime(
                bookingData.appointment_date, 
                bookingData.appointment_time
            );

            if (!timeValidation.valid) {
                return {
                    success: false,
                    message: timeValidation.reason || 'Thời gian đặt lịch không hợp lệ'
                };
            }

            // Step 2: Get authenticated user
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập để đặt lịch khám'
                };
            }

            // Step 3: Check for time conflicts
            const hasConflict = await this.checkTimeConflict(
                bookingData.appointment_date,
                bookingData.appointment_time,
                bookingData.doctor_id
            );

            if (hasConflict) {
                return {
                    success: false,
                    message: 'Thời gian này đã có người đặt, vui lòng chọn thời gian khác'
                };
            }

            // Step 4: Create booking record
            const bookingRecord = {
                customer_name: bookingData.customer_name,
                phone_number: bookingData.phone_number,
                user_id: currentUser.id,
                appointment_date: bookingData.appointment_date,
                appointment_time: bookingData.appointment_time,
                symptoms: bookingData.symptoms || '',
                detailed_description: bookingData.detailed_description || '',
                booking_status: 'pending',
                checkin_status: 'not_checked',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            console.log('📝 Inserting booking into Supabase bookings table:', bookingRecord);

            const { data, error } = await supabase
                .from('bookings')
                .insert([bookingRecord])
                .select()
                .single();

            if (error) {
                console.error('❌ Supabase insert error:', error);
                throw new Error(`Database error: ${error.message}`);
            }

            console.log('✅ Booking created successfully in Supabase:', data);

            // Step 5: Generate QR code
            const qrCode = await QRService.generateQRCode(data);

            // Step 6: Update booking with QR code
            await this.updateBookingQR(data.id, qrCode);

            return {
                success: true,
                booking: data,
                qrCode: qrCode,
                message: 'Đặt lịch khám thành công! Vui lòng đến đúng giờ hẹn.'
            };

        } catch (error: any) {
            console.error('❌ Supabase booking creation failed:', error);
            return {
                success: false,
                message: error.message || 'Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại sau.'
            };
        }
    }

    /**
     * Check for time conflicts in Supabase bookings table
     */
    static async checkTimeConflict(
        appointmentDate: string, 
        appointmentTime: string, 
        doctorId?: string
    ): Promise<boolean> {
        try {
            console.log('🔍 Checking time conflicts in Supabase:', { appointmentDate, appointmentTime, doctorId });

            let query = supabase
                .from('bookings')
                .select('id, customer_name')
                .eq('appointment_date', appointmentDate)
                .eq('appointment_time', appointmentTime)
                .in('booking_status', ['pending', 'confirmed']);

            // If doctor_id is specified, check for that specific doctor only
            if (doctorId) {
                query = query.eq('doctor_id', doctorId);
            }

            const { data, error } = await query;

            if (error) {
                console.error('❌ Error checking time conflicts:', error);
                return false; // Allow booking if check fails (fail open)
            }

            const hasConflict = data && data.length > 0;
            
            if (hasConflict) {
                console.log(`⚠️ TIME CONFLICT DETECTED:`, data);
            } else {
                console.log('✅ No time conflicts found');
            }
            
            return hasConflict;

        } catch (error) {
            console.error('❌ Time conflict check failed:', error);
            return false; // Allow booking if check fails
        }
    }

    /**
     * Get user's bookings from Supabase
     */
    static async getUserBookings(userId?: string): Promise<any[]> {
        try {
            const currentUser = AuthService.getCurrentUser();
            const targetUserId = userId || currentUser?.id;

            if (!targetUserId) {
                console.log('👤 No user ID available for booking lookup');
                return [];
            }

            console.log('📋 Fetching bookings for user:', targetUserId);

            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('user_id', targetUserId)
                .order('appointment_date', { ascending: true })
                .order('appointment_time', { ascending: true });

            if (error) {
                console.error('❌ Error fetching user bookings:', error);
                return [];
            }

            console.log(`✅ Found ${data?.length || 0} bookings for user`);
            return data || [];

        } catch (error) {
            console.error('❌ Failed to fetch user bookings:', error);
            return [];
        }
    }

    /**
     * Cancel a booking
     */
    static async cancelBooking(bookingId: string): Promise<{ success: boolean; message: string }> {
        try {
            console.log('❌ Cancelling booking:', bookingId);

            const { data, error } = await supabase
                .from('bookings')
                .update({
                    booking_status: 'user_cancelled',
                    updated_at: new Date().toISOString()
                })
                .eq('id', bookingId)
                .select()
                .single();

            if (error) {
                throw error;
            }

            console.log('✅ Booking cancelled successfully');
            return {
                success: true,
                message: 'Hủy lịch hẹn thành công'
            };

        } catch (error: any) {
            console.error('❌ Failed to cancel booking:', error);
            return {
                success: false,
                message: error.message || 'Không thể hủy lịch hẹn'
            };
        }
    }

    /**
     * Get available time slots for a date (excluding booked slots)
     */
    static async getAvailableSlots(date: string, doctorId?: string): Promise<string[]> {
        try {
            // Get all possible slots for the date
            const allSlots = WorkingHoursService.generateTimeSlots(date);
            
            // Get booked slots from database
            let query = supabase
                .from('bookings')
                .select('appointment_time')
                .eq('appointment_date', date)
                .in('booking_status', ['pending', 'confirmed']);

            if (doctorId) {
                query = query.eq('doctor_id', doctorId);
            }

            const { data, error } = await query;

            if (error) {
                console.error('❌ Error fetching booked slots:', error);
                return allSlots; // Return all slots if check fails
            }

            const bookedTimes = data?.map(booking => booking.appointment_time) || [];
            const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

            console.log(`📅 Available slots for ${date}:`, availableSlots);
            return availableSlots;

        } catch (error) {
            console.error('❌ Failed to get available slots:', error);
            return WorkingHoursService.generateTimeSlots(date); // Return all slots as fallback
        }
    }

    /**
     * Update booking with QR code
     */
    private static async updateBookingQR(bookingId: string, qrCode: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ 
                    qr_code_data: qrCode,
                    updated_at: new Date().toISOString()
                })
                .eq('id', bookingId);

            if (error) {
                console.error('❌ Failed to update booking with QR code:', error);
            } else {
                console.log('✅ Booking QR code updated successfully');
            }
        } catch (error) {
            console.error('❌ QR code update error:', error);
        }
    }

    /**
     * Get booking by ID
     */
    static async getBookingById(bookingId: string): Promise<any | null> {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('id', bookingId)
                .single();

            if (error) {
                console.error('❌ Error fetching booking by ID:', error);
                return null;
            }

            return data;

        } catch (error) {
            console.error('❌ Failed to fetch booking by ID:', error);
            return null;
        }
    }

    /**
     * Update booking status (for reception staff)
     */
    static async updateBookingStatus(bookingId: string, status: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({
                    booking_status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', bookingId);

            if (error) {
                console.error('❌ Failed to update booking status:', error);
                return false;
            }

            console.log(`✅ Booking status updated to: ${status}`);
            return true;

        } catch (error) {
            console.error('❌ Booking status update error:', error);
            return false;
        }
    }
}

export default SupabaseBookingService;
