# Kiến trúc Dual Mini App với Zalo Platform

## Tổng quan hệ thống mới

### 🎯 Ý tưởng chính
Thay vì Reception System bên ngoài, chúng ta sẽ tạo **2 Zalo Mini Apps độc lập**:

1. **Kajo User App** (hiện tại) - Dành cho bệnh nhân
2. **Kajo Reception App** (mới) - Dành cho lễ tân

### 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐
│  Kajo User App  │    │Kajo Reception   │
│  (Bệnh nhân)    │    │App (Lễ tân)     │
│                 │    │                 │
│ • Đặt lịch      │    │ • Quét QR       │
│ • Nhận QR code  │    │ • Check-in      │
│ • Theo dõi      │    │ • Xem lịch hẹn  │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────┬───────────────┘
                 │
    ┌─────────────────────────┐
    │   Shared Backend API    │
    │                         │
    │ • Supabase Database     │
    │ • QR Management         │
    │ • Appointment Sync      │
    │ • User Authentication   │
    └─────────────────────────┘
```

## 📱 Mini App 1: Kajo User App (Hiện tại)

### Luồng đặt lịch mới
1. **Đăng nhập** → Zalo OAuth
2. **Chọn dịch vụ** → Theo UI hiện tại  
3. **Đặt lịch** → Auto-confirm (bỏ admin approval)
4. **Tạo QR Code** → Chứa appointment ID + security token
5. **Hiển thị QR** → Dành cho check-in tại phòng khám

### Thay đổi cần thiết
```typescript
// src/services/booking-v2.service.ts (đã có)
export class BookingServiceV2 {
  // Bỏ qua admin approval
  async createBooking(appointmentData: AppointmentData) {
    // 1. Check conflict
    // 2. Auto-confirm
    // 3. Generate QR code
    // 4. Save to Supabase
  }
}
```

## 📱 Mini App 2: Kajo Reception App (Mới)

### Chức năng chính
1. **Đăng nhập nhân viên** → Zalo OAuth + Role check
2. **Quét QR Code** → Camera integration
3. **Xác thực QR** → Decrypt + validate appointment
4. **Check-in bệnh nhân** → Update status to "arrived"
5. **Xem danh sách hẹn** → Theo ngày, trạng thái

### Cấu trúc dự án
```
kajo-reception-miniapp/
├── package.json
├── vite.config.mts
├── src/
│   ├── app.ts
│   ├── router.tsx
│   ├── pages/
│   │   ├── login.tsx          # Đăng nhập nhân viên
│   │   ├── scanner.tsx        # Quét QR code
│   │   ├── appointments.tsx   # Danh sách lịch hẹn
│   │   └── profile.tsx        # Thông tin nhân viên
│   ├── components/
│   │   ├── qr-scanner.tsx     # Camera QR scanner
│   │   ├── appointment-card.tsx
│   │   └── check-in-modal.tsx
│   └── services/
│       ├── auth.service.ts    # Zalo OAuth
│       ├── qr.service.ts      # QR processing
│       └── appointment.service.ts
```

## 🔐 Bảo mật và Authentication

### User App Authentication
```typescript
// Sử dụng Zalo User Profile API
import { getUserInfo } from "zmp-sdk/apis";

const authenticateUser = async () => {
  const userInfo = await getUserInfo();
  // Lưu user info vào Supabase
  return {
    zaloId: userInfo.id,
    name: userInfo.name,
    avatar: userInfo.avatar
  };
};
```

### Reception App Authentication  
```typescript
// Kiểm tra role nhân viên
const authenticateStaff = async () => {
  const userInfo = await getUserInfo();
  
  // Check trong database staff table
  const staff = await supabase
    .from('staff')
    .select('*')
    .eq('zalo_id', userInfo.id)
    .eq('role', 'reception')
    .single();
    
  if (!staff) throw new Error('Unauthorized');
  return staff;
};
```

## 🎯 QR Code System

### QR Payload Structure
```typescript
interface QRPayload {
  appointmentId: string;
  userId: string;
  clinicId: string;
  timestamp: number;
  expiresAt: number;
  signature: string; // HMAC security
}
```

### QR Generation (User App)
```typescript
import QRCode from 'qrcode';

const generateQR = async (appointment: Appointment) => {
  const payload: QRPayload = {
    appointmentId: appointment.id,
    userId: appointment.user_id,
    clinicId: appointment.clinic_id,
    timestamp: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24h
    signature: generateHMAC(appointment)
  };
  
  const encrypted = encrypt(JSON.stringify(payload));
  const qrDataURL = await QRCode.toDataURL(encrypted);
  return qrDataURL;
};
```

### QR Scanning (Reception App)
```typescript
import { Html5QrcodeScanner } from "html5-qrcode";

const scanQR = async (qrCode: string) => {
  try {
    const decrypted = decrypt(qrCode);
    const payload: QRPayload = JSON.parse(decrypted);
    
    // Validate signature + expiry
    if (!validateQR(payload)) {
      throw new Error('Invalid QR code');
    }
    
    // Get appointment details
    const appointment = await getAppointment(payload.appointmentId);
    return appointment;
  } catch (error) {
    throw new Error('QR scan failed');
  }
};
```

## 🗄️ Database Schema (Supabase)

```sql
-- Bảng users (bệnh nhân)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zalo_id VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  phone VARCHAR,
  email VARCHAR,
  avatar VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bảng staff (nhân viên)  
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zalo_id VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL, -- 'reception', 'admin', 'doctor'
  clinic_id UUID,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bảng appointments (lịch hẹn)
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  doctor_id UUID,
  service_id UUID,
  appointment_date DATE,
  appointment_time TIME,
  status VARCHAR DEFAULT 'confirmed', -- 'confirmed', 'arrived', 'completed', 'cancelled'
  qr_code TEXT, -- QR code data
  qr_expires_at TIMESTAMP,
  notes TEXT,
  checked_in_at TIMESTAMP,
  checked_in_by UUID REFERENCES staff(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bảng check_ins (lịch sử check-in)
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id),
  staff_id UUID REFERENCES staff(id),
  checked_in_at TIMESTAMP DEFAULT NOW(),
  qr_data JSONB,
  notes TEXT
);
```

## 🚀 Implementation Plan

### Phase 1: Setup Infrastructure
1. **Tạo Supabase project**
2. **Setup database schema** 
3. **Cài đặt dependencies**
4. **Configure Zalo OAuth**

### Phase 2: User App Migration  
1. **Integrate Supabase** into current app
2. **Implement auto-confirmation** booking
3. **Add QR generation** after booking
4. **Update UI** to show QR codes

### Phase 3: Reception App Development
1. **Setup new Mini App project**
2. **Implement staff authentication**
3. **Build QR scanner** interface  
4. **Create appointment management** UI

### Phase 4: Integration & Testing
1. **Test cross-app workflow**
2. **Security testing** 
3. **Performance optimization**
4. **Deploy both apps**

## 🔧 Zalo Platform Configuration

### User App Settings
```json
{
  "app_id": "2403652688841115720",
  "app_secret": "1Yb5YMVFGwGB7J7mSR9C", 
  "domain": "kajo.vn",
  "scopes": [
    "zmp.user.info",
    "zmp.user.phone" 
  ]
}
```

### Reception App Settings (Cần tạo mới)
```json
{
  "app_id": "TBD", // Sẽ được cấp khi đăng ký
  "app_secret": "TBD",
  "domain": "reception.kajo.vn", // Subdomain
  "scopes": [
    "zmp.user.info"
  ],
  "staff_roles": ["reception", "admin"]
}
```

## 🎉 Lợi ích của kiến trúc mới

### ✅ Ưu điểm
1. **Native Zalo Experience** - Tích hợp hoàn toàn với Zalo
2. **Better Security** - Zalo OAuth + Role-based access
3. **Mobile Optimized** - UI/UX tối ưu cho mobile
4. **Easy Deployment** - Không cần server riêng cho Reception  
5. **Scalable** - Dễ mở rộng thêm role (doctor, admin)

### ⚡ Performance
1. **Faster Load** - Zalo Mini App framework
2. **Offline Support** - Cache với Zalo storage
3. **Push Notifications** - Zalo notification system

### 🔒 Security
1. **Zalo Authentication** - Trusted identity
2. **Role-based Access** - Staff verification
3. **QR Encryption** - Secure appointment data
4. **Audit Trail** - Complete check-in history

## 🤔 Cân nhắc

### Limitations
1. **Dual App Complexity** - 2 apps to maintain
2. **Zalo Dependency** - Platform lock-in  
3. **Staff Training** - New app for reception
4. **Review Process** - 2 apps need Zalo approval

### Migration Strategy  
1. **Parallel Development** - Old system tetap hoạt động
2. **Gradual Rollout** - Test với một số staff trước
3. **Rollback Plan** - Fallback to web system if needed
4. **Training Program** - Hướng dẫn sử dụng cho nhân viên

---

**Kết luận**: Kiến trúc Dual Mini App sẽ tạo ra trải nghiệm nhất quán, bảo mật cao và dễ sử dụng cho cả bệnh nhân và nhân viên, đồng thời tận dụng tối đa sức mạnh của Zalo Platform.
