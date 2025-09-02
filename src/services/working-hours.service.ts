// Working Hours Service for Kajo Clinic
import { format, getDay, isAfter, isBefore, addDays, startOfDay } from 'date-fns';

export interface ClinicHours {
  weekdays: {
    days: string[];
    start_time: string;
    end_time: string;
    break_time: null;
    total_hours: number;
  };
  weekends: {
    days: string[];
    start_time: string;
    end_time: string;
    break_time: {
      start: string;
      end: string;
    };
    total_hours: number;
  };
}

export interface AppointmentSettings {
  duration_minutes: number;
  buffer_minutes: number;
  advance_booking_days: number;
  cancellation_hours: number;
  auto_confirm_minutes: number;
}

export class WorkingHoursService {
  
  // Clinic working hours configuration
  private static readonly CLINIC_HOURS: ClinicHours = {
    weekdays: {
      days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      start_time: "16:00",
      end_time: "19:00",
      break_time: null,
      total_hours: 3
    },
    weekends: {
      days: ["saturday", "sunday"],
      start_time: "09:00",
      end_time: "17:00",
      break_time: {
        start: "12:00",
        end: "13:00"
      },
      total_hours: 7
    }
  };

  private static readonly APPOINTMENT_SETTINGS: AppointmentSettings = {
    duration_minutes: 30,
    buffer_minutes: 5,
    advance_booking_days: 30,
    cancellation_hours: 24,
    auto_confirm_minutes: 10
  };

  /**
   * Generate available time slots for a specific date
   */
  static generateTimeSlots(date: Date | string): string[] {
    const appointmentDate = typeof date === 'string' ? new Date(date) : date;
    const dayOfWeek = getDay(appointmentDate); // 0 = Sunday, 6 = Saturday
    
    console.log('🕐 Generating time slots for day:', dayOfWeek, format(appointmentDate, 'yyyy-MM-dd'));
    
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Weekdays: Monday-Friday 16:00-19:00
      const weekdaySlots = ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30'];
      console.log('📅 Weekday slots:', weekdaySlots);
      return weekdaySlots;
    } else {
      // Weekends: Saturday-Sunday 09:00-17:00 (skip lunch 12:00-13:00)
      const weekendSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        // Skip 12:00-13:00 lunch break
        '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', 
        '16:00', '16:30'
      ];
      console.log('🏖️ Weekend slots:', weekendSlots);
      return weekendSlots;
    }
  }

  /**
   * Validate if a booking time is within working hours
   */
  static validateBookingTime(appointmentDate: string, appointmentTime: string): {
    valid: boolean;
    reason?: string;
  } {
    try {
      const bookingDate = new Date(appointmentDate);
      const today = startOfDay(new Date());
      
      console.log('🔍 Validating booking:', { appointmentDate, appointmentTime });
      
      // Rule 1: Cannot book in the past
      if (isBefore(bookingDate, today)) {
        return { valid: false, reason: 'Không thể đặt lịch trong quá khứ' };
      }
      
      // Rule 2: Cannot book more than 30 days in advance
      const maxDate = addDays(today, this.APPOINTMENT_SETTINGS.advance_booking_days);
      if (isAfter(bookingDate, maxDate)) {
        return { 
          valid: false, 
          reason: `Chỉ có thể đặt lịch trước tối đa ${this.APPOINTMENT_SETTINGS.advance_booking_days} ngày` 
        };
      }
      
      // Rule 3: Check if time slot is within working hours
      const validSlots = this.generateTimeSlots(bookingDate);
      if (!validSlots.includes(appointmentTime)) {
        return { valid: false, reason: 'Giờ đặt lịch nằm ngoài giờ làm việc của phòng khám' };
      }
      
      console.log('✅ Booking time is valid');
      return { valid: true };
      
    } catch (error) {
      console.error('❌ Error validating booking time:', error);
      return { valid: false, reason: 'Lỗi xác thực thời gian đặt lịch' };
    }
  }

  /**
   * Check if clinic is open on a specific date
   */
  static isClinicOpen(date: Date | string): boolean {
    const checkDate = typeof date === 'string' ? new Date(date) : date;
    const dayOfWeek = getDay(checkDate);
    
    // Clinic is open Monday-Sunday (different hours for weekdays vs weekends)
    return dayOfWeek >= 0 && dayOfWeek <= 6; // Open all 7 days
  }

  /**
   * Get clinic hours for a specific date
   */
  static getClinicHours(date: Date | string): {
    isOpen: boolean;
    startTime: string;
    endTime: string;
    breakTime?: { start: string; end: string };
  } {
    const checkDate = typeof date === 'string' ? new Date(date) : date;
    const dayOfWeek = getDay(checkDate);
    
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Weekdays
      return {
        isOpen: true,
        startTime: this.CLINIC_HOURS.weekdays.start_time,
        endTime: this.CLINIC_HOURS.weekdays.end_time
      };
    } else {
      // Weekends  
      return {
        isOpen: true,
        startTime: this.CLINIC_HOURS.weekends.start_time,
        endTime: this.CLINIC_HOURS.weekends.end_time,
        breakTime: this.CLINIC_HOURS.weekends.break_time
      };
    }
  }

  /**
   * Get next available booking date
   */
  static getNextAvailableDate(): string {
    const tomorrow = addDays(new Date(), 1);
    return format(tomorrow, 'yyyy-MM-dd');
  }

  /**
   * Calculate if cancellation is allowed (before cancellation deadline)
   */
  static canCancelBooking(appointmentDate: string, appointmentTime: string): {
    canCancel: boolean;
    reason?: string;
  } {
    try {
      const appointmentDateTime = new Date(`${appointmentDate} ${appointmentTime}`);
      const now = new Date();
      const deadlineHours = this.APPOINTMENT_SETTINGS.cancellation_hours;
      
      // Calculate deadline (24 hours before appointment)
      const cancellationDeadline = new Date(appointmentDateTime.getTime() - (deadlineHours * 60 * 60 * 1000));
      
      if (isBefore(now, cancellationDeadline)) {
        return { canCancel: true };
      } else {
        return { 
          canCancel: false, 
          reason: `Chỉ có thể hủy lịch trước ${deadlineHours} giờ` 
        };
      }
      
    } catch (error) {
      console.error('❌ Error checking cancellation eligibility:', error);
      return { canCancel: false, reason: 'Lỗi kiểm tra điều kiện hủy lịch' };
    }
  }

  /**
   * Get appointment settings
   */
  static getAppointmentSettings(): AppointmentSettings {
    return this.APPOINTMENT_SETTINGS;
  }

  /**
   * Get full clinic hours configuration
   */
  static getClinicConfiguration(): ClinicHours {
    return this.CLINIC_HOURS;
  }
}

export default WorkingHoursService;
