import React, { useState } from 'react';
import { Box, Button, Text } from 'zmp-ui';
import { format, addDays, startOfWeek } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MockDatabaseService } from '@/services/mock-database.service';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotPickerProps {
  selectedDate?: Date;
  selectedTime?: string;
  onTimeSelect: (date: Date, time: string) => void;
  className?: string;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedDate,
  selectedTime,
  onTimeSelect,
  className = ''
}) => {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  // Generate time slots for morning and afternoon sessions
  const generateTimeSlots = () => {
    const morningSlots = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'
    ];
    const afternoonSlots = [
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];
    
    return { morning: morningSlots, afternoon: afternoonSlots };
  };

  const { morning, afternoon } = generateTimeSlots();
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const handleTimeClick = (date: Date, time: string) => {
    onTimeSelect(date, time);
  };

  return (
    <Box className={`p-4 ${className}`}>
      {/* Header */}
      <Box className="text-center mb-6">
        <Text.Title size="large" className="text-gray-800 mb-2">
          Chọn thời gian khám
        </Text.Title>
        <Text className="text-gray-600">
          Chọn ngày và giờ phù hợp với lịch của bạn
        </Text>
      </Box>

      {/* Week Navigation */}
      <Box className="flex justify-between items-center mb-4">
        <Button
          type="neutral"
          size="small"
          onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
          className="px-3 py-2"
        >
          ← Tuần trước
        </Button>
        <Text.Title className="text-blue-600 font-semibold">
          {format(currentWeek, 'dd/MM', { locale: vi })} - {format(addDays(currentWeek, 6), 'dd/MM/yyyy', { locale: vi })}
        </Text.Title>
        <Button
          type="neutral"
          size="small"
          onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
          className="px-3 py-2"
        >
          Tuần sau →
        </Button>
      </Box>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-8 bg-gray-50 border-b">
          <div className="p-3 text-center font-semibold text-gray-700 border-r">
            Giờ khám
          </div>
          {weekDays.map((day, index) => {
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
          {morning.map((time) => (
            <div key={time} className="grid grid-cols-8 border-b last:border-b-0">
              <div className="p-3 text-center font-medium text-gray-700 border-r bg-yellow-25 flex items-center justify-center">
                {time}
              </div>
              {weekDays.map((day, dayIndex) => {
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
                      onClick={() => handleTimeClick(day, time)}
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
          {afternoon.map((time) => (
            <div key={time} className="grid grid-cols-8 border-b last:border-b-0">
              <div className="p-3 text-center font-medium text-gray-700 border-r bg-blue-25 flex items-center justify-center">
                {time}
              </div>
              {weekDays.map((day, dayIndex) => {
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
                      onClick={() => handleTimeClick(day, time)}
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
        <Box className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
          <div className="text-center">
            <Text className="text-sm text-gray-600 mb-1">Thời gian đã chọn</Text>
            <Text className="text-lg font-bold text-blue-700">
              {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })} - {selectedTime}
            </Text>
          </div>
        </Box>
      )}

      {/* Legend */}
      <Box className="mt-4 flex justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
          <Text className="text-gray-600">Có thể đặt</Text>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <Text className="text-gray-600">Đã chọn</Text>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <Text className="text-gray-600">Không khả dụng</Text>
        </div>
      </Box>
    </Box>
  );
};
