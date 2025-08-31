import React, { useState } from 'react';
import { QRService } from '../services/qr.service';

export const QRTest: React.FC = () => {
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testQR = async () => {
    setLoading(true);
    try {
      const mockAppointment = {
        id: 'test-123',
        user_id: 'user-123',
        appointment_date: '2025-08-31',
        appointment_time: '10:00',
        status: 'confirmed' as const,
        created_at: new Date().toISOString()
      };

      const qr = await QRService.generateQRCode(mockAppointment as any);
      setQrCode(qr);
      console.log('✅ QR Test successful:', qr.substring(0, 50) + '...');
    } catch (error) {
      console.error('❌ QR Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <button 
        onClick={testQR}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Generating...' : 'Test QR Generation'}
      </button>
      
      {qrCode && (
        <div className="text-center">
          <img src={qrCode} alt="Test QR" className="mx-auto" style={{ width: 200, height: 200 }} />
          <p className="text-sm text-gray-600 mt-2">QR Test thành công!</p>
        </div>
      )}
    </div>
  );
};
