# 🕐 CLINIC WORKING HOURS CONFIGURATION

## ⏰ **Giờ làm việc Phòng khám Kajo**

### **📅 Lịch làm việc chi tiết:**

```json
{
  "clinic_hours": {
    "weekdays": {
      "days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
      "start_time": "16:00",
      "end_time": "19:00",
      "break_time": null,
      "total_hours": 3
    },
    "weekends": {
      "days": ["saturday", "sunday"],
      "start_time": "09:00", 
      "end_time": "17:00",
      "break_time": {
        "start": "12:00",
        "end": "13:00"
      },
      "total_hours": 7
    }
  },
  
  "appointment_settings": {
    "duration_minutes": 30,
    "buffer_minutes": 5,
    "advance_booking_days": 30,
    "cancellation_hours": 24,
    "auto_confirm_minutes": 10
  },
  
  "time_slots": {
    "weekdays": [
      "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
    ],
    "weekends": [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
    ]
  }
}
```

## 🏥 **Business Rules Implementation**

### **⏰ Slot Generation Logic:**
```typescript
export const generateTimeSlots = (date: Date): string[] => {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    // Weekdays: Monday-Friday 16:00-19:00
    return ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30'];
  } else {
    // Weekends: Saturday-Sunday 09:00-17:00 (skip lunch 12:00-13:00)
    return [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', 
      '16:00', '16:30'
    ];
  }
};
```

### **📋 Booking Validation Rules:**
```typescript
export const validateBookingTime = (appointmentDate: string, appointmentTime: string): boolean => {
  const bookingDate = new Date(appointmentDate);
  const today = new Date();
  
  // Rule 1: Cannot book in the past
  if (bookingDate < today) return false;
  
  // Rule 2: Cannot book more than 30 days in advance
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30);
  if (bookingDate > maxDate) return false;
  
  // Rule 3: Check if time slot is within working hours
  const validSlots = generateTimeSlots(bookingDate);
  return validSlots.includes(appointmentTime);
};
```

## 🔄 **Auto-Cancellation Cron Job**

### **Supabase Edge Function:**
```sql
-- Function to auto-cancel expired bookings
CREATE OR REPLACE FUNCTION auto_cancel_expired_bookings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Cancel bookings that are more than 1 hour past appointment time
  UPDATE bookings 
  SET booking_status = 'system_cancelled',
      updated_at = NOW()
  WHERE booking_status IN ('pending', 'confirmed')
    AND (appointment_date + appointment_time::time) < (NOW() - INTERVAL '1 hour');
    
  -- Log the operation
  INSERT INTO system_logs (operation, details, created_at)
  VALUES ('auto_cancel_expired', 
          'Auto-cancelled expired bookings', 
          NOW());
END;
$$;
```

### **Cron Schedule Setup:**
```sql
-- Run every hour to check for expired bookings
SELECT cron.schedule(
  'auto-cancel-expired-bookings',
  '0 * * * *', -- Every hour at minute 0
  'SELECT auto_cancel_expired_bookings();'
);
```

## 📱 **Message Templates (Draft)**

### **🔔 Booking Confirmation:**
```
🏥 PHÒNG KHÁM KAJO - XÁC NHẬN LỊCH HẸN

Xin chào {customer_name}!

✅ Lịch khám của bạn đã được xác nhận:
📅 Ngày: {appointment_date}
⏰ Giờ: {appointment_time}
👨‍⚕️ Bác sĩ: {doctor_name}
📍 Địa chỉ: [ĐỊA CHỈ PHÒNG KHÁM]

🔲 Vui lòng đến trước giờ hẹn 15 phút và mang theo:
- CMND/CCCD
- Thẻ BHYT (nếu có)
- Kết quả xét nghiệm cũ (nếu có)

❌ Hủy lịch: Liên hệ [SỐ HOTLINE] trước 24h
📞 Hotline: [SỐ ĐIỆN THOẠI]

Cảm ơn bạn đã tin tưởng Phòng khám Kajo! 🙏
```

### **⏰ Appointment Reminder:**
```
🔔 NHẮC LỊCH KHÁM - PHÒNG KHÁM KAJO

Xin chào {customer_name}!

⏰ Nhắc nhở: Bạn có lịch khám vào {appointment_time} hôm nay ({appointment_date})

📍 Vui lòng đến đúng giờ tại: [ĐỊA CHỈ]
📞 Liên hệ khẩn cấp: [HOTLINE]

Chúc bạn một ngày tốt lành! 🌟
```

### **❌ Cancellation Notification:**
```
📋 THÔNG BÁO HỦY LỊCH - PHÒNG KHÁM KAJO

Xin chào {customer_name},

❌ Lịch khám ngày {appointment_date} lúc {appointment_time} đã được hủy thành công.

🔄 Đặt lịch mới: Truy cập Mini App hoặc gọi [HOTLINE]
📞 Hotline: [SỐ ĐIỆN THOẠI]

Cảm ơn bạn đã thông báo! 🙏
```

## 📊 **Database Schema Mapping**

Based on the Supabase screenshots, tôi thấy structure hiện tại:

### **Bookings Table Schema:**
```sql
-- Mapping từ UI screenshots
bookings (
  id UUID PRIMARY KEY,
  customer_name TEXT,
  phone_number TEXT, 
  user_id TEXT,
  appointment_date DATE,
  appointment_time TIME,
  symptoms TEXT,
  detailed_description TEXT,
  image_urls JSONB,
  video_urls JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  booking_status TEXT, -- pending, confirmed, completed, cancelled
  checkin_status TEXT, -- not_checked, checked_in, completed
  checkin_timestamp TIMESTAMP
)
```

### **Staff Table Schema:**
```sql
staff (
  staff_id UUID PRIMARY KEY,
  name TEXT,
  role TEXT, -- reception, admin, doctor
  phone_number TEXT,
  email TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP
)
```

## 🎯 **Next Steps - Integration Priority**

### **IMMEDIATE (Today):**
1. ✅ Update BookingServiceV2 to use real Supabase data
2. ✅ Test booking creation with existing data  
3. ✅ Implement working hours validation
4. ✅ Setup cron job for auto-cancellation

### **THIS WEEK:**
1. 📋 Create Reception Web App với QR scanner
2. 📋 Setup real-time sync for booking updates
3. 📋 Implement Zalo OA messaging
4. 📋 End-to-end testing với production data

Ready to proceed! 🚀
