-- PRODUCTION DATABASE DEPLOYMENT SCRIPT - FIXED VERSION
-- Deploy lên Supabase: vekrhqotmgszgsredkud.supabase.co
-- Project: Kajo-Rehab

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS public.checkin_history CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.staff CASCADE;

-- 1. Bảng bookings cho hệ thống đặt lịch thực tế
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Thông tin khách hàng
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  user_id TEXT, -- Zalo user ID (optional for multi-channel booking)
  
  -- Thông tin đặt lịch  
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  symptoms TEXT,
  detailed_description TEXT,
  
  -- Media attachments (stored in Supabase Storage)
  image_urls TEXT[] DEFAULT '{}', -- Array of image URLs
  video_urls TEXT[] DEFAULT '{}', -- Array of video URLs
  
  -- Timestamps
  booking_timestamp TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Booking status states theo use case
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
  doctor_id TEXT DEFAULT 'default-doctor',
  service_id TEXT DEFAULT 'rehabilitation',
  clinic_location TEXT DEFAULT 'KajoTai Rehab Clinic',
  
  -- Metadata
  created_via TEXT DEFAULT 'zalo_miniapp' CHECK (
    created_via IN ('zalo_miniapp', 'facebook', 'zalo_oa', 'phone', 'walk_in')
  )
);

-- Add unique constraint để prevent double booking (without DEFERRABLE for ON CONFLICT compatibility)
ALTER TABLE public.bookings ADD CONSTRAINT unique_booking_slot 
  UNIQUE(appointment_date, appointment_time);

-- 2. Bảng checkin_history để track chi tiết check-in
CREATE TABLE public.checkin_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  checkin_timestamp TIMESTAMPTZ DEFAULT NOW(),
  checkin_method TEXT DEFAULT 'qr_scan' CHECK (
    checkin_method IN ('qr_scan', 'manual', 'phone_call', 'auto_system')
  ),
  reception_staff_id TEXT,
  notes TEXT
);

-- 3. Bảng staff cho reception webapp
CREATE TABLE public.staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zalo_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'reception' CHECK (
    role IN ('reception', 'doctor', 'admin', 'nurse')
  ),
  phone_number TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Stored Procedure: Auto-cancel expired bookings
CREATE OR REPLACE FUNCTION public.auto_cancel_expired_bookings()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cancelled_count INTEGER;
BEGIN
  -- Update expired bookings
  UPDATE public.bookings 
  SET 
    booking_status = 'auto_cancelled',
    checkin_status = 'no_show',
    updated_at = NOW()
  WHERE 
    appointment_date < CURRENT_DATE
    AND booking_status = 'confirmed' 
    AND checkin_status = 'not_arrived';
    
  GET DIAGNOSTICS cancelled_count = ROW_COUNT;
    
  -- Log the auto-cancellation trong checkin_history
  INSERT INTO public.checkin_history (booking_id, checkin_timestamp, checkin_method, notes)
  SELECT 
    id, 
    NOW(), 
    'auto_system', 
    CONCAT('Auto-cancelled: No show after appointment date. Total cancelled: ', cancelled_count)
  FROM public.bookings 
  WHERE booking_status = 'auto_cancelled' 
    AND updated_at >= NOW() - INTERVAL '1 minute'; -- Chỉ log những booking vừa được cancel
    
  -- Log kết quả
  RAISE NOTICE 'Auto-cancelled % expired bookings', cancelled_count;
END;
$$;

-- 5. Function: Check time conflicts
CREATE OR REPLACE FUNCTION public.check_booking_conflict(
  p_date DATE,
  p_time TIME,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.bookings 
    WHERE appointment_date = p_date 
      AND appointment_time = p_time
      AND booking_status IN ('pending', 'confirmed')
      AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
  );
END;
$$;

-- 6. Indexes để optimize performance
CREATE INDEX idx_bookings_date_time ON public.bookings(appointment_date, appointment_time);
CREATE INDEX idx_bookings_status ON public.bookings(booking_status);
CREATE INDEX idx_bookings_checkin_status ON public.bookings(checkin_status);
CREATE INDEX idx_bookings_phone ON public.bookings(phone_number);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_timestamp ON public.bookings(booking_timestamp DESC);
CREATE INDEX idx_checkin_history_booking ON public.checkin_history(booking_id);
CREATE INDEX idx_staff_zalo_id ON public.staff(zalo_id);

-- 7. Row Level Security (RLS) Policies
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role access to all tables (for app operations)
CREATE POLICY "Service role full access bookings" ON public.bookings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access checkin_history" ON public.checkin_history
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access staff" ON public.staff
  FOR ALL USING (auth.role() = 'service_role');

-- Policy: Anonymous users can create and view bookings (for public booking)
CREATE POLICY "Anonymous can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anonymous can view bookings" ON public.bookings
  FOR SELECT USING (true);

-- Policy: Anonymous can update bookings (for status updates)
CREATE POLICY "Anonymous can update bookings" ON public.bookings
  FOR UPDATE USING (true);

-- 8. Enable Realtime cho reception webapp
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.checkin_history;

-- 9. Storage bucket cho media attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('booking-attachments', 'booking-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Policy cho storage bucket
CREATE POLICY "Public access to booking attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'booking-attachments');

CREATE POLICY "Users can upload booking attachments" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'booking-attachments');

-- 10. Trigger để tự động update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER bookings_updated_at 
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at();

-- 11. Insert sample staff data (Reception)
INSERT INTO public.staff (zalo_id, name, role, phone_number) VALUES
  ('reception-staff-01', 'Lễ Tân 1', 'reception', '0901234567'),
  ('reception-staff-02', 'Lễ Tần 2', 'reception', '0901234568')
ON CONFLICT (zalo_id) DO NOTHING;

-- 12. Insert test booking để verify schema (with proper type casting)
DO $$
BEGIN
  -- Insert test booking only if no existing booking at this time
  IF NOT EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE appointment_date = (CURRENT_DATE + INTERVAL '1 day')::DATE
      AND appointment_time = '09:00:00'::TIME
  ) THEN
    INSERT INTO public.bookings (
      customer_name, 
      phone_number, 
      appointment_date, 
      appointment_time,
      symptoms,
      booking_status
    ) VALUES (
      'Test Patient',
      '0123456789',
      (CURRENT_DATE + INTERVAL '1 day')::DATE,
      '09:00:00'::TIME,
      'Test booking for schema verification',
      'pending'
    );
  END IF;
END $$;

-- Deploy completed - Verify results
SELECT 
  'Database setup completed!' as status,
  COUNT(*) as booking_count 
FROM public.bookings;

SELECT 
  'Staff data loaded!' as staff_status,
  COUNT(*) as staff_count 
FROM public.staff;

-- Test stored procedures
SELECT 'Testing booking conflict function...' as test;
SELECT public.check_booking_conflict((CURRENT_DATE + INTERVAL '1 day')::DATE, '09:00:00'::TIME) as has_conflict;

SELECT 'Schema deployment successful! ✅' as final_status;
