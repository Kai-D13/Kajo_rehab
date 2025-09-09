import React, { useState, useEffect } from 'react';
import { Page, Header, Box, Text, List, Button, Input, Spinner } from 'zmp-ui';
import { staticCheckInService } from '@/services/static-checkin.service';
import { realClinicBookingService } from '@/services/real-clinic-booking.service';
import toast from 'react-hot-toast';

/**
 * 🏥 Admin Interface cho Lễ Tân - View Only Dashboard
 * Quản lý check-in, xem danh sách bệnh nhân, search và filter
 */

interface ReceptionDashboardData {
  todayBookings: any[];
  summary: {
    total: number;
    checked_in: number;
    pending: number;
  };
  selectedDate: string;
}

export default function ReceptionDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReceptionDashboardData>({
    todayBookings: [],
    summary: { total: 0, checked_in: 0, pending: 0 },
    selectedDate: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [manualPhone, setManualPhone] = useState('');

  useEffect(() => {
    loadDashboardData();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [data.selectedDate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading reception dashboard data...');

      if (data.selectedDate === new Date().toISOString().split('T')[0]) {
        // Today's data from static check-in service
        const result = await staticCheckInService.getTodayBookings();
        setData(prev => ({
          ...prev,
          todayBookings: result.bookings,
          summary: result.summary
        }));
      } else {
        // Historical data from booking service
        const bookings = await realClinicBookingService.getBookingsByDate(data.selectedDate);
        const checkedIn = bookings.filter(b => b.checkin_status === 'checked_in').length;
        const pending = bookings.filter(b => b.checkin_status === 'not_arrived').length;
        
        setData(prev => ({
          ...prev,
          todayBookings: bookings,
          summary: {
            total: bookings.length,
            checked_in: checkedIn,
            pending: pending
          }
        }));
      }

    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckIn = async () => {
    if (!manualPhone.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }

    try {
      const result = await staticCheckInService.manualCheckIn(manualPhone.trim());
      
      if (result.success) {
        toast.success(result.message);
        setManualPhone('');
        loadDashboardData(); // Refresh data
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('❌ Manual check-in error:', error);
      toast.error('Lỗi khi check-in thủ công');
    }
  };

  const filteredBookings = data.todayBookings.filter(booking => {
    const matchesSearch = !searchTerm || 
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone_number.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'checked_in' && booking.checkin_status === 'checked_in') ||
      (filterStatus === 'pending' && booking.checkin_status === 'not_arrived');

    return matchesSearch && matchesFilter;
  });

  const formatTime = (timeStr: string) => timeStr.substring(0, 5);
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Page>
      <Header title="🏥 Reception Dashboard - Lễ Tân" />
      
      <Box className="p-4 space-y-6">
        
        {/* Dashboard Summary */}
        <Box className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <Text className="font-bold text-blue-800 mb-3">📊 Tổng Quan Ngày {formatDate(data.selectedDate)}</Text>
          <Box className="grid grid-cols-3 gap-4 text-center">
            <Box className="bg-white p-3 rounded-md">
              <Text className="text-2xl font-bold text-blue-600">{data.summary.total}</Text>
              <Text className="text-xs text-gray-600">Tổng Lịch Hẹn</Text>
            </Box>
            <Box className="bg-white p-3 rounded-md">
              <Text className="text-2xl font-bold text-green-600">{data.summary.checked_in}</Text>
              <Text className="text-xs text-gray-600">Đã Check-in</Text>
            </Box>
            <Box className="bg-white p-3 rounded-md">
              <Text className="text-2xl font-bold text-orange-600">{data.summary.pending}</Text>
              <Text className="text-xs text-gray-600">Chưa Đến</Text>
            </Box>
          </Box>
        </Box>

        {/* Controls */}
        <Box className="space-y-3">
          {/* Date Selection */}
          <Box>
            <Text className="text-sm font-medium mb-2">📅 Chọn Ngày:</Text>
            <input
              type="date"
              value={data.selectedDate}
              onChange={(e) => setData(prev => ({ ...prev, selectedDate: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </Box>

          {/* Search & Filter */}
          <Box className="grid grid-cols-2 gap-3">
            <Box>
              <Text className="text-sm font-medium mb-2">🔍 Tìm Kiếm:</Text>
              <Input
                placeholder="Tên hoặc SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Box>
            <Box>
              <Text className="text-sm font-medium mb-2">🔽 Lọc Trạng Thái:</Text>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="all">Tất cả</option>
                <option value="checked_in">Đã check-in</option>
                <option value="pending">Chưa đến</option>
              </select>
            </Box>
          </Box>

          {/* Manual Check-in */}
          <Box className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <Text className="text-sm font-medium text-yellow-800 mb-2">🆘 Check-in Thủ Công:</Text>
            <Box className="flex gap-2">
              <Input
                placeholder="Số điện thoại..."
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                className="flex-1"
              />
              <Button
                size="small"
                onClick={handleManualCheckIn}
                className="bg-yellow-600 text-white"
              >
                Check-in
              </Button>
            </Box>
          </Box>

          {/* Refresh Button */}
          <Button
            onClick={loadDashboardData}
            loading={loading}
            className="w-full bg-blue-600 text-white"
          >
            🔄 Làm Mới Dữ Liệu
          </Button>
        </Box>

        {/* Bookings List */}
        <Box>
          <Text className="font-bold mb-3">
            📋 Danh Sách Bệnh Nhân ({filteredBookings.length})
          </Text>
          
          {loading ? (
            <Box className="text-center py-8">
              <Spinner />
              <Text className="mt-2">Đang tải dữ liệu...</Text>
            </Box>
          ) : filteredBookings.length === 0 ? (
            <Box className="text-center py-8 bg-gray-50 rounded-lg">
              <Text className="text-gray-500">Không có dữ liệu</Text>
            </Box>
          ) : (
            <List>
              {filteredBookings.map((booking) => (
                <List.Item
                  key={booking.id}
                  title={`${booking.customer_name} - ${booking.phone_number}`}
                  subTitle={`🕐 ${formatTime(booking.appointment_time)} | 🏥 ${booking.service_type || 'Vật lý trị liệu'} ${booking.symptoms ? `| 🩺 ${booking.symptoms}` : ''}`}
                  suffix={
                    <Box className="text-right">
                      <Box className={`px-2 py-1 rounded text-xs font-medium ${
                        booking.checkin_status === 'checked_in' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {booking.checkin_status === 'checked_in' ? '✅ Đã đến' : '⏳ Chưa đến'}
                      </Box>
                      {booking.checkin_timestamp && (
                        <Text className="text-xs text-gray-500 mt-1">
                          {new Date(booking.checkin_timestamp).toLocaleTimeString('vi-VN')}
                        </Text>
                      )}
                    </Box>
                  }
                />
              ))}
            </List>
          )}
        </Box>

        {/* Quick Actions */}
        <Box className="bg-gray-50 p-4 rounded-lg">
          <Text className="font-bold text-gray-800 mb-3">⚡ Thao Tác Nhanh:</Text>
          <Box className="grid grid-cols-2 gap-3">
            <Button
              size="small"
              onClick={() => window.open('/checkin', '_blank')}
              className="bg-teal-600 text-white"
            >
              📱 Mở Check-in Page
            </Button>
            <Button
              size="small"
              onClick={() => {
                const qrContent = staticCheckInService.generateStaticQRContent();
                navigator.clipboard.writeText(qrContent);
                toast.success('QR URL copied to clipboard');
              }}
              className="bg-purple-600 text-white"
            >
              📄 Copy QR URL
            </Button>
          </Box>
        </Box>

        {/* Instructions */}
        <Box className="bg-green-50 p-4 rounded-lg border border-green-200">
          <Text className="font-bold text-green-800 mb-2">📋 Hướng Dẫn Sử Dụng:</Text>
          <Box className="space-y-1 text-sm text-green-700">
            <Text>• Dashboard tự động refresh mỗi 30 giây</Text>
            <Text>• Khách hàng scan QR tĩnh để tự động check-in</Text>
            <Text>• Dùng check-in thủ công nếu khách gặp vấn đề</Text>
            <Text>• Tìm kiếm theo tên hoặc số điện thoại</Text>
            <Text>• Xem lịch sử các ngày trước bằng chọn ngày</Text>
          </Box>
        </Box>
      </Box>
    </Page>
  );
}
