import { useState } from "react";
import { useNavigate } from "zmp-ui";
import { useAtom } from "jotai";
import { bookingFormState } from "@/state";
import { Page, Box, Button, Text, Header } from "zmp-ui";
import { bookingServiceV2 } from "@/services/booking-v2.service";
import toast from "react-hot-toast";
import { AuthService } from "@/services/auth.service";

export default function Step2() {
  const navigate = useNavigate();
  const [formData, setFormData] = useAtom(bookingFormState);
  const [symptoms, setSymptoms] = useState<string[]>(formData.symptoms || []);
  const [description, setDescription] = useState<string>(formData.description || "");
  const [phoneNumber, setPhoneNumber] = useState<string>(formData.phoneNumber || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSymptoms = [
    "Đau đầu",
    "Sốt cao", 
    "Ho khan",
    "Đau bụng",
    "Mệt mỏi",
    "Chóng mặt",
    "Buồn nôn",
    "Khó thở"
  ];

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => {
      if (prev.includes(symptom)) {
        return prev.filter(s => s !== symptom);
      } else {
        return [...prev, symptom];
      }
    });
  };

  const handleSubmit = async () => {
    if (symptoms.length === 0 || !description.trim() || !phoneNumber.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Validate phone number
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      toast.error("Số điện thoại không hợp lệ!");
      return;
    }

    setIsSubmitting(true);
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

      // Update form data
      setFormData(prev => ({
        ...prev,
        symptoms,
        description,
        phoneNumber: phoneNumber.trim()
      }));

      // Create appointment using Booking Service V2
      const result = await bookingServiceV2.createBooking({
        doctor_id: formData.doctor.id?.toString() || "1",
        doctor_name: formData.doctor.name || "Bác sĩ",
        service_id: formData.department.id?.toString() || "1", 
        service_name: formData.department.name || "Khám tổng quát",
        appointment_date: formData.slot.date instanceof Date 
          ? formData.slot.date.toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        appointment_time: `${formData.slot.time.hour.toString().padStart(2, '0')}:${formData.slot.time.half ? '30' : '00'}`,
        notes: `Triệu chứng: ${symptoms.join(', ')}. Mô tả: ${description}`,
        phone_number: phoneNumber.trim()
      });

      if (result.success) {
        toast.success("Đặt lịch thành công!", { id: "booking" });
        
        // Store appointment data
        sessionStorage.setItem('lastBooking', JSON.stringify({
          appointment: result.appointment,
          qrCode: result.qrCode,
          bookingDetails: {
            serviceName: formData.department?.name || 'Dịch vụ y tế',
            facilityName: 'Kajo Rehab',
            doctorName: formData.doctor?.name || 'Bác sĩ điều trị',
            symptoms: symptoms,
            description: description
          }
        }));
        
        navigate('/booking/3');
      } else {
        toast.error(result.message, { id: "booking" });
      }

    } catch (error) {
      console.error("❌ Booking error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Đặt lịch thất bại. Vui lòng thử lại!';
      toast.error(errorMessage, { id: "booking" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Page className="bg-gray-100">
      <Header title="Đặt lịch khám - Bước 2" showBackIcon />
      
      <Box className="p-4 space-y-4">
        {/* Progress */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <Text.Title size="small">Bước 2/3</Text.Title>
            <Text size="small" className="text-gray-600">Mô tả triệu chứng</Text>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full w-2/3"></div>
          </div>
        </div>

        {/* Phone Number Input */}
        <div className="bg-white rounded-lg p-4">
          <Text.Title size="normal" className="mb-3">Số điện thoại liên hệ</Text.Title>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Nhập số điện thoại (VD: 0935680630)"
            className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            required
          />
          <Text size="xSmall" className="text-gray-500 mt-1">
            📞 Số điện thoại để lễ tân check-in khi bạn đến khám
          </Text>
        </div>

        {/* Symptoms Selection */}
        <div className="bg-white rounded-lg p-4">
          <Text.Title size="normal" className="mb-3">Chọn triệu chứng</Text.Title>
          <div className="grid grid-cols-2 gap-2">
            {availableSymptoms.map((symptom) => (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={`p-3 text-center border rounded-lg transition-colors ${
                  symptoms.includes(symptom)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {symptom}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg p-4">
          <Text.Title size="normal" className="mb-3">Mô tả chi tiết</Text.Title>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả chi tiết về triệu chứng, thời gian xuất hiện, mức độ nghiêm trọng..."
            className="w-full p-3 border border-gray-200 rounded-lg h-32 resize-none focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        {/* Summary */}
        {formData.department && formData.doctor && formData.slot && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Text.Title size="small" className="text-blue-800 mb-2">Thông tin đặt lịch</Text.Title>
            <div className="space-y-1 text-sm text-blue-700">
              <div>Khoa: {formData.department.name}</div>
              <div>Bác sĩ: {formData.doctor.name}</div>
              <div>Ngày: {formData.slot.date instanceof Date ? formData.slot.date.toLocaleDateString('vi-VN') : formData.slot.date}</div>
              <div>Giờ: {formData.slot.time.hour}:{formData.slot.time.half ? '30' : '00'}</div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          variant="primary" 
          size="large"
          fullWidth
          className="mt-6"
          disabled={symptoms.length === 0 || !description.trim() || !phoneNumber.trim() || isSubmitting}
        >
          {isSubmitting ? "Đang đặt lịch..." : "Đặt lịch khám"}
        </Button>
      </Box>
    </Page>
  );
}
