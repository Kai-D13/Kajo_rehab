# REAL CLINIC BOOKING SYSTEM - RESOURCES NEEDED

## 🗄️ SUPABASE SETUP

### 1. Database Setup
```bash
# 1. Tạo Supabase project
# 2. Run enhanced-schema.sql
# 3. Setup RLS policies
# 4. Enable Realtime for 'bookings' table
```

### 2. Environment Variables
```env
# .env.local
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
REACT_APP_SUPABASE_SERVICE_KEY=your-service-key # For server functions
```

## 📱 ZALO MINI APP SETUP

### 1. App Configuration
```json
// app-config.json - Cập nhật permissions
{
  "app": {
    "title": "KajoTai - Phòng khám vật lý trị liệu",
    "permissions": [
      "scope.userInfo",
      "scope.userPhonenumber" // Cần cho booking by phone
    ]
  }
}
```

### 2. QR Code Static 
- Tạo QR code tĩnh link đến: `https://zalo.me/s/{mini-app-id}?page=checkin`
- In và dán tại quầy lễ tân

## 🔧 TECHNICAL REQUIREMENTS

### 1. Auto-Cancel Cron Job
```typescript
// Setup serverless function hoặc Supabase Edge Function
// Chạy mỗi ngày để auto-cancel expired bookings
export async function autoCancelExpiredBookings() {
  const { error } = await supabase.rpc('auto_cancel_expired_bookings');
  if (error) console.error('Auto-cancel failed:', error);
}
```

### 2. Media Upload (Images/Videos)
```typescript
// Supabase Storage setup cho upload ảnh/video
const uploadMedia = async (file: File, bookingId: string) => {
  const { data, error } = await supabase.storage
    .from('booking-media')
    .upload(`${bookingId}/${file.name}`, file);
  
  return data?.path;
};
```

### 3. Notification System
```typescript
// Zalo OA Integration cho notifications
// Server API để gửi thông báo
const sendBookingNotification = async (booking: BookingRecord) => {
  await fetch('/api/send-oa-notification', {
    method: 'POST',
    body: JSON.stringify({
      userId: booking.user_id,
      phone: booking.phone_number,
      template: 'booking_confirmed',
      data: booking
    })
  });
};
```

## 📊 RECEPTION WEBAPP SETUP

### 1. Separate Mini App for Staff
- Tạo riêng 1 Zalo Mini App cho reception staff
- Authentication với staff role
- Subscribe to real-time booking updates

### 2. Staff Management
```sql
-- Bảng quản lý nhân viên
CREATE TABLE staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zalo_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('reception', 'doctor', 'admin')),
  phone TEXT,
  is_active BOOLEAN DEFAULT true
);
```

## 🔐 SECURITY & PERMISSIONS

### 1. Zalo Mini App Permissions
- `scope.userInfo`: Lấy thông tin user
- `scope.userPhonenumber`: Lấy số điện thoại
- Camera permission: Cho QR scanning

### 2. API Security
```typescript
// Row Level Security policies
CREATE POLICY "Users see own bookings" ON bookings
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub' OR phone_number = auth.jwt() ->> 'phone');
```

## 📋 DEPLOYMENT CHECKLIST

### 1. Mini App Review
- [ ] Submit main app for Zalo review
- [ ] Submit reception app for Zalo review  
- [ ] Request necessary permissions
- [ ] Test on Zalo testing environment

### 2. Production Setup
- [ ] Setup Supabase production database
- [ ] Deploy auto-cancel cron job
- [ ] Setup media storage
- [ ] Configure OA notifications
- [ ] Print QR codes for clinic

## 💰 COST ESTIMATION

### 1. Supabase (Backend)
- Free tier: Up to 50,000 API calls/month
- Pro tier: $25/month for production

### 2. Zalo Mini App
- Free to develop and deploy
- OA messaging: ~200đ per message

### 3. Development Time
- Backend setup: 2-3 days
- Frontend integration: 3-4 days
- Testing & deployment: 2-3 days
- Total: ~1-2 weeks

## 🚀 NEXT STEPS PRIORITY

1. **Week 1**: Setup Supabase + Enhanced booking service
2. **Week 2**: Implement real-time updates + Reception components  
3. **Week 3**: QR static check-in + Testing
4. **Week 4**: Zalo review submission + Production deployment
