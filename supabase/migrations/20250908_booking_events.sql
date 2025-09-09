-- Booking events table for audit trail
CREATE TABLE IF NOT EXISTS public.booking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  old_status text,
  new_status text,
  actor text, -- staff_id or 'system_auto'
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Function to log booking status changes
CREATE OR REPLACE FUNCTION public.trg_log_booking_status()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.booking_status IS DISTINCT FROM OLD.booking_status THEN
    INSERT INTO public.booking_events(booking_id, old_status, new_status, actor, meta)
    VALUES (NEW.id, OLD.booking_status, NEW.booking_status, COALESCE(NEW.confirmed_by, 'system_auto'),
            jsonb_build_object('checkin_ts', NEW.checkin_timestamp, 'checkout_ts', NEW.checkout_timestamp));
  END IF;
  RETURN NEW;
END $$;

-- Create trigger for booking status logging
DROP TRIGGER IF EXISTS booking_status_logger ON public.bookings;
CREATE TRIGGER booking_status_logger
AFTER UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.trg_log_booking_status();
