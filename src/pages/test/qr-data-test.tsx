import React, { useState } from 'react';
import Page from '../../components/page';
import { QRService } from '../../services/qr.service';
import { MockDatabaseService } from '../../services/mock-database.service';

import React, { useState } from 'react';
import { QRService } from '../../services/qr.service';
import { MockDatabaseService } from '../../services/mock-database.service';

export const QRDataTestPage: React.FC = () => {
  const [qrData, setQrData] = useState<any>(null);
  const [scannedData, setScannedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testQRWithLatestAppointment = async () => {
    try {
      setLoading(true);
      console.log('🔍 Testing QR with latest appointment...');
      
      // Get latest appointment
      const appointments = await MockDatabaseService.getAppointmentsByUserId('patient-dev-123');
      const latestAppointment = appointments[0]; // Most recent
      
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
      
      // Simulate QR scan - decrypt QR to see what Reception app will receive
      const qrText = await QRService.generateQRText(latestAppointment);
      const decryptedData = QRService.decryptQRData(qrText);
      setScannedData(decryptedData);
      
      console.log('✅ QR Test Results:');
      console.log('📱 Original Appointment:', latestAppointment);
      console.log('🔐 QR Text:', qrText);
      console.log('📥 Decrypted Data (What Reception sees):', decryptedData);
      
    } catch (error) {
      console.error('❌ QR Test Error:', error);
      alert('QR test failed: ' + error.message);
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

            {scannedData && (
              <div className="bg-yellow-100 p-4 rounded-lg">
                <h3 className="font-bold text-yellow-800 mb-2">🏥 What Reception App Will See</h3>
                <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
                  {JSON.stringify(scannedData, null, 2)}
                </pre>
                
                <div className="mt-3 space-y-2">
                  <h4 className="font-semibold">📋 Extracted Patient Info:</h4>
                  <p><strong>Appointment ID:</strong> {scannedData.appointmentId}</p>
                  <p><strong>Patient ID:</strong> {scannedData.patientId}</p>
                  <p><strong>Check-in Time:</strong> {scannedData.checkInTime}</p>
                  <p><strong>Valid Until:</strong> {scannedData.expiresAt}</p>
                  <p><strong>Security Signature:</strong> {scannedData.signature ? '✅ Valid' : '❌ Invalid'}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-100 p-4 rounded-lg text-sm">
          <h3 className="font-bold mb-2">📝 Test Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>First, create a booking with symptoms and description</li>
            <li>Then click "Test QR" to see what Reception app will receive</li>
            <li>Check if symptoms and description are included in the QR data</li>
            <li>Verify QR security (signature validation)</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
