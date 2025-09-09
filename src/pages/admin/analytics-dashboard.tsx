import React, { useState, useEffect } from 'react';
import { Page, Header, Box, Text, Button, Spinner } from 'zmp-ui';
import { realClinicBookingService } from '@/services/real-clinic-booking.service';
import { staticCheckInService } from '@/services/static-checkin.service';

/**
 * 📊 Analytics & Reporting Dashboard
 * Tổng hợp báo cáo, thống kê và phân tích dữ liệu
 */

interface AnalyticsData {
  dailyStats: {
    date: string;
    totalBookings: number;
    checkedIn: number;
    pending: number;
    cancellations: number;
  }[];
  serviceStats: {
    serviceName: string;
    count: number;
    revenue: number;
  }[];
  timeSlotStats: {
    timeSlot: string;
    popularity: number;
    averageWaitTime: number;
  }[];
  summary: {
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
    completionRate: number;
  };
}

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    dailyStats: [],
    serviceStats: [],
    timeSlotStats: [],
    summary: {
      totalBookings: 0,
      totalRevenue: 0,
      averageRating: 0,
      completionRate: 0
    }
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading analytics data...');

      // Get all bookings in date range
      const allBookings = await getAllBookingsInRange();
      
      // Process analytics
      const processedData = processAnalytics(allBookings);
      setData(processedData);

    } catch (error) {
      console.error('❌ Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAllBookingsInRange = async () => {
    const bookings: any[] = [];
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayBookings = await realClinicBookingService.getBookingsByDate(dateStr);
      bookings.push(...dayBookings);
    }
    
    return bookings;
  };

  const processAnalytics = (bookings: any[]): AnalyticsData => {
    // Daily stats
    const dailyStats = processDailyStats(bookings);
    
    // Service stats  
    const serviceStats = processServiceStats(bookings);
    
    // Time slot stats
    const timeSlotStats = processTimeSlotStats(bookings);
    
    // Summary
    const summary = {
      totalBookings: bookings.length,
      totalRevenue: serviceStats.reduce((sum, s) => sum + s.revenue, 0),
      averageRating: 4.5, // Mock data
      completionRate: bookings.filter(b => b.checkin_status === 'checked_in').length / bookings.length * 100
    };

    return {
      dailyStats,
      serviceStats,
      timeSlotStats,
      summary
    };
  };

  const processDailyStats = (bookings: any[]) => {
    const stats = new Map();
    
    bookings.forEach(booking => {
      const date = booking.appointment_date;
      if (!stats.has(date)) {
        stats.set(date, {
          date,
          totalBookings: 0,
          checkedIn: 0,
          pending: 0,
          cancellations: 0
        });
      }
      
      const dayStats = stats.get(date);
      dayStats.totalBookings++;
      
      if (booking.checkin_status === 'checked_in') {
        dayStats.checkedIn++;
      } else if (booking.checkin_status === 'not_arrived') {
        dayStats.pending++;
      }
      
      if (booking.booking_status === 'cancelled') {
        dayStats.cancellations++;
      }
    });
    
    return Array.from(stats.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  const processServiceStats = (bookings: any[]) => {
    const stats = new Map();
    const servicePrices = {
      'Vật lý trị liệu': 200000,
      'Thăm khám tổng quát': 150000,
      'Tư vấn chuyên khoa': 250000,
      'Điều trị': 300000
    };
    
    bookings.forEach(booking => {
      const service = booking.service_type || 'Vật lý trị liệu';
      if (!stats.has(service)) {
        stats.set(service, {
          serviceName: service,
          count: 0,
          revenue: 0
        });
      }
      
      const serviceStats = stats.get(service);
      serviceStats.count++;
      serviceStats.revenue += servicePrices[service] || 200000;
    });
    
    return Array.from(stats.values()).sort((a, b) => b.count - a.count);
  };

  const processTimeSlotStats = (bookings: any[]) => {
    const stats = new Map();
    
    bookings.forEach(booking => {
      const timeSlot = booking.appointment_time.substring(0, 5);
      if (!stats.has(timeSlot)) {
        stats.set(timeSlot, {
          timeSlot,
          popularity: 0,
          averageWaitTime: Math.random() * 30 + 5 // Mock wait time
        });
      }
      
      stats.get(timeSlot).popularity++;
    });
    
    return Array.from(stats.values()).sort((a, b) => b.popularity - a.popularity);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const exportReport = () => {
    const csvContent = generateCSVReport();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kajotai-report-${dateRange.startDate}-${dateRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSVReport = () => {
    let csv = 'Date,Total Bookings,Checked In,Pending,Completion Rate\n';
    
    data.dailyStats.forEach(stat => {
      const completionRate = (stat.checkedIn / stat.totalBookings * 100).toFixed(1);
      csv += `${stat.date},${stat.totalBookings},${stat.checkedIn},${stat.pending},${completionRate}%\n`;
    });
    
    return csv;
  };

  return (
    <Page>
      <Header title="📊 Analytics & Reporting" />
      
      <Box className="p-4 space-y-6">
        
        {/* Date Range Selector */}
        <Box className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <Text className="font-bold text-blue-800 mb-3">📅 Chọn Khoảng Thời Gian</Text>
          <Box className="grid grid-cols-2 gap-3">
            <Box>
              <Text className="text-sm mb-1">Từ ngày:</Text>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </Box>
            <Box>
              <Text className="text-sm mb-1">Đến ngày:</Text>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </Box>
          </Box>
        </Box>

        {loading ? (
          <Box className="text-center py-8">
            <Spinner />
            <Text className="mt-2">Đang tải dữ liệu phân tích...</Text>
          </Box>
        ) : (
          <>
            {/* Summary Cards */}
            <Box className="grid grid-cols-2 gap-3">
              <Box className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                <Text className="text-2xl font-bold text-green-600">{data.summary.totalBookings}</Text>
                <Text className="text-sm text-green-700">Tổng Lịch Hẹn</Text>
              </Box>
              <Box className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                <Text className="text-2xl font-bold text-blue-600">{formatCurrency(data.summary.totalRevenue)}</Text>
                <Text className="text-sm text-blue-700">Tổng Doanh Thu</Text>
              </Box>
              <Box className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                <Text className="text-2xl font-bold text-yellow-600">{data.summary.averageRating.toFixed(1)}⭐</Text>
                <Text className="text-sm text-yellow-700">Đánh Giá TB</Text>
              </Box>
              <Box className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                <Text className="text-2xl font-bold text-purple-600">{data.summary.completionRate.toFixed(1)}%</Text>
                <Text className="text-sm text-purple-700">Tỷ Lệ Hoàn Thành</Text>
              </Box>
            </Box>

            {/* Daily Stats Chart */}
            <Box className="bg-white p-4 rounded-lg border border-gray-200">
              <Text className="font-bold mb-3">📈 Thống Kê Theo Ngày</Text>
              <Box className="space-y-2">
                {data.dailyStats.map((stat, index) => (
                  <Box key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <Text className="text-sm">{formatDate(stat.date)}</Text>
                    <Box className="flex gap-4 text-xs">
                      <span className="text-blue-600">📋 {stat.totalBookings}</span>
                      <span className="text-green-600">✅ {stat.checkedIn}</span>
                      <span className="text-orange-600">⏳ {stat.pending}</span>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Service Stats */}
            <Box className="bg-white p-4 rounded-lg border border-gray-200">
              <Text className="font-bold mb-3">🏥 Thống Kê Dịch Vụ</Text>
              <Box className="space-y-2">
                {data.serviceStats.map((stat, index) => (
                  <Box key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <Text className="text-sm">{stat.serviceName}</Text>
                    <Box className="text-right text-xs">
                      <Text className="text-blue-600">{stat.count} lịch hẹn</Text>
                      <Text className="text-green-600">{formatCurrency(stat.revenue)}</Text>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Time Slot Analysis */}
            <Box className="bg-white p-4 rounded-lg border border-gray-200">
              <Text className="font-bold mb-3">⏰ Phân Tích Khung Giờ</Text>
              <Box className="space-y-2">
                {data.timeSlotStats.map((stat, index) => (
                  <Box key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <Text className="text-sm">{stat.timeSlot}</Text>
                    <Box className="text-right text-xs">
                      <Text className="text-blue-600">📊 {stat.popularity} lượt book</Text>
                      <Text className="text-gray-600">⏱️ {stat.averageWaitTime.toFixed(0)}min chờ</Text>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Export Options */}
            <Box className="bg-gray-50 p-4 rounded-lg">
              <Text className="font-bold text-gray-800 mb-3">📤 Xuất Báo Cáo</Text>
              <Box className="grid grid-cols-2 gap-3">
                <Button
                  onClick={exportReport}
                  className="bg-green-600 text-white"
                >
                  📊 Xuất CSV
                </Button>
                <Button
                  onClick={loadAnalyticsData}
                  className="bg-blue-600 text-white"
                >
                  🔄 Làm Mới
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Page>
  );
}
