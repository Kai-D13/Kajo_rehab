-- Database Trigger Solution for OA Notifications
-- File: supabase/migrations/20250910_auto_notification_trigger.sql

-- Tạo function để tự động gửi notification
CREATE OR REPLACE FUNCTION auto_notify_booking()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  notification_payload jsonb;
BEGIN
  -- Chỉ gửi notification khi booking chuyển sang confirmed
  IF NEW.booking_status = 'confirmed' AND (OLD.booking_status IS NULL OR OLD.booking_status != 'confirmed') THEN
    
    -- Tạo payload cho notification
    notification_payload := jsonb_build_object(
      'booking_id', NEW.id,
      'customer_name', NEW.customer_name,
      'appointment_date', NEW.appointment_date,
      'appointment_time', NEW.appointment_time,
      'booking_code', NEW.booking_code,
      'service_type', NEW.service_type,
      'clinic_location', NEW.clinic_location
    );
    
    -- Log attempt
    INSERT INTO notification_logs (
      booking_id,
      recipient_type,
      recipient_id,
      message_content,
      sent_at,
      success
    ) VALUES (
      NEW.id,
      'auto_trigger',
      'system',
      'Booking confirmed: ' || NEW.booking_code,
      NOW(),
      true
    );
    
    -- TODO: Gọi Edge Function qua pg_net extension (nếu có)
    -- PERFORM net.http_post(...)
    
  END IF;
  
  RETURN NEW;
END $$;

-- Tạo trigger
DROP TRIGGER IF EXISTS booking_auto_notify ON bookings;
CREATE TRIGGER booking_auto_notify
  AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION auto_notify_booking();

-- Tạo trigger cho INSERT (booking mới đã confirmed)
CREATE TRIGGER booking_auto_notify_insert
  AFTER INSERT ON bookings
  FOR EACH ROW 
  WHEN (NEW.booking_status = 'confirmed')
  EXECUTE FUNCTION auto_notify_booking();
