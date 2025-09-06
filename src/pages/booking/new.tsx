import React, { useState } from 'react';
import { Page, Box, Button, Text, Select, Input, useNavigate } from 'zmp-ui';
import { AuthGuard } from '@/components/auth/AuthGuard';
import FormItem from '@/components/form/item';
import { bookingServiceV2, BookingData } from '@/services/booking-v2.service';
import { Facility } from '@/services/supabase';
import { format, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';

const { Option } = Select;

export default function NewBookingPage() {
  const [step, setStep] = useState(1);
  const [selectedFacility, setSelectedFacility] = useState<Facility>();
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
    if (step === 2 && (!selectedDate || !selectedTime)) {
      toast.error('Vui lòng chọn thời gian');
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const canProceedFromStep3 = () => {
    return symptoms.length > 0 && description.trim().length > 0;
  };

  const handleSubmit = async () => {
    if (!selectedFacility || !selectedDate || !selectedTime) {
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
        doctor_id: 'auto-assign', // Sẽ tự động phân công bác sĩ
        doctor_name: 'Bác sĩ được phân công',
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
        
        // Store booking data and navigate to success page
        sessionStorage.setItem('lastBooking', JSON.stringify({
          appointment: result.appointment,
          qrCode: result.qrCode,
          bookingDetails: {
            facilityName: selectedFacility.name,
            doctorName: 'Bác sĩ được phân công',
            serviceName: 'Vật lý trị liệu, Phục hồi chức năng',
            symptoms: symptoms,
            description: description.trim()
          }
        }));
        
        navigate('/booking/success');
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
            <FormItem label="Cơ sở khám chữa bệnh">
              <Select
                placeholder="Chọn cơ sở y tế"
                value={selectedFacility?.id}
                onChange={(facilityId) => {
                  const facilities = [
                    { id: '1', name: 'KajoTai - Cơ sở 1 (Quận 1)', address: '123 Nguyễn Huệ, Quận 1, TP.HCM' },
                    { id: '2', name: 'KajoTai - Cơ sở 2 (Quận 7)', address: '456 Nguyễn Thị Thập, Quận 7, TP.HCM' },
                    { id: '3', name: 'KajoTai - Cơ sở 3 (Thủ Đức)', address: '789 Võ Văn Ngân, Thủ Đức, TP.HCM' }
                  ];
                  const facility = facilities.find(f => f.id === facilityId);
                  setSelectedFacility(facility as any);
                }}
              >
                <Option key="1" value="1" title="KajoTai - Cơ sở 1 (Quận 1)">
                  <div>
                    <div className="font-medium">KajoTai - Cơ sở 1 (Quận 1)</div>
                    <div className="text-sm text-gray-500">123 Nguyễn Huệ, Quận 1, TP.HCM</div>
                  </div>
                </Option>
                <Option key="2" value="2" title="KajoTai - Cơ sở 2 (Quận 7)">
                  <div>
                    <div className="font-medium">KajoTai - Cơ sở 2 (Quận 7)</div>
                    <div className="text-sm text-gray-500">456 Nguyễn Thị Thập, Quận 7, TP.HCM</div>
                  </div>
                </Option>
                <Option key="3" value="3" title="KajoTai - Cơ sở 3 (Thủ Đức)">
                  <div>
                    <div className="font-medium">KajoTai - Cơ sở 3 (Thủ Đức)</div>
                    <div className="text-sm text-gray-500">789 Võ Văn Ngân, Thủ Đức, TP.HCM</div>
                  </div>
                </Option>
              </Select>
            </FormItem>
        );
      
      case 2:
        return (
          <div className="space-y-4 p-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-semibold text-gray-800">
                Chọn thời gian khám
              </div>
              <div className="text-gray-600">Chọn ngày và giờ phù hợp với lịch của bạn</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {/* Date Headers */}
              <div className="grid grid-cols-8 bg-gray-50 border-b">
                <div className="p-3 text-center font-semibold text-gray-700 border-r">
                  Giờ khám
                </div>
                {Array.from({ length: 7 }, (_, i) => addDays(new Date(), i)).map((day, index) => {
                  const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                  const isPast = day < new Date();
                  
                  return (
                    <div key={index} className={`p-3 text-center border-r last:border-r-0 ${
                      isToday ? 'bg-blue-50 text-blue-700' : isPast ? 'bg-gray-100 text-gray-400' : 'text-gray-700'
                    }`}>
                      <div className="text-xs font-medium">
                        {format(day, 'EEE', { locale: vi })}
                      </div>
                      <div className={`text-lg font-bold mt-1 ${isToday ? 'text-blue-600' : ''}`}>
                        {format(day, 'dd')}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Morning Session */}
              <div className="bg-yellow-50 border-b">
                <div className="p-2 text-center text-sm font-semibold text-yellow-800 bg-yellow-100">
                  ☀️ Buổi sáng (8:00 - 11:30)
                </div>
                {['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'].map((time) => (
                  <div key={time} className="grid grid-cols-8 border-b last:border-b-0">
                    <div className="p-3 text-center font-medium text-gray-700 border-r bg-yellow-25 flex items-center justify-center">
                      {time}
                    </div>
                    {Array.from({ length: 7 }, (_, i) => addDays(new Date(), i)).map((day, dayIndex) => {
                      const isSelected = selectedDate && 
                        format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') && 
                        selectedTime === time;
                      const isPast = day < new Date() || 
                        (format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && 
                         time < format(new Date(), 'HH:mm'));
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                      return (
                        <div key={dayIndex} className="border-r last:border-r-0 p-1">
                          <button
                            onClick={() => {
                              setSelectedDate(day);
                              setSelectedTime(time);
                            }}
                            disabled={isPast || isWeekend}
                            className={`w-full h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isSelected 
                                ? 'bg-blue-500 text-white shadow-md transform scale-105' 
                                : isPast || isWeekend
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-sm border border-green-200'
                            }`}
                          >
                            {isPast || isWeekend ? '×' : (isSelected ? '✓' : '○')}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Afternoon Session */}
              <div className="bg-blue-50">
                <div className="p-2 text-center text-sm font-semibold text-blue-800 bg-blue-100">
                  🌅 Buổi chiều (13:00 - 16:30)
                </div>
                {['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'].map((time) => (
                  <div key={time} className="grid grid-cols-8 border-b last:border-b-0">
                    <div className="p-3 text-center font-medium text-gray-700 border-r bg-blue-25 flex items-center justify-center">
                      {time}
                    </div>
                    {Array.from({ length: 7 }, (_, i) => addDays(new Date(), i)).map((day, dayIndex) => {
                      const isSelected = selectedDate && 
                        format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') && 
                        selectedTime === time;
                      const isPast = day < new Date() || 
                        (format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && 
                         time < format(new Date(), 'HH:mm'));
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                      return (
                        <div key={dayIndex} className="border-r last:border-r-0 p-1">
                          <button
                            onClick={() => {
                              setSelectedDate(day);
                              setSelectedTime(time);
                            }}
                            disabled={isPast || isWeekend}
                            className={`w-full h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isSelected 
                                ? 'bg-blue-500 text-white shadow-md transform scale-105' 
                                : isPast || isWeekend
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-sm border border-green-200'
                            }`}
                          >
                            {isPast || isWeekend ? '×' : (isSelected ? '✓' : '○')}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Time Display */}
            {selectedDate && selectedTime && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Thời gian đã chọn</div>
                  <div className="text-lg font-bold text-blue-700">
                    {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })} - {selectedTime}
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 flex justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
                <span className="text-gray-600">Có thể đặt</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-gray-600">Đã chọn</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span className="text-gray-600">Không khả dụng</span>
              </div>
            </div>
          </div>
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
                  <strong>👨‍⚕️ Bác sĩ:</strong> Bác sĩ được phân công
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
      case 2: return 'Chọn thời gian';
      case 3: return 'Xác nhận';
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
            onClick={() => navigate('/')}
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
              disabled={step === 3 && !canProceedFromStep3()}
              onClick={step === 3 ? handleSubmit : handleNext}
            >
              {step === 3 ? 'Xác nhận đặt lịch' : 'Tiếp tục'}
            </Button>
          </div>
        </Box>
      </Page>
    </AuthGuard>
  );
}
