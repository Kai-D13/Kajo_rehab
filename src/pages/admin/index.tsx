import { Box } from "zmp-ui";
import { Text } from "zmp-ui";
import { List } from "zmp-ui";
import { Button } from "zmp-ui";
import { useState, useEffect } from "react";
import { MockDatabaseService } from "@/services/mock-database.service";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ArrowRightIcon from "@/components/icons/arrow-right";
import Page from "@/components/page";
import Section from "@/components/section";
import Header from "@/components/header";

interface AdminStats {
  todayAppointments: number;
  pendingAppointments: number;
  totalPatientsToday: number;
  totalRevenue: number;
}

interface AppointmentSummary {
  id: string;
  patient_name?: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  symptoms: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({
    todayAppointments: 0,
    pendingAppointments: 0,
    totalPatientsToday: 0,
    totalRevenue: 0
  });
  const [todayAppointments, setTodayAppointments] = useState<AppointmentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Loading admin data...');
      
      // Get today's appointments (using mock service for now)
      const today = new Date().toISOString().split('T')[0];
      const appointments = MockDatabaseService.getAppointmentsByDateRange(today, today);
      
      console.log('📅 Today:', today);
      console.log('📊 Found appointments:', appointments.length);
      
      // Calculate stats
      const todayCount = appointments.length;
      const pendingCount = appointments.filter(apt => apt.status === 'pending').length;
      const confirmedCount = appointments.filter(apt => apt.status === 'confirmed').length;
      const completedCount = appointments.filter(apt => apt.status === 'completed').length;
      const estimatedRevenue = (confirmedCount + completedCount) * 200000; // 200k per appointment

      console.log('📈 Stats:', { todayCount, pendingCount, confirmedCount, completedCount, estimatedRevenue });

      setStats({
        todayAppointments: todayCount,
        pendingAppointments: pendingCount,
        totalPatientsToday: completedCount,
        totalRevenue: estimatedRevenue
      });

      // Convert to admin format
      const adminAppointments: AppointmentSummary[] = appointments.map((apt, index) => ({
        id: apt.id,
        patient_name: `Bệnh nhân #${apt.patient_id?.slice(-3) || (index + 1)}`,
        doctor_id: apt.doctor_id || '1',
        appointment_date: apt.appointment_date,
        appointment_time: apt.appointment_time,
        status: apt.status as any,
        symptoms: Array.isArray(apt.symptoms) ? apt.symptoms.join(', ') : apt.symptoms || "Không có triệu chứng"
      }));

      console.log('👥 Admin appointments:', adminAppointments);
      setTodayAppointments(adminAppointments);
    } catch (error) {
      console.error("❌ Failed to load admin data:", error);
      toast.error("Không thể tải dữ liệu admin!");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      console.log('✅ Confirming appointment:', appointmentId);
      
      // Update status in mock service
      const appointments = MockDatabaseService.getAppointmentsByDateRange("", "");
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (appointment) {
        console.log('📝 Found appointment to confirm:', appointment);
        appointment.status = 'confirmed';
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('kajo-appointments', JSON.stringify(appointments));
          console.log('💾 Updated appointment saved to localStorage');
        }
        
        toast.success(`Đã xác nhận lịch khám lúc ${appointment.appointment_time}!`);
        loadAdminData(); // Refresh data
      } else {
        console.error('❌ Appointment not found:', appointmentId);
        toast.error("Không tìm thấy lịch khám!");
      }
    } catch (error) {
      console.error("❌ Failed to confirm appointment:", error);
      toast.error("Không thể xác nhận lịch khám!");
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      console.log('❌ Cancelling appointment:', appointmentId);
      
      // Update status in mock service  
      const appointments = MockDatabaseService.getAppointmentsByDateRange("", "");
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (appointment) {
        console.log('📝 Found appointment to cancel:', appointment);
        appointment.status = 'cancelled';
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('kajo-appointments', JSON.stringify(appointments));
          console.log('💾 Cancelled appointment saved to localStorage');
        }
        
        toast.success(`Đã hủy lịch khám lúc ${appointment.appointment_time}!`);
        loadAdminData(); // Refresh data
      } else {
        console.error('❌ Appointment not found:', appointmentId);
        toast.error("Không tìm thấy lịch khám!");
      }
    } catch (error) {
      console.error("❌ Failed to cancel appointment:", error);
      toast.error("Không thể hủy lịch khám!");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#10b981';
      case 'completed': return '#059669';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4">
        <div className="flex items-center mb-6">
          <Button
            size="small"
            variant="secondary"
            onClick={() => navigate(-1)}
            className="mr-3"
          >
            ←
          </Button>
          <Text.Title>Admin Dashboard (Demo)</Text.Title>
        </div>
        
        {/* Statistics Cards */}
        <Section title="Thống kê hôm nay">
          <Box className="grid grid-cols-2 gap-4 p-4">
            <Box className="bg-blue-50 p-4 rounded-lg">
              <Text size="small" className="text-blue-600">Lịch khám hôm nay</Text>
              <Text.Title size="large" className="text-blue-800">{stats.todayAppointments}</Text.Title>
            </Box>
            <Box className="bg-yellow-50 p-4 rounded-lg">
              <Text size="small" className="text-yellow-600">Chờ xác nhận</Text>
              <Text.Title size="large" className="text-yellow-800">{stats.pendingAppointments}</Text.Title>
            </Box>
            <Box className="bg-green-50 p-4 rounded-lg">
              <Text size="small" className="text-green-600">Bệnh nhân hôm nay</Text>
              <Text.Title size="large" className="text-green-800">{stats.totalPatientsToday}</Text.Title>
            </Box>
            <Box className="bg-purple-50 p-4 rounded-lg">
              <Text size="small" className="text-purple-600">Doanh thu</Text>
              <Text.Title size="small" className="text-purple-800">{formatCurrency(stats.totalRevenue)}</Text.Title>
            </Box>
          </Box>
        </Section>

        {/* Quick Actions */}
        <Section title="Thao tác nhanh">
          <Box className="flex gap-2 p-4">
            <Button 
              size="small" 
              onClick={loadAdminData}
            >
              Làm mới
            </Button>
            <Button 
              size="small" 
              variant="secondary"
              onClick={() => toast.success("Tính năng đang phát triển!")}
            >
              Xem lịch
            </Button>
          </Box>
        </Section>

        {/* Today's Appointments */}
        <Section title="Lịch khám hôm nay (Chờ duyệt)">
          {loading ? (
            <Box className="p-4 text-center">
              <Text>Đang tải...</Text>
            </Box>
          ) : todayAppointments.length === 0 ? (
            <Box className="p-4 text-center">
              <Text className="text-gray-500">Không có lịch khám nào hôm nay</Text>
            </Box>
          ) : (
            <List>
              {todayAppointments.map((appointment) => (
                <List.Item
                  key={appointment.id}
                  title={appointment.patient_name || "Bệnh nhân ẩn danh"}
                  subTitle={`${appointment.appointment_time} - Bác sĩ #${appointment.doctor_id} | Triệu chứng: ${appointment.symptoms} | Trạng thái: ${getStatusText(appointment.status)}`}
                  suffix={
                    appointment.status === 'pending' ? (
                      <Box className="flex gap-1">
                        <Button
                          size="small"
                          onClick={() => handleConfirmAppointment(appointment.id)}
                        >
                          Xác nhận
                        </Button>
                        <Button
                          size="small"
                          variant="tertiary"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          Hủy
                        </Button>
                      </Box>
                    ) : null
                  }
                />
              ))}
            </List>
          )}
        </Section>
      </div>
    </div>
  );
}
