import React, { useEffect, useState, useMemo } from 'react';
import { ScheduleItem } from './schedule-item';
import { MockDatabaseService } from '@/services/mock-database.service';
import { SyncService } from '@/services/sync.service';
import { Appointment } from '@/services/supabase';
import { Booking } from '@/types';
import { AuthService } from '@/services/auth.service';

// Cache for bookings to prevent remount issues
let bookingsCache: Booking[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5000; // 5 seconds

// Helper function to convert Appointment to Booking format
const convertAppointmentToBooking = async (appointment: Appointment): Promise<Booking | null> => {
  try {
    console.log('Converting appointment:', appointment);
    const doctor = appointment.doctor_id ? await MockDatabaseService.getDoctorById(appointment.doctor_id) : null;
    console.log('Found doctor:', doctor);

    if (!doctor) {
      console.warn('No doctor found for appointment:', appointment.id);
      return null;
    }

    // Parse appointment time (assuming format like "14:30")
    const timeParts = appointment.appointment_time.split(':');
    const hours = parseInt(timeParts[0]) || 0;
    const minutes = parseInt(timeParts[1]) || 0;
    const half = minutes >= 30;

    const specialtiesStr = Array.isArray(doctor.specialties) ? doctor.specialties.join(', ') : (doctor.specialties || 'General Practice');
    const languagesStr = Array.isArray(doctor.languages) ? doctor.languages.join(', ') : (doctor.languages || 'Vietnamese');

    // 🔧 Parse notes to extract symptoms and description
    const parseNotesForDetails = (notes: string) => {
      if (!notes) return { symptoms: [], description: '' };
      
      const symptomsMatch = notes.match(/Triệu chứng:\s*([^.]+)/);
      const descriptionMatch = notes.match(/Mô tả:\s*(.+)/);
      
      return {
        symptoms: symptomsMatch ? symptomsMatch[1].split(', ').map(s => s.trim()).filter(s => s) : [],
        description: descriptionMatch ? descriptionMatch[1].trim() : ''
      };
    };

    const parsedDetails = parseNotesForDetails(appointment.notes || '');
    console.log('📋 Parsed details from notes:', parsedDetails);

    const booking: Booking = {
      id: parseInt(appointment.id.replace('appointment-', '')) || Date.now(),
      status: appointment.status,
      patientName: appointment.patient_name || 'Patient', // Use actual patient name
      symptoms: appointment.symptoms?.length > 0 ? appointment.symptoms : parsedDetails.symptoms, // ✅ Use parsed symptoms
      description: appointment.description || parsedDetails.description, // ✅ Use parsed description
      schedule: {
        date: new Date(appointment.appointment_date),
        time: {
          hour: hours,
          half: half
        }
      },
      doctor: {
        id: parseInt(doctor.id),
        name: doctor.name,
        title: doctor.title || specialtiesStr,
        languages: languagesStr,
        specialties: specialtiesStr,
        image: doctor.avatar || '/static/doctors/default-avatar.png',
        isAvailable: doctor.is_available
      },
      department: {
        id: 1, // Mock department ID
        name: appointment.department || specialtiesStr, // Use actual department if available
        shortDescription: specialtiesStr,
        description: `Department of ${specialtiesStr}`,
        groupId: 1
      }
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
        setBookings(bookingsCache);
        setLoading(false);
        return;
      }
      
      try {
        // Get current authenticated user
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
          console.error('❌ No authenticated user found');
          setLoading(false);
          return;
        }

        console.log('🔍 Fetching appointments for user:', currentUser.id);
        const userAppointments = await MockDatabaseService.getUserAppointments(currentUser.id);

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
      fetchAppointments();
    };

    window.addEventListener('appointmentsUpdated', handleAppointmentsUpdated);
    
    fetchAppointments();

    return () => {
      isMounted = false;
      window.removeEventListener('appointmentsUpdated', handleAppointmentsUpdated);
    };
  }, []);  if (loading) {
    return (
      <div className="px-4 py-3">
        <div className="text-center">Loading appointments...</div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="px-4 py-3">
        <div className="text-center text-gray-500">No appointments found</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 space-y-3">
      {bookings.map((booking, index) => (
        <ScheduleItem key={booking.id || index} schedule={booking} />
      ))}
    </div>
  );
}

export default ScheduleHistoryPage;
