-- Kajo System v2.0 Database Enhancement
-- Apply this SQL in Supabase SQL Editor

-- 1. Add booking_code column with unique constraint
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_code VARCHAR(20) UNIQUE;

-- 2. Add checkout_timestamp column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checkout_timestamp TIMESTAMPTZ;

-- 3. Update booking_status enum to include new statuses
-- Note: In Supabase, this might need to be done via dashboard if enum exists
-- ALTER TYPE booking_status_enum ADD VALUE IF NOT EXISTS 'checked_out';
-- ALTER TYPE booking_status_enum ADD VALUE IF NOT EXISTS 'no_show';

-- 4. Create notification_logs table
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    notification_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
    recipient VARCHAR(255),
    message_content TEXT,
    external_id VARCHAR(255),
    error_details TEXT,
    sent_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create function to generate booking codes
CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS TRIGGER AS $$
DECLARE
    date_part TEXT;
    sequence_num INTEGER;
    new_code TEXT;
BEGIN
    -- Get date part in YYYYMMDD format
    date_part := to_char(COALESCE(NEW.appointment_date, CURRENT_DATE), 'YYYYMMDD');
    
    -- Get next sequence number for this date
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(booking_code FROM 'KR-\d{8}-(\d{5})') AS INTEGER)
    ), 0) + 1
    INTO sequence_num
    FROM bookings 
    WHERE booking_code LIKE 'KR-' || date_part || '-%';
    
    -- Generate new booking code
    new_code := 'KR-' || date_part || '-' || LPAD(sequence_num::TEXT, 5, '0');
    
    -- Assign to NEW record
    NEW.booking_code := new_code;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for automatic booking code generation
DROP TRIGGER IF EXISTS trigger_generate_booking_code ON bookings;
CREATE TRIGGER trigger_generate_booking_code
    BEFORE INSERT ON bookings
    FOR EACH ROW
    WHEN (NEW.booking_code IS NULL)
    EXECUTE FUNCTION generate_booking_code();

-- 7. Create function to mark no-shows
CREATE OR REPLACE FUNCTION mark_no_shows()
RETURNS INTEGER AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    -- Mark confirmed bookings as no_show if appointment date has passed
    WITH updated_bookings AS (
        UPDATE bookings 
        SET 
            booking_status = 'no_show',
            updated_at = now()
        WHERE 
            booking_status = 'confirmed'
            AND appointment_date < CURRENT_DATE
            AND appointment_date >= CURRENT_DATE - INTERVAL '7 days' -- Only last 7 days
        RETURNING id, customer_name, appointment_date
    )
    SELECT COUNT(*) INTO affected_count FROM updated_bookings;
    
    -- Log the operation
    INSERT INTO notification_logs (
        notification_type,
        status,
        message_content,
        sent_at
    ) VALUES (
        'auto_no_show',
        'sent',
        'Marked ' || affected_count || ' bookings as no_show for ' || CURRENT_DATE,
        now()
    );
    
    RETURN affected_count;
END;
$$ LANGUAGE plpgsql;

-- 8. Performance indexes
CREATE INDEX IF NOT EXISTS idx_bookings_appointment_date ON bookings(appointment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_code ON bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(phone_number);
CREATE INDEX IF NOT EXISTS idx_bookings_checkin_status ON bookings(checkin_status);

-- 9. Notification logs indexes
CREATE INDEX IF NOT EXISTS idx_notification_logs_booking_id ON notification_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at);

-- 10. Update existing bookings without booking_code (if any)
UPDATE bookings 
SET booking_code = 'KR-' || to_char(COALESCE(appointment_date, CURRENT_DATE), 'YYYYMMDD') || '-' || 
    LPAD((ROW_NUMBER() OVER (PARTITION BY appointment_date ORDER BY created_at))::TEXT, 5, '0')
WHERE booking_code IS NULL;

-- 11. Add constraints for data integrity (with proper error handling)
DO $$
BEGIN
    -- Check if constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_valid_status' 
        AND table_name = 'bookings'
    ) THEN
        ALTER TABLE bookings 
        ADD CONSTRAINT check_valid_status 
        CHECK (booking_status IN ('confirmed', 'checked_in', 'checked_out', 'no_show', 'cancelled'));
        
        RAISE NOTICE 'Added check_valid_status constraint to bookings table';
    ELSE
        RAISE NOTICE 'Constraint check_valid_status already exists, skipping';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Constraint check_valid_status already exists, skipping';
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not add constraint check_valid_status: %', SQLERRM;
END $$;

-- 12. Enable pg_cron extension if not already enabled (for auto no-show scheduling)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 13. Schedule auto no-show detection (runs daily at midnight Vietnam time)
-- Note: This requires superuser privileges, may need to be done manually in production
DO $$
BEGIN
    -- Try to schedule the cron job
    PERFORM cron.schedule(
        'kajo-auto-no-show',           -- job name
        '0 0 * * *',                   -- cron expression: daily at midnight
        'SELECT mark_no_shows();'      -- SQL command
    );
    RAISE NOTICE 'Scheduled auto no-show detection cron job';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not schedule cron job (may require superuser): %', SQLERRM;
        RAISE NOTICE 'You can manually run: SELECT cron.schedule(''kajo-auto-no-show'', ''0 0 * * *'', ''SELECT mark_no_shows();'');';
END $$;

-- Success message
SELECT 'Kajo System v2.0 database migration completed successfully!' as message;
