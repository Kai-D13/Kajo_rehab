# 🧪 Comprehensive Testing Guide for System Enhancements

## Overview
This guide covers testing all the new features implemented in the Kajo system enhancement:
- Booking codes (KR-YYYYMMDD-#####)
- Checkout functionality with duration tracking
- Auto no-show detection
- Edge Functions for checkin/checkout
- OA notification system
- Enhanced admin reception with real-time updates

## Prerequisites
- Database migration applied (20250908_booking_migration.sql)
- Edge Functions deployed (checkin, checkout, send-oa-notification)
- Environment variables set (ADMIN_API_KEY, ZALO_ACCESS_TOKEN)
- Enhanced reception system deployed

## 1. Database Schema Testing

### Test Booking Code Generation
```sql
-- Insert a test booking to verify booking code generation
INSERT INTO bookings (
    customer_name, 
    phone_number, 
    appointment_date, 
    appointment_time, 
    service_type,
    booking_status
) VALUES (
    'Test User', 
    '0987654321', 
    '2025-01-08', 
    '09:00:00', 
    'Khám tổng quát',
    'confirmed'
);

-- Verify booking code was generated
SELECT booking_code, customer_name, created_at 
FROM bookings 
WHERE customer_name = 'Test User';
-- Expected: KR-20250108-00001 (or next sequence)
```

### Test Auto No-Show Function
```sql
-- Create a test booking for yesterday that should be marked as no-show
INSERT INTO bookings (
    customer_name, 
    phone_number, 
    appointment_date, 
    appointment_time, 
    service_type,
    booking_status
) VALUES (
    'No Show Test', 
    '0987654320', 
    CURRENT_DATE - INTERVAL '1 day', 
    '10:00:00', 
    'Test Service',
    'confirmed'
);

-- Manually trigger the auto no-show function
SELECT mark_past_bookings_as_no_show();

-- Verify the booking was marked as no_show
SELECT booking_code, booking_status, updated_at 
FROM bookings 
WHERE customer_name = 'No Show Test';
-- Expected: booking_status = 'no_show'
```

### Test Status Constraints
```sql
-- Test invalid status transition (should fail)
UPDATE bookings 
SET booking_status = 'checked_out' 
WHERE booking_status = 'confirmed';
-- Expected: Error due to FSM constraint

-- Test valid status transition
UPDATE bookings 
SET booking_status = 'checked_in' 
WHERE booking_status = 'confirmed' 
LIMIT 1;
-- Expected: Success
```

## 2. Edge Functions Testing

### Test Checkin Function
```bash
# Test with valid booking
curl -X POST "https://vekrhqotmgszgsredkud.supabase.co/functions/v1/checkin" \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: YOUR_ADMIN_API_KEY" \
  -d '{
    "booking_id": "ACTUAL_BOOKING_ID",
    "staff_id": "staff_001"
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Check-in completed successfully",
#   "data": {
#     "booking_id": "...",
#     "booking_code": "KR-20250108-00001",
#     "customer_name": "...",
#     "checkin_timestamp": "...",
#     "booking_status": "checked_in"
#   }
# }
```

### Test Checkout Function
```bash
# Test with checked-in booking
curl -X POST "https://vekrhqotmgszgsredkud.supabase.co/functions/v1/checkout" \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: YOUR_ADMIN_API_KEY" \
  -d '{
    "booking_id": "CHECKED_IN_BOOKING_ID",
    "staff_id": "staff_001",
    "notes": "Patient completed consultation successfully"
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Check-out completed successfully",
#   "data": {
#     "booking_id": "...",
#     "booking_code": "KR-20250108-00001",
#     "duration": "45m",
#     "checkout_timestamp": "..."
#   }
# }
```

### Test OA Notification Function
```bash
# Test booking confirmation notification
curl -X POST "https://vekrhqotmgszgsredkud.supabase.co/functions/v1/send-oa-notification" \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: YOUR_ADMIN_API_KEY" \
  -d '{
    "booking_id": "ACTUAL_BOOKING_ID",
    "type": "confirmation"
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "OA notification sent successfully",
#   "data": {
#     "booking_code": "KR-20250108-00001",
#     "recipient": "zalo_user_id",
#     "notification_type": "confirmation"
#   }
# }
```

## 3. Admin Reception System Testing

### Test Real-time Updates
1. Open the enhanced reception system: `reception-system.html`
2. Create a new booking in another tab/system
3. Verify the new booking appears automatically without refresh
4. Test the live connection indicator (green dot)

### Test Booking Code Search
1. In the reception system, enter a booking code in the search field
2. Click search or press Enter
3. Verify the correct booking is found and displayed
4. Test with partial codes and invalid codes

### Test Check-in Flow
1. Find a booking with status "Đã xác nhận" (confirmed)
2. Click the "Check-in" button
3. Verify the modal shows correct booking details including booking code
4. Confirm the check-in
5. Verify:
   - Status changes to "Đang khám" (checked_in)
   - Check-in timestamp is recorded
   - Success notification appears

### Test Check-out Flow
1. Find a booking with status "Đang khám" (checked_in)
2. Click the "Check-out" button
3. Verify the modal shows:
   - Booking details with booking code
   - Check-in timestamp
   - Current duration
4. Add optional notes
5. Confirm the check-out
6. Verify:
   - Status changes to "Hoàn thành" (checked_out)
   - Checkout timestamp is recorded
   - Duration is calculated and displayed
   - Notes are added to detailed_description

### Test Auto-refresh
1. Click the "Auto 30s" button
2. Verify it changes to "Dừng auto" with red color
3. Wait 30 seconds and verify data refreshes automatically
4. Click "Dừng auto" to stop auto-refresh

### Test Filtering
1. Click each stat card (Hôm nay, Chờ khám, Đang khám, Hoàn thành, Không đến)
2. Verify the list filters correctly for each status
3. Check that the active filter is highlighted

## 4. Mini App Testing

### Test Navigation Enhancement
1. Open the mini app in Zalo
2. Navigate to any sub-page
3. Verify the home button appears in the header
4. Click the home button and verify it returns to the home page
5. Use the back button and verify it works correctly

### Test Booking Flow with Codes
1. Create a new booking through the mini app
2. Complete the booking process
3. Verify a booking code is generated and displayed
4. Check that the booking appears in the admin reception system with the correct code

## 5. Performance Testing

### Database Performance
```sql
-- Test index performance on booking codes
EXPLAIN ANALYZE SELECT * FROM bookings WHERE booking_code = 'KR-20250108-00001';
-- Should use index_booking_code index

-- Test date filtering performance
EXPLAIN ANALYZE SELECT * FROM bookings WHERE appointment_date = CURRENT_DATE;
-- Should use index_appointment_date index

-- Test status filtering performance
EXPLAIN ANALYZE SELECT * FROM bookings WHERE booking_status = 'checked_in';
-- Should use index_booking_status index
```

### Edge Function Performance
1. Test Edge Functions with concurrent requests
2. Monitor response times (should be < 2 seconds)
3. Check error rates in Supabase dashboard
4. Monitor database connection usage

## 6. Error Handling Testing

### Test Invalid Requests
```bash
# Test checkin with invalid booking ID
curl -X POST "https://vekrhqotmgszgsredkud.supabase.co/functions/v1/checkin" \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: YOUR_ADMIN_API_KEY" \
  -d '{"booking_id": "invalid-id"}'
# Expected: 404 error with clear message

# Test checkout without checkin
curl -X POST "https://vekrhqotmgszgsredkud.supabase.co/functions/v1/checkout" \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: YOUR_ADMIN_API_KEY" \
  -d '{"booking_id": "CONFIRMED_BOOKING_ID"}'
# Expected: 409 error - cannot checkout from confirmed status
```

### Test Authentication
```bash
# Test without admin key
curl -X POST "https://vekrhqotmgszgsredkud.supabase.co/functions/v1/checkin" \
  -H "Content-Type: application/json" \
  -d '{"booking_id": "test"}'
# Expected: 401 Unauthorized
```

## 7. Security Testing

### Test SQL Injection Prevention
1. Try entering malicious SQL in search fields
2. Verify input is properly sanitized
3. Test with special characters and unicode

### Test XSS Prevention
1. Try entering JavaScript code in booking details
2. Verify it's properly escaped in the admin interface
3. Test with HTML tags and script tags

## 8. Cron Job Testing

### Test Auto No-Show Cron
```sql
-- Check if cron job is scheduled
SELECT * FROM cron.job WHERE jobname = 'auto-mark-no-show';

-- View recent cron job runs
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'auto-mark-no-show')
ORDER BY start_time DESC LIMIT 10;
```

## 9. Notification Testing

### Test OA Message Logging
```sql
-- Check notification logs
SELECT * FROM notification_logs 
ORDER BY sent_at DESC LIMIT 10;

-- Test different notification types
SELECT notification_type, status, COUNT(*) 
FROM notification_logs 
GROUP BY notification_type, status;
```

## 10. Rollback Testing

### Test System Rollback
1. Create test data with new features
2. Test rolling back database migration
3. Verify system still functions with old schema
4. Test reapplying migration

## Expected Results Summary

✅ **Booking Codes**: All new bookings get unique KR-YYYYMMDD-##### codes  
✅ **Check-in/Checkout**: Smooth flow with timestamp tracking  
✅ **Duration Calculation**: Accurate time tracking between checkin/checkout  
✅ **Auto No-Show**: Past bookings automatically marked at midnight  
✅ **Real-time Updates**: Changes appear immediately in admin interface  
✅ **Search Enhancement**: Fast search by phone number or booking code  
✅ **Edge Functions**: All functions respond within 2 seconds  
✅ **Error Handling**: Clear error messages for all failure cases  
✅ **Security**: Proper authentication and input validation  
✅ **Performance**: Database queries use indexes efficiently  

## Monitoring & Alerts

After testing, set up monitoring for:
- Edge Function error rates
- Database query performance
- Cron job execution status
- Real-time subscription health
- Notification delivery rates

## Production Checklist

Before going live:
- [ ] All tests passed
- [ ] Environment variables configured
- [ ] Database migration applied
- [ ] Edge Functions deployed
- [ ] Real-time subscriptions working
- [ ] Cron jobs scheduled
- [ ] Monitoring dashboards set up
- [ ] Backup procedures verified
- [ ] Documentation updated
