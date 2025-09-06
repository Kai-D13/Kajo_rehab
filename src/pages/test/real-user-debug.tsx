import React, { useState, useEffect } from 'react';
import { Page, Box, Button, Text } from 'zmp-ui';
import { AuthService } from '../../services/auth.service';
import toast from 'react-hot-toast';

const RealUserDebugPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const REAL_ZALO_ID = '277047792803717156';

  useEffect(() => {
    // Check current user on mount
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);
    console.log('🔍 Current user on mount:', user);
  }, []);

  // Create user with real Zalo ID
  const createRealUser = () => {
    const user = AuthService.createTestUserWithRealId(REAL_ZALO_ID);
    setCurrentUser(user);
    toast.success('Created user with real Zalo ID');
  };

  // Test get user bookings
  const testGetUserBookings = async () => {
    try {
      setLoading(true);
      
      if (!currentUser) {
        toast.error('Please create user first');
        return;
      }

      console.log('🔍 Testing: Fetching bookings for real user:', currentUser);
      
      const { realClinicBookingService } = await import('../../services/real-clinic-booking.service');
      const bookings = await realClinicBookingService.getUserBookings(currentUser.id);
      
      console.log('📋 Production bookings result:', bookings);
      setResult({ 
        userBookings: bookings, 
        count: bookings.length, 
        userId: currentUser.id,
        zaloId: currentUser.zalo_id
      });
      
      if (bookings.length > 0) {
        toast.success(`Found ${bookings.length} booking(s) for real Zalo user`);
      } else {
        toast.error(`No bookings found for Zalo ID: ${currentUser.zalo_id}`);
      }
    } catch (error) {
      console.error('❌ Failed to get user bookings:', error);
      toast.error('Failed to fetch bookings');
      setResult({ error: (error as Error).message || 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  // Test get all bookings (for debugging)
  const testGetAllBookings = async () => {
    try {
      setLoading(true);
      console.log('🔍 Testing: Fetching ALL bookings...');
      
      const { supabase } = await import('../../services/supabase.config');
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      console.log('📋 All bookings result:', data);
      setResult({ allBookings: data, count: data?.length || 0 });
      
      if (data && data.length > 0) {
        toast.success(`Found ${data.length} total booking(s) in database`);
        
        // Check if any bookings match our real user
        const matchingBookings = data.filter(booking => 
          booking.user_id === currentUser?.id || 
          booking.user_id?.includes(REAL_ZALO_ID)
        );
        
        if (matchingBookings.length > 0) {
          console.log('✅ Found matching bookings for real user:', matchingBookings);
          toast.success(`Found ${matchingBookings.length} bookings for current user!`);
        } else {
          console.log('⚠️ No bookings match current user ID:', currentUser?.id);
        }
      } else {
        toast.error('No bookings found in database');
      }
    } catch (error) {
      console.error('❌ Failed to get all bookings:', error);
      toast.error('Failed to fetch all bookings');
      setResult({ error: (error as Error).message || 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  // Create booking with real user
  const testCreateBooking = async () => {
    try {
      setLoading(true);
      
      if (!currentUser) {
        toast.error('Please create user first');
        return;
      }

      console.log('🚀 Creating booking with real user:', currentUser);
      
      const { realClinicBookingService } = await import('../../services/real-clinic-booking.service');
      
      const bookingData = {
        customer_name: currentUser.name,
        phone_number: currentUser.phone || '0123456789',
        appointment_date: '2025-09-03', // Tomorrow
        appointment_time: '10:00',
        symptoms: 'Test booking với real Zalo ID',
        detailed_description: `Test booking created for Zalo ID: ${currentUser.zalo_id}`,
        doctor_id: '1',
        service_id: '1'
      };
      
      const result = await realClinicBookingService.createBooking(bookingData);
      
      console.log('📋 Booking creation result:', result);
      setResult({ bookingResult: result, userData: currentUser });
      
      if (result.success) {
        toast.success(`Booking created successfully! ID: ${result.booking?.id}`);
      } else {
        toast.error(result.message || 'Booking failed');
      }
    } catch (error) {
      console.error('❌ Failed to create booking:', error);
      toast.error('Failed to create booking');
      setResult({ error: (error as Error).message || 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page className="bg-white">
      <Box className="p-4 space-y-4">
        <Text size="xLarge" bold className="text-center mb-6">
          🧪 Real Zalo User Debug
        </Text>

        {/* Current User Info */}
        <Box className="p-4 bg-gray-50 rounded-lg">
          <Text bold className="mb-2">👤 Current User:</Text>
          {currentUser ? (
            <Box className="text-sm">
              <Text>ID: {currentUser.id}</Text>
              <Text>Zalo ID: {currentUser.zalo_id}</Text>
              <Text>Name: {currentUser.name}</Text>
              <Text>Phone: {currentUser.phone}</Text>
            </Box>
          ) : (
            <Text className="text-gray-500">No user created yet</Text>
          )}
        </Box>

        {/* Test Buttons */}
        <Box className="space-y-3">
          <Button 
            fullWidth 
            variant="primary"
            onClick={createRealUser}
          >
            👤 Create User with Real Zalo ID
          </Button>

          <Button 
            fullWidth 
            variant="secondary"
            loading={loading}
            disabled={!currentUser}
            onClick={testGetUserBookings}
          >
            📋 Test Get My Bookings
          </Button>

          <Button 
            fullWidth 
            variant="secondary"
            loading={loading}
            onClick={testGetAllBookings}
          >
            🗂️ Test Get All Bookings
          </Button>

          <Button 
            fullWidth 
            variant="tertiary"
            loading={loading}
            disabled={!currentUser}
            onClick={testCreateBooking}
          >
            🚀 Test Create Booking
          </Button>
        </Box>

        {/* Real Zalo ID Display */}
        <Box className="p-4 bg-blue-50 rounded-lg">
          <Text bold className="mb-2">🎯 Real Zalo ID:</Text>
          <Text className="font-mono text-sm">{REAL_ZALO_ID}</Text>
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
      </Box>
    </Page>
  );
};

export default RealUserDebugPage;
