import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Page, Button, Box, Text } from 'zmp-ui';
import { QRCodeDisplay } from '../../components/qr-code-display';
import { Appointment } from '../../services/supabase.config';
import toast from 'react-hot-toast';

const BookingSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadAppointmentFromState();
  }, [location.state]);

  const loadAppointmentFromState = async () => {
    try {
      console.log('📍 Success page state:', location.state);
      
      if (!location.state || !location.state.appointment) {
        setError('Không tìm thấy thông tin lịch hẹn');
        console.error('❌ No appointment data in navigation state');
        return;
      }

      const { appointment: appointmentData, qrCode: qrCodeData, bookingDetails: detailsData } = location.state;
      
      console.log('✅ Loading appointment from state:', appointmentData);
      console.log('🔑 QR Code data:', qrCodeData ? 'Available' : 'Missing');
      console.log('📋 Booking details:', detailsData);
      
      setAppointment(appointmentData);
      setQrCode(qrCodeData || '');
      setBookingDetails(detailsData || null);
      
    } catch (err) {
      console.error('Error loading appointment from state:', err);
      setError('Có lỗi xảy ra khi tải thông tin lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleQRRegenerate = (newQRCode: string) => {
    toast.success('Mã QR đã được cập nhật!');
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        weekday: 'long',
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
      return timeStr.substring(0, 5);
    } catch {
      return timeStr;
    }
  };

  if (loading) {
    return (
      <Page className="bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Đang tải thông tin...</p>
          </div>
        </div>
      </Page>
    );
  }

  if (error || !appointment) {
    return (
      <Page className="bg-gray-50">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h2>
            <p className="text-gray-600 text-center mb-6">{error}</p>
            <div className="space-y-2">
              <Button 
                fullWidth 
                onClick={() => navigate('/booking')}
                className="bg-blue-600 text-white"
              >
                Đặt lịch mới
              </Button>
              <Button 
                fullWidth 
                variant="secondary" 
                onClick={() => navigate('/')}
              >
                Về trang chủ
              </Button>
            </div>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page className="bg-gray-50">
      <div className="p-4 space-y-6">
        {/* Success Message */}
        <div className="text-center bg-green-50 border border-green-200 rounded-xl p-6 mt-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl">✅</span>
          </div>
          <h1 className="text-xl font-bold text-green-800 mb-2">
            Đặt lịch thành công!
          </h1>
          <p className="text-green-600 text-sm">
            Lịch hẹn của bạn đã được tự động xác nhận và tạo mã QR
          </p>
        </div>

        {/* Appointment Details */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Thông tin lịch hẹn
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 font-medium">🏥 Dịch vụ:</span>
              <span className="text-gray-900 text-right max-w-48">
                {bookingDetails?.serviceName || (appointment as any)?.service_name || 'Vật lý trị liệu, Phục hồi chức năng'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 font-medium">🏢 Cơ sở:</span>
              <span className="text-gray-900 text-right max-w-48">
                {bookingDetails?.facilityName || 'Kajo Rehab'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 font-medium">👨‍⚕️ Bác sĩ:</span>
              <span className="text-gray-900 text-right max-w-48">
                {bookingDetails?.doctorName || (appointment as any)?.doctor_name || 'Chưa xác định'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 font-medium">📅 Ngày hẹn:</span>
              <span className="text-gray-900">{formatDate(appointment.appointment_date)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 font-medium">⏰ Thời gian:</span>
              <span className="text-gray-900">{formatTime(appointment.appointment_time)}</span>
            </div>
            
            {(bookingDetails?.symptoms?.length > 0 || (appointment as any)?.symptoms) && (
              <div className="flex justify-between items-start py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">🩺 Triệu chứng:</span>
                <span className="text-gray-900 text-right max-w-48">
                  {bookingDetails?.symptoms?.join(', ') || (appointment as any)?.symptoms}
                </span>
              </div>
            )}

            {(bookingDetails?.description || appointment.notes) && (
              <div className="flex justify-between items-start py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">📝 Mô tả:</span>
                <span className="text-gray-900 text-right max-w-48">
                  {bookingDetails?.description || appointment.notes}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 font-medium">📊 Trạng thái:</span>
              <span className="inline-block px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Đã xác nhận
              </span>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        {qrCode && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Mã QR Check-in
            </h2>
            
            <div className="text-center">
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img
                  src={qrCode}
                  alt="QR Code for appointment"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <Text size="small" className="text-gray-500 mt-2">
                Mã QR này sẽ hết hạn sau 24 giờ
              </Text>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Hướng dẫn sử dụng:</h3>
          <div className="space-y-2 text-blue-700 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-blue-600">1.</span>
              <span>Đến phòng khám đúng ngày giờ hẹn</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">2.</span>
              <span>Đưa mã QR này cho lễ tân để check-in</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">3.</span>
              <span>Chờ được gọi tên để vào khám</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pb-6">
          <Button 
            fullWidth 
            onClick={() => navigate('/schedule')}
            className="bg-blue-600 text-white"
          >
            Xem lịch hẹn của tôi
          </Button>
          
          <Button 
            fullWidth 
            variant="secondary" 
            onClick={() => navigate('/')}
          >
            Về trang chủ
          </Button>
          
          <Button 
            fullWidth 
            variant="tertiary"
            onClick={() => navigate('/booking')}
            className="text-blue-600"
          >
            Đặt lịch khác
          </Button>
        </div>
      </div>
    </Page>
  );
};

export default BookingSuccess;
