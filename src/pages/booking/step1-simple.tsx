import { useState } from "react";
import { useNavigate } from "zmp-ui";
import { useAtom } from "jotai";
import { bookingFormState } from "@/state";
import { Page, Box, Button, Text, Header } from "zmp-ui";
import toast from "react-hot-toast";

export default function Step1() {
  const navigate = useNavigate();
  const [formData, setFormData] = useAtom(bookingFormState);
  const [selectedDepartment, setSelectedDepartment] = useState<string>(formData.department?.name || "");
  const [selectedDoctor, setSelectedDoctor] = useState<string>(formData.doctor?.name || "");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const departments = [
    { id: "1", name: "Khoa Nội", groupId: 1 },
    { id: "2", name: "Khoa Ngoại", groupId: 1 },
    { id: "3", name: "Khoa Sản Phụ khoa", groupId: 2 },
    { id: "4", name: "Khoa Nhi", groupId: 2 },
  ];

  const doctors = [
    { id: "1", name: "Dr. Nguyễn Văn A", departmentId: "1" },
    { id: "2", name: "Dr. Trần Thị B", departmentId: "2" },
    { id: "3", name: "Dr. Lê Văn C", departmentId: "3" },
    { id: "4", name: "Dr. Phạm Thị D", departmentId: "4" },
  ];

  const timeSlots = ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"];

  const handleNext = () => {
    if (!selectedDepartment || !selectedDoctor || !selectedDate || !selectedTime) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Update form state
    const department = departments.find(d => d.name === selectedDepartment);
    const doctor = doctors.find(d => d.name === selectedDoctor);
    
    setFormData(prev => ({
      ...prev,
      department: department as any,
      doctor: doctor as any,
      slot: {
        date: new Date(selectedDate),
        time: {
          hour: parseInt(selectedTime.split(':')[0]),
          half: selectedTime.endsWith(':30')
        }
      }
    }));

    navigate("/booking/2", { viewTransition: true });
  };

  return (
    <Page className="bg-gray-100">
      <Header title="Đặt lịch khám - Bước 1" showBackIcon />
      
      <Box className="p-4 space-y-4">
        {/* Progress */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <Text.Title size="small">Bước 1/3</Text.Title>
            <Text size="small" className="text-gray-600">Chọn khoa & bác sĩ</Text>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full w-1/3"></div>
          </div>
        </div>

        {/* Department Selection */}
        <div className="bg-white rounded-lg p-4">
          <Text.Title size="normal" className="mb-3">Chọn khoa khám</Text.Title>
          <div className="space-y-2">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDepartment(dept.name)}
                className={`w-full p-3 text-left border rounded-lg transition-colors ${
                  selectedDepartment === dept.name
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {dept.name}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor Selection */}
        <div className="bg-white rounded-lg p-4">
          <Text.Title size="normal" className="mb-3">Chọn bác sĩ</Text.Title>
          <div className="space-y-2">
            {doctors.map((doctor) => (
              <button
                key={doctor.id}
                onClick={() => setSelectedDoctor(doctor.name)}
                className={`w-full p-3 text-left border rounded-lg transition-colors ${
                  selectedDoctor === doctor.name
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {doctor.name}
              </button>
            ))}
          </div>
        </div>

        {/* Date Selection */}
        <div className="bg-white rounded-lg p-4">
          <Text.Title size="normal" className="mb-3">Chọn ngày khám</Text.Title>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Time Selection */}
        <div className="bg-white rounded-lg p-4">
          <Text.Title size="normal" className="mb-3">Chọn giờ khám</Text.Title>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`p-3 text-center border rounded-lg transition-colors ${
                  selectedTime === time
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          variant="primary"
          size="large"
          fullWidth
          className="mt-6"
          disabled={!selectedDepartment || !selectedDoctor || !selectedDate || !selectedTime}
        >
          Tiếp tục
        </Button>
      </Box>
    </Page>
  );
}
