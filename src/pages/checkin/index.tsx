// QR Static Check-in Page - Khách hàng quét QR tĩnh của phòng khám
import React, { useState, useEffect } from 'react';
import { Box, Button, Page, Header, Text, Modal, List } from 'zmp-ui';
import { realClinicBookingService, BookingRecord, CheckinStatus } from '@/services/real-clinic-booking.service';
import { AuthService } from '@/services/auth.service';
import { getPhoneNumber } from 'zmp-sdk/apis';
import toast from 'react-hot-toast';

export const QRStaticCheckIn: React.FC = () => {
  const [userBookings, setUserBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [showBookings, setShowBookings] = useState(false);

  useEffect(() => {
    // Auto-load user bookings if authenticated
    loadUserBookings();
  }, []);

  const loadUserBookings = async () => {
    setLoading(true);
    try {
      const currentUser = AuthService.getCurrentUser();
      
      if (currentUser) {
        // Load by user ID
        const bookings = await realClinicBookingService.getUserBookings();
        const confirmedBookings = bookings.filter(b => 
          b.booking_status === 'confirmed' && 
          b.checkin_status === CheckinStatus.NOT_ARRIVED &&
          new Date(b.appointment_date) >= new Date(new Date().toISOString().split('T')[0])
        );
        setUserBookings(confirmedBookings);
        
        if (confirmedBookings.length > 0) {
          setShowBookings(true);
        }
      }
    } catch (error) {
      console.error('Error loading user bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookingsByPhone = async () => {
    if (!phoneNumber) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }

    setLoading(true);
    try {
      const bookings = await realClinicBookingService.getUserBookings(phoneNumber);
      const confirmedBookings = bookings.filter(b => 
        b.booking_status === 'confirmed' && 
        b.checkin_status === CheckinStatus.NOT_ARRIVED &&
        new Date(b.appointment_date) >= new Date(new Date().toISOString().split('T')[0])
      );
      
      setUserBookings(confirmedBookings);
      setShowBookings(true);
      
      if (confirmedBookings.length === 0) {
        toast.error('Không tìm thấy lịch hẹn nào cần check-in');
      }
    } catch (error) {
      console.error('Error loading bookings by phone:', error);
      toast.error('Lỗi khi tìm lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (bookingId: string) => {
    try {
      const result = await realClinicBookingService.checkInBooking(bookingId);
      
      if (result.success) {
        toast.success('Check-in thành công! Vui lòng chờ trong phòng khám.');
        loadUserBookings(); // Refresh data
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('Lỗi khi check-in');
    }
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

  return (
    <Page>
      <Header title="Check-in Lịch Hẹn" />
      
      <Box className="p-4 space-y-6">
        {/* Welcome Message */}
        <Box className="bg-blue-50 p-4 rounded-lg">
          <Text.Title className="text-blue-800 mb-2">
            Chào mừng đến KajoTai Rehab Clinic! 👋
          </Text.Title>
          <Text className="text-blue-600">
            Vui lòng check-in để xác nhận bạn đã có mặt tại phòng khám.
          </Text>
        </Box>

        {/* Auto-loaded bookings or Phone input */}
        {!showBookings ? (
          <Box className="space-y-4">
            <Text.Header>
              Nhập số điện thoại để tìm lịch hẹn:
            </Text.Header>
            
            <Box className="space-y-3">
              <input
                type="tel"
                placeholder="Số điện thoại (VD: 0901234567)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              
              <Button
                type="highlight"
                size="large"
                onClick={loadBookingsByPhone}
                loading={loading}
                className="w-full"
              >
                Tìm lịch hẹn
              </Button>
            </Box>
          </Box>
        ) : (
          <Box className="space-y-4">
            <Text.Header>
              Lịch hẹn của bạn ({userBookings.length})
            </Text.Header>

            {userBookings.length > 0 ? (
              <List>
                {userBookings.map((booking) => (
                  <List.Item
                    key={booking.id}
                    title={`${formatDate(booking.appointment_date)}`}
                    subTitle={`${formatTime(booking.appointment_time)} - ${booking.customer_name}`}
                    suffix={
                      <Button
                        type="highlight"
                        size="small"
                        onClick={() => handleCheckIn(booking.id)}
                      >
                        Check-in
                      </Button>
                    }
                  />
                ))}
              </List>
            ) : (
              <Box className="text-center py-8">
                <Text className="text-gray-500">
                  Không tìm thấy lịch hẹn nào cần check-in
                </Text>
                <Button
                  type="neutral"
                  size="medium"
                  className="mt-3"
                  onClick={() => {
                    setShowBookings(false);
                    setPhoneNumber('');
                  }}
                >
                  Thử số điện thoại khác
                </Button>
              </Box>
            )}

            {userBookings.length > 0 && (
              <Button
                type="neutral"
                size="medium"
                className="w-full mt-4"
                onClick={() => {
                  setShowBookings(false);
                  setPhoneNumber('');
                }}
              >
                Tìm bằng số điện thoại khác
              </Button>
            )}
          </Box>
        )}

        {/* Instructions */}
        <Box className="bg-gray-50 p-4 rounded-lg">
          <Text.Header className="text-gray-700 mb-2">
            Hướng dẫn:
          </Text.Header>
          <Box className="space-y-2">
            <Text className="text-sm text-gray-600">
              • Quét mã QR tĩnh tại quầy lễ tân để vào trang này
            </Text>
            <Text className="text-sm text-gray-600">
              • Nhập số điện thoại đã đăng ký lịch hẹn
            </Text>
            <Text className="text-sm text-gray-600">
              • Nhấn "Check-in" để xác nhận đã có mặt
            </Text>
            <Text className="text-sm text-gray-600">
              • Chờ hướng dẫn từ nhân viên y tế
            </Text>
          </Box>
        </Box>
      </Box>
    </Page>
  );
};

export default QRStaticCheckIn;
