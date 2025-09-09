-- Script to update existing bookings with booking codes
-- Run this AFTER the main migration script

-- First, let's see how many bookings need codes
SELECT 
    COUNT(*) as total_bookings,
    COUNT(booking_code) as bookings_with_codes,
    COUNT(*) - COUNT(booking_code) as bookings_need_codes
FROM bookings;

-- Update existing bookings without booking codes (safe method)
-- This uses a simple counter approach
WITH numbered_bookings AS (
  SELECT 
    id,
    appointment_date,
    to_char(COALESCE(appointment_date, CURRENT_DATE), 'YYYYMMDD') as date_part
  FROM bookings 
  WHERE booking_code IS NULL
  ORDER BY appointment_date, created_at
)
UPDATE bookings
SET booking_code = 'KR-' || nb.date_part || '-' || LPAD(
  (
    SELECT COUNT(*) + 1 
    FROM bookings b2 
    WHERE b2.booking_code LIKE 'KR-' || nb.date_part || '-%'
  )::TEXT, 5, '0'
)
FROM numbered_bookings nb
WHERE bookings.id = nb.id;

-- Verify the update
SELECT 
    booking_code,
    customer_name,
    appointment_date,
    booking_status
FROM bookings 
WHERE booking_code IS NOT NULL
ORDER BY booking_code
LIMIT 10;

-- Check for any duplicates
SELECT 
    booking_code,
    COUNT(*) as count
FROM bookings 
WHERE booking_code IS NOT NULL
GROUP BY booking_code
HAVING COUNT(*) > 1;

SELECT 'Existing bookings updated with booking codes successfully!' as result;
