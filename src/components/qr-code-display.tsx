import React, { useState, useEffect } from 'react';
import { Appointment } from '../services/supabase.config';
import { QRService } from '../services/qr.service';
import { Icon } from 'zmp-ui';
import toast from 'react-hot-toast';

interface QRCodeDisplayProps {
  appointment: Appointment;
  size?: 'small' | 'medium' | 'large';
  showInfo?: boolean;
  allowDownload?: boolean;
  allowRegenerate?: boolean;
  onRegenerate?: (newQRCode: string) => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  appointment,
  size = 'medium',
  showInfo = true,
  allowDownload = false,
  allowRegenerate = false,
  onRegenerate
}) => {
  const [qrCode, setQRCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [regenerating, setRegenerating] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: { width: 150, containerClass: 'w-40' },
    medium: { width: 250, containerClass: 'w-64' },
    large: { width: 350, containerClass: 'w-80' }
  };

  const currentSize = sizeConfig[size];

  // Generate QR code on mount
  useEffect(() => {
    generateQRCode();
  }, [appointment.id]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError('');
      
      const qrDataURL = await QRService.generateCustomQR(appointment, 'display');
      setQRCode(qrDataURL);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Không thể tạo mã QR');
      toast.error('Không thể tạo mã QR');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const qrDataURL = await QRService.generateCustomQR(appointment, 'display');
      setQRCode(qrDataURL);
      onRegenerate?.(qrDataURL);
      toast.success('Mã QR đã được tạo lại!');
    } catch (err) {
      console.error('Error regenerating QR code:', err);
      toast.error('Không thể tạo lại mã QR');
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownload = () => {
    if (!qrCode) return;

    const link = document.createElement('a');
    link.download = `qr-appointment-${appointment.id}.png`;
    link.href = qrCode;
    link.click();
    toast.success('Mã QR đã được tải xuống!');
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      return timeStr.substring(0, 5); // HH:MM format
    } catch {
      return timeStr;
    }
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center ${currentSize.containerClass} mx-auto p-4`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 text-sm mt-2">Đang tạo mã QR...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center ${currentSize.containerClass} mx-auto p-4 border border-red-200 rounded-lg bg-red-50`}>
        <Icon icon="zi-close-circle" className="text-red-500 text-2xl mb-2" />
        <p className="text-red-600 text-sm text-center">{error}</p>
        <button 
          onClick={generateQRCode}
          className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${currentSize.containerClass} mx-auto`}>
      {/* QR Code Image */}
      <div className="relative bg-white p-4 rounded-lg shadow-md border">
        <img 
          src={qrCode} 
          alt="QR Code" 
          className="block"
          style={{ width: currentSize.width, height: currentSize.width }}
        />
        
        {/* Status indicator */}
        <div className="absolute top-2 right-2">
          <div className={`w-3 h-3 rounded-full ${
            appointment.status === 'confirmed' ? 'bg-green-500' :
            appointment.status === 'arrived' ? 'bg-blue-500' :
            appointment.status === 'completed' ? 'bg-gray-500' :
            'bg-yellow-500'
          }`} />
        </div>
      </div>

      {/* Appointment Info */}
      {showInfo && (
        <div className="mt-4 text-center space-y-1">
          <h3 className="font-medium text-gray-900 text-sm">Mã QR Check-in</h3>
          <p className="text-gray-600 text-xs">
            {formatDate(appointment.appointment_date)} • {formatTime(appointment.appointment_time)}
          </p>
          <p className="text-gray-500 text-xs">
            ID: {appointment.id.substring(0, 8)}...
          </p>
          <div className={`inline-block px-2 py-1 rounded-full text-xs ${
            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
            appointment.status === 'arrived' ? 'bg-blue-100 text-blue-800' :
            appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {appointment.status === 'confirmed' ? 'Đã xác nhận' :
             appointment.status === 'arrived' ? 'Đã đến' :
             appointment.status === 'completed' ? 'Hoàn thành' :
             'Đang chờ'}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {(allowDownload || allowRegenerate) && (
        <div className="flex gap-2 mt-4">
          {allowDownload && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
            >
              <Icon icon="zi-download" size={14} />
              Tải xuống
            </button>
          )}
          
          {allowRegenerate && (
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors disabled:bg-gray-400"
            >
              <Icon icon="zi-refresh" size={14} className={regenerating ? 'animate-spin' : ''} />
              {regenerating ? 'Đang tạo...' : 'Tạo lại'}
            </button>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-800 text-xs text-center">
          📱 Đưa mã QR này cho lễ tân để check-in khi đến khám
        </p>
      </div>
    </div>
  );
};
