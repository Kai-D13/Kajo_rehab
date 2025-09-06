# 🏥 Phân Tích Luồng Xử Lý Phòng Khám

## 📊 **Use Case Analysis**

### **Customer Journey Map:**
```
Facebook/Zalo Chat → Mini App Link → Booking Form → Confirmation → 
Visit Clinic → QR Scan → Check-in → Treatment
```

## ⚠️ **Critical Issues Found**

### 1. **Booking Status Flow - NEEDS REDESIGN**
**Current:** `pending` → `confirmed` → `checked_in`
**Required:** `pending` → `confirmed` → `checked_in` / `cancelled` / `no_show`

### 2. **Missing Auto Status Updates**
- ❌ No automatic status change after appointment time
- ❌ No "no_show" detection system
- ❌ No automatic cancellation after 24h

### 3. **Database Schema Gaps**
**Current Tables:** Basic booking table
**Missing:**
- Patient management table
- Staff/Reception table  
- Clinic configuration table
- Media storage (images/videos)
- Audit logs

## 🔧 **Recommended Architecture Improvements**

### **1. Enhanced Database Schema**
```sql
-- Enhanced bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  staff_id UUID REFERENCES staff(id) NULL,
  
  -- Booking Details
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  symptoms TEXT[],
  detailed_description TEXT,
  
  -- Media Attachments
  image_urls TEXT[],
  video_urls TEXT[],
  
  -- Status Management
  booking_status VARCHAR(20) DEFAULT 'pending',
  checkin_status VARCHAR(20) DEFAULT 'waiting',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP NULL,
  checkin_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  
  -- Auto-cancellation
  expires_at TIMESTAMP GENERATED ALWAYS AS (created_at + INTERVAL '24 hours') STORED
);

-- Patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zalo_id VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  email VARCHAR NULL,
  avatar_url TEXT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Staff/Reception table
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL CHECK (role IN ('reception', 'doctor', 'admin')),
  clinic_id UUID NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **2. Status Management System**
```typescript
export type BookingStatus = 
  | 'pending'      // Chờ xác nhận
  | 'confirmed'    // Đã xác nhận
  | 'cancelled'    // Khách tự hủy
  | 'no_show'      // Không đến khám
  | 'expired';     // Hệ thống tự hủy

export type CheckinStatus = 
  | 'waiting'      // Chờ check-in
  | 'checked_in'   // Đã check-in
  | 'completed'    // Hoàn thành khám
  | 'missed';      // Bỏ lỡ
```

### **3. Auto Status Update Service**
```typescript
class BookingStatusService {
  // Chạy mỗi giờ để check expired bookings
  static async updateExpiredBookings() {
    const expiredBookings = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_status', 'confirmed')
      .lt('appointment_date', new Date().toISOString())
      .eq('checkin_status', 'waiting');
      
    for (const booking of expiredBookings) {
      await this.markAsNoShow(booking.id);
    }
  }
}
```

## 🎯 **Required Resources**

### **Technical Resources:**
1. **Supabase Pro Account** - For production database with advanced features
2. **Zalo OA Business Account** - For official notifications
3. **Image/Video Storage** - Cloudinary or Supabase Storage
4. **Push Notification Service** - For real-time updates

### **Development Resources:**
1. **Reception Web App** - Separate admin dashboard
2. **QR Scanner Component** - For clinic check-in
3. **Media Upload System** - Image/video attachments
4. **Notification System** - SMS/Zalo OA integration

### **Documentation Needed:**
1. **Zalo Mini App Official Docs** ✅ (Already following)
2. **Supabase Database Design Guide**
3. **QR Code Implementation Best Practices**
4. **Healthcare Data Privacy Guidelines**

## 🚀 **Implementation Priority**

### **Phase 1: Core Booking (Current - 70% Complete)**
- [x] Basic booking form
- [x] User authentication
- [x] QR code generation
- [ ] Proper status management
- [ ] Database schema completion

### **Phase 2: Status Management (Next 4 weeks)**
- [ ] Auto status updates
- [ ] Cancellation system
- [ ] No-show detection
- [ ] Booking expiration

### **Phase 3: Reception System (Following 2 weeks)**
- [ ] Reception web app
- [ ] QR scanner for check-in
- [ ] Patient management
- [ ] Real-time status sync

### **Phase 4: Advanced Features (Final 2 weeks)**
- [ ] Media uploads
- [ ] SMS/OA notifications
- [ ] Analytics dashboard
- [ ] Backup systems

## ✅ **Workflow Optimization Recommendations**

### **1. Simplify Customer Flow**
```
Current: 6 steps → Optimized: 4 steps
Facebook/Zalo → Mini App → Form → Confirmation → Visit → Check-in
```

### **2. Add Safety Nets**
- Auto-confirmation after 10 minutes if no conflicts
- SMS backup for important updates
- Offline mode for reception desk

### **3. Performance Optimizations**
- Cache frequent queries
- Optimize QR code generation
- Add loading states and error boundaries

## 📈 **Success Metrics**
- Booking completion rate > 85%
- Check-in accuracy > 95%
- No-show rate < 10%
- System uptime > 99.5%
