import React, { useState } from 'react';
import { Page, Box, Button, Text } from 'zmp-ui';
import { AuthService } from '../../services/auth.service';
import toast from 'react-hot-toast';

const BookingDebugPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Test get user bookings
  const testGetUserBookings = async () => {
    try {
      setLoading(true);
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        toast.error('Please login first');
        return;
      }

      console.log('🔍 Testing: Fetching bookings for user:', currentUser.id);
      
      const { realClinicBookingService } = await import('../../services/real-clinic-booking.service');
      const bookings = await realClinicBookingService.getUserBookings(currentUser.id);
      
      console.log('📋 Production bookings result:', bookings);
      setResult({ userBookings: bookings, count: bookings.length, userId: currentUser.id });
      
      if (bookings.length > 0) {
        toast.success(`Found ${bookings.length} booking(s)`);
      } else {
        toast.error(`No bookings found for user: ${currentUser.id}`);
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
        .limit(10);
      
      if (error) throw error;
      
      console.log('📋 All bookings result:', data);
      setResult({ allBookings: data, count: data?.length || 0 });
      
      if (data && data.length > 0) {
        toast.success(`Found ${data.length} total booking(s) in database`);
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

  // Clear results
  const clearResults = () => {
    setResult(null);
  };

  return (
    <Page className="bg-white">
      <Box className="p-4 space-y-4">
        <Text size="xLarge" bold className="text-center mb-6">
          🧪 Booking Debug Test
        </Text>

        {/* Test Buttons */}
        <Box className="space-y-3">
          <Button 
            fullWidth 
            variant="primary"
            loading={loading}
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
            onClick={clearResults}
          >
            🧹 Clear Results
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
          <Text bold className="mb-2">📝 Debug Instructions:</Text>
          <Text size="small">
            1. Click "Test Get My Bookings" to see if current user has bookings
            {'\n'}
            2. Click "Test Get All Bookings" to see all bookings in database
            {'\n'}
            3. Check console logs for detailed debugging information
            {'\n'}
            4. Compare user_id in bookings with current user ID
          </Text>
        </Box>
      </Box>
    </Page>
  );
};

export default BookingDebugPage;
