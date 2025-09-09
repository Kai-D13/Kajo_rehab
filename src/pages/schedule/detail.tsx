import DoctorItem from "@/components/items/doctor";
import PolarizedList from "@/components/polarized-list";
import { bookingFormState } from "@/state";
import { useSetAtom } from "jotai";
import { useNavigate, useParams, Page, Header, Box } from "zmp-ui";
import { useState, useEffect } from "react";
import NotFound from "../404";
import { TestResult } from "./test-result";
import FabForm from "@/components/form/fab-form";
import { formatDayName, formatFullDate, formatTimeSlot } from "@/utils/format";
import { MockDatabaseService } from "@/services/mock-database.service";
import { Appointment } from "@/services/supabase.config";
import { Booking } from "@/types";

// Helper function to convert Appointment to Booking format (same as history.tsx)
const convertAppointmentToBooking = async (appointment: Appointment): Promise<Booking | null> => {
  try {
    const doctor = appointment.doctor_id ? await MockDatabaseService.getDoctorById(appointment.doctor_id) : null;
    
    if (!doctor) return null;

    const timeParts = appointment.appointment_time.split(':');
    const hours = parseInt(timeParts[0]) || 0;
    const minutes = parseInt(timeParts[1]) || 0;
    const half = minutes >= 30;

    const specialtiesStr = Array.isArray(doctor.specialties) ? doctor.specialties.join(', ') : (doctor.specialties || 'General Practice');
    const languagesStr = Array.isArray(doctor.languages) ? doctor.languages.join(', ') : (doctor.languages || 'Vietnamese');

    return {
      id: appointment.id, // ✅ Use original UUID string
      status: appointment.booking_status || appointment.status,
      patientName: appointment.customer_name || 'Patient',
      symptoms: Array.isArray(appointment.symptoms) ? appointment.symptoms : [appointment.symptoms || ''],
      description: appointment.detailed_description || '',
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
        image: doctor.image || '/static/doctors/default-avatar.png',
        isAvailable: doctor.isAvailable || true
      },
      department: {
        id: 1,
        name: appointment.service_type || specialtiesStr,
        shortDescription: specialtiesStr,
        description: `Department of ${specialtiesStr}`,
        groupId: 1
      }
    };
  } catch (error) {
    console.error('Error converting appointment to booking:', error);
    return null;
  }
};

function ScheduleDetailPage() {
  const { id } = useParams();
  const [schedule, setSchedule] = useState<Booking | null>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const setBookingData = useSetAtom(bookingFormState);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Looking for appointment detail with ID:', id);
        // Find appointment by converted ID
        // Get current authenticated user
        const { AuthService } = await import('@/services/auth.service');
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
          console.error('❌ No authenticated user found');
          setLoading(false);
          return;
        }

        console.log('🔍 Fetching appointments for user:', currentUser.id);
        
        // Try production service first, then fallback to mock
        let appointments: any[] = [];
        try {
          const { realClinicBookingService } = await import('../../services/real-clinic-booking.service');
          const productionBookings = await realClinicBookingService.getUserBookings(currentUser.id);
          
          if (productionBookings && productionBookings.length > 0) {
            console.log('📋 Found production bookings for detail:', productionBookings.length);
            // Convert production bookings to appointment format
            appointments = productionBookings.map((booking: any) => ({
              id: booking.id, // Use raw ID from production
              user_id: booking.user_id,
              facility_id: booking.facility_id || 'f1234567-1234-1234-1234-123456789001',
              doctor_id: booking.doctor_id,
              service_name: booking.service_name || 'Vật lý trị liệu',
              appointment_date: booking.appointment_date,
              appointment_time: booking.appointment_time,
              status: booking.booking_status,
              symptoms: booking.symptoms ? [booking.symptoms] : [],
              notes: booking.detailed_description,
              qr_code: booking.qr_code,
              created_at: booking.created_at,
              updated_at: booking.updated_at
            }));
          } else {
            appointments = await MockDatabaseService.getUserAppointments(currentUser.id);
          }
        } catch (error) {
          console.error('❌ Error fetching production appointments, using mock:', error);
          appointments = await MockDatabaseService.getUserAppointments(currentUser.id);
        }
        
        console.log('📋 Available appointments:', appointments.map(a => ({ id: a.id, status: a.status })));
        
        // Search for appointment with both raw ID and prefixed ID
        console.log('🎯 Searching for appointment ID:', id);
        console.log('🎯 Available appointment IDs:', appointments.map(a => a.id));
        
        let foundAppointment = appointments.find(apt => {
          // Try exact match first
          if (apt.id === id) return true;
          
          // Try matching with prefix removed
          const cleanId = apt.id.toString().replace('appointment-', '');
          if (cleanId === id) return true;
          
          // Try matching with prefix added
          if (`appointment-${apt.id}` === id) return true;
          
          return false;
        });
        
        // If still not found, try reverse logic
        if (!foundAppointment) {
          console.log('🔄 Trying reverse ID matching...');
          const searchId = id.startsWith('appointment-') ? id.replace('appointment-', '') : `appointment-${id}`;
          console.log('🔄 Reverse search ID:', searchId);
          foundAppointment = appointments.find(apt => 
            apt.id === searchId || 
            apt.id.toString().replace('appointment-', '') === searchId ||
            `appointment-${apt.id}` === searchId
          );
        }
        
        if (foundAppointment) {
          console.log('✅ Found appointment:', foundAppointment);
          setAppointment(foundAppointment); // Store original appointment for QR
          
          const booking = await convertAppointmentToBooking(foundAppointment);
          console.log('✅ Converted booking:', booking);
          setSchedule(booking);
        } else {
          console.error('❌ Appointment not found:', id);
          console.error('Available IDs:', appointments.map(a => a.id));
        }
      } catch (error) {
        console.error('Error fetching appointment details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  if (loading) {
    return (
      <Page>
        <Header showBackIcon title="Chi tiết lịch hẹn" />
        <Box className="flex justify-center items-center h-64">
          <div>Loading appointment details...</div>
        </Box>
      </Page>
    );
  }

  if (!schedule) {
    return (
      <Page>
        <Header showBackIcon title="Chi tiết lịch hẹn" />
        <NotFound />
      </Page>
    );
  }

  return (
    <Page>
      <Header showBackIcon title="Chi tiết lịch hẹn" />
      <Box>
        <FabForm
          fab={{
            children: "Tái khám",
            onClick() {
              setBookingData((prev) => ({
                ...prev,
                ...schedule,
              }));
              navigate("/booking", {
                viewTransition: true,
              });
            },
          }}
        >
          <div className="flex w-full flex-col px-4 py-3 space-y-3">
        <div className="flex flex-col justify-center gap-3 rounded-xl bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="text-base font-medium">{schedule.department.name}</div>
            <div className="text-xs text-disabled">{schedule.status === 'confirmed' ? 'Hoàn thành' : schedule.status === 'pending' ? 'Đang chờ' : schedule.status}</div>
          </div>
          <hr className="border-t border-black/10" />
          <DoctorItem doctor={schedule.doctor} />
          <PolarizedList
            items={[
              ["Họ tên", schedule.patientName || "Patient"],
              ["Khu vực", schedule.department.name],
              ["Khoa", schedule.department.name],
              [
                "Thời gian khám bệnh",
                `${formatFullDate(schedule.schedule.date)} ${formatDayName(schedule.schedule.date)} ${formatTimeSlot(schedule.schedule.time)}`,
              ],
              ["Loại khám bệnh", "Ngoại trú Khám lần đầu"],
              ["Phương thức thanh toán", "Tự chi trả"],
            ]}
          />
        </div>
        <div className="flex flex-col justify-center gap-4 rounded-xl bg-white p-4 text-base">
          <div className="font-medium">Chi tiết phiếu khám</div>
          
          {/* Hiển thị triệu chứng thực tế */}
          {schedule.symptoms && schedule.symptoms.length > 0 && (
            <TestResult
              testType="Triệu chứng"
              testName={schedule.symptoms.join(', ')}
              description="Triệu chứng được ghi nhận khi đặt lịch khám"
            />
          )}
          
          {/* Hiển thị mô tả chi tiết */}
          {schedule.description && (
            <TestResult
              testType="Mô tả chi tiết"
              testName="Thông tin bổ sung"
              description={schedule.description}
            />
          )}
          
          {/* Mock test results - có thể ẩn nếu chưa có kết quả thực tế */}
          <TestResult
            testType="Xét ngiệm"
            testName="Đang chờ kết quả"
            description="Xét nghiệm sẽ được thực hiện trong quá trình khám bệnh."
          />
        </div>

        {/* Instructions Section - Replace QR Code with Phone Number Instructions */}
        {appointment && schedule.status === 'confirmed' && (
          <div className="flex flex-col justify-center gap-4 rounded-xl bg-white p-4">
            <div className="font-medium text-center">Hướng dẫn check-in</div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">📞</div>
              <div className="font-semibold text-blue-800 mb-2">Khi đến khám</div>
              <div className="text-sm text-blue-700 space-y-1">
                <p>🗣️ Đọc số điện thoại cho lễ tân</p>
                <p>✅ Lễ tân sẽ check-in cho bạn</p>
                <p>⏰ Có mặt trước 15 phút</p>
              </div>
              <div className="mt-3 p-2 bg-white rounded border text-lg font-mono">
                {appointment.phone_number || 'Chưa có số điện thoại'}
              </div>
            </div>
          </div>
        )}
      </div>
        </FabForm>
      </Box>
    </Page>
  );
}

export default ScheduleDetailPage;
