import DoctorItem from "@/components/items/doctor";
import PolarizedList from "@/components/polarized-list";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { bookingFormState } from "@/state";
import { useSetAtom } from "jotai";
import { useNavigate, useParams } from "zmp-ui";
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
      id: parseInt(appointment.id.replace('appointment-', '')) || Date.now(),
      status: appointment.status,
      patientName: appointment.patient_name || 'Patient',
      symptoms: appointment.symptoms || [],
      description: appointment.description || '',
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
        id: 1,
        name: appointment.department || specialtiesStr,
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
        const appointments = await MockDatabaseService.getUserAppointments(currentUser.id);
        console.log('📋 Available appointments:', appointments.map(a => ({ id: a.id, status: a.status })));
        
        const appointmentId = `appointment-${id}`;
        console.log('🎯 Searching for appointment ID:', appointmentId);
        
        const foundAppointment = appointments.find(apt => apt.id === appointmentId);
        
        if (foundAppointment) {
          console.log('✅ Found appointment:', foundAppointment);
          setAppointment(foundAppointment); // Store original appointment for QR
          
          const booking = await convertAppointmentToBooking(foundAppointment);
          console.log('✅ Converted booking:', booking);
          setSchedule(booking);
        } else {
          console.error('❌ Appointment not found:', appointmentId);
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
      <div className="flex justify-center items-center h-64">
        <div>Loading appointment details...</div>
      </div>
    );
  }

  if (!schedule) {
    return <NotFound />;
  }

  return (
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

        {/* QR Code Section - Only show for confirmed appointments */}
        {appointment && schedule.status === 'confirmed' && (
          <div className="flex flex-col justify-center gap-4 rounded-xl bg-white p-4">
            <div className="font-medium text-center">Mã QR Check-in</div>
            <QRCodeDisplay
              appointment={{
                id: appointment.id,
                user_id: appointment.user_id || 'patient-dev-123',
                appointment_date: appointment.appointment_date,
                appointment_time: appointment.appointment_time,
                status: appointment.status,
                created_at: appointment.created_at || new Date().toISOString()
              } as any}
              size="medium"
              showInfo={true}
              allowDownload={true}
              allowRegenerate={true}
            />
          </div>
        )}
      </div>
    </FabForm>
  );
}

export default ScheduleDetailPage;
