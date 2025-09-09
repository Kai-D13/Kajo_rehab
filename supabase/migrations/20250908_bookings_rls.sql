-- Enable Row Level Security on bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Revoke default permissions
REVOKE ALL ON public.bookings FROM anon, authenticated;

-- Policy for users to see only their own bookings (if using Supabase Auth)
CREATE POLICY p_bookings_select_own ON public.bookings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY p_bookings_insert_own ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY p_bookings_update_own ON public.bookings
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Note: Admin/reception operations via Edge Functions (SERVICE_ROLE) bypass RLS
