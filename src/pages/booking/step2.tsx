import FabForm from "@/components/form/fab-form";
import SymptomInquiry from "@/components/form/symptom-inquiry";
import { bookingFormState } from "@/state";
import { bookingServiceV2 } from "@/services/booking-v2.service";
import { AuthService } from "@/services/auth.service";
import { useAtom } from "jotai";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function Step2() {
  const [formData, setFormData] = useAtom(bookingFormState);
  const navigate = useNavigate();

  return (
    <FabForm
      fab={{
        children: "Đặt lịch khám",
        disabled:
          !formData.symptoms.length || !formData.description.trim().length,
        onDisabledClick() {
          toast.error("Vui lòng điền đầy đủ thông tin!");
        },
      }}
      onSubmit={async () => {
        try {
          const user = AuthService.getCurrentUser();
          if (!user) {
            toast.error("Vui lòng đăng nhập!");
            return;
          }

          if (!formData.doctor || !formData.department || !formData.slot) {
            toast.error("Thông tin đặt lịch không đầy đủ!");
            return;
          }

          toast.loading("Đang đặt lịch khám...", { id: "booking" });

          // Create appointment using Booking Service V2 (with auto-confirmation)
          const result = await bookingServiceV2.createBooking({
            doctor_id: formData.doctor.id.toString(),
            doctor_name: formData.doctor.name,
            service_id: formData.department.id.toString(),
            service_name: formData.department.name,
            appointment_date: format(formData.slot.date, 'yyyy-MM-dd'),
            appointment_time: `${formData.slot.time.hour.toString().padStart(2, '0')}:${formData.slot.time.half ? '30' : '00'}`,
            notes: `Triệu chứng: ${formData.symptoms.join(', ')}. Mô tả: ${formData.description}`
          });

          if (result.success) {
            toast.success("Đặt lịch thành công! Mã QR đã được tạo.", { id: "booking" });
            console.log("✅ Auto-confirmed appointment created:", result.appointment);

            // Navigate to success page with appointment ID
            navigate(`/booking/success/${result.appointment.id}`, {
              viewTransition: true,
            });
          } else {
            toast.error(result.message, { id: "booking" });
          }

        } catch (error) {
          console.error("❌ Booking error:", error);
          
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Đặt lịch thất bại. Vui lòng thử lại!';
            
          toast.error(errorMessage, { id: "booking" });
        }
      }}
    >
      <SymptomInquiry value={formData} onChange={setFormData} />
    </FabForm>
  );
}
