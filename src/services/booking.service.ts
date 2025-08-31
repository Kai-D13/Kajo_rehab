import { supabase, Facility, Doctor, Appointment } from './supabase';
import { AuthService } from './auth.service';
import { MockDatabaseService } from './mock-database.service';
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

export class BookingService {
  /**
   * Lấy danh sách cơ sở y tế
   */
  static async getFacilities(): Promise<Facility[]> {
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

    if (isDevelopment) {
      console.log('🔧 Using mock database for facilities');
      return await MockDatabaseService.getFacilities();
    }

    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast.error('Không thể tải danh sách cơ sở');
      return [];
    }
  }

  /**
   * Lấy danh sách bác sĩ theo cơ sở
   */
  static async getDoctorsByFacility(facilityId: string): Promise<Doctor[]> {
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

    if (isDevelopment) {
      console.log('🔧 Using mock database for doctors');
      return await MockDatabaseService.getDoctorsByFacility(facilityId);
    }

    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('is_available', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Không thể tải danh sách bác sĩ');
      return [];
    }
  }

  /**
   * Kiểm tra slot thời gian có available không
   */
  static async checkAvailability(
    doctorId: string,
    appointmentDate: string,
    appointmentTime: string
  ): Promise<boolean> {
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

    if (isDevelopment) {
      return await MockDatabaseService.checkAvailability(doctorId, appointmentDate, appointmentTime);
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', appointmentDate)
        .eq('appointment_time', appointmentTime)
        .in('status', ['pending', 'confirmed'])
        .limit(1);

      if (error) throw error;
      return !data || data.length === 0;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }

  /**
   * Tạo QR code cho appointment
   */
  private static async generateQRCode(appointmentId: string): Promise<string> {
    try {
      const qrData = {
        type: 'appointment_checkin',
        appointment_id: appointmentId,
        timestamp: new Date().getTime()
      };
      
      const qrCodeString = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return qrCodeString;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Không thể tạo mã QR');
    }
  }

  /**
   * Tạo appointment mới
   */
  static async createAppointment(bookingData: BookingRequest): Promise<Appointment> {
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

    if (isDevelopment) {
      console.log('🔧 Using mock database for creating appointment');
      const appointment = await MockDatabaseService.createAppointment(bookingData);
      toast.success('Đặt lịch thành công! (Development mode)');
      return appointment;
    }

    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('User chưa đăng nhập');
      }

      // Kiểm tra availability
      const isAvailable = await this.checkAvailability(
        bookingData.doctor_id,
        bookingData.appointment_date,
        bookingData.appointment_time
      );

      if (!isAvailable) {
        throw new Error('Thời gian này đã có người đặt');
      }

      // Tìm hoặc tạo patient record
      const patient = await this.findOrCreatePatient(user.id);

      // Tạo appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: patient.id,
          doctor_id: bookingData.doctor_id,
          facility_id: bookingData.facility_id,
          appointment_date: bookingData.appointment_date,
          appointment_time: bookingData.appointment_time,
          duration_minutes: bookingData.duration_minutes || 30,
          symptoms: bookingData.symptoms || [],
          description: bookingData.description || '',
          status: 'pending',
          qr_code_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h from now
        })
        .select('*')
        .single();

      if (appointmentError) throw appointmentError;

      // Generate QR code
      const qrCode = await this.generateQRCode(appointment.id);
      
      // Update appointment with QR code
      const { data: updatedAppointment, error: updateError } = await supabase
        .from('appointments')
        .update({ qr_code: qrCode })
        .eq('id', appointment.id)
        .select('*')
        .single();

      if (updateError) throw updateError;

      // Schedule notification (optional - sẽ implement sau)
      // await this.scheduleAppointmentReminder(updatedAppointment);

      toast.success('Đặt lịch thành công!');
      return updatedAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Đặt lịch thất bại');
      }
      throw error;
    }
  }

  /**
   * Tìm hoặc tạo patient record
   */
  private static async findOrCreatePatient(userId: string) {
    try {
      // Tìm patient existing
      const { data: existingPatient, error: findError } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingPatient && !findError) {
        return existingPatient;
      }

      // Tạo patient mới
      const user = AuthService.getCurrentUser()!;
      const patientCode = `KT${Date.now().toString().slice(-8)}`; // Generate patient code
      
      const { data: newPatient, error: createError } = await supabase
        .from('patients')
        .insert({
          user_id: userId,
          patient_code: patientCode,
          full_name: user.name
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
   * Lấy appointments của user hiện tại
   */
  static async getUserAppointments(status?: string): Promise<Appointment[]> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return [];

      let query = supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctors(*),
          facility:facilities(*)
        `)
        .eq('patient_id', user.id)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      return [];
    }
  }

  /**
   * Hủy appointment
   */
  static async cancelAppointment(appointmentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;
      toast.success('Hủy lịch hẹn thành công');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Không thể hủy lịch hẹn');
      throw error;
    }
  }

  /**
   * Validate QR code (sẽ được gọi từ reception/admin)
   */
  static async validateQRCode(qrCodeData: string): Promise<Appointment | null> {
    try {
      const parsed = JSON.parse(qrCodeData);
      if (parsed.type !== 'appointment_checkin') {
        return null;
      }

      const { data: appointment, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctors(*),
          facility:facilities(*),
          patient:patients(*)
        `)
        .eq('id', parsed.appointment_id)
        .gt('qr_code_expires_at', new Date().toISOString())
        .single();

      if (error || !appointment) {
        return null;
      }

      // Update appointment status to confirmed
      await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', appointment.id);

      return appointment;
    } catch (error) {
      console.error('Error validating QR code:', error);
      return null;
    }
  }
}
