import React, { useEffect, useState, useMemo } from 'react';
import { ScheduleItem } from './schedule-item';
import { MockDatabaseService } from '@/services/mock-database.service';
import { SyncService } from '@/services/sync.service';
import { Appointment } from '@/services/supabase.config';
import { Booking, Doctor } from '@/types';
import { AuthService } from '@/services/auth.service';
import { Page, Header } from "zmp-ui";

// Cache for bookings to prevent remount issues
let bookingsCache: Booking[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 2000; // 🔧 Reduced to 2 seconds for faster updates

// Helper function to convert Appointment to Booking format
const convertAppointmentToBooking = async (appointment: any): Promise<Booking | null> => {
  try {
    console.log('Converting appointment:', appointment);
    let doctor: Doctor | null = null;
    
    if (appointment.doctor_id) {
      try {
        doctor = await MockDatabaseService.getDoctorById(appointment.doctor_id);
        console.log('Found doctor:', doctor);
      } catch (error) {
        console.warn('Error getting doctor data:', error);
      }
    }

    // Ensure we have a doctor object
    const finalDoctor: Doctor = doctor || {
      id: parseInt(appointment.doctor_id || '1'),
      name: 'Bác sĩ phụ trách',
      specialties: 'Vật lý trị liệu',
      languages: 'Vietnamese',
      title: 'Bác sĩ', 
      image: '',
      isAvailable: true
    };

    // Parse appointment time (assuming format like "14:30")
    const timeParts = (appointment.appointment_time || '00:00').split(':');
    const hours = parseInt(timeParts[0]) || 0;
    const minutes = parseInt(timeParts[1]) || 0;
    const half = minutes >= 30;

    const specialtiesStr = finalDoctor.specialties || 'General Practice';
    const languagesStr = finalDoctor.languages || 'Vietnamese';

    // 🔧 Parse notes to extract symptoms and description
    console.log('Converting appointment to booking format:', appointment);

    const booking: Booking = {
      id: appointment.id, // ✅ Use original UUID instead of converting to int
      status: appointment.booking_status || 'scheduled',
      patientName: appointment.customer_name || 'Patient',
      symptoms: Array.isArray(appointment.symptoms) ? appointment.symptoms : 
                (appointment.symptoms ? appointment.symptoms.split(',').map(s => s.trim()).filter(s => s) : []),
      description: appointment.detailed_description || '',
      schedule: {
        date: new Date(appointment.appointment_date),
        time: {
          hour: hours,
          half: half
        }
      },
      doctor: {
        id: finalDoctor.id,
        name: finalDoctor.name,
        title: finalDoctor.title || specialtiesStr,
        languages: languagesStr,
        specialties: specialtiesStr,
        image: finalDoctor.image || '/static/doctors/default-avatar.png',
        isAvailable: finalDoctor.isAvailable
      },
      department: {
        id: 1, // Mock department ID
        name: appointment.service_type || specialtiesStr,
        shortDescription: specialtiesStr,
        description: `Department of ${specialtiesStr}`,
        groupId: 1
      },
      // 🔧 Add raw appointment data for enhanced display
      ...(appointment as any)
    };

    console.log('Converted booking:', booking);
    return booking;
  } catch (error) {
    console.error('Error converting appointment to booking:', error);
    return null;
  }
};

function ScheduleHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>(() => bookingsCache);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchAppointments = async () => {
      if (!isMounted) return;
      
      // Check cache first  
      const now = Date.now();
      if (bookingsCache.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
        console.log('📋 Using cached bookings data');
        setBookings(bookingsCache);
        setLoading(false);
        return;
      }
      
      // 🔧 Clear cache for fresh data fetch
      bookingsCache = [];
      
      try {
        // Get current authenticated user
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
          console.error('❌ No authenticated user found');
          setLoading(false);
          return;
        }

        console.log('🔍 Fetching appointments for user:', currentUser.id);
        
        // Try production service first, fallback to mock for development
        let userAppointments: Appointment[] = [];
        try {
          // Use production booking service
          const { realClinicBookingService } = await import('../../services/real-clinic-booking.service');
          const productionBookings = await realClinicBookingService.getUserBookings(); // 🔧 Remove currentUser.id parameter
          
          console.log('🔍 Raw production bookings result:', productionBookings);
          
          if (productionBookings && productionBookings.length > 0) {
            console.log('📋 Found production bookings:', productionBookings.length);
            // Convert production bookings to proper Appointment format
            userAppointments = productionBookings.map((booking: any): Appointment => ({
              id: booking.id,
              customer_name: booking.customer_name || 'Patient',
              phone_number: booking.phone_number || '0000000000',
              user_id: booking.user_id,
              appointment_date: booking.appointment_date,
              appointment_time: booking.appointment_time,
              symptoms: booking.symptoms,
              detailed_description: booking.detailed_description,
              image_urls: booking.image_urls || [],
              video_urls: booking.video_urls || [],
              booking_timestamp: booking.booking_timestamp || booking.created_at,
              updated_at: booking.updated_at,
              booking_status: booking.booking_status || 'confirmed',
              checkin_status: booking.checkin_status || 'not_checked',
              checkin_timestamp: booking.checkin_timestamp,
              qr_code_data: booking.qr_code_data,
              doctor_id: booking.doctor_id,
              service_id: booking.service_id,
              clinic_location: booking.clinic_location,
              created_via: booking.created_via || 'zalo_miniapp',
              created_at: booking.created_at,
              confirmed_by: booking.confirmed_by,
              confirmed_at: booking.confirmed_at,
              service_type: booking.service_type,
              preferred_therapist: booking.preferred_therapist,
              status: booking.booking_status || 'confirmed',
              qr_code: booking.qr_code_data
            }));
          } else {
            console.log('📋 No production bookings, trying mock data...');
            userAppointments = await MockDatabaseService.getUserAppointments(currentUser.id);
          }
        } catch (error) {
          console.error('❌ Error fetching production bookings, using mock:', error);
          userAppointments = await MockDatabaseService.getUserAppointments(currentUser.id);
        }

        if (!isMounted) return;
        
        if (userAppointments.length === 0) {
          bookingsCache = [];
          setBookings([]);
          setLoading(false);
          return;
        }
        
        // Convert appointments to booking format
        const bookingPromises = userAppointments.map(convertAppointmentToBooking);
        const bookingsResults = await Promise.all(bookingPromises);
        
        if (!isMounted) return;
        
        // Filter out null results
        const validBookings = bookingsResults.filter((booking): booking is Booking => booking !== null);
        
        // Update cache
        bookingsCache = validBookings;
        lastFetchTime = now;
        
        setBookings(validBookings);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Listen for sync updates from admin dashboard
    const handleAppointmentsUpdated = () => {
      console.log('🔄 Appointments updated from sync - refreshing...');
      bookingsCache = []; // Clear cache to force refresh
      lastFetchTime = 0; // Reset fetch time
      fetchAppointments();
    };

    window.addEventListener('appointmentsUpdated', handleAppointmentsUpdated);
    
    fetchAppointments();

    return () => {
      isMounted = false;
      window.removeEventListener('appointmentsUpdated', handleAppointmentsUpdated);
    };
  }, []);
  
  // 🔧 Manual refresh function for testing
  const refreshBookings = () => {
    console.log('🔄 Manual refresh triggered');
    bookingsCache = [];
    lastFetchTime = 0;
    setLoading(true);
    // Re-trigger the effect by clearing cache
    window.dispatchEvent(new Event('appointmentsUpdated'));
  };

  if (loading) {
    return (
      <div className="px-4 py-3">
        <div className="text-center">Loading appointments...</div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="px-4 py-3">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Lịch hẹn của tôi</h2>
          <button
            onClick={refreshBookings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            🔄 Làm mới
          </button>
        </div>
        <div className="text-center text-gray-500">No appointments found</div>
      </div>
    );
  }

  return (
    <Page className="bg-gray-100">
      <Header title="Lịch hẹn của tôi" showBackIcon />
      <div className="px-4 py-3 space-y-3">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Lịch hẹn của tôi ({bookings.length})</h2>
          <button
            onClick={refreshBookings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            🔄 Làm mới
          </button>
        </div>
        {bookings.map((booking, index) => (
          <ScheduleItem key={booking.id || index} schedule={booking} />
        ))}
      </div>
    </Page>
  );
}

export default ScheduleHistoryPage;
