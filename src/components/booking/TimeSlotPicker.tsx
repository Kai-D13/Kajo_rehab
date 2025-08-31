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
  doctorId?: string;
  selectedDate?: Date;
  selectedTime?: string;
  onTimeSelect: (date: Date, time: string) => void;
  className?: string;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  doctorId,
  selectedDate,
  selectedTime,
  onTimeSelect,
  className = ''
}) => {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [loading, setLoading] = useState(false);

  // Generate time slots (8:00 - 17:00, 30-minute intervals)
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 8; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time,
          available: true // Will be checked against database
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const checkAvailability = async (date: Date, time: string) => {
    if (!doctorId) return false;
    
    setLoading(true);
    try {
      const available = await MockDatabaseService.checkAvailability(
        doctorId,
        format(date, 'yyyy-MM-dd'),
        time
      );
      return available;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleTimeClick = async (date: Date, time: string) => {
    if (!doctorId) return;
    
    const isAvailable = await checkAvailability(date, time);
    if (isAvailable) {
      onTimeSelect(date, time);
    }
  };

  if (!doctorId) {
    return (
      <Box className={`text-center p-4 ${className}`}>
        <Text className="text-gray-500">Vui lòng chọn bác sĩ trước</Text>
      </Box>
    );
  }

  return (
    <Box className={className}>
      <Box className="flex justify-between items-center mb-4">
        <Button
          type="neutral"
          size="small"
          onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
        >
          ← Tuần trước
        </Button>
        <Text.Title>
          {format(currentWeek, 'dd/MM', { locale: vi })} - {format(addDays(currentWeek, 6), 'dd/MM/yyyy', { locale: vi })}
        </Text.Title>
        <Button
          type="neutral"
          size="small"
          onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
        >
          Tuần sau →
        </Button>
      </Box>

      {/* Date Headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center p-2">
            <Text size="xSmall" className="text-gray-600">
              {format(day, 'EEE', { locale: vi })}
            </Text>
            <Text size="small" className="font-medium">
              {format(day, 'dd')}
            </Text>
          </div>
        ))}
      </div>

      {/* Time Slots */}
      <Box className="space-y-2">
        {timeSlots.map((slot) => (
          <Box key={slot.time} className="flex items-center space-x-2">
            <Box className="w-16">
              <Text size="small" className="font-medium">
                {slot.time}
              </Text>
            </Box>
            <div className="grid grid-cols-7 flex-1">
              {weekDays.map((day, dayIndex) => {
                const isSelected = selectedDate && 
                  format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') && 
                  selectedTime === slot.time;
                const isPast = day < new Date() || 
                  (format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && 
                   slot.time < format(new Date(), 'HH:mm'));

                return (
                  <div key={dayIndex}>
                    <Button
                      type={isSelected ? 'highlight' : 'neutral'}
                      size="small"
                      className={`w-full h-8 text-xs ${isPast ? 'opacity-50' : ''}`}
                      disabled={isPast || loading}
                      onClick={() => handleTimeClick(day, slot.time)}
                    >
                      {loading ? '...' : (isPast ? 'X' : '○')}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Box>
        ))}
      </Box>

      {selectedDate && selectedTime && (
        <Box className="mt-4 p-3 bg-blue-50 rounded-lg">
          <Text className="font-medium text-center">
            Đã chọn: {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })} lúc {selectedTime}
          </Text>
        </Box>
      )}
    </Box>
  );
};
