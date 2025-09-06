import React, { useState } from 'react';
import { Page, Box, Button, Text, Header } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { bookingServiceV2 } from '@/services/booking-v2.service';

export default function SimpleBookingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    facility: '',
    service: '',
    date: '',
    time: '',
    symptoms: '',
    notes: ''
  });

  const canProceed = () => {
    switch (step) {
      case 1: return formData.facility !== '';
      case 2: return formData.service !== '';
      case 3: return formData.date !== '' && formData.time !== '';
      case 4: return formData.symptoms.trim() !== '';
      default: return false;
    }
  };

  const handleFacilitySelect = (value: string) => {
    setFormData(prev => ({ ...prev, facility: value }));
  };

  const handleServiceSelect = (value: string) => {
    setFormData(prev => ({ ...prev, service: value }));
  };

  const handleDateChange = (value: string) => {
    setFormData(prev => ({ ...prev, date: value }));
  };

  const handleTimeSelect = (value: string) => {
    setFormData(prev => ({ ...prev, time: value }));
  };

  const handleSymptomsChange = (value: string) => {
    setFormData(prev => ({ ...prev, symptoms: value }));
  };

  const handleNotesChange = (value: string) => {
    setFormData(prev => ({ ...prev, notes: value }));
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    
    setIsSubmitting(true);
    try {
      const result = await bookingServiceV2.createBooking({
        doctor_name: formData.service,
        service_name: formData.service,
        appointment_date: formData.date,
        appointment_time: formData.time,
        symptoms: formData.symptoms,
        notes: formData.notes
      });

      if (result.success) {
        navigate('/booking/success', {
          state: { 
            appointment: result.appointment,
            qrCode: result.qrCode 
          }
        });
      } else {
        console.error('Booking failed:', result.message);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="bg-white rounded-lg p-4">
            <Text.Title size="normal" className="mb-4">Chọn cơ sở khám bệnh</Text.Title>
            <div className="space-y-3">
              {['Phòng khám Đa khoa ABC', 'Bệnh viện XYZ', 'Phòng khám Chuyên khoa DEF'].map((facility) => (
                <button
                  key={facility}
                  onClick={() => handleFacilitySelect(facility)}
                  className={`w-full p-3 text-left border rounded-lg transition-colors ${
                    formData.facility === facility
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {facility}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="bg-white rounded-lg p-4">
            <Text.Title size="normal" className="mb-4">Chọn dịch vụ khám</Text.Title>
            <div className="space-y-3">
              {['Khám tổng quát', 'Khám chuyên khoa', 'Khám định kỳ', 'Tư vấn sức khỏe'].map((service) => (
                <button
                  key={service}
                  onClick={() => handleServiceSelect(service)}
                  className={`w-full p-3 text-left border rounded-lg transition-colors ${
                    formData.service === service
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="bg-white rounded-lg p-4">
            <Text.Title size="normal" className="mb-4">Chọn ngày và giờ khám</Text.Title>
            
            <div className="mb-4">
              <Text className="mb-2 font-medium">Ngày khám:</Text>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <Text className="mb-2 font-medium">Giờ khám:</Text>
              <div className="grid grid-cols-3 gap-2">
                {['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'].map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className={`p-2 text-center border rounded-lg transition-colors ${
                      formData.time === time
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="bg-white rounded-lg p-4">
            <Text.Title size="normal" className="mb-4">Mô tả triệu chứng</Text.Title>
            
            <div className="mb-4">
              <Text className="mb-2 font-medium">Triệu chứng hiện tại:</Text>
              <textarea
                value={formData.symptoms}
                onChange={(e) => handleSymptomsChange(e.target.value)}
                placeholder="Mô tả các triệu chứng bạn đang gặp phải..."
                className="w-full p-3 border border-gray-200 rounded-lg h-24 resize-none focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <Text className="mb-2 font-medium">Ghi chú thêm (tùy chọn):</Text>
              <textarea
                value={formData.notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Thông tin bổ sung..."
                className="w-full p-3 border border-gray-200 rounded-lg h-20 resize-none focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AuthGuard>
      <Page className="bg-gray-100">
        <Header title="Đặt lịch khám" showBackIcon />
        
        <Box className="p-4 space-y-4">
          {/* Progress Indicator */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Text.Title size="small">Bước {step}/4</Text.Title>
              <Text size="small" className="text-gray-600">
                {step === 1 && "Chọn cơ sở"}
                {step === 2 && "Chọn dịch vụ"}  
                {step === 3 && "Chọn thời gian"}
                {step === 4 && "Triệu chứng"}
              </Text>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            {step > 1 && (
              <Button
                onClick={() => setStep(step - 1)}
                variant="secondary"
                size="medium"
                className="flex-1"
              >
                Quay lại
              </Button>
            )}
            
            <Button
              onClick={step === 4 ? handleSubmit : () => setStep(step + 1)}
              disabled={!canProceed() || isSubmitting}
              variant="primary"
              size="medium"
              className="flex-1"
            >
              {isSubmitting ? (
                "Đang xử lý..."
              ) : step === 4 ? (
                "Hoàn thành đặt lịch"
              ) : (
                "Tiếp tục"
              )}
            </Button>
          </div>
        </Box>
      </Page>
    </AuthGuard>
  );
};