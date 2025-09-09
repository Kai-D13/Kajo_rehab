import { Button } from "@/components/button";
import { DashedDivider } from "@/components/dashed-divider";
import PolarizedList from "@/components/polarized-list";
import { realClinicBookingService } from "@/services/real-clinic-booking.service";
import { AuthService } from "@/services/auth.service";
import { useEffect, useState } from "react";
import { Page, Header, Box } from "zmp-ui";
import toast from 'react-hot-toast';

interface InvoiceData {
  id: string;
  customer_name: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  booking_status: string;
  created_at: string;
  clinic_location: string;
  service_fee: number;
}

function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const user = AuthService.getCurrentUser();

  useEffect(() => {
    loadUserInvoices();
  }, []);

  const loadUserInvoices = async () => {
    try {
      setLoading(true);
      console.log('📋 Loading user invoices...');
      
      // Get all user bookings to generate invoices
      const bookings = await realClinicBookingService.getUserBookings();
      
      // Convert bookings to invoice format
      const invoiceData: InvoiceData[] = bookings
        .filter(booking => booking.booking_status === 'confirmed')
        .map(booking => ({
          id: booking.id,
          customer_name: booking.customer_name,
          appointment_date: booking.appointment_date,
          appointment_time: booking.appointment_time,
          service_type: booking.service_type || 'Vật lý trị liệu',
          booking_status: booking.booking_status,
          created_at: booking.created_at || booking.booking_timestamp,
          clinic_location: booking.clinic_location || 'KajoTai Rehab Clinic',
          service_fee: calculateServiceFee(booking.service_type)
        }));

      setInvoices(invoiceData);
      console.log('✅ Loaded invoices:', invoiceData.length);
      
    } catch (error) {
      console.error('❌ Error loading invoices:', error);
      toast.error('Không thể tải hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  // Calculate service fee based on service type
  const calculateServiceFee = (serviceType?: string): number => {
    const feeTable: Record<string, number> = {
      'Vật lý trị liệu': 200000,
      'Thăm khám tổng quát': 150000,
      'Tư vấn chuyên khoa': 250000,
      'Điều trị': 300000
    };
    
    return feeTable[serviceType || 'Vật lý trị liệu'] || 200000;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (timeStr: string): string => {
    return timeStr.substring(0, 5);
  };

  if (!user) {
    return (
      <Page>
        <Header showBackIcon title="Hóa đơn" />
        <Box className="py-5 px-4">
          <div className="text-center">Loading user data...</div>
        </Box>
      </Page>
    );
  }

  if (loading) {
    return (
      <Page>
        <Header showBackIcon title="Hóa đơn" />
        <Box className="py-5 px-4">
          <div className="text-center">Loading invoices...</div>
        </Box>
      </Page>
    );
  }

  if (invoices.length === 0) {
    return (
      <Page>
        <Header showBackIcon title="Hóa đơn" />
        <Box className="py-5 px-4">
          <div className="text-center space-y-4">
            <div className="text-gray-500">Chưa có hóa đơn nào</div>
            <Button onClick={() => window.location.href = '/booking'}>
              Đặt lịch khám
            </Button>
          </div>
        </Box>
      </Page>
    );
  }

  return (
    <Page>
      <Header showBackIcon title="Hóa đơn" />
      <Box className="py-5 px-4 space-y-4">
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold">Hóa đơn của tôi ({invoices.length})</h2>
        </div>
        
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="w-full space-y-6 rounded-2xl bg-white px-4 py-6 shadow-sm border border-gray-100"
          >
          <div className="flex justify-between items-center">
            <div className="text-xl font-medium text-blue-800">
              {invoice.service_type}
            </div>
            <div className="text-sm text-gray-500">
              #{invoice.id.substring(0, 8)}
            </div>
          </div>
          
          <DashedDivider />
          
          <PolarizedList
            items={[
              ["Tên bệnh nhân", invoice.customer_name],
              ["Phòng khám", invoice.clinic_location],
              ["Dịch vụ", invoice.service_type],
              ["Thời gian khám", `${formatDate(invoice.appointment_date)} ${formatTime(invoice.appointment_time)}`],
              ["Trạng thái", invoice.booking_status === 'confirmed' ? 'Đã xác nhận' : 'Đang xử lý'],
              ["Phí dịch vụ", formatCurrency(invoice.service_fee)],
              ["Ngày tạo hóa đơn", formatDate(invoice.created_at)]
            ]}
          />
          
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-lg font-bold text-green-600">
              Tổng cộng: {formatCurrency(invoice.service_fee)}
            </div>
            <div className="space-x-2">
              <Button 
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => toast.success('Tính năng thanh toán đang phát triển')}
              >
                Thanh toán
              </Button>
            </div>
          </div>
        </div>
      ))}
      
        <div className="text-center pt-4">
          <Button 
            onClick={loadUserInvoices}
            className="bg-gray-600 text-white"
          >
            🔄 Làm mới
          </Button>
        </div>
      </Box>
    </Page>
  );
}

export default InvoicesPage;
