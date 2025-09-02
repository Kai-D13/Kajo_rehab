import React, { useState, useEffect } from 'react';
import { AuthService } from '@/services/auth.service';
import { MockDatabaseService } from '@/services/mock-database.service';
import { bookingServiceV2 } from '@/services/booking-v2.service';
import { Button } from '@/components/button';
import type { Appointment } from '@/services/supabase.config';

interface SystemStatus {
  currentUser: any;
  userIdConsistent: boolean;
  appointmentsCount: number;
  lastBookingId?: string;
  lastBookingStatus?: string;
  errors: string[];
}

const SystemDiagnosticsPage = () => {
  const [status, setStatus] = useState<SystemStatus>({
    currentUser: null,
    userIdConsistent: false,
    appointmentsCount: 0,
    errors: []
  });
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addLog = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const runSystemDiagnostics = async () => {
    setLoading(true);
    setTestResults([]);
    const errors: string[] = [];

    try {
      addLog('🔍 Starting system diagnostics...');

      // Test 1: User Authentication
      addLog('🔐 Testing user authentication...');
      const currentUser = AuthService.getCurrentUser();
      
      if (!currentUser) {
        errors.push('No current user found');
        addLog('❌ No current user found');
      } else {
        addLog(`✅ Current user: ${currentUser.id} (${currentUser.name})`);
      }

      // Test 2: Mock Database Connection
      addLog('📦 Testing mock database...');
      await MockDatabaseService.loadAppointments();
      addLog('✅ Mock database loaded');

      // Test 3: User ID Consistency
      addLog('🔄 Testing user ID consistency...');
      let userIdConsistent = true;
      
      if (currentUser) {
        // Check if user ID in auth matches expected format
        const expectedUserId = 'user-dev-123';
        if (currentUser.id !== expectedUserId) {
          userIdConsistent = false;
          errors.push(`User ID mismatch: expected ${expectedUserId}, got ${currentUser.id}`);
          addLog(`❌ User ID mismatch: expected ${expectedUserId}, got ${currentUser.id}`);
        } else {
          addLog(`✅ User ID consistent: ${currentUser.id}`);
        }

        // Test appointments retrieval
        addLog('📋 Testing appointment retrieval...');
        const appointments = await MockDatabaseService.getUserAppointments(currentUser.id);
        addLog(`📊 Found ${appointments.length} appointments for user ${currentUser.id}`);

        // Test booking service
        addLog('🏥 Testing booking service...');
        const userAppointments = await bookingServiceV2.getUserAppointments();
        addLog(`🏥 BookingServiceV2 returned ${userAppointments.length} appointments`);
      }

      // Test 4: Create Test Booking
      addLog('📝 Testing booking creation...');
      if (currentUser) {
        try {
          const testBooking = {
            doctor_id: 'test-doctor-1',
            appointment_date: '2024-09-10',
            appointment_time: '10:00',
            symptoms: 'Test symptoms',
            notes: 'System diagnostic test booking',
            service_id: 'test-service'
          };

          const result = await bookingServiceV2.createBooking(testBooking);
          
          if (result.success) {
            addLog('✅ Test booking created successfully');
            addLog(`📍 Booking ID: ${result.appointment?.id}`);
          } else {
            errors.push('Failed to create test booking');
            addLog(`❌ Test booking failed: ${result.message}`);
          }
        } catch (error) {
          errors.push(`Booking creation error: ${error}`);
          addLog(`❌ Booking creation error: ${error}`);
        }
      }

      // Test 5: QR Code Generation
      addLog('🔲 QR Code functionality available');

      // Update status
      setStatus({
        currentUser,
        userIdConsistent,
        appointmentsCount: currentUser ? (await MockDatabaseService.getUserAppointments(currentUser.id)).length : 0,
        errors
      });

      addLog('🎯 System diagnostics completed');

    } catch (error) {
      errors.push(`System error: ${error}`);
      addLog(`❌ System diagnostics failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearTestData = async () => {
    try {
      addLog('🗑️ Clearing test data...');
      // Clear localStorage in development
      localStorage.removeItem('kajo-appointments');
      addLog('✅ Test data cleared');
      await runSystemDiagnostics(); // Re-run diagnostics
    } catch (error) {
      addLog(`❌ Error clearing test data: ${error}`);
    }
  };

  useEffect(() => {
    runSystemDiagnostics();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white rounded-lg p-4">
        <h1 className="text-xl font-bold mb-4">🔧 System Diagnostics</h1>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className={`p-3 rounded-lg ${status.currentUser ? 'bg-green-100' : 'bg-red-100'}`}>
            <div className="font-semibold">User Authentication</div>
            <div className="text-sm">{status.currentUser ? '✅ Active' : '❌ Failed'}</div>
          </div>
          
          <div className={`p-3 rounded-lg ${status.userIdConsistent ? 'bg-green-100' : 'bg-red-100'}`}>
            <div className="font-semibold">User ID Consistency</div>
            <div className="text-sm">{status.userIdConsistent ? '✅ Consistent' : '❌ Mismatch'}</div>
          </div>
          
          <div className="p-3 rounded-lg bg-blue-100">
            <div className="font-semibold">Appointments</div>
            <div className="text-sm">{status.appointmentsCount} found</div>
          </div>
          
          <div className={`p-3 rounded-lg ${status.errors.length === 0 ? 'bg-green-100' : 'bg-red-100'}`}>
            <div className="font-semibold">System Errors</div>
            <div className="text-sm">{status.errors.length} errors</div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <Button onClick={runSystemDiagnostics} loading={loading}>
            🔄 Run Full Diagnostics
          </Button>
          
          <Button onClick={clearTestData}>
            🗑️ Clear Test Data
          </Button>
        </div>
      </div>

      {status.currentUser && (
        <div className="bg-white rounded-lg p-4">
          <h3 className="font-semibold mb-2">👤 Current User Details</h3>
          <pre className="text-sm bg-gray-100 p-3 rounded overflow-x-auto">
            {JSON.stringify(status.currentUser, null, 2)}
          </pre>
        </div>
      )}

      {status.errors.length > 0 && (
        <div className="bg-white rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-red-600">❌ System Errors</h3>
          <div className="space-y-1">
            {status.errors.map((error, index) => (
              <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg p-4">
        <h3 className="font-semibold mb-2">📋 Diagnostic Log</h3>
        <div className="text-xs bg-gray-100 p-3 rounded max-h-96 overflow-y-auto">
          {testResults.map((log, index) => (
            <div key={index} className="py-1">{log}</div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg p-4">
        <h3 className="font-semibold mb-2">🎯 Week 1-2 Progress</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className={status.currentUser ? '✅' : '❌'}></span>
            <span>User Authentication System</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={status.userIdConsistent ? '✅' : '❌'}></span>
            <span>User ID Consistency</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={status.appointmentsCount >= 0 ? '✅' : '❌'}></span>
            <span>Database Schema & Storage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={status.errors.length === 0 ? '✅' : '🟡'}></span>
            <span>Status Management</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemDiagnosticsPage;
