// Reception Check-in Component cho Lễ tân
import React, { useState, useEffect } from 'react';
import { Box, Button, Page, Header, Text, List, Icon, Modal } from 'zmp-ui';
import { realClinicBookingService, BookingRecord, BookingStatus, CheckinStatus } from '@/services/real-clinic-booking.service';
import { scanQRCode } from 'zmp-sdk/apis';
import toast from 'react-hot-toast';

interface ReceptionCheckInProps {
  staffId?: string;
}

export const ReceptionCheckIn: React.FC<ReceptionCheckInProps> = ({ 
  staffId = 'reception-staff-01' 
}) => {
  const [todayBookings, setTodayBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Load today's bookings
  useEffect(() => {
    loadTodayBookings();
    
    // Subscribe to real-time updates
    const subscription = realClinicBookingService.subscribeToBookingUpdates((payload) => {
      console.log('Real-time booking update:', payload);
      loadTodayBookings(); // Refresh data
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadTodayBookings = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const bookings = await realClinicBookingService.getAllBookings({
        date: today,
        status: BookingStatus.CONFIRMED // Chỉ hiện booking đã confirm
      });
      
      setTodayBookings(bookings);
    } catch (error) {
      console.error('Error loading today bookings:', error);
      toast.error('Lỗi khi tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  // QR Scanner function
  const handleQRScan = async () => {
    try {
      const result = await scanQRCode();
      
      if (result.content) {
        // Find booking by QR data
        const booking = await realClinicBookingService.getBookingByQR(result.content);
        
        if (booking) {
          setSelectedBooking(booking);
          setShowModal(true);
        } else {
          toast.error('Không tìm thấy lịch hẹn tương ứng');
        }
      }
    } catch (error) {
      console.error('QR scan error:', error);
      toast.error('Lỗi khi quét mã QR');
    }
  };

  // Check-in booking
  const handleCheckIn = async (bookingId: string) => {
    try {
      const result = await realClinicBookingService.checkInBooking(bookingId, staffId);
      
      if (result.success) {
        toast.success('Check-in thành công!');
        loadTodayBookings(); // Refresh data
        setShowModal(false);
        setSelectedBooking(null);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('Lỗi khi check-in');
    }
  };

  // Get status color
  const getStatusColor = (status: CheckinStatus) => {
    switch (status) {
      case CheckinStatus.CHECKED_IN:
        return 'text-green-600';
      case CheckinStatus.NOT_ARRIVED:
        return 'text-orange-600';
      case CheckinStatus.NO_SHOW:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get status text
  const getStatusText = (status: CheckinStatus) => {
    switch (status) {
      case CheckinStatus.CHECKED_IN:
        return 'Đã check-in';
      case CheckinStatus.NOT_ARRIVED:
        return 'Chưa đến';
      case CheckinStatus.NO_SHOW:
        return 'Không đến';
      default:
        return 'Không xác định';
    }
  };

  return (
    <Page>
      <Header title="Lễ Tân - Check-in Khách Hàng" />
      
      <Box className="p-4 space-y-4">
        {/* QR Scanner Button */}
        <Box className="text-center">
          <Button
            type="highlight"
            size="large"
            onClick={handleQRScan}
            className="w-full mb-4"
          >
            Quét mã QR khách hàng
          </Button>
        </Box>

        {/* Today's Bookings */}
        <Box>
          <Text.Header className="mb-3">
            Lịch hẹn hôm nay ({todayBookings.length})
          </Text.Header>
          
          {loading ? (
            <Text>Đang tải...</Text>
          ) : (
            <List>
              {todayBookings.map((booking) => (
                <List.Item
                  key={booking.id}
                  title={booking.customer_name}
                  subTitle={`${booking.appointment_time} - ${booking.phone_number}`}
                  suffix={
                    <Box className="text-right">
                      <Text className={`text-sm ${getStatusColor(booking.checkin_status)}`}>
                        {getStatusText(booking.checkin_status)}
                      </Text>
                      {booking.checkin_status === CheckinStatus.NOT_ARRIVED && (
                        <Button
                          size="small"
                          type="highlight"
                          className="mt-1"
                          onClick={() => handleCheckIn(booking.id)}
                        >
                          Check-in
                        </Button>
                      )}
                    </Box>
                  }
                />
              ))}
            </List>
          )}
        </Box>
      </Box>

      {/* Check-in Modal */}
      <Modal
        visible={showModal}
        title="Xác nhận Check-in"
        onClose={() => {
          setShowModal(false);
          setSelectedBooking(null);
        }}
        actions={[
          {
            text: 'Hủy',
            close: true,
          },
          {
            text: 'Xác nhận Check-in',
            highLight: true,
            onClick: () => selectedBooking && handleCheckIn(selectedBooking.id),
          },
        ]}
      >
        {selectedBooking && (
          <Box className="space-y-3">
            <Text><strong>Tên khách hàng:</strong> {selectedBooking.customer_name}</Text>
            <Text><strong>Số điện thoại:</strong> {selectedBooking.phone_number}</Text>
            <Text><strong>Thời gian hẹn:</strong> {selectedBooking.appointment_time}</Text>
            <Text><strong>Ngày hẹn:</strong> {selectedBooking.appointment_date}</Text>
            {selectedBooking.symptoms && (
              <Text><strong>Triệu chứng:</strong> {selectedBooking.symptoms}</Text>
            )}
            {selectedBooking.detailed_description && (
              <Text><strong>Mô tả:</strong> {selectedBooking.detailed_description}</Text>
            )}
          </Box>
        )}
      </Modal>
    </Page>
  );
};

export default ReceptionCheckIn;
