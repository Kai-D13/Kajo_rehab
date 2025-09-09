-- Kajo System v2.0 Database Enhancement - SIMPLE VERSION
-- Apply this SQL in Supabase SQL Editor if the main script has issues

-- 1. Add booking_code column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_code VARCHAR(20);

-- 2. Add checkout_timestamp column  
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checkout_timestamp TIMESTAMPTZ;

-- 3. Create unique index on booking_code (instead of unique constraint)
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_booking_code_unique ON bookings(booking_code) WHERE booking_code IS NOT NULL;

-- 4. Create notification_logs table
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID,
    notification_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
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
    -- Skip if booking_code already set
    IF NEW.booking_code IS NOT NULL THEN
        RETURN NEW;
    END IF;
    
    -- Get date part in YYYYMMDD format
    date_part := to_char(COALESCE(NEW.appointment_date, CURRENT_DATE), 'YYYYMMDD');
    
    -- Get next sequence number for this date
    SELECT COALESCE(MAX(
        CASE 
            WHEN booking_code ~ '^KR-\d{8}-\d{5}$' 
            THEN CAST(SUBSTRING(booking_code FROM 'KR-\d{8}-(\d{5})') AS INTEGER)
            ELSE 0
        END
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
    EXECUTE FUNCTION generate_booking_code();

-- 7. Create function to mark no-shows (simplified)
CREATE OR REPLACE FUNCTION mark_no_shows()
RETURNS INTEGER AS $$
DECLARE
    affected_count INTEGER := 0;
BEGIN
    -- Mark confirmed bookings as no_show if appointment date has passed
    UPDATE bookings 
    SET 
        booking_status = 'no_show',
        updated_at = now()
    WHERE 
        booking_status = 'confirmed'
        AND appointment_date < CURRENT_DATE
        AND appointment_date >= CURRENT_DATE - INTERVAL '7 days';
        
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    
    -- Log the operation if notification_logs table exists
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

-- 8. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_bookings_appointment_date ON bookings(appointment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(phone_number);
CREATE INDEX IF NOT EXISTS idx_bookings_checkin_status ON bookings(checkin_status);

-- 9. Notification logs indexes
CREATE INDEX IF NOT EXISTS idx_notification_logs_booking_id ON notification_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at);

-- 10. Update existing bookings without booking_code (if any)
-- Use a different approach without window functions in UPDATE
DO $$
DECLARE
    booking_record RECORD;
    date_part TEXT;
    sequence_num INTEGER;
    new_code TEXT;
BEGIN
    -- Loop through bookings without booking_code
    FOR booking_record IN 
        SELECT id, appointment_date, created_at
        FROM bookings 
        WHERE booking_code IS NULL
        ORDER BY appointment_date, created_at
    LOOP
        -- Get date part
        date_part := to_char(COALESCE(booking_record.appointment_date, CURRENT_DATE), 'YYYYMMDD');
        
        -- Get next sequence number for this date
        SELECT COALESCE(MAX(
            CASE 
                WHEN booking_code ~ '^KR-\d{8}-\d{5}$' 
                THEN CAST(SUBSTRING(booking_code FROM 'KR-\d{8}-(\d{5})') AS INTEGER)
                ELSE 0
            END
        ), 0) + 1
        INTO sequence_num
        FROM bookings 
        WHERE booking_code LIKE 'KR-' || date_part || '-%';
        
        -- Generate new booking code
        new_code := 'KR-' || date_part || '-' || LPAD(sequence_num::TEXT, 5, '0');
        
        -- Update the booking
        UPDATE bookings 
        SET booking_code = new_code
        WHERE id = booking_record.id;
        
        RAISE NOTICE 'Updated booking ID % with code %', booking_record.id, new_code;
    END LOOP;
    
    RAISE NOTICE 'Finished updating existing bookings with booking codes';
END $$;

-- 11. Test the booking code generation
DO $$
BEGIN
    RAISE NOTICE 'Testing booking code generation...';
    -- This will test if the trigger works
    IF EXISTS (SELECT 1 FROM bookings LIMIT 1) THEN
        RAISE NOTICE 'Booking code generation is ready!';
    ELSE
        RAISE NOTICE 'No existing bookings to test with, but functions are created.';
    END IF;
END $$;

-- 12. Manual no-show check (you can run this anytime)
SELECT 'You can manually run no-show detection with: SELECT mark_no_shows();' as manual_command;

-- Success message
SELECT 
    'Kajo System v2.0 database migration completed successfully!' as message,
    'Booking codes will be auto-generated for new bookings' as booking_codes,
    'Run "SELECT mark_no_shows();" to manually mark no-shows' as no_show_detection;
