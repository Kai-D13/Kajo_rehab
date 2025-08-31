import React, { useState } from 'react';
import { Page, Box, Button, Text, Input } from 'zmp-ui';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { FacilitySelector } from '@/components/booking/FacilitySelector';
import { DoctorSelector } from '@/components/booking/DoctorSelector';
import { TimeSlotPicker } from '@/components/booking/TimeSlotPicker';
import { bookingServiceV2, BookingData } from '@/services/booking-v2.service';
import { Facility, Doctor } from '@/services/supabase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function NewBookingPage() {
  const [step, setStep] = useState(1);
  const [selectedFacility, setSelectedFacility] = useState<Facility>();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleNext = () => {
    if (step === 1 && !selectedFacility) {
      toast.error('Vui lòng chọn cơ sở');
      return;
    }
    if (step === 2 && !selectedDoctor) {
      toast.error('Vui lòng chọn bác sĩ');
      return;
    }
    if (step === 3 && (!selectedDate || !selectedTime)) {
      toast.error('Vui lòng chọn thời gian');
      return;
    }
    
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const canProceedFromStep4 = () => {
    return symptoms.length > 0 && description.trim().length > 0;
  };

  const handleSubmit = async () => {
    if (!selectedFacility || !selectedDoctor || !selectedDate || !selectedTime) {
      toast.error('Vui lòng hoàn thiện thông tin đặt lịch');
      return;
    }

    // Validate required fields
    if (symptoms.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 triệu chứng');
      return;
    }

    if (!description.trim()) {
      toast.error('Vui lòng mô tả chi tiết tình trạng của bạn');
      return;
    }

    try {
      setLoading(true);
      
      const bookingData: BookingData = {
        doctor_id: selectedDoctor.id,
        doctor_name: selectedDoctor.name,
        service_id: 'vat-ly-tri-lieu',
        service_name: 'Vật lý trị liệu, Phục hồi chức năng',
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime,
        symptoms: symptoms.join(', '),
        notes: description.trim()
      };

      console.log('📝 Submitting complete booking data:', bookingData);
      
      const result = await bookingServiceV2.createBooking(bookingData);
      
      if (result.success) {
        toast.success('Đặt lịch thành công!');
        console.log('✅ Booking created successfully, navigating to success page');
        
        // Navigate to success page with full data
        navigate('/booking/success', { 
          state: { 
            appointment: result.appointment,
            qrCode: result.qrCode,
            bookingDetails: {
              facilityName: selectedFacility.name,
              doctorName: selectedDoctor.name,
              serviceName: 'Vật lý trị liệu, Phục hồi chức năng',
              symptoms: symptoms,
              description: description.trim()
            }
          }
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('❌ Booking failed:', error);
      toast.error('Có lỗi xảy ra khi đặt lịch');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <FacilitySelector
            selectedFacility={selectedFacility}
            onFacilitySelect={(facility) => {
              setSelectedFacility(facility);
              setSelectedDoctor(undefined); // Reset doctor when facility changes
            }}
          />
        );
      
      case 2:
        return (
          <DoctorSelector
            facilityId={selectedFacility?.id}
            selectedDoctor={selectedDoctor}
            onDoctorSelect={setSelectedDoctor}
          />
        );
      
      case 3:
        return (
          <TimeSlotPicker
            doctorId={selectedDoctor?.id}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onTimeSelect={(date, time) => {
              setSelectedDate(date);
              setSelectedTime(time);
            }}
          />
        );
      
      case 4:
        return (
          <Box className="space-y-4">
            <Text.Title>Thông tin bổ sung</Text.Title>
            
            {/* Symptom Selection */}
            <Box>
              <Text className="mb-2 font-medium">Triệu chứng chính *</Text>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {['Đau lưng', 'Đau cổ', 'Đau khớp', 'Cứng khớp', 'Yếu cơ', 'Khó vận động', 'Đau đầu', 'Khác'].map(symptom => (
                  <button
                    key={symptom}
                    onClick={() => {
                      const newSymptoms = symptoms.includes(symptom) 
                        ? symptoms.filter(s => s !== symptom)
                        : [...symptoms, symptom];
                      setSymptoms(newSymptoms);
                    }}
                    className={`p-2 text-sm rounded border ${
                      symptoms.includes(symptom) 
                        ? 'bg-blue-100 border-blue-500 text-blue-700' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </Box>

            {/* Description */}
            <Box>
              <Text className="mb-2 font-medium">Mô tả chi tiết *</Text>
              <Input.TextArea
                placeholder="Ví dụ: Đau lưng kéo dài 3 ngày, khó cử động, đau tăng khi ngồi lâu..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <Text size="small" className="text-gray-500 mt-1">
                {description.length}/500 ký tự
              </Text>
            </Box>

            {/* Image Upload Placeholder */}
            <Box>
              <Text className="mb-2 font-medium">Hình ảnh liên quan (tuỳ chọn)</Text>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <div className="text-gray-500">
                  📷 Chụp ảnh vùng bị đau (sẽ có trong phiên bản sau)
                </div>
              </div>
            </Box>

            {/* Summary */}
            <Box className="p-4 bg-green-50 rounded-lg border border-green-200">
              <Text.Title size="small" className="mb-3 text-green-800">📋 Tóm tắt đặt lịch</Text.Title>
              <Box className="space-y-2">
                <Text size="small">
                  <strong>🏥 Dịch vụ:</strong> Vật lý trị liệu, Phục hồi chức năng
                </Text>
                <Text size="small">
                  <strong>🏢 Cơ sở:</strong> {selectedFacility?.name}
                </Text>
                <Text size="small">
                  <strong>👨‍⚕️ Bác sĩ:</strong> {selectedDoctor?.name}
                </Text>
                <Text size="small">
                  <strong>📅 Thời gian:</strong> {selectedDate && format(selectedDate, 'dd/MM/yyyy')} lúc {selectedTime}
                </Text>
                <Text size="small">
                  <strong>🩺 Triệu chứng:</strong> {symptoms.length > 0 ? symptoms.join(', ') : 'Chưa chọn'}
                </Text>
                {description && (
                  <Text size="small">
                    <strong>📝 Mô tả:</strong> {description.substring(0, 100)}{description.length > 100 ? '...' : ''}
                  </Text>
                )}
                <Text size="small" className="text-green-700">
                  <strong>💰 Thanh toán:</strong> Tại phòng khám
                </Text>
              </Box>
            </Box>
          </Box>
        );
      
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Chọn cơ sở';
      case 2: return 'Chọn bác sĩ';
      case 3: return 'Chọn thời gian';
      case 4: return 'Xác nhận';
      default: return 'Đặt lịch hẹn';
    }
  };

  return (
    <AuthGuard>
      <Page>
        {/* Simple Header */}
        <Box className="flex items-center p-4 border-b bg-white">
          <Button
            type="neutral"
            size="small"
            className="mr-3"
            onClick={() => navigate(-1)}
          >
            ← Quay lại
          </Button>
          <Text.Title>{getStepTitle()}</Text.Title>
        </Box>
        
        {/* Progress Indicator */}
        <Box className="flex justify-center mb-4 px-4">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNumber <= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div
                    className={`w-8 h-1 ${
                      stepNumber < step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </Box>

        <Box className="p-4">
          {renderStepContent()}
        </Box>

        {/* Navigation Buttons */}
        <Box className="p-4 border-t bg-white sticky bottom-0">
          <div className="flex space-x-3">
            {step > 1 && (
              <Button
                type="neutral"
                className="flex-1"
                onClick={() => setStep(step - 1)}
              >
                Quay lại
              </Button>
            )}
            
            <Button
              type="highlight"
              className="flex-1"
              loading={loading}
              disabled={step === 4 && !canProceedFromStep4()}
              onClick={step === 4 ? handleSubmit : handleNext}
            >
              {step === 4 ? 'Xác nhận đặt lịch' : 'Tiếp tục'}
            </Button>
          </div>
        </Box>
      </Page>
    </AuthGuard>
  );
}
