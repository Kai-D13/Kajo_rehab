// Test Database Connection Script
// Chạy để verify Supabase connection và database schema

import { createClient } from '@supabase/supabase-js';

// Supabase config
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vekrhqotmgszgsredkud.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla3JocW90bWdzemdzcmVka3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NjU1NjksImV4cCI6MjA1MTA0MTU2OX0.r1ztZfPluvLtQEGGVUxpMZlpjyFKkHxCO5yDRXK0YyM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...');
  console.log('📊 Supabase URL:', SUPABASE_URL);
  console.log('🔑 Using ANON KEY:', SUPABASE_ANON_KEY.substring(0, 20) + '...');

  try {
    // Test 1: Basic connection
    console.log('\n📡 Test 1: Basic Connection');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('bookings')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ Connection failed:', connectionError);
      return false;
    }
    console.log('✅ Database connected successfully');

    // Test 2: Schema verification
    console.log('\n🗄️ Test 2: Schema Verification');
    const { data: bookings, error: schemaError } = await supabase
      .from('bookings')
      .select('*')
      .limit(3);

    if (schemaError) {
      console.error('❌ Schema error:', schemaError);
      return false;
    }
    console.log('✅ Bookings table accessible');
    console.log('📋 Sample bookings:', bookings);

    // Test 3: Staff table
    console.log('\n👥 Test 3: Staff Table');
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*');

    if (staffError) {
      console.error('❌ Staff table error:', staffError);
      return false;
    }
    console.log('✅ Staff table accessible');
    console.log('👤 Staff count:', staff?.length || 0);

    // Test 4: Create test booking
    console.log('\n📝 Test 4: Create Test Booking');
    const testBooking = {
      customer_name: 'Test Customer',
      phone_number: '0987654321',
      appointment_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      appointment_time: '14:30:00',
      symptoms: 'Test symptoms for database connection',
      booking_status: 'pending'
    };

    const { data: newBooking, error: createError } = await supabase
      .from('bookings')
      .insert([testBooking])
      .select();

    if (createError) {
      console.error('❌ Booking creation failed:', createError);
      return false;
    }
    console.log('✅ Test booking created successfully');
    console.log('📄 New booking:', newBooking?.[0]);

    // Test 5: Update booking status
    if (newBooking?.[0]) {
      console.log('\n🔄 Test 5: Update Booking Status');
      const { data: updatedBooking, error: updateError } = await supabase
        .from('bookings')
        .update({ booking_status: 'confirmed' })
        .eq('id', newBooking[0].id)
        .select();

      if (updateError) {
        console.error('❌ Update failed:', updateError);
        return false;
      }
      console.log('✅ Booking status updated successfully');
      console.log('📄 Updated booking:', updatedBooking?.[0]);

      // Clean up test booking
      console.log('\n🧹 Cleaning up test booking...');
      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', newBooking[0].id);

      if (!deleteError) {
        console.log('✅ Test booking cleaned up');
      }
    }

    // Test 6: Check stored procedures
    console.log('\n⚙️ Test 6: Stored Procedures');
    const { data: conflictResult, error: procError } = await supabase
      .rpc('check_booking_conflict', {
        p_date: '2025-09-02',
        p_time: '09:00:00'
      });

    if (procError) {
      console.error('❌ Stored procedure error:', procError);
      return false;
    }
    console.log('✅ Stored procedure accessible');
    console.log('🔍 Conflict check result:', conflictResult);

    console.log('\n🎉 ALL TESTS PASSED! Database is ready for production use.');
    return true;

  } catch (error) {
    console.error('❌ Unexpected error during testing:', error);
    return false;
  }
}

// Auto-run test when imported
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).testDatabase = testDatabaseConnection;
  console.log('🔧 Database test function available as window.testDatabase()');
}
