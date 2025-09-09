// QR Static Check-in Page - Luồng mới theo yêu cầu
import React, { useState, useEffect } from 'react';
import { Box, Button, Page, Header, Text, Spinner } from 'zmp-ui';
import { staticCheckInService } from '@/services/static-checkin.service';
import toast from 'react-hot-toast';

interface CheckInState {
  loading: boolean;
  success: boolean;
  message: string;
  booking: any;
}

export const QRStaticCheckIn: React.FC = () => {
  const [state, setState] = useState<CheckInState>({
    loading: true,
    success: false,
    message: '',
    booking: null
  });

  // Auto check-in when page loads (theo luồng mới)
  useEffect(() => {
    handleAutoCheckIn();
  }, []);

  const handleAutoCheckIn = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      console.log('🎯 Starting auto check-in process...');
      const result = await staticCheckInService.handleCustomerCheckIn();
      
      setState({
        loading: false,
        success: result.success,
        message: result.message,
        booking: result.booking || null
      });

      if (result.success) {
        toast.success('Check-in thành công!');
      } else {
        toast.error(result.message);
      }

    } catch (error) {
      console.error('❌ Check-in error:', error);
      setState({
        loading: false,
        success: false,
        message: 'Có lỗi xảy ra trong quá trình check-in.',
        booking: null
      });
      toast.error('Lỗi check-in');
    }
  };

  const handleRetryCheckIn = () => {
    handleAutoCheckIn();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  if (state.loading) {
    return (
      <Page>
        <Header title="Đang Check-in..." />
        <Box className="flex flex-col items-center justify-center min-h-screen p-6">
          <Spinner />
          <Text className="mt-4 text-center text-lg">
            Đang xử lý check-in tự động...
          </Text>
          <Text className="mt-2 text-center text-sm text-gray-600">
            Vui lòng đợi trong giây lát
          </Text>
        </Box>
      </Page>
    );
  }

  return (
    <Page>
      <Header title="Kết Quả Check-in" />
      
      <Box className="p-6 space-y-6">
        
        {/* Check-in Status Card */}
        <Box className={`p-6 rounded-xl text-center ${
          state.success 
            ? 'bg-green-50 border-2 border-green-200' 
            : 'bg-red-50 border-2 border-red-200'
        }`}>
          
          {/* Status Icon */}
          <Box className={`text-6xl mb-4 ${
            state.success ? 'text-green-500' : 'text-red-500'
          }`}>
            {state.success ? '✅' : '❌'}
          </Box>

          {/* Status Title */}
          <Text.Title className={`text-xl font-bold mb-3 ${
            state.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {state.success ? 'Check-in Thành Công!' : 'Check-in Không Thành Công'}
          </Text.Title>

          {/* Status Message */}
          <Text className={`text-sm mb-4 ${
            state.success ? 'text-green-700' : 'text-red-700'
          }`}>
            {state.message}
          </Text>

          {/* Booking Details (if successful) */}
          {state.success && state.booking && (
            <Box className="bg-white p-4 rounded-lg border border-green-300 text-left mt-4">
              <Text className="font-semibold text-green-800 mb-3">📋 Chi tiết lịch hẹn:</Text>
              <Box className="space-y-2 text-sm">
                <Box className="flex justify-between">
                  <Text className="text-gray-600">Tên khách hàng:</Text>
                  <Text className="font-medium">{state.booking.customer_name}</Text>
                </Box>
                <Box className="flex justify-between">
                  <Text className="text-gray-600">Thời gian:</Text>
                  <Text className="font-medium">{formatTime(state.booking.appointment_time)}</Text>
                </Box>
                <Box className="flex justify-between">
                  <Text className="text-gray-600">Ngày hẹn:</Text>
                  <Text className="font-medium">{formatDate(state.booking.appointment_date)}</Text>
                </Box>
                <Box className="flex justify-between">
                  <Text className="text-gray-600">Dịch vụ:</Text>
                  <Text className="font-medium">{state.booking.service_type || 'Vật lý trị liệu'}</Text>
                </Box>
                <Box className="flex justify-between">
                  <Text className="text-gray-600">Check-in lúc:</Text>
                  <Text className="font-medium text-green-600">
                    {new Date(state.booking.checkin_timestamp).toLocaleTimeString('vi-VN')}
                  </Text>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* Action Buttons */}
        <Box className="space-y-3">
          {!state.success && (
            <Button
              type="highlight"
              size="large"
              onClick={handleRetryCheckIn}
              className="w-full"
            >
              🔄 Thử lại Check-in
            </Button>
          )}

          <Button
            type="neutral"
            size="large"
            onClick={() => window.location.href = '/schedule'}
            className="w-full"
          >
            📋 Xem lịch hẹn của tôi
          </Button>

          <Button
            type="neutral"
            size="large" 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            🏠 Về trang chủ
          </Button>
        </Box>

        {/* New Workflow Instructions */}
        <Box className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <Text className="text-blue-800 font-semibold mb-2">
            📱 Luồng quy trình mới:
          </Text>
          <Box className="space-y-1 text-xs text-blue-700">
            <Text>✅ 1. Đặt lịch qua Zalo Mini App</Text>
            <Text>✅ 2. Nhận thông báo xác nhận qua Zalo OA</Text>
            <Text>✅ 3. Đến phòng khám → Scan QR tĩnh tại quầy lễ tân</Text>
            <Text>✅ 4. Hệ thống tự động check-in</Text>
            <Text>✅ 5. Chờ gọi tên để vào phòng khám</Text>
          </Box>
        </Box>

        {/* Contact Information */}
        {!state.success && (
          <Box className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <Text className="text-yellow-800 font-semibold mb-2">
              🆘 Cần hỗ trợ?
            </Text>
            <Text className="text-xs text-yellow-700">
              Nếu gặp khó khăn, vui lòng liên hệ lễ tân để được hỗ trợ check-in thủ công.
            </Text>
          </Box>
        )}
      </Box>
    </Page>
  );
};

export default QRStaticCheckIn;
