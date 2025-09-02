import React, { useState, useEffect } from 'react';
import { MockDatabaseService } from '@/services/mock-database.service';
import { AuthService } from '@/services/auth.service';
import { Button } from '@/components/button';
import type { Appointment } from '@/services/supabase.config';

const DebugAppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);
    addLog(`Current user: ${user ? user.id : 'No user found'}`);
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      if (!currentUser) {
        addLog('❌ No current user found');
        return;
      }

      addLog('🔄 Loading appointments from storage...');
      await MockDatabaseService.loadAppointments();
      
      addLog('🔍 Fetching user appointments...');
      const userAppointments = await MockDatabaseService.getUserAppointments(currentUser.id);
      
      addLog(`📊 Found ${userAppointments.length} appointments for user ${currentUser.id}`);
      setAppointments(userAppointments);

    } catch (error) {
      addLog(`❌ Error loading appointments: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestAppointment = async () => {
    setLoading(true);
    try {
      if (!currentUser) {
        addLog('❌ No current user found');
        return;
      }

      addLog('🏥 Creating test appointment...');
      const testAppointment = {
        user_id: currentUser.id,
        doctor_id: 'doctor-1',
        doctor_name: 'Dr. Test',
        appointment_date: '2024-09-02',
        appointment_time: '14:30',
        status: 'confirmed',
        symptoms: 'Test symptoms',
        description: 'Test description for debugging',
        patient_name: currentUser.name || 'Test Patient'
      };

      const created = await MockDatabaseService.createAppointment(testAppointment);
      addLog(`✅ Created appointment: ${created.id}`);
      
      // Reload appointments
      await loadAppointments();

    } catch (error) {
      addLog(`❌ Error creating appointment: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Debug Appointments</h1>
      
      <div className="bg-white rounded-lg p-4">
        <h3 className="font-semibold mb-2">Current User</h3>
        <pre className="text-sm bg-gray-100 p-2 rounded">
          {JSON.stringify(currentUser, null, 2)}
        </pre>
      </div>

      <div className="space-y-2">
        <Button onClick={loadAppointments} loading={loading}>
          Load Appointments
        </Button>
        <Button onClick={createTestAppointment} loading={loading}>
          Create Test Appointment
        </Button>
      </div>

      <div className="bg-white rounded-lg p-4">
        <h3 className="font-semibold mb-2">Appointments ({appointments.length})</h3>
        {appointments.length === 0 ? (
          <p className="text-gray-500">No appointments found</p>
        ) : (
          appointments.map(apt => (
            <div key={apt.id} className="border-b pb-2 mb-2">
              <div className="font-medium">{apt.id}</div>
              <div className="text-sm text-gray-600">
                {apt.appointment_date} at {apt.appointment_time}
              </div>
              <div className="text-sm text-gray-600">
                Status: {apt.status}
              </div>
              <div className="text-xs text-gray-500">
                User ID: {apt.patient_id}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white rounded-lg p-4">
        <h3 className="font-semibold mb-2">Debug Log</h3>
        <div className="text-xs bg-gray-100 p-2 rounded max-h-64 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebugAppointmentsPage;
