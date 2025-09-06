import { User, Facility, Doctor, Appointment } from './supabase.config';
import { setStorage, getStorage } from 'zmp-sdk';

/**
 * Mock Database Service for Development & Production (Zalo Safe)
 * Uses Zalo Native Storage instead of localStorage for better compatibil      if (result['kajo-appointments']) {
        try {
          const storedData = result['kajo-appointments'];
          if (typeof storedData === 'string') {
            const parsed = JSON.parse(storedData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              this.appointments = parsed;
              console.log('📦 Loaded appointments from Zalo storage:', this.appointments.length);
              return;
            }
          } else if (Array.isArray(storedData)) {
            this.appointments = storedData;
            console.log('📦 Loaded appointments from Zalo storage:', this.appointments.length);
            return;
          }
        } catch (parseError) {
          console.error('❌ Error parsing Zalo storage data, clearing corrupted data');
          await setStorage({ data: { 'kajo-appointments': JSON.stringify([]) } });
        }
      }* Now used in production to avoid Supabase auth conflicts on Zalo
 */
export class MockDatabaseService {
  private static users: User[] = [];
  private static facilities: Facility[] = [
    {
      id: '1',
      name: 'KajoTai - Cơ sở 1 (Quận 1)',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      phone: '028-1234-5678',
      email: 'cs1@kajotai.vn',
      working_hours: {
        monday: { open: '08:00', close: '17:00' },
        tuesday: { open: '08:00', close: '17:00' },
        wednesday: { open: '08:00', close: '17:00' },
        thursday: { open: '08:00', close: '17:00' },
        friday: { open: '08:00', close: '17:00' },
        saturday: { open: '08:00', close: '12:00' },
        sunday: { closed: true }
      },
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'KajoTai - Cơ sở 2 (Quận 7)',
      address: '456 Nguyễn Thị Thập, Quận 7, TP.HCM',
      phone: '028-8765-4321',
      email: 'cs2@kajotai.vn',
      working_hours: {
        monday: { open: '08:00', close: '17:00' },
        tuesday: { open: '08:00', close: '17:00' },
        wednesday: { open: '08:00', close: '17:00' },
        thursday: { open: '08:00', close: '17:00' },
        friday: { open: '08:00', close: '17:00' },
        saturday: { open: '08:00', close: '12:00' },
        sunday: { closed: true }
      },
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];

  private static doctors: Doctor[] = [
    {
      id: '1',
      name: 'BS. Nguyễn Văn A',
      title: 'Bác sĩ chuyên khoa II',
      specialties: ['Vật lý trị liệu', 'Phục hồi chức năng'],
      languages: ['Tiếng Việt', 'English'],
      avatar: '/static/doctors/default-avatar.png',
      facility_id: '1',
      is_available: true,
      working_schedule: {
        monday: { available: true, slots: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
        tuesday: { available: true, slots: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
        wednesday: { available: true, slots: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
        thursday: { available: true, slots: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
        friday: { available: true, slots: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
        saturday: { available: true, slots: ['08:00', '09:00', '10:00', '11:00'] },
        sunday: { available: false }
      },
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'BS. Trần Thị B',
      title: 'Bác sĩ chuyên khoa I',
      specialties: ['Massage trị liệu', 'Châm cứu'],
      languages: ['Tiếng Việt'],
      avatar: '/static/doctors/default-avatar.png',
      facility_id: '1',
      is_available: true,
      working_schedule: {
        monday: { available: true, slots: ['08:30', '09:30', '10:30', '11:30', '14:30', '15:30', '16:30'] },
        tuesday: { available: false },
        wednesday: { available: true, slots: ['08:30', '09:30', '10:30', '11:30', '14:30', '15:30', '16:30'] },
        thursday: { available: true, slots: ['08:30', '09:30', '10:30', '11:30', '14:30', '15:30', '16:30'] },
        friday: { available: true, slots: ['08:30', '09:30', '10:30', '11:30', '14:30', '15:30', '16:30'] },
        saturday: { available: true, slots: ['08:30', '09:30', '10:30', '11:30'] },
        sunday: { available: false }
      },
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'BS. Lê Văn C',
      title: 'Bác sĩ đa khoa',
      specialties: ['Vật lý trị liệu cột sống', 'Điều trị đau mãn tính'],
      languages: ['Tiếng Việt', 'English', '日本語'],
      avatar: '/static/doctors/default-avatar.png',
      facility_id: '2',
      is_available: true,
      working_schedule: {
        monday: { available: true, slots: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
        tuesday: { available: true, slots: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
        wednesday: { available: true, slots: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
        thursday: { available: true, slots: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
        friday: { available: true, slots: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
        saturday: { available: false },
        sunday: { available: false }
      },
      created_at: new Date().toISOString()
    }
  ];

  private static appointments: Appointment[] = (() => {
    // Don't load from localStorage on initialization to avoid JSON parse errors
    console.log('🎭 Initializing with sample appointments (localStorage will be loaded on-demand)');
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: 'sample-1',
        patient_id: 'patient-dev-123',
        user_id: 'patient-dev-123',
        doctor_id: '1',
        doctor_name: 'BS. Nguyễn Văn A',
        facility_id: '1',
        service_id: 'vat-ly-tri-lieu',
        service_name: 'Vật lý trị liệu, Phục hồi chức năng',
        appointment_date: today,
        appointment_time: '09:00',
        duration_minutes: 30,
        status: 'confirmed',
        symptoms: 'Đau đầu, Chóng mặt',
        description: 'Bệnh nhân có triệu chứng đau đầu kéo dài 3 ngày',
        notes: 'Triệu chứng: Đau đầu, Chóng mặt. Mô tả: Bệnh nhân có triệu chứng đau đầu kéo dài 3 ngày',
        qr_code: 'data:image/png;base64,sample-qr-code-1',
        qr_code_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  })();

  /**
   * Mock: Find or create user
   */
  static async findOrCreateUser(zaloUserId: string, userData: any): Promise<User> {
    await this.simulateDelay();

    // Find existing user
    let user = this.users.find(u => u.zalo_id === zaloUserId);
    
    if (user) {
      // Update existing user
      user.name = userData.name;
      user.avatar = userData.avatar;
      return user;
    }

    // Create new user with consistent ID for development
    const userId = zaloUserId.includes('dev') || zaloUserId === 'user-dev-123' ? 'user-dev-123' : `user-${Date.now()}`;
    
    user = {
      id: userId,
      zalo_id: zaloUserId,
      name: userData.name,
      avatar: userData.avatar,
      created_at: new Date().toISOString()
    };

    this.users.push(user);
    return user;
  }

  /**
   * Mock: Get facilities
   */
  static async getFacilities(): Promise<Facility[]> {
    await this.simulateDelay();
    return [...this.facilities];
  }

  /**
   * Mock: Get doctors by facility
   */
  static async getDoctorsByFacility(facilityId: string): Promise<Doctor[]> {
    await this.simulateDelay();
    return this.doctors.filter(d => d.facility_id === facilityId);
  }

  /**
   * Mock: Check availability
   */
  static async checkAvailability(doctorId: string, date: string, time: string): Promise<boolean> {
    await this.simulateDelay(500);

    // Check if there's already an appointment at this time
    const existingAppointment = this.appointments.find(
      a => a.doctor_id === doctorId && 
           a.appointment_date === date && 
           a.appointment_time === time &&
           ['pending', 'confirmed'].includes(a.status)
    );

    // Simulate some slots being taken (for demo purposes)
    if (time === '09:00' || time === '14:00') {
      return Math.random() > 0.5; // 50% chance these popular slots are taken
    }

    return !existingAppointment;
  }

  /**
   * Mock: Create appointment
   */
  static async createAppointment(appointmentData: any): Promise<Appointment> {
    await this.simulateDelay(1000);

    const appointment: Appointment = {
      id: `appointment-${Date.now()}`,
      patient_id: appointmentData.user_id || 'user-dev-123', // Use actual user ID if available
      user_id: appointmentData.user_id || 'user-dev-123', // Store user_id for ownership check
      doctor_id: appointmentData.doctor_id,
      doctor_name: appointmentData.doctor_name,
      facility_id: appointmentData.facility_id || '1',
      service_id: appointmentData.service_id,
      service_name: appointmentData.service_name,
      appointment_date: appointmentData.appointment_date,
      appointment_time: appointmentData.appointment_time,
      duration_minutes: appointmentData.duration_minutes || 30,
      status: appointmentData.status || 'confirmed', // Auto-confirm as required
      symptoms: appointmentData.symptoms || '',
      description: appointmentData.description || '',
      notes: appointmentData.notes || '',
      qr_code: appointmentData.qr_code || null,
      qr_expires_at: appointmentData.qr_expires_at || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.appointments.push(appointment);
    
    // Save to Zalo Native Storage for persistence
    try {
      await setStorage({
        data: {
          'kajo-appointments': JSON.stringify(this.appointments),
          'last-updated': new Date().toISOString()
        }
      });
      console.log('💾 Appointments saved to Zalo storage, total:', this.appointments.length);
    } catch (error) {
      console.error('❌ Error saving to Zalo storage:', error);
      // Fallback to localStorage in development
      if (typeof window !== 'undefined') {
        localStorage.setItem('kajo-appointments', JSON.stringify(this.appointments));
        console.log('💾 Fallback: Saved to localStorage');
      }
    }
    
    console.log('📝 Appointment created with complete data:', appointment);
    return appointment;
  }

  /**
   * Load appointments from Zalo Native Storage
   */
  static async loadAppointments(): Promise<void> {
    try {
      // Try Zalo Native Storage first
      const result = await getStorage({
        keys: ['kajo-appointments']
      });
      
      if (result['kajo-appointments']) {
        const stored = JSON.parse(result['kajo-appointments']);
        this.appointments = stored;
        console.log('� Loaded appointments from Zalo storage:', this.appointments.length);
        return;
      }
    } catch (error) {
      console.error('❌ Error loading from Zalo storage:', error);
    }

    // Fallback to localStorage with error handling
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('kajo-appointments');
        if (stored && stored !== 'undefined' && stored !== 'null' && stored.length > 10) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              this.appointments = parsed;
              console.log('📦 Loaded appointments from localStorage:', this.appointments.length);
              return;
            }
          } catch (parseError) {
            console.error('❌ Error parsing localStorage data, clearing corrupted data');
            localStorage.removeItem('kajo-appointments');
          }
        }
      } catch (error) {
        console.error('❌ Error accessing localStorage:', error);
      }
    }

    console.log('🎭 No stored appointments found, keeping sample data');
  }

  /**
   * Mock: Get user appointments
   */
  static async getUserAppointments(userId: string, status?: string): Promise<Appointment[]> {
    await this.simulateDelay();
    
    // Load latest appointments from storage first
    await this.loadAppointments();
    
    console.log('🔍 Fetching appointments for user:', userId);
    console.log('📊 Total appointments available:', this.appointments.length);
    
    // Match by user_id, patient_id, or use default for backward compatibility
    let userAppointments = this.appointments.filter(a => 
      a.user_id === userId || 
      a.patient_id === userId ||
      (userId.includes('user-dev') && (a.patient_id === 'user-dev-123' || a.user_id === 'user-dev-123'))
    );
    console.log('👤 User appointments found:', userAppointments.length);
    
    if (status) {
      userAppointments = userAppointments.filter(a => a.status === status);
      console.log('📋 Filtered by status:', status, '- Count:', userAppointments.length);
    }

    const sortedAppointments = userAppointments.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    console.log('📅 Returning sorted appointments:', sortedAppointments);
    return sortedAppointments;
  }

  /**
   * Simulate network delay
   */
  private static async simulateDelay(ms: number = 800): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get statistics for development
   */
  static getStats() {
    return {
      users: this.users.length,
      facilities: this.facilities.length,
      doctors: this.doctors.length,
      appointments: this.appointments.length
    };
  }

  /**
   * Mock: Get appointment by ID
   */
  static async getAppointmentById(appointmentId: string): Promise<Appointment | null> {
    await this.simulateDelay(300);
    
    // Load latest appointments from storage first
    await this.loadAppointments();
    
    console.log('🔍 Looking for appointment:', appointmentId);
    console.log('📋 Available appointments:', this.appointments.map(a => a.id));
    
    const appointment = this.appointments.find(apt => apt.id === appointmentId);
    
    if (appointment) {
      console.log('✅ Found appointment:', appointment);
      return appointment;
    } else {
      console.error('❌ Appointment not found:', appointmentId);
      return null;
    }
  }

  /**
   * Mock: Update appointment status
   */
  static updateAppointmentStatus(appointmentId: string, status: string): void {
    const appointmentIndex = this.appointments.findIndex(apt => apt.id === appointmentId);
    if (appointmentIndex >= 0) {
      this.appointments[appointmentIndex].status = status as any;
      this.appointments[appointmentIndex].updated_at = new Date().toISOString();
      
      // Save to localStorage
      localStorage.setItem('mockAppointments', JSON.stringify(this.appointments));
      console.log(`✅ Appointment ${appointmentId} status updated to: ${status}`);
    }
  }

  /**
   * Mock: Get doctor by ID
   */
  static async getDoctorById(doctorId: string): Promise<Doctor | null> {
    await this.simulateDelay();
    return this.doctors.find(d => d.id === doctorId) || null;
  }

  /**
   * Mock: Get facility by ID
   */
  static async getFacilityById(facilityId: string): Promise<Facility | null> {
    await this.simulateDelay();
    return this.facilities.find(f => f.id === facilityId) || null;
  }

  /**
   * Reserve a slot for 5 minutes (Mock implementation)
   */
  static async reserveSlot(
    doctorId: string,
    facilityId: string, 
    appointmentDate: string,
    appointmentTime: string
  ): Promise<any> {
    // Mock implementation for development
    const slotKey = `${doctorId}-${appointmentDate}-${appointmentTime}`;
    const isAvailable = await this.checkAvailability(doctorId, appointmentDate, appointmentTime);
    
    if (!isAvailable) {
      throw new Error('Slot is currently reserved or booked');
    }
    
    return {
      lock_id: `lock-${Date.now()}`,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      success: true
    };
  }

  /**
   * Get alternative slots when booking conflicts (Mock implementation)
   */
  static async getAlternativeSlots(originalRequest: any): Promise<any> {
    // Mock alternative slots
    const alternatives: string[] = [];
    const baseDate = new Date(originalRequest.appointment_date);
    
    // Suggest next 3 hours same day
    for (let i = 1; i <= 3; i++) {
      const time = originalRequest.appointment_time;
      const [hour, minute] = time.split(':').map(Number);
      const newHour = hour + i;
      
      if (newHour <= 17) { // Working hours until 17:00
        alternatives.push(`${newHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    
    return {
      type: 'same_day',
      date: originalRequest.appointment_date,
      slots: alternatives
    };
  }

  /**
   * Reset all data (for testing)
   */
  /**
   * Get appointments by date range for admin dashboard
   */
  static getAppointmentsByDateRange(startDate: string, endDate: string): Appointment[] {
    console.log('📅 Getting appointments between:', startDate, 'and', endDate);
    console.log('📊 Total appointments available:', this.appointments.length);
    
    const filtered = this.appointments.filter(appointment => {
      const appointmentDate = appointment.appointment_date;
      return appointmentDate >= startDate && appointmentDate <= endDate;
    });
    
    console.log('🔍 Filtered appointments:', filtered.length);
    return filtered;
  }

  /**
   * Reset mock data
   */
  static resetData() {
    this.users = [];
    this.appointments = [];
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kajo-appointments');
      console.log('🗑️ Cleared appointments from localStorage');
    }
    
    console.log('🔄 Mock database reset');
  }
}
