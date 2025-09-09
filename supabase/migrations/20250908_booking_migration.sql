-- ===== KAJO REHAB BOOKING SYSTEM MIGRATION =====
-- Purpose: Add booking codes, checkout functionality, and auto no-show handling
-- Date: 2025-09-08
-- Version: 1.0

-- Enable pg_cron for scheduling (Supabase: Database > Extensions)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ===== Add new columns =====
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS booking_no BIGSERIAL,
  ADD COLUMN IF NOT EXISTS booking_code TEXT GENERATED ALWAYS AS (
    'KR-' || to_char(appointment_date, 'YYYYMMDD') || '-' || lpad(booking_no::text, '5', '0')
  ) STORED,
  ADD COLUMN IF NOT EXISTS checkout_timestamp TIMESTAMPTZ;

-- ===== Update booking_status constraint =====
-- Drop existing constraint if exists
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS ck_booking_status_valid;

-- Add new comprehensive status constraint
ALTER TABLE public.bookings
  ADD CONSTRAINT ck_booking_status_valid
  CHECK (booking_status IN (
    'pending','confirmed','checked_in','checked_out','completed','canceled','no_show'
  ));

-- ===== Checkout validation =====
-- Check-out must be after check-in (if exists)
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS ck_checkout_after_checkin;
ALTER TABLE public.bookings
  ADD CONSTRAINT ck_checkout_after_checkin
  CHECK (
    checkout_timestamp IS NULL
    OR (checkin_timestamp IS NOT NULL AND checkout_timestamp > checkin_timestamp)
  );

-- ===== Performance indexes =====
CREATE UNIQUE INDEX IF NOT EXISTS uk_bookings_code ON public.bookings(booking_code);
CREATE INDEX IF NOT EXISTS ix_bookings_phone ON public.bookings(phone_number);
CREATE INDEX IF NOT EXISTS ix_bookings_date ON public.bookings(appointment_date);
CREATE INDEX IF NOT EXISTS ix_bookings_status ON public.bookings(booking_status);
CREATE INDEX IF NOT EXISTS ix_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS ix_bookings_created_at ON public.bookings(created_at);

-- ===== Auto NO_SHOW function =====
-- Mark bookings as no-show after appointment date passes (Asia/Ho_Chi_Minh timezone)
CREATE OR REPLACE FUNCTION public.auto_mark_no_show_vn() RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  today_vn date := (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
  affected_count integer;
BEGIN
  UPDATE public.bookings
  SET booking_status = 'no_show',
      updated_at = now()
  WHERE booking_status IN ('pending','confirmed')
    AND checkin_timestamp IS NULL
    AND appointment_date < today_vn;
    
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  
  -- Log the operation
  RAISE NOTICE 'Auto no-show function executed. Affected bookings: %', affected_count;
END $$;

-- ===== Schedule daily cron job =====
-- Schedule daily at 00:05 VN time (≈ 17:05 UTC previous day)
-- Note: Adjust timezone offset based on daylight saving time if needed
SELECT cron.schedule(
  'auto-no-show-vn',
  '5 17 * * *',
  $$SELECT public.auto_mark_no_show_vn();$$
);

-- ===== Update existing data =====
-- Set default booking_status for any NULL values
UPDATE public.bookings 
SET booking_status = 'confirmed' 
WHERE booking_status IS NULL;

-- ===== Notification logs table =====
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('booking_created', 'reminder_24h', 'reminder_1h', 'no_show_followup')),
  recipient_user_id TEXT NOT NULL,
  message_content TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'delivered')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for notification logs
CREATE INDEX IF NOT EXISTS ix_notification_logs_booking ON public.notification_logs(booking_id);
CREATE INDEX IF NOT EXISTS ix_notification_logs_user ON public.notification_logs(recipient_user_id);
CREATE INDEX IF NOT EXISTS ix_notification_logs_type ON public.notification_logs(notification_type);
CREATE INDEX IF NOT EXISTS ix_notification_logs_sent_at ON public.notification_logs(sent_at);

-- ===== RLS Policies =====
-- Enable RLS on notification_logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notification_logs
  FOR SELECT USING (recipient_user_id = auth.uid()::text);

-- Service role can insert/update notifications  
CREATE POLICY "Service role can manage notifications" ON public.notification_logs
  FOR ALL USING (auth.role() = 'service_role');

-- ===== Grant permissions =====
-- Grant necessary permissions for the cron function
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;

-- ===== Migration complete =====
-- Add migration record
CREATE TABLE IF NOT EXISTS public.migration_history (
  id SERIAL PRIMARY KEY,
  migration_name TEXT NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

INSERT INTO public.migration_history (migration_name, notes) 
VALUES ('20250908_booking_migration', 'Added booking codes, checkout functionality, auto no-show, and notification logs');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Kajo Rehab booking system migration completed successfully!';
  RAISE NOTICE '📋 Features added:';
  RAISE NOTICE '  - Booking codes (KR-YYYYMMDD-#####)';
  RAISE NOTICE '  - Check-out functionality';
  RAISE NOTICE '  - Auto no-show detection (daily 00:05 VN time)';
  RAISE NOTICE '  - Notification logging system';
  RAISE NOTICE '  - Performance indexes';
  RAISE NOTICE '🎯 Next steps: Deploy Edge Functions for check-in/out';
END $$;
