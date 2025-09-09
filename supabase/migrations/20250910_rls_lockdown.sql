-- ===== RLS LOCKDOWN - Loại bỏ Anonymous Access =====
-- Purpose: Secure bookings table, only service_role via Edge Functions
-- Date: 2025-09-10

-- Enable RLS on bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop all existing anonymous policies
DROP POLICY IF EXISTS "Anonymous can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anonymous can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anonymous can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Facilities are publicly readable" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS bookings_policy ON public.bookings;
DROP POLICY IF EXISTS p_bookings_select_own ON public.bookings;
DROP POLICY IF EXISTS p_bookings_insert_own ON public.bookings;
DROP POLICY IF EXISTS p_bookings_update_own ON public.bookings;

-- Revoke all permissions from anon and authenticated
REVOKE ALL ON public.bookings FROM anon, authenticated;

-- Grant access only to service_role (used by Edge Functions)
GRANT ALL ON public.bookings TO service_role;

-- Optional: If using Supabase Auth for end-users, uncomment these policies:
-- CREATE POLICY p_bookings_select_own ON public.bookings
--   FOR SELECT TO authenticated USING (user_id = auth.uid());
-- CREATE POLICY p_bookings_insert_own ON public.bookings
--   FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
-- CREATE POLICY p_bookings_update_own ON public.bookings
--   FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Apply same security to related tables
ALTER TABLE public.booking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Only service_role can access audit tables
REVOKE ALL ON public.booking_events FROM anon, authenticated;
REVOKE ALL ON public.notification_logs FROM anon, authenticated;
GRANT ALL ON public.booking_events TO service_role;
GRANT ALL ON public.notification_logs TO service_role;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🔒 RLS Lockdown completed successfully!';
  RAISE NOTICE '📋 Changes applied:';
  RAISE NOTICE '  - All anonymous policies removed from bookings';
  RAISE NOTICE '  - Only service_role has access';
  RAISE NOTICE '  - Admin operations must use Edge Functions';
  RAISE NOTICE '  - Audit tables secured';
END $$;
