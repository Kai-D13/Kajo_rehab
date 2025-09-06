import React, { useState } from 'react';
import { Page, Box, Button, Input, Text, Select, DatePicker, List } from 'zmp-ui';
import { SupabaseBookingService } from '../../services/supabase-booking.service';
import { WorkingHoursService } from '../../services/working-hours.servic          <Button 
            fullWidth 
            variant="secondary"
            onClick={getUserBookings}
          >
            📋 Get My Bookings
          </Button>port { AuthService } from '../../services/auth.service';
import { DatabaseHelper } from '../../utils/database-helper';
import toast from 'react-hot-toast';

const TestBookingPage: React.FC = () => {
  const [formData, setFormData] = useState({
    customer_name: 'Test User',
    phone_number: '0123456789',
    appointment_date: '',
    appointment_time: '',
    symptoms: 'Test symptoms',
    detailed_description: 'Test booking from Mini App',
    service_type: 'physical_therapy'
  });
  
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Clear test data
  const clearTestData = async () => {
    try {
      setLoading(true);
      await DatabaseHelper.clearTestBookings(formData.phone_number);
      toast.success('Test data cleared successfully');
    } catch (error) {
      console.error('Failed to clear test data:', error);
      toast.error('Failed to clear test data');
    } finally {
      setLoading(false);
    }
  };

  // Get user bookings test
  const getUserBookings = async () => {
    try {
      setLoading(true);
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        toast.error('Please login first');
        return;
      }

      console.log('🔍 Fetching bookings for user:', currentUser.id);
      
      const { realClinicBookingService } = await import('../../services/real-clinic-booking.service');
      const bookings = await realClinicBookingService.getUserBookings(currentUser.id);
      
      console.log('📋 User bookings result:', bookings);
      setResult({ userBookings: bookings, count: bookings.length });
      
      if (bookings.length > 0) {
        toast.success(`Found ${bookings.length} booking(s)`);
      } else {
        toast.error('No bookings found for current user');
      }
    } catch (error) {
      console.error('❌ Failed to get user bookings:', error);
      toast.error('Failed to fetch bookings');
      setResult({ error: (error as Error).message || 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  // Check conflicts for date/time
  const checkConflicts = async () => {
    if (!formData.appointment_date || !formData.appointment_time) {
      toast.error('Please select date and time first');
      return;
    }

    try {
      setLoading(true);
      const conflicts = await DatabaseHelper.getBookingConflicts(
        formData.appointment_date,
        formData.appointment_time
      );
      
      if (conflicts.length > 0) {
        setResult({ conflicts });
        toast.error(`Found ${conflicts.length} booking(s) for this time slot`);
      } else {
        toast.success('No conflicts found - time slot is available');
      }
    } catch (error) {
      console.error('Failed to check conflicts:', error);
      toast.error('Failed to check conflicts');
    } finally {
      setLoading(false);
    }
  };

  // Generate available time slots when date changes
  const handleDateChange = async (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setFormData({ ...formData, appointment_date: dateString, appointment_time: '' });
    
    console.log('🗓️ Date selected:', dateString);
    
    // Get available slots for the date
    const slots = await SupabaseBookingService.getAvailableSlots(dateString);
    setAvailableSlots(slots);
    console.log('🕐 Available slots:', slots);
  };

  const handleTimeSelect = (time: string) => {
    setFormData({ ...formData, appointment_time: time });
    console.log('⏰ Time selected:', time);
  };

  const handleBooking = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🚀 Starting booking test with data:', formData);
      
      // Initialize auth for testing - use current or create dev user
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        console.log('⚠️ No user found, please login first');
        toast.error('Please login to create booking');
        return;
      }
      
      const result = await SupabaseBookingService.createBooking(formData);
      
      console.log('📋 Booking result:', result);
      setResult(result);
      
      if (result.success) {
        toast.success('✅ Booking created successfully!');
      } else {
        toast.error('❌ Booking failed: ' + result.message);
      }
      
    } catch (error) {
      console.error('❌ Booking test error:', error);
      toast.error('❌ Test failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetUserBookings = async () => {
    try {
      const bookings = await SupabaseBookingService.getUserBookings();
      console.log('📋 User bookings:', bookings);
      setResult({ userBookings: bookings });
      toast.success(`Found ${bookings.length} bookings`);
    } catch (error) {
      console.error('❌ Get bookings error:', error);
      toast.error('❌ Failed to get bookings');
    }
  };

  return (
    <Page className="page">
      <Box p={4}>
        <Text size="xLarge" bold className="mb-4">
          🧪 Test Supabase Booking System
        </Text>
        
        {/* Customer Info */}
        <Box className="mb-4">
          <Text className="mb-2">Customer Name:</Text>
          <Input 
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            placeholder="Enter customer name"
          />
        </Box>

        <Box className="mb-4">
          <Text className="mb-2">Phone Number:</Text>
          <Input 
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            placeholder="Enter phone number"
          />
        </Box>

        {/* Date Selection */}
        <Box className="mb-4">
          <Text className="mb-2">Appointment Date:</Text>
          <DatePicker
            mask
            maskClosable
            title="Select Date"
            value={formData.appointment_date ? new Date(formData.appointment_date) : undefined}
            onChange={handleDateChange}
          />
          {formData.appointment_date && (
            <Text className="mt-2 text-sm text-gray-600">
              Selected: {formData.appointment_date}
            </Text>
          )}
        </Box>

        {/* Time Slots */}
        {availableSlots.length > 0 && (
          <Box className="mb-4">
            <Text className="mb-2">Available Time Slots:</Text>
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map(slot => (
                <Button 
                  key={slot}
                  size="small"
                  variant={formData.appointment_time === slot ? 'primary' : 'secondary'}
                  onClick={() => handleTimeSelect(slot)}
                >
                  {slot}
                </Button>
              ))}
            </div>
            {formData.appointment_time && (
              <Text className="mt-2 text-sm text-green-600">
                Selected: {formData.appointment_time}
              </Text>
            )}
          </Box>
        )}

        {/* Symptoms */}
        <Box className="mb-4">
          <Text className="mb-2">Symptoms:</Text>
          <Input 
            value={formData.symptoms}
            onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
            placeholder="Describe symptoms"
          />
        </Box>

        {/* Service Type */}
        <Box className="mb-4">
          <Text className="mb-2">Service Type:</Text>
          <Select
            value={formData.service_type}
            onChange={(value) => setFormData({ ...formData, service_type: value as string })}
          >
            <option value="physical_therapy">Physical Therapy</option>
            <option value="general_checkup">General Checkup</option>
            <option value="consultation">Consultation</option>
          </Select>
        </Box>

        {/* Action Buttons */}
        <Box className="space-y-3">
          <Button 
            fullWidth 
            variant="primary"
            loading={loading}
            disabled={!formData.appointment_date || !formData.appointment_time}
            onClick={handleBooking}
          >
            🚀 Test Create Booking
          </Button>

          <Button 
            fullWidth 
            variant="secondary"
            loading={loading}
            onClick={checkConflicts}
          >
            🔍 Check Time Conflicts
          </Button>

          <Button 
            fullWidth 
            variant="tertiary"
            loading={loading}
            onClick={clearTestData}
          >
            🧹 Clear Test Data
          </Button>
          
          <Button 
            fullWidth 
            variant="secondary"
            onClick={handleGetUserBookings}
          >
            📋 Get User Bookings
          </Button>
        </Box>

        {/* Results */}
        {result && (
          <Box className="mt-6 p-4 bg-gray-100 rounded-lg">
            <Text bold className="mb-2">Test Result:</Text>
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </Box>
        )}
      </Box>
    </Page>
  );
};

export default TestBookingPage;
