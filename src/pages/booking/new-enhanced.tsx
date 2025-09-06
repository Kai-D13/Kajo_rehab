import React, { useState, useMemo } from 'react';
import { Page, Box, Button, Text, Select } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';
import { AuthGuard } from '@/components/auth/AuthGuard';
import DateTimePicker from '@/components/form/date-time-picker';
import SymptomInquiry from '@/components/form/symptom-inquiry';
import FormItem from '@/components/form/item';
import ServiceItem from '@/components/items/service';
import { format, addDays, startOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { bookingServiceV2 } from '@/services/booking-v2.service';
import { Facility } from '@/services/supabase';
import { formatDayName, formatShortDate, formatTimeSlot } from '@/utils/format';
import type { SymptomDescription, TimeSlot, AvailableTimeSlots, Service } from '@/types';

const { Option } = Select;

export default function NewEnhancedBookingPage() {
  const [step, setStep] = useState(1);
  const [selectedFacility, setSelectedFacility] = useState<{id: string, name: string, address: string}>();
  const [selectedService, setSelectedService] = useState<Service>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<Partial<TimeSlot>>();
  const [symptomData, setSymptomData] = useState<SymptomDescription>({
    symptoms: [],
    description: '',
    images: []
  });
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Mock facilities data
  const facilities = [
    { id: '1', name: 'KajoTai - Cơ sở 1 (Quận 1)', address: '123 Nguyễn Huệ, Quận 1, TP.HCM' },
    { id: '2', name: 'KajoTai - Cơ sở 2 (Quận 7)', address: '456 Nguyễn Thị Thập, Quận 7, TP.HCM' },
    { id: '3', name: 'KajoTai - Cơ sở 3 (Thủ Đức)', address: '789 Võ Văn Ngân, Thủ Đức, TP.HCM' }
  ];

  // Mock services data
  const services = [
    {
      id: 1,
      name: 'Vật lý trị liệu',
      description: 'Điều trị và phục hồi chức năng',
      image: '/static/services/physical-therapy.png',
      price: 300000,
      department: { 
        id: 1, 
        name: 'Phục hồi chức năng',
        shortDescription: 'Phục hồi',
        description: 'Phục hồi chức năng và vật lý trị liệu',
        groupId: 1
      }
    },
    {
      id: 2,
      name: 'Massage trị liệu',
      description: 'Massage chuyên sâu cho cơ bắp',
      image: '/static/services/massage.png',
      price: 200000,
      department: { 
        id: 1, 
        name: 'Phục hồi chức năng',
        shortDescription: 'Phục hồi',
        description: 'Phục hồi chức năng và vật lý trị liệu',
        groupId: 1
      }
    },
    {
      id: 3,
      name: 'Châm cứu',
      description: 'Y học cổ truyền',
      image: '/static/services/acupuncture.png',
      price: 250000,
      department: { 
        id: 2, 
        name: 'Y học cổ truyền',
        shortDescription: 'Y học cổ truyền',
        description: 'Điều trị bằng các phương pháp y học cổ truyền',
        groupId: 2
      }
    }
  ];

  // Generate mock available time slots for next 7 days
  const generateTimeSlots = (): AvailableTimeSlots[] => {
    const slots: AvailableTimeSlots[] = [];
    const startDate = startOfDay(new Date());
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(startDate, i);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      if (!isWeekend) {
        const timeSlots: { hour: number; half?: boolean; isAvailable?: boolean }[] = [];
        
        // Morning slots
        for (let hour = 8; hour <= 11; hour++) {
          timeSlots.push({ hour, half: false, isAvailable: true });
          if (hour < 11) {
            timeSlots.push({ hour, half: true, isAvailable: true });
          }
        }
        
        // Afternoon slots  
        for (let hour = 13; hour <= 16; hour++) {
          timeSlots.push({ hour, half: false, isAvailable: true });
          if (hour < 16) {
            timeSlots.push({ hour, half: true, isAvailable: true });
          }
        }
        
        slots.push({
          date,
          slots: timeSlots
        });
      }
    }
    
    return slots;
  };

  const availableTimeSlots = generateTimeSlots();

  const canProceedToNextStep = () => {
    switch (step) {
      case 1: return selectedFacility !== undefined;
      case 2: return selectedService !== undefined;
      case 3: return selectedTimeSlot?.date && selectedTimeSlot?.time;
      case 4: return symptomData.symptoms.length > 0 && symptomData.description.trim().length > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNextStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFacility || !selectedService || !selectedTimeSlot?.date || !selectedTimeSlot?.time) {
      toast.error('Vui lòng hoàn thiện thông tin đặt lịch');
      return;
    }

    if (symptomData.symptoms.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 triệu chứng');
      return;
    }

    if (!symptomData.description.trim()) {
      toast.error('Vui lòng mô tả chi tiết tình trạng của bạn');
      return;
    }

    try {
      setLoading(true);
      
      // Format time from TimeSlot to string
      const timeString = formatTimeSlot(selectedTimeSlot.time);
      
      const bookingData = {
        doctor_id: 'auto-assign',
        doctor_name: 'Bác sĩ được phân công',
        service_id: selectedService.id.toString(),
        service_name: selectedService.name,
        appointment_date: format(selectedTimeSlot.date, 'yyyy-MM-dd'),
        appointment_time: timeString,
        symptoms: symptomData.symptoms.join(', '),
        notes: symptomData.description.trim()
      };

      console.log('📝 Submitting enhanced booking data:', bookingData);
      
      const result = await bookingServiceV2.createBooking(bookingData);
      
      if (result.success) {
        toast.success('Đặt lịch thành công!');
        console.log('✅ Enhanced booking created successfully');
        
        // Store booking data and navigate to success page
        sessionStorage.setItem('lastBooking', JSON.stringify({
          appointment: result.appointment,
          qrCode: result.qrCode,
          bookingDetails: {
            facilityName: selectedFacility.name,
            serviceName: selectedService.name,
            doctorName: 'Bác sĩ được phân công',
            symptoms: symptomData.symptoms,
            description: symptomData.description.trim()
          }
        }));
        
        navigate('/booking/success');
      } else {
        throw new Error('Không thể đặt lịch');
      }
    } catch (error) {
      console.error('❌ Enhanced booking submission failed:', error);
      toast.error('Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Box className="p-4 space-y-6">
            <div className="text-center space-y-2">
              <Text.Title className="text-2xl font-bold text-blue-600">
                Chọn cơ sở y tế
              </Text.Title>
              <Text className="text-gray-600">
                Chọn cơ sở gần nhất với bạn
              </Text>
            </div>
            
            <FormItem label="Cơ sở khám chữa bệnh">
              <Select
                placeholder="Chọn cơ sở y tế"
                value={selectedFacility?.id}
                onChange={(facilityId) => {
                  const facility = facilities.find(f => f.id === facilityId);
                  setSelectedFacility(facility);
                }}
              >
                {facilities.map((facility) => (
                  <Option key={facility.id} value={facility.id} title={facility.name}>
                    <div className="py-2">
                      <div className="font-medium text-gray-800">{facility.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{facility.address}</div>
                    </div>
                  </Option>
                ))}
              </Select>
            </FormItem>

            {selectedFacility && (
              <Box className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium text-blue-800">{selectedFacility.name}</div>
                    <div className="text-sm text-blue-600 mt-1">{selectedFacility.address}</div>
                  </div>
                </div>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box className="p-4 space-y-6">
            <div className="text-center space-y-2">
              <Text.Title className="text-2xl font-bold text-green-600">
                Chọn dịch vụ
              </Text.Title>
              <Text className="text-gray-600">
                Chọn dịch vụ phù hợp với nhu cầu của bạn
              </Text>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    selectedService?.id === service.id
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Text className="text-2xl">🏥</Text>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{service.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{service.description}</div>
                      <div className="text-green-600 font-medium mt-2">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(service.price)}
                      </div>
                    </div>
                    {selectedService?.id === service.id && (
                      <div className="text-green-500 text-xl">✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Box>
        );

      case 3:
        return (
          <Box className="p-4 space-y-6">
            <div className="text-center space-y-2">
              <Text.Title className="text-2xl font-bold text-purple-600">
                Chọn thời gian
              </Text.Title>
              <Text className="text-gray-600">
                Chọn ngày và giờ thuận tiện nhất
              </Text>
            </div>

            <div className="bg-white rounded-xl shadow-sm border">
              <DateTimePicker
                value={selectedTimeSlot}
                onChange={setSelectedTimeSlot}
                slots={availableTimeSlots}
              />
            </div>
          </Box>
        );

      case 4:
        return (
          <Box className="p-4 space-y-6">
            <div className="text-center space-y-2">
              <Text.Title className="text-2xl font-bold text-red-600">
                Thông tin triệu chứng
              </Text.Title>
              <Text className="text-gray-600">
                Mô tả chi tiết tình trạng sức khỏe
              </Text>
            </div>

            <SymptomInquiry<{}>
              value={symptomData}
              onChange={setSymptomData}
            />
            
            {/* Enhanced Booking Summary */}
            <Box className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 shadow-sm">
              <div className="text-center mb-4">
                <Text className="text-xl font-bold text-gray-800">📋 Tóm tắt đặt lịch</Text>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Text className="text-blue-600">🏢</Text>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Cơ sở</div>
                    <div className="font-medium text-gray-800">{selectedFacility?.name}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Text className="text-green-600">🏥</Text>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Dịch vụ</div>
                    <div className="font-medium text-gray-800">{selectedService?.name}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Text className="text-purple-600">👨‍⚕️</Text>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Bác sĩ</div>
                    <div className="font-medium text-gray-800">Bác sĩ được phân công</div>
                  </div>
                </div>

                {selectedTimeSlot?.date && selectedTimeSlot?.time && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Text className="text-orange-600">📅</Text>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Thời gian</div>
                      <div className="font-medium text-gray-800">
                        {format(selectedTimeSlot.date, 'EEEE, dd/MM/yyyy', { locale: vi })} - {formatTimeSlot(selectedTimeSlot.time)}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <Text className="text-red-600">🩺</Text>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Triệu chứng</div>
                    <div className="font-medium text-gray-800">
                      {symptomData.symptoms.length > 0 ? symptomData.symptoms.join(', ') : 'Chưa chọn'}
                    </div>
                  </div>
                </div>
              </div>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Cơ sở';
      case 2: return 'Dịch vụ';
      case 3: return 'Thời gian';
      case 4: return 'Xác nhận';
      default: return 'Đặt lịch hẹn';
    }
  };

  const getProgressColor = (stepNum: number) => {
    if (stepNum === step) return 'bg-blue-500 text-white';
    if (stepNum < step) return 'bg-green-500 text-white';
    return 'bg-gray-300 text-gray-600';
  };

  return (
    <AuthGuard>
      <Page className="bg-gray-50">
        {/* Enhanced Header */}
        <Box className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center p-4">
            <Button
              type="neutral"
              size="small"
              className="mr-3 bg-white/20 text-white border-white/30"
              onClick={() => navigate('/')}
            >
              ← Quay lại
            </Button>
            <Text.Title className="flex-1 text-center text-white font-bold">
              {getStepTitle()} - Đặt lịch khám
            </Text.Title>
            <Box className="w-16" />
          </div>
        </Box>

        {/* Enhanced Progress Indicator */}
        <Box className="bg-white border-b shadow-sm">
          <div className="flex justify-center items-center py-6 px-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${getProgressColor(stepNum)}`}>
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-16 h-1 mx-2 rounded transition-all duration-300 ${
                    stepNum < step ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </Box>

        {/* Content */}
        <Box className="flex-1 pb-20">
          {renderStepContent()}
        </Box>

        {/* Enhanced Bottom Navigation */}
        <Box className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="p-4 flex space-x-3">
            {step > 1 && (
              <Button
                type="neutral"
                className="flex-1 py-3 font-medium"
                onClick={handleBack}
              >
                ← Quay lại
              </Button>
            )}
            
            <Button
              type="highlight"
              className={`flex-1 py-3 font-bold ${
                step === 4 
                  ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}
              loading={loading}
              disabled={!canProceedToNextStep()}
              onClick={step === 4 ? handleSubmit : handleNext}
            >
              {step === 4 ? '✨ Xác nhận đặt lịch' : 'Tiếp tục →'}
            </Button>
          </div>
        </Box>
      </Page>
    </AuthGuard>
  );
}
