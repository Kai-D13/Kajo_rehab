-- Test Script for Kajo System v2.0
-- Run this AFTER applying the migration to test all features

-- 1. Test booking code generation
INSERT INTO bookings (
    customer_name, 
    phone_number, 
    appointment_date, 
    appointment_time,
    service_type,
    booking_status
) VALUES (
    'Test User - Booking Code', 
    '0123456789', 
    '2025-09-08', 
    '10:00:00',
    'Vật lý trị liệu',
    'confirmed'
);

-- 2. Check if booking code was generated
SELECT 
    booking_code,
    customer_name,
    appointment_date,
    booking_status
FROM bookings 
WHERE customer_name = 'Test User - Booking Code';

-- 3. Test the mark_no_shows function
SELECT mark_no_shows() as no_shows_marked;

-- 4. Check notification logs
SELECT 
    notification_type,
    status,
    message_content,
    sent_at
FROM notification_logs 
ORDER BY sent_at DESC 
LIMIT 5;

-- 5. Test all booking statuses are valid
SELECT DISTINCT booking_status FROM bookings;

-- 6. Check indexes were created
SELECT 
    indexname,
    tablename
FROM pg_indexes 
WHERE tablename IN ('bookings', 'notification_logs')
ORDER BY tablename, indexname;

-- 7. Verify table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('booking_code', 'checkout_timestamp')
ORDER BY column_name;

-- 8. Test booking code uniqueness
SELECT 
    booking_code,
    COUNT(*) as count
FROM bookings 
WHERE booking_code IS NOT NULL
GROUP BY booking_code
HAVING COUNT(*) > 1;

-- Clean up test data (optional)
-- DELETE FROM bookings WHERE customer_name = 'Test User - Booking Code';
