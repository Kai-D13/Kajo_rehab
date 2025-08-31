import React, { useState, useEffect } from 'react';
import { Box, List, Radio, Text, Spinner, Avatar } from 'zmp-ui';
import { MockDatabaseService } from '@/services/mock-database.service';
import { Doctor } from '@/services/supabase';

interface DoctorSelectorProps {
  facilityId?: string;
  selectedDoctor?: Doctor;
  onDoctorSelect: (doctor: Doctor) => void;
  className?: string;
}

export const DoctorSelector: React.FC<DoctorSelectorProps> = ({
  facilityId,
  selectedDoctor,
  onDoctorSelect,
  className = ''
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDoctors = async () => {
      if (!facilityId) {
        setDoctors([]);
        return;
      }

      try {
        setLoading(true);
        const data = await MockDatabaseService.getDoctorsByFacility(facilityId);
        setDoctors(data);
      } catch (error) {
        console.error('Error loading doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, [facilityId]);

  if (!facilityId) {
    return (
      <Box className={`text-center p-4 ${className}`}>
        <Text className="text-gray-500">Vui lòng chọn cơ sở trước</Text>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box className={`flex justify-center p-4 ${className}`}>
        <Spinner visible />
      </Box>
    );
  }

  if (doctors.length === 0) {
    return (
      <Box className={`text-center p-4 ${className}`}>
        <Text className="text-gray-500">Không có bác sĩ khả dụng</Text>
      </Box>
    );
  }

  return (
    <Box className={className}>
      <Text.Title className="mb-3">Chọn bác sĩ</Text.Title>
      <List>
        {doctors.map((doctor) => (
          <List.Item
            key={doctor.id}
            onClick={() => onDoctorSelect(doctor)}
            prefix={
              <Radio
                checked={selectedDoctor?.id === doctor.id}
                onChange={() => onDoctorSelect(doctor)}
              />
            }
          >
            <Box className="flex items-center space-x-3">
              <Avatar
                story="default"
                size={40}
                src={doctor.avatar}
              />
              <Box className="flex-1">
                <Text className="font-medium">{doctor.name}</Text>
                {doctor.title && (
                  <Text size="xSmall" className="text-gray-600">
                    {doctor.title}
                  </Text>
                )}
                {doctor.specialties && doctor.specialties.length > 0 && (
                  <Text size="xSmall" className="text-blue-600">
                    {doctor.specialties.join(', ')}
                  </Text>
                )}
                {doctor.languages && doctor.languages.length > 0 && (
                  <Text size="xSmall" className="text-gray-500">
                    Ngôn ngữ: {doctor.languages.join(', ')}
                  </Text>
                )}
              </Box>
            </Box>
          </List.Item>
        ))}
      </List>
    </Box>
  );
};
