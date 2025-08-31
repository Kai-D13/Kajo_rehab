# 🏥 **RECEPTION MINI APP - IMPLEMENTATION PLAN**

## 📋 **REVIEW LỊCH SỬ YÊU CẦU**

### **🎯 MỤC TIÊU CHÍNH THEO PLAN BAN ĐẦU:**

#### **Original User Request:**
> "Luồng đặt lịch: khách hàng đăng nhập → đặt lịch → gửi mã QR → lễ tân quét QR để check in"
> "tôi muốn bỏ qua phần confirm booking của admin dashboard"

#### **✅ ĐÃ HOÀN THÀNH (Phase 1):**
- ✅ **User Mini App**: Auto-confirmation booking với QR generation
- ✅ **QR System**: Encryption, security signatures, 24h expiration
- ✅ **Data Flow**: User booking → QR code → Ready for reception scan

#### **🔄 CẦN TRIỂN KHAI (Phase 2):**
- **Reception Mini App**: QR scanner cho lễ tân check-in patients

## 🏥 **RECEPTION MINI APP ARCHITECTURE**

### **📱 Reception App Overview:**
```
┌─────────────────────────────────────┐
│        🏥 KAJO RECEPTION APP        │
├─────────────────────────────────────┤
│                                     │
│  👤 Staff Login (Zalo OAuth)        │
│  📷 QR Code Scanner                 │
│  📋 Patient Check-in Interface      │
│  📊 Today's Appointments Dashboard  │
│  🔔 Doctor Notifications           │
│  📝 Queue Management               │
│                                     │
└─────────────────────────────────────┘
```

### **🔄 User Journey - Reception Staff:**
```
1. Staff opens Reception Mini App
2. Login với Zalo account (staff role)
3. Dashboard hiển thị appointments hôm nay
4. Patient đến → Staff scan QR code
5. System validate QR → Show patient info
6. Staff confirm check-in → Notify doctor
7. Update patient status → Queue management
```

## 🛠️ **TECHNICAL IMPLEMENTATION**

### **📁 Project Structure:**
```
📁 kajo-reception-app/
├── 📄 app-config.json           # Zalo Reception App config
├── 📄 package.json
├── 📁 src/
│   ├── 📄 app.ts
│   ├── 📄 router.tsx
│   ├── 📁 pages/
│   │   ├── 📄 login/
│   │   ├── 📄 dashboard/        # Today's appointments
│   │   ├── 📄 scanner/          # QR code scanner
│   │   ├── 📄 checkin/          # Patient check-in
│   │   ├── 📄 queue/            # Queue management
│   │   └── 📄 notifications/    # Doctor alerts
│   ├── 📁 services/
│   │   ├── 📄 qr-scanner.service.ts
│   │   ├── 📄 checkin.service.ts
│   │   ├── 📄 notification.service.ts
│   │   └── 📄 queue.service.ts
│   └── 📁 components/
│       ├── 📄 qr-scanner.tsx
│       ├── 📄 patient-card.tsx
│       └── 📄 appointment-list.tsx
```

### **🔐 QR Scanner Integration:**
```typescript
// QR Scanner Service
export class QRScannerService {
  static async scanQRCode(): Promise<PatientCheckInData> {
    // 1. Open camera for QR scanning
    const qrResult = await Html5Qrcode.scanQR();
    
    // 2. Decrypt QR data using same encryption as User App
    const appointmentData = QRService.decryptQRData(qrResult);
    
    // 3. Validate QR signature and expiration
    const isValid = await this.validateQR(appointmentData);
    
    if (!isValid) {
      throw new Error('QR Code không hợp lệ hoặc đã hết hạn');
    }
    
    // 4. Fetch full appointment details from database
    const appointment = await this.getAppointmentDetails(appointmentData.appointmentId);
    
    return {
      appointmentId: appointment.id,
      patientName: appointment.patient_name,
      doctorName: appointment.doctor_name,
      appointmentTime: appointment.appointment_time,
      symptoms: appointment.symptoms,
      notes: appointment.notes,
      status: appointment.status
    };
  }
  
  static async validateQR(data: any): boolean {
    // Validate signature, expiration, appointment status
    return QRService.validateQRCode(data);
  }
}
```

### **📋 Check-in Interface:**
```typescript
// Patient Check-in Component
export const PatientCheckIn: React.FC = () => {
  const [scannedData, setScannedData] = useState<PatientCheckInData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleQRScan = async () => {
    try {
      const patientData = await QRScannerService.scanQRCode();
      setScannedData(patientData);
    } catch (error) {
      toast.error('Lỗi quét QR: ' + error.message);
    }
  };
  
  const handleCheckIn = async () => {
    if (!scannedData) return;
    
    setIsProcessing(true);
    try {
      // 1. Update appointment status to "checked-in"
      await CheckInService.confirmCheckIn(scannedData.appointmentId);
      
      // 2. Add to today's queue
      await QueueService.addToQueue(scannedData);
      
      // 3. Notify doctor
      await NotificationService.notifyDoctor(scannedData.doctorName, scannedData);
      
      toast.success(`${scannedData.patientName} đã check-in thành công`);
      setScannedData(null);
      
    } catch (error) {
      toast.error('Lỗi check-in: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="p-4">
      <h2>📷 Quét QR Check-in</h2>
      
      {!scannedData ? (
        <button onClick={handleQRScan} className="scan-button">
          📱 Quét QR Code
        </button>
      ) : (
        <div className="patient-info-card">
          <h3>👤 Thông tin bệnh nhân</h3>
          <p><strong>Họ tên:</strong> {scannedData.patientName}</p>
          <p><strong>Bác sĩ:</strong> {scannedData.doctorName}</p>
          <p><strong>Giờ hẹn:</strong> {scannedData.appointmentTime}</p>
          <p><strong>Triệu chứng:</strong> {scannedData.symptoms}</p>
          <p><strong>Ghi chú:</strong> {scannedData.notes}</p>
          
          <div className="actions">
            <button 
              onClick={handleCheckIn}
              disabled={isProcessing}
              className="checkin-button"
            >
              {isProcessing ? 'Đang xử lý...' : '✅ Xác nhận Check-in'}
            </button>
            <button onClick={() => setScannedData(null)}>❌ Hủy</button>
          </div>
        </div>
      )}
    </div>
  );
};
```

### **📊 Dashboard Today's Appointments:**
```typescript
// Reception Dashboard
export const ReceptionDashboard: React.FC = () => {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats>({});
  
  useEffect(() => {
    loadTodayData();
  }, []);
  
  const loadTodayData = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's appointments
    const appointments = await MockDatabaseService.getAppointmentsByDate(today);
    setTodayAppointments(appointments);
    
    // Calculate queue stats
    const stats = {
      total: appointments.length,
      checkedIn: appointments.filter(a => a.status === 'checked-in').length,
      waiting: appointments.filter(a => a.status === 'confirmed').length,
      completed: appointments.filter(a => a.status === 'completed').length
    };
    setQueueStats(stats);
  };
  
  return (
    <div className="dashboard">
      <h1>🏥 Lễ Tân Dashboard - {new Date().toLocaleDateString('vi-VN')}</h1>
      
      {/* Queue Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>📅 Tổng lịch hẹn hôm nay</h3>
          <div className="stat-number">{queueStats.total}</div>
        </div>
        <div className="stat-card">
          <h3>✅ Đã check-in</h3>
          <div className="stat-number">{queueStats.checkedIn}</div>
        </div>
        <div className="stat-card">
          <h3>⏳ Đang chờ</h3>
          <div className="stat-number">{queueStats.waiting}</div>
        </div>
        <div className="stat-card">
          <h3>🏁 Hoàn thành</h3>
          <div className="stat-number">{queueStats.completed}</div>
        </div>
      </div>
      
      {/* Today's Appointments List */}
      <div className="appointments-list">
        <h2>📋 Danh sách lịch hẹn hôm nay</h2>
        {todayAppointments.map(appointment => (
          <AppointmentCard 
            key={appointment.id}
            appointment={appointment}
            onStatusUpdate={loadTodayData}
          />
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={() => navigate('/scanner')}>
          📷 Quét QR Check-in
        </button>
        <button onClick={() => navigate('/queue')}>
          📊 Quản lý hàng chờ
        </button>
      </div>
    </div>
  );
};
```

## 🚀 **IMPLEMENTATION ROADMAP**

### **Phase 2A: Reception App Foundation (Week 1-2)**
```bash
Day 1-3: Project Setup
- Create new Zalo Mini App project for Reception
- Set up basic structure và dependencies
- Configure Zalo OAuth for staff login
- Set up shared services (QRService, API calls)

Day 4-7: Core Components
- QR Scanner component (HTML5-QRCode integration)
- Patient check-in interface
- Basic dashboard layout
- Appointment list component

Day 8-14: Integration & Testing
- Connect to same Supabase database
- Test QR scanning với User App QR codes
- Implement check-in flow
- Staff authentication và role management
```

### **Phase 2B: Advanced Features (Week 3-4)**
```bash
Week 3: Queue Management
- Queue status tracking
- Doctor notification system
- Real-time updates
- Appointment status management

Week 4: Polish & Deploy
- UI/UX improvements
- Error handling
- Performance optimization
- Zalo Mini App submission (Reception version)
```

## 📱 **DEPLOYMENT STRATEGY**

### **🔄 Two Mini Apps Approach:**
```
📱 User App (Patients):          📱 Reception App (Staff):
- Booking appointments          - Scanning QR codes
- Viewing schedules            - Managing check-ins
- QR code display             - Queue management
- Symptom input               - Doctor notifications

        ↓ Shared Database ↓
    🗄️  Supabase PostgreSQL
    - Appointments table
    - Doctors table  
    - Patients table
    - Queue status
```

### **🔐 Staff Access Control:**
```typescript
// Staff Role Management
const STAFF_ROLES = {
  RECEPTIONIST: 'receptionist',
  DOCTOR: 'doctor', 
  MANAGER: 'manager'
};

// Role-based access
const checkStaffPermission = (userRole: string, action: string) => {
  const permissions = {
    [STAFF_ROLES.RECEPTIONIST]: ['scan_qr', 'checkin_patient', 'view_queue'],
    [STAFF_ROLES.DOCTOR]: ['view_patients', 'update_status', 'add_notes'],
    [STAFF_ROLES.MANAGER]: ['*'] // All permissions
  };
  
  return permissions[userRole]?.includes(action) || permissions[userRole]?.includes('*');
};
```

## 🎯 **NEXT STEPS**

### **✅ Immediate Actions (This Week):**
1. **Create Reception App Project Structure**
2. **Set up QR Scanner Dependencies** 
3. **Design Reception UI/UX**
4. **Plan Staff Training Materials**

### **✅ Technical Requirements:**
```json
{
  "dependencies": {
    "html5-qrcode": "^2.3.8",      // QR scanner
    "react-webcam": "^7.1.1",      // Camera access
    "zalo-mini-app": "latest",     // Zalo framework
    "@supabase/supabase-js": "^2.56.1" // Same database
  }
}
```

### **✅ Success Criteria:**
- ✅ Staff có thể login và access Reception app
- ✅ QR scanner hoạt động với User App QR codes  
- ✅ Check-in flow smooth và fast (<30 seconds)
- ✅ Real-time queue updates
- ✅ Doctor notification system working

---

## 🎉 **CONCLUSION**

**🎯 RECEPTION APP PLAN IS READY FOR IMPLEMENTATION**

- **Foundation**: Built on same tech stack as User App
- **Integration**: Seamless QR code compatibility
- **Staff Experience**: Intuitive interface for reception staff
- **Timeline**: 3-4 weeks for complete implementation
- **Result**: Complete end-to-end patient journey from booking to check-in

**🚀 READY TO START PHASE 2: RECEPTION MINI APP DEVELOPMENT!**
