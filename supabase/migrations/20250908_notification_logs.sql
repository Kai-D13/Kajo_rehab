-- Notification logs table for tracking OA notifications
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  channel text,
  recipient text,
  status_code integer,
  response_body jsonb,
  payload_sent jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes for notification logs
CREATE INDEX IF NOT EXISTS ix_notilog_booking ON public.notification_logs(booking_id);
CREATE INDEX IF NOT EXISTS ix_notilog_created ON public.notification_logs(created_at);
