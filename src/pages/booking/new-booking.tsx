import React, { useState } from 'react';
import { Page, Button, Box, Text, Select } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';
import { AuthGuard } from '@/components/auth/AuthGuard';
import DateTimePicker from '@/components/form/date-time-picker';
import SymptomInquiry from '@/components/form/symptom-inquiry';
import FormItem from '@/components/form/item';
import ChevronDownIcon from '@/components/icons/chevron-down';
import { format, addDays, startOfWeek, startOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { bookingServiceV2 } from '@/services/booking-v2.service';
import { Facility } from '@/services/supabase';
import { MockDatabaseService } from '@/services/mock-database.service';
import type { SymptomDescription, TimeSlot, AvailableTimeSlots } from '@/types';

const { Option } = Select;

export default function NewBookingPage() {
  const [step, setStep] = useState(1);
  const [selectedFacility, setSelectedFacility] = useState<Facility>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<Partial<TimeSlot>>();
  const [symptomData, setSymptomData] = useState<SymptomDescription>({
    symptoms: [],
    description: '',
    images: []
  });
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Generate mock available time slots for next 7 days
  const generateTimeSlots = (): AvailableTimeSlots[] => {
    const slots: AvailableTimeSlots[] = [];
    const startDate = startOfDay(new Date());
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(startDate, i);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      if (!isWeekend) {
        const timeSlots: TimeSlot['time'][] = [];
        
        // Morning slots
        for (let hour = 8; hour <= 11; hour++) {
          timeSlots.push({ hour, half: 0, isAvailable: true });
          if (hour < 11) {
            timeSlots.push({ hour, half: 30, isAvailable: true });
          }
        }
        
        // Afternoon slots  
        for (let hour = 13; hour <= 16; hour++) {
          timeSlots.push({ hour, half: 0, isAvailable: true });
          if (hour < 16) {
            timeSlots.push({ hour, half: 30, isAvailable: true });
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
      case 2: return selectedTimeSlot?.date && selectedTimeSlot?.time;
      case 3: return symptomData.symptoms.length > 0 && symptomData.description.trim().length > 0;
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
    if (!selectedFacility || !selectedTimeSlot?.date || !selectedTimeSlot?.time) {
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
      const timeString = `${selectedTimeSlot.time.hour.toString().padStart(2, '0')}:${selectedTimeSlot.time.half.toString().padStart(2, '0')}`;
      
      const bookingData: BookingData = {
        doctor_id: 'auto-assign',
        doctor_name: 'Bác sĩ được phân công',
        service_id: 'vat-ly-tri-lieu',
        service_name: 'Vật lý trị liệu, Phục hồi chức năng',
        appointment_date: format(selectedTimeSlot.date, 'yyyy-MM-dd'),
        appointment_time: timeString,
        symptoms: symptomData.symptoms.join(', '),
        notes: symptomData.description.trim()
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
            symptoms: symptomData.symptoms,
            description: symptomData.description.trim()
          }
        }));
        
        navigate('/booking/success');
      } else {
        throw new Error(result.error || 'Không thể đặt lịch');
      }
    } catch (error) {
      console.error('❌ Booking submission failed:', error);
      toast.error('Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Box className="p-4">
            <Text.Title className="text-xl font-bold mb-4 text-center">
              Chọn cơ sở y tế
            </Text.Title>
            <FormItem label="Cơ sở khám chữa bệnh">
              <Select
                placeholder="Chọn cơ sở y tế"
                value={selectedFacility?.id}
                onChange={(facilityId) => {
                  const facility = MOCK_FACILITIES.find(f => f.id === facilityId);
                  setSelectedFacility(facility);
                }}
              >
                {MOCK_FACILITIES.map((facility) => (
                  <Option key={facility.id} value={facility.id} title={facility.name}>
                    <div>
                      <div className="font-medium">{facility.name}</div>
                      <div className="text-sm text-gray-500">{facility.address}</div>
                    </div>
                  </Option>
                ))}
              </Select>
            </FormItem>
          </Box>
        );

      case 2:
        return (
          <Box className="p-4">
            <Text.Title className="text-xl font-bold mb-4 text-center">
              Chọn thời gian khám
            </Text.Title>
            <div className="bg-white rounded-lg shadow-sm">
              <DateTimePicker
                value={selectedTimeSlot}
                onChange={setSelectedTimeSlot}
                slots={availableTimeSlots}
              />
            </div>
            
            {selectedTimeSlot?.date && selectedTimeSlot?.time && (
              <Box className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
                <div className="text-center">
                  <Text className="text-sm text-gray-600 mb-1">Thời gian đã chọn</Text>
                  <Text className="text-lg font-bold text-blue-700">
                    {format(selectedTimeSlot.date, 'EEEE, dd/MM/yyyy', { locale: vi })} - 
                    {selectedTimeSlot.time.hour.toString().padStart(2, '0')}:{selectedTimeSlot.time.half.toString().padStart(2, '0')}
                  </Text>
                </div>
              </Box>
            )}
          </Box>
        );

      case 3:
        return (
          <Box className="p-4">
            <Text.Title className="text-xl font-bold mb-4 text-center">
              Thông tin triệu chứng
            </Text.Title>
            <SymptomInquiry
              value={symptomData}
              onChange={setSymptomData}
            />
            
            {/* Booking Summary */}
            <Box className="mt-6 p-4 bg-white rounded-lg shadow-sm border">
              <Text className="font-bold text-lg mb-3 text-center">Tóm tắt đặt lịch</Text>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cơ sở:</span>
                  <span className="font-medium">{selectedFacility?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bác sĩ:</span>
                  <span className="font-medium">Bác sĩ được phân công</span>
                </div>
                {selectedTimeSlot?.date && selectedTimeSlot?.time && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian:</span>
                    <span className="font-medium">
                      {format(selectedTimeSlot.date, 'dd/MM/yyyy')} - 
                      {selectedTimeSlot.time.hour.toString().padStart(2, '0')}:{selectedTimeSlot.time.half.toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Triệu chứng:</span>
                  <span className="font-medium">{symptomData.symptoms.join(', ') || 'Chưa chọn'}</span>
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
      case 1: return 'Chọn cơ sở';
      case 2: return 'Chọn thời gian';
      case 3: return 'Xác nhận';
      default: return 'Đặt lịch hẹn';
    }
  };

  return (
    <AuthGuard>
      <Page>
        {/* Header */}
        <Box className="flex items-center p-4 border-b bg-white">
          <Button
            type="neutral"
            size="small"
            className="mr-3"
            onClick={() => navigate('/')}
          >
            ← Quay lại
          </Button>
          <Text.Title className="flex-1 text-center">
            {getStepTitle()}
          </Text.Title>
          <Box className="w-8" />
        </Box>

        {/* Progress Indicator */}
        <Box className="flex justify-center items-center py-4 bg-gray-50">
          {[1, 2, 3].map((stepNum) => (
            <React.Fragment key={stepNum}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stepNum === step ? 'bg-blue-500 text-white' :
                stepNum < step ? 'bg-green-500 text-white' :
                'bg-gray-300 text-gray-600'
              }`}>
                {stepNum}
              </div>
              {stepNum < 3 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  stepNum < step ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          ))}
        </Box>

        {/* Content */}
        <Box className="flex-1 bg-gray-50">
          {renderStepContent()}
        </Box>

        {/* Bottom Navigation */}
        <Box className="p-4 bg-white border-t flex space-x-3">
          {step > 1 && (
            <Button
              type="neutral"
              className="flex-1"
              onClick={handleBack}
            >
              Quay lại
            </Button>
          )}
          
          <Button
            type="highlight"
            className="flex-1"
            loading={loading}
            disabled={!canProceedToNextStep()}
            onClick={step === 3 ? handleSubmit : handleNext}
          >
            {step === 3 ? 'Xác nhận đặt lịch' : 'Tiếp tục'}
          </Button>
        </Box>
      </Page>
    </AuthGuard>
  );
}
