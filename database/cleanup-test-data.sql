-- Clean up test bookings to prevent conflicts
-- Run this if you keep getting duplicate slot errors

-- Delete test bookings from end-to-end testing
DELETE FROM checkin_history 
WHERE notes LIKE '%E2E test%' OR notes LIKE '%integration test%';

DELETE FROM bookings 
WHERE customer_name LIKE 'Nguyễn Văn Test%' 
   OR customer_name LIKE '%Test Patient%'
   OR detailed_description LIKE '%Testing%'
   OR detailed_description LIKE '%integration test%';

-- Reset auto-increment if needed
-- ALTER SEQUENCE bookings_id_seq RESTART WITH 1;

-- Verify cleanup
SELECT COUNT(*) as remaining_bookings FROM bookings;
SELECT COUNT(*) as remaining_history FROM checkin_history;
