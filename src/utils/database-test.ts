// Database Connection Test Script
// Run this in browser console để test Supabase connection

import { createClient } from '@supabase/supabase-js';

// Test Supabase connection
async function testDatabaseConnection() {
  console.log('🔍 Testing Supabase Connection...');
  
  // Environment check
  console.log('📋 Environment Variables:');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_ANON_KEY (first 20 chars):', 
    import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
  
  // Create Supabase client
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
  
  try {
    // Test 1: Check tables exist
    console.log('📊 Test 1: Checking tables...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_list');
    
    if (tablesError) {
      console.log('⚠️  RPC not available, trying direct query...');
    }
    
    // Test 2: Query bookings table
    console.log('📊 Test 2: Querying bookings table...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .limit(5);
    
    if (bookingsError) {
      console.error('❌ Bookings query error:', bookingsError);
      return false;
    }
    
    console.log('✅ Bookings table accessible:', bookings);
    
    // Test 3: Query staff table  
    console.log('📊 Test 3: Querying staff table...');
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*');
    
    if (staffError) {
      console.error('❌ Staff query error:', staffError);
      return false;
    }
    
    console.log('✅ Staff table accessible:', staff);
    
    // Test 4: Test stored procedure
    console.log('📊 Test 4: Testing stored procedure...');
    const { data: conflictTest, error: conflictError } = await supabase
      .rpc('check_booking_conflict', {
        p_date: '2025-09-02',
        p_time: '09:00:00'
      });
    
    if (conflictError) {
      console.error('❌ Stored procedure error:', conflictError);
    } else {
      console.log('✅ Stored procedure working:', conflictTest);
    }
    
    console.log('🎉 Database connection test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

// Test booking creation
async function testBookingCreation() {
  console.log('🔍 Testing Booking Creation...');
  
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
  
  const testBooking = {
    customer_name: 'Test User ' + Date.now(),
    phone_number: '0123456789',
    appointment_date: '2025-09-05',
    appointment_time: '10:00:00',
    symptoms: 'Test booking from connection test',
    booking_status: 'pending'
  };
  
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([testBooking])
      .select();
    
    if (error) {
      console.error('❌ Booking creation failed:', error);
      return false;
    }
    
    console.log('✅ Test booking created successfully:', data);
    
    // Cleanup test booking
    if (data && data[0]) {
      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', data[0].id);
      
      if (!deleteError) {
        console.log('🧹 Test booking cleaned up');
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Booking creation test failed:', error);
    return false;
  }
}

// Export test functions
(window as any).testDatabaseConnection = testDatabaseConnection;
(window as any).testBookingCreation = testBookingCreation;

console.log('📋 Database test functions loaded!');
console.log('📋 Run: testDatabaseConnection() to test connection');
console.log('📋 Run: testBookingCreation() to test booking flow');

export { testDatabaseConnection, testBookingCreation };
