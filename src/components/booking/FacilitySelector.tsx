import React, { useState, useEffect } from 'react';
import { Box, List, Radio, Text, Spinner } from 'zmp-ui';
import { MockDatabaseService } from '@/services/mock-database.service';
import { Facility } from '@/services/supabase';

interface FacilitySelectorProps {
  selectedFacility?: Facility;
  onFacilitySelect: (facility: Facility) => void;
  className?: string;
}

export const FacilitySelector: React.FC<FacilitySelectorProps> = ({
  selectedFacility,
  onFacilitySelect,
  className = ''
}) => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFacilities = async () => {
      try {
        setLoading(true);
        const data = await MockDatabaseService.getFacilities();
        setFacilities(data);
      } catch (error) {
        console.error('Error loading facilities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFacilities();
  }, []);

  if (loading) {
    return (
      <Box className={`flex justify-center p-4 ${className}`}>
        <Spinner visible />
      </Box>
    );
  }

  if (facilities.length === 0) {
    return (
      <Box className={`text-center p-4 ${className}`}>
        <Text className="text-gray-500">Không có cơ sở khả dụng</Text>
      </Box>
    );
  }

  return (
    <Box className={className}>
      <Text.Title className="mb-3">Chọn cơ sở</Text.Title>
      <List>
        {facilities.map((facility) => (
          <List.Item
            key={facility.id}
            onClick={() => onFacilitySelect(facility)}
            prefix={
              <Radio
                checked={selectedFacility?.id === facility.id}
                onChange={() => onFacilitySelect(facility)}
              />
            }
          >
            <Box>
              <Text className="font-medium">{facility.name}</Text>
              <Text size="xSmall" className="text-gray-500">
                {facility.address}
              </Text>
              {facility.phone && (
                <Text size="xSmall" className="text-blue-600">
                  {facility.phone}
                </Text>
              )}
            </Box>
          </List.Item>
        ))}
      </List>
    </Box>
  );
};
