import React, { useState } from 'react';
import { QRService } from '../../services/qr.service';
import { MockDatabaseService } from '../../services/mock-database.service';

export const QRDataTestPage: React.FC = () => {
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testQRWithLatestAppointment = async () => {
    try {
      setLoading(true);
      console.log('🔍 Testing QR with latest appointment...');
      
      // Get all appointments and find the latest one
      const appointments = MockDatabaseService.appointments;
      const latestAppointment = appointments[appointments.length - 1]; // Most recent
      
      if (!latestAppointment) {
        alert('No appointments found! Please create a booking first.');
        return;
      }

      console.log('📋 Testing with appointment:', latestAppointment);
      
      // Generate QR
      const qrCode = await QRService.generateQRCode(latestAppointment);
      setQrData({
        appointment: latestAppointment,
        qrCode: qrCode
      });
      
      // Generate QR text to see what Reception app will receive
      const qrText = await QRService.generateQRText(latestAppointment);
      
      console.log('✅ QR Test Results:');
      console.log('📱 Original Appointment:', latestAppointment);
      console.log('🔐 QR Text:', qrText);
      
    } catch (error: any) {
      console.error('❌ QR Test Error:', error);
      alert('QR test failed: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-xl font-bold mb-4">🧪 QR Data Test - Reception Simulation</h1>
        
        <button 
          onClick={testQRWithLatestAppointment}
          disabled={loading}
          className="w-full bg-blue-500 text-white p-3 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Testing...' : '🔍 Test QR with Latest Appointment'}
        </button>

        {qrData && (
          <div className="space-y-4">
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">📱 Original Appointment Data</h3>
              <div className="text-sm space-y-1">
                <p><strong>ID:</strong> {qrData.appointment.id}</p>
                <p><strong>Doctor:</strong> {qrData.appointment.doctor_id}</p>
                <p><strong>Date:</strong> {qrData.appointment.appointment_date}</p>
                <p><strong>Time:</strong> {qrData.appointment.appointment_time}</p>
                <p><strong>Status:</strong> {qrData.appointment.status}</p>
                <p><strong>Notes:</strong> {qrData.appointment.notes}</p>
                <p><strong>Symptoms Array:</strong> {JSON.stringify(qrData.appointment.symptoms)}</p>
                <p><strong>Description:</strong> {qrData.appointment.description}</p>
              </div>
            </div>

            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">📱 Generated QR Code</h3>
              <div 
                className="qr-container bg-white p-4 rounded-lg flex justify-center"
                dangerouslySetInnerHTML={{ __html: qrData.qrCode }}
              />
            </div>

            <div className="bg-yellow-100 p-4 rounded-lg">
              <h3 className="font-bold text-yellow-800 mb-2">🏥 What Reception App Will See</h3>
              <p className="text-sm mb-2">Reception app will scan this QR and receive the appointment data for check-in processing.</p>
              
              <div className="mt-3 space-y-2 bg-white p-3 rounded">
                <h4 className="font-semibold">📋 Patient Check-in Data:</h4>
                <p><strong>Appointment ID:</strong> {qrData.appointment.id}</p>
                <p><strong>Patient Name:</strong> {qrData.appointment.patient_name || 'Patient'}</p>
                <p><strong>Doctor:</strong> {qrData.appointment.doctor_id}</p>
                <p><strong>Date & Time:</strong> {qrData.appointment.appointment_date} at {qrData.appointment.appointment_time}</p>
                <p><strong>Status:</strong> {qrData.appointment.status}</p>
                <p><strong>Symptoms & Notes:</strong> {qrData.appointment.notes || 'None'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-100 p-4 rounded-lg text-sm">
          <h3 className="font-bold mb-2">📝 Test Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>First, create a booking with symptoms and description at <a href="/" className="text-blue-600 underline">Home Page</a></li>
            <li>Then return here and click "Test QR" to see what Reception app will receive</li>
            <li>Check if symptoms and description are included in the appointment notes</li>
            <li>Verify QR code displays correctly for scanning</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
