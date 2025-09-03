import React, { useState } from 'react';
import { Page, Box, Button, Text, Input, DatePicker, Select } from 'zmp-ui';
import { SupabaseBookingService } from '../../services/supabase-booking.service';
import { WorkingHoursService } from '../../services/working-hours.service';
import { AuthService } from '../../services/auth.service';
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

  // Generate available time slots when date changes
  const handleDateChange = async (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setFormData({ ...formData, appointment_date: dateString, appointment_time: '' });
    
    console.log('🗓️ Date selected:', dateString);
    
    // Get available slots for the date - simplified
    const slots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
    setAvailableSlots(slots);
    
    console.log('⏰ Available slots:', slots);
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
        toast.success('Booking created successfully!');
      } else {
        toast.error(result.message || 'Booking failed');
      }
      
    } catch (error) {
      console.error('❌ Booking test failed:', error);
      toast.error('Booking test failed');
      setResult({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleGetUserBookings = async () => {
    setLoading(true);
    
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        toast.error('Please login first');
        return;
      }

      const bookings = await SupabaseBookingService.getUserBookings(currentUser.id);
      console.log('📋 User bookings:', bookings);
      
      setResult({ userBookings: bookings });
      toast.success(`Found ${bookings.length} bookings`);
      
    } catch (error) {
      console.error('❌ Failed to get bookings:', error);
      toast.error('Failed to get bookings');
      setResult({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page className="bg-white">
      <Box className="p-4">
        <Text size="xLarge" bold className="text-center mb-6">
          🧪 Supabase Booking Test
        </Text>

        {/* Customer Name */}
        <Box className="mb-4">
          <Text className="mb-2">Customer Name:</Text>
          <Input 
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            placeholder="Enter customer name"
          />
        </Box>

        {/* Phone Number */}
        <Box className="mb-4">
          <Text className="mb-2">Phone Number:</Text>
          <Input 
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            placeholder="Enter phone number"
          />
        </Box>

        {/* Date Picker */}
        <Box className="mb-4">
          <Text className="mb-2">Appointment Date:</Text>
          <DatePicker 
            onChange={handleDateChange}
            placeholder="Select appointment date"
          />
        </Box>

        {/* Time Slots */}
        {availableSlots.length > 0 && (
          <Box className="mb-4">
            <Text className="mb-2">Available Time Slots:</Text>
            <Select
              value={formData.appointment_time}
              onChange={(value) => setFormData({ ...formData, appointment_time: value as string })}
            >
              <option value="">Select time slot</option>
              {availableSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </Select>
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
            onClick={handleGetUserBookings}
          >
            📋 Get My Bookings
          </Button>
        </Box>

        {/* Results Display */}
        {result && (
          <Box className="mt-6 p-4 bg-gray-50 rounded-lg">
            <Text bold className="mb-3">📊 Test Results:</Text>
            <Box className="bg-white p-3 rounded border">
              <pre className="text-sm overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </Box>
          </Box>
        )}

        {/* Instructions */}
        <Box className="mt-6 p-4 bg-blue-50 rounded-lg">
          <Text bold className="mb-2">📝 Test Instructions:</Text>
          <Text size="small">
            1. Select appointment date and time slot
            {'\n'}
            2. Fill in customer details and symptoms
            {'\n'}
            3. Click "Test Create Booking" to test booking creation
            {'\n'}
            4. Click "Get My Bookings" to test booking retrieval
            {'\n'}
            5. Check console logs for detailed debugging information
          </Text>
        </Box>
      </Box>
    </Page>
  );
};

export default TestBookingPage;
