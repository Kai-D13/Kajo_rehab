import { supabase, Facility, Doctor, Appointment } from './supabase';
import { AuthService } from './auth.service';
import { MockDatabaseService } from './mock-database.service';
import { SyncService } from './sync.service';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export interface BookingRequest {
  facility_id: string;
  doctor_id: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:mm
  symptoms?: string[];
  description?: string;
  duration_minutes?: number;
}

export interface SlotReservation {
  lock_id: string;
  expires_at: string;
  success: boolean;
  error_message?: string;
}

/**
 * 🛡️ PRODUCTION-READY BOOKING SERVICE
 * Implements conflict prevention, slot reservation, and atomic booking
 */
export class ProductionBookingService {
  private static readonly LOCK_DURATION = 5; // 5 minutes
  private static readonly MAX_RETRIES = 3;

  /**
   * 🔒 STEP 1: Reserve Slot (5-minute lock)
   * Prevents race conditions by reserving slot before user completes booking
   */
  static async reserveSlot(
    doctorId: string,
    facilityId: string,
    appointmentDate: string,
    appointmentTime: string
  ): Promise<SlotReservation> {
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

    if (isDevelopment) {
      console.log('🔧 Development mode: Using mock reservation');
      return MockDatabaseService.reserveSlot(doctorId, facilityId, appointmentDate, appointmentTime);
    }

    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('reserve_appointment_slot', {
        p_doctor_id: doctorId,
        p_facility_id: facilityId,
        p_appointment_date: appointmentDate,
        p_appointment_time: appointmentTime,
        p_user_id: user.id,
        p_duration_minutes: this.LOCK_DURATION
      });

      if (error) throw error;

      const result = data[0];
      if (!result.success) {
        throw new Error(result.error_message || 'Failed to reserve slot');
      }

      return {
        lock_id: result.lock_id,
        expires_at: result.expires_at,
        success: true
      };

    } catch (error) {
      console.error('❌ Slot reservation failed:', error);
      throw error;
    }
  }

  /**
   * ⚡ STEP 2: Create Booking (Atomic)
   * Uses database function to ensure no conflicts
   */
  static async createBookingAtomic(
    bookingData: BookingRequest,
    lockId?: string
  ): Promise<Appointment> {
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

    if (isDevelopment) {
      console.log('🔧 Development mode: Using mock booking');
      return await MockDatabaseService.createAppointment(bookingData);
    }

    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Find or create patient record
      const patient = await this.findOrCreatePatient(user.id);

      // Create appointment atomically
      const { data, error } = await supabase.rpc('create_booking_atomic', {
        p_patient_id: patient.id,
        p_doctor_id: bookingData.doctor_id,
        p_facility_id: bookingData.facility_id,
        p_appointment_date: bookingData.appointment_date,
        p_appointment_time: bookingData.appointment_time,
        p_duration_minutes: bookingData.duration_minutes || 30,
        p_symptoms: bookingData.symptoms || [],
        p_description: bookingData.description || '',
        p_user_id: user.id
      });

      if (error) throw error;

      const result = data[0];
      if (!result.success) {
        throw new Error(result.error_message || 'Failed to create booking');
      }

      // Fetch the created appointment with full details
      const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctors(*),
          facility:facilities(*),
          patient:patients(*)
        `)
        .eq('id', result.appointment_id)
        .single();

      if (fetchError) throw fetchError;

      // Generate QR code
      const qrCode = await this.generateQRCode(appointment.id);
      
      // Update appointment with QR code
      await supabase
        .from('appointments')
        .update({ 
          qr_code: qrCode,
          qr_code_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
        })
        .eq('id', appointment.id);

      // Send notifications
      await this.sendBookingConfirmation(appointment);

      toast.success('Đặt lịch thành công!');
      return { ...appointment, qr_code: qrCode };

    } catch (error) {
      console.error('❌ Booking creation failed:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('already booked')) {
          toast.error('Thời gian này đã có người đặt. Vui lòng chọn thời gian khác.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Đặt lịch thất bại');
      }
      
      throw error;
    }
  }

  /**
   * 🔄 COMPLETE BOOKING FLOW
   * Reserve slot -> User fills form -> Create booking
   */
  static async completeBookingFlow(bookingData: BookingRequest): Promise<Appointment> {
    let attempt = 0;
    console.log('🚀 Starting booking flow:', bookingData);

    while (attempt < this.MAX_RETRIES) {
      try {
        console.log(`🔄 Booking attempt ${attempt + 1}/${this.MAX_RETRIES}`);
        
        // Step 1: Try to reserve slot
        console.log('🎯 Attempting to reserve slot...');
        const reservation = await this.reserveSlot(
          bookingData.doctor_id,
          bookingData.facility_id,
          bookingData.appointment_date,
          bookingData.appointment_time
        );
        console.log('✅ Slot reserved successfully with lock_id:', reservation.lock_id);

        // Step 2: Create booking with reservation
        console.log('📝 Creating atomic booking...');
        const appointment = await this.createBookingAtomic(bookingData, reservation.lock_id);
        console.log('✅ Booking completed successfully:', appointment.id);
        return appointment;

      } catch (error) {
        attempt++;
        console.error(`❌ Booking attempt ${attempt} failed:`, error);
        
        if (error instanceof Error) {
          // If slot is unavailable, suggest alternatives
          if (error.message.includes('reserved') || error.message.includes('booked')) {
            console.log('🔍 Slot conflict detected, suggesting alternatives...');
            const alternatives = await this.suggestAlternativeSlots(bookingData);
            throw new BookingConflictError('Slot unavailable', alternatives);
          }

          // If max retries reached, throw error
          if (attempt >= this.MAX_RETRIES) {
            console.error('❌ Max retries reached, booking failed');
            throw error;
          }
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max booking attempts exceeded');
  }

  /**
   * 💡 SUGGEST ALTERNATIVE SLOTS
   * When booking fails, suggest nearby available slots
   */
  static async suggestAlternativeSlots(originalRequest: BookingRequest) {
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

    if (isDevelopment) {
      return MockDatabaseService.getAlternativeSlots(originalRequest);
    }

    try {
      // Get available slots for same day
      const sameDaySlots = await this.getAvailableSlots(
        originalRequest.doctor_id,
        originalRequest.appointment_date
      );

      if (sameDaySlots.length > 0) {
        return {
          type: 'same_day',
          date: originalRequest.appointment_date,
          slots: sameDaySlots.slice(0, 3)
        };
      }

      // Get slots for next 7 days
      const nextWeekSlots = await this.getAvailableSlotsNextDays(
        originalRequest.doctor_id,
        originalRequest.appointment_date,
        7
      );

      return {
        type: 'next_days',
        slots: nextWeekSlots.slice(0, 5)
      };

    } catch (error) {
      console.error('Error getting alternatives:', error);
      return { type: 'none', slots: [] };
    }
  }

  /**
   * 📅 GET AVAILABLE SLOTS for specific date
   */
  static async getAvailableSlots(doctorId: string, date: string): Promise<string[]> {
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', date)
      .in('status', ['pending', 'confirmed']);

    if (error) throw error;

    // Get doctor's working hours (assuming 9:00 - 17:00)
    const workingHours = this.generateTimeSlots('09:00', '17:00', 30); // 30-minute slots
    const bookedTimes = appointments?.map(apt => apt.appointment_time) || [];

    return workingHours.filter(time => !bookedTimes.includes(time));
  }

  /**
   * 🔄 GET AVAILABLE SLOTS for next N days
   */
  static async getAvailableSlotsNextDays(
    doctorId: string, 
    startDate: string, 
    days: number
  ): Promise<Array<{date: string, time: string}>> {
    const slots: Array<{date: string, time: string}> = [];
    const start = new Date(startDate);

    for (let i = 1; i <= days; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const availableSlots = await this.getAvailableSlots(doctorId, dateStr);
      
      availableSlots.slice(0, 2).forEach(time => { // Max 2 slots per day
        slots.push({ date: dateStr, time });
      });

      if (slots.length >= 5) break; // Max 5 suggestions
    }

    return slots;
  }

  /**
   * ⏰ GENERATE TIME SLOTS
   */
  private static generateTimeSlots(start: string, end: string, intervalMinutes: number): string[] {
    const slots: string[] = [];
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    for (let time = startTime; time < endTime; time += intervalMinutes) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
    
    return slots;
  }

  /**
   * 🔐 QR CODE GENERATION
   */
  private static async generateQRCode(appointmentId: string): Promise<string> {
    try {
      const qrData = {
        type: 'appointment_checkin',
        appointment_id: appointmentId,
        timestamp: new Date().getTime(),
        clinic: 'kajotai'
      };
      
      const qrCodeString = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 256,
        margin: 2,
        color: {
          dark: '#2563eb',
          light: '#ffffff'
        }
      });
      
      return qrCodeString;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Không thể tạo mã QR');
    }
  }

  /**
   * 👤 FIND OR CREATE PATIENT
   */
  private static async findOrCreatePatient(userId: string) {
    try {
      // Try to find existing patient
      const { data: existingPatient, error: findError } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingPatient && !findError) {
        return existingPatient;
      }

      // Create new patient
      const user = AuthService.getCurrentUser()!;
      const patientCode = `KT${Date.now().toString().slice(-8)}`;
      
      const { data: newPatient, error: createError } = await supabase
        .from('patients')
        .insert({
          user_id: userId,
          patient_code: patientCode,
          full_name: user.name,
          phone: user.phone || '',
          email: user.email || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (createError) throw createError;
      return newPatient;
    } catch (error) {
      console.error('Error finding/creating patient:', error);
      throw error;
    }
  }

  /**
   * 📱 SEND BOOKING CONFIRMATION
   */
  private static async sendBookingConfirmation(appointment: Appointment) {
    try {
      console.log('📧 Starting booking confirmation for:', appointment.id);
      
      // Send to Admin API immediately (localhost:3001)
      await this.sendToAdminAPI(appointment);
      
      // Create admin notification (only in production with real Supabase)
      const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
      if (!isDevelopment) {
        await supabase.from('admin_notifications').insert({
          type: 'new_booking',
          title: 'Lịch hẹn mới',
          message: `Bệnh nhân đã đặt lịch khám`,
          appointment_id: appointment.id,
          priority: 'normal'
        });
      }

      // TODO: Implement Zalo OA notification (Phase 2)
      console.log('📱 Booking confirmation sent:', appointment.id);
    } catch (error) {
      console.error('Error sending confirmation:', error);
      // Don't fail booking if notification fails
    }
  }

  /**
   * 📡 Send booking data to Admin API
   */
  private static async sendToAdminAPI(appointment: any) {
    try {
      const adminData = {
        id: appointment.id,
        patient_id: appointment.patient_id,
        patient_name: appointment.patient?.full_name || appointment.patient?.name || 'Bệnh nhân',
        doctor_id: appointment.doctor_id,
        doctor_name: appointment.doctor?.full_name || appointment.doctor?.name || 'Bác sĩ',
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        symptoms: appointment.symptoms || [],
        status: appointment.status || 'pending',
        created_at: appointment.created_at || new Date().toISOString(),
        department: appointment.doctor?.specialization || appointment.department || 'Tổng quát'
      };

      console.log('📡 Attempting to send to admin API:', adminData);
      console.log('📡 Admin API URL: http://localhost:3001/api/appointments');

      // Use SyncService first
      const syncResult = await SyncService.sendToAdminAPI(adminData);
      
      if (syncResult) {
        console.log('✅ Successfully sent to admin API via SyncService:', syncResult);
      } else {
        console.log('⚠️ SyncService failed, trying direct fetch...');
        
        // Fallback: direct fetch
        const response = await fetch('http://localhost:3001/api/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(adminData)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Direct fetch success:', result);
        } else {
          console.log('❌ Direct fetch failed:', response.status, response.statusText);
        }
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('❌ Admin API connection completely failed:', errorMessage);
      // Don't fail booking if admin API is down
    }
  }
}

/**
 * 🚨 CUSTOM ERROR CLASSES
 */
export class BookingConflictError extends Error {
  constructor(message: string, public alternatives?: any) {
    super(message);
    this.name = 'BookingConflictError';
  }
}

export class SlotReservationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SlotReservationError';
  }
}
