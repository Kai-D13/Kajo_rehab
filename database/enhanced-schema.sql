-- Enhanced Booking System Schema for Real Clinic Use Case
-- Cập nhật: September 2025

-- 1. Bảng bookings với đầy đủ thông tin theo yêu cầu
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Thông tin khách hàng
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  user_id TEXT, -- Zalo user ID (optional nếu book qua other channels)
  
  -- Thông tin đặt lịch  
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  symptoms TEXT,
  detailed_description TEXT,
  
  -- Media attachments
  image_urls TEXT[], -- Array of image URLs
  video_urls TEXT[], -- Array of video URLs
  
  -- Timestamps
  booking_timestamp TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Booking status states
  booking_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    booking_status IN (
      'pending',           -- Chờ xác nhận
      'confirmed',         -- Đặt lịch thành công (hệ thống xác nhận)
      'cancelled_by_user', -- Khách tự hủy
      'auto_cancelled',    -- Hệ thống tự hủy (không đến)
      'completed'          -- Hoàn thành
    )
  ),
  
  -- Check-in status
  checkin_status TEXT DEFAULT 'not_arrived' CHECK (
    checkin_status IN (
      'not_arrived',  -- Chưa đến
      'checked_in',   -- Đã check-in
      'no_show'       -- Không đến (auto update)
    )
  ),
  checkin_timestamp TIMESTAMPTZ,
  
  -- Additional fields
  qr_code_data TEXT, -- QR code content for check-in
  doctor_id TEXT,
  service_id TEXT,
  clinic_location TEXT DEFAULT 'KajoTai Rehab Clinic',
  
  -- Metadata
  created_via TEXT DEFAULT 'zalo_miniapp' CHECK (
    created_via IN ('zalo_miniapp', 'facebook', 'zalo_oa', 'phone', 'walk_in')
  ),
  
  UNIQUE(appointment_date, appointment_time) -- Prevent double booking
);

-- 2. Bảng checkin_history để track chi tiết
CREATE TABLE IF NOT EXISTS checkin_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  checkin_timestamp TIMESTAMPTZ DEFAULT NOW(),
  checkin_method TEXT DEFAULT 'qr_scan' CHECK (
    checkin_method IN ('qr_scan', 'manual', 'phone_call')
  ),
  reception_staff_id TEXT,
  notes TEXT
);

-- 3. Auto-cancel function cho bookings quá hạn
CREATE OR REPLACE FUNCTION auto_cancel_expired_bookings()
RETURNS void AS $$
BEGIN
  UPDATE bookings 
  SET 
    booking_status = 'auto_cancelled',
    checkin_status = 'no_show',
    updated_at = NOW()
  WHERE 
    appointment_date < CURRENT_DATE
    AND booking_status = 'confirmed' 
    AND checkin_status = 'not_arrived';
    
  -- Log the auto-cancellation
  INSERT INTO checkin_history (booking_id, checkin_timestamp, checkin_method, notes)
  SELECT 
    id, 
    NOW(), 
    'auto_system', 
    'Auto-cancelled: No show after appointment date'
  FROM bookings 
  WHERE booking_status = 'auto_cancelled' 
    AND updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger để tự động chạy auto-cancel mỗi ngày
-- (Cần setup với pg_cron extension hoặc external cron job)

-- 5. Indexes để optimize performance
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(phone_number);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);

-- 6. RLS (Row Level Security) policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- User chỉ xem được booking của mình
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

-- User chỉ tạo được booking với user_id của mình  
CREATE POLICY "Users can create own bookings" ON bookings
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- User chỉ update được booking của mình (để cancel)
CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

-- Admin/Reception có full access (cần setup riêng admin role)

-- 7. Realtime subscriptions cho reception webapp
-- Reception sẽ subscribe để nhận realtime updates
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
