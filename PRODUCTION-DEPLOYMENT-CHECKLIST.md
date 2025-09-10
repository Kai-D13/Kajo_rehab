# 🚀 PRODUCTION DEPLOYMENT CHECKLIST
## Kajo Rehabilitation Clinic - Final Steps

---

## ✅ **Phase 1: Environment Setup**

### **1.1 Set Environment Variables** (Supabase Dashboard → Functions → Environment Variables)

```env
# Core Supabase
SUPABASE_URL=https://vekrhqotmgszgsredkud.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SERVICE_ROLE_KEY>
JWT_SECRET=8N0UWKBPQsj/gHNCp7woYH3TEOeYKR5WfdIX8t/sDSYsTpsaxxAUtpXUep6XSZqJgECtzN1Y5Iw8o1qyqt29CQ==

# Admin Security
ADMIN_API_KEY=0883eb4f114371c8414ad8e3a2e3557b4fdddbadee78ecb41dfea0b8ca29cb96

# Zalo Platform
ZALO_APP_ID=2403652688843335720
ZALO_APP_SECRET=1Yb5YMVFGwGB7J7mSR9C
ZALO_MINIAPP_ID=3355586882348907634
ZALO_MINIAPP_DEEPLINK=https://zalo.me/s/3355586882348907634/
ZALO_OA_ID=2339827548685253412

# OA Tokens (ROTATE sau go-live)
ZALO_OA_ACCESS_TOKEN=<YOUR_OA_ACCESS_TOKEN>
ZALO_OA_REFRESH_TOKEN=<YOUR_OA_REFRESH_TOKEN>

# OA Configuration
ZALO_OA_SEND_URL=https://openapi.zalo.me/v3.0/oa/message
ZALO_OA_SEND_MODE=message_token
```

### **1.2 Deploy Database & Functions** (PowerShell/Terminal)

```powershell
# Kiểm tra Supabase CLI
supabase --version

# Login và link project
supabase login
supabase link --project-ref vekrhqotmgszgsredkud

# Deploy database migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy checkin
supabase functions deploy checkout
supabase functions deploy notify_booking_created
supabase functions deploy admin_bookings_query
supabase functions deploy oa_health
```

### **1.3 Configure API Domains** (Zalo Mini App Dashboard)

**Add to API Domains Allowlist:**
- `https://vekrhqotmgszgsredkud.functions.supabase.co`
- `https://vekrhqotmgszgsredkud.supabase.co`
- `https://vekrhqotmgszgsredkud.storage.supabase.co`

**Reference:** https://miniapp.zaloplatforms.com/documents/open-apis/partner/api-domains/

---

## ✅ **Phase 2: Smoke Testing**

### **2.1 OA Health Check**

```bash
# Test ENV status (JSON response)
curl https://vekrhqotmgszgsredkud.functions.supabase.co/oa_health

# Test monitoring UI
https://vekrhqotmgszgsredkud.functions.supabase.co/oa_health?ui=1

# Test OA messaging (với message_token)
curl -X POST https://vekrhqotmgszgsredkud.functions.supabase.co/oa_health \
  -H "content-type: application/json" \
  -d '{"recipient":{"message_token":"<YOUR_MESSAGE_TOKEN>"}, "text":"[Kajo] Health check OK"}'
```

**Expected Results:**
- ✅ `200 OK` status
- ✅ Environment variables present: `true`
- ✅ OA test message delivered to Zalo

### **2.2 Admin API Security Test**

```bash
# Test WITH admin key (should work)
curl -X POST https://vekrhqotmgszgsredkud.functions.supabase.co/admin_bookings_query \
  -H "Content-Type: application/json" \
  -H "x-admin-key: 0883eb4f114371c8414ad8e3a2e3557b4fdddbadee78ecb41dfea0b8ca29cb96" \
  -d '{"filters":{}}'

# Test WITHOUT admin key (should fail)
curl -X POST https://vekrhqotmgszgsredkud.functions.supabase.co/admin_bookings_query \
  -H "Content-Type: application/json" \
  -d '{"filters":{}}'
```

**Expected Results:**
- ✅ With key: `200 OK` + booking data
- ✅ Without key: `401 Unauthorized`

---

## ✅ **Phase 3: Admin Reception System Test**

### **3.1 Open Reception System**
**File:** `reception-system-v3-production.html`

### **3.2 Test Core Functions**

1. **Date Range Filter:**
   - Set từ ngày: `2025-09-08`
   - Set đến ngày: `2025-09-10`
   - Click "📅 Áp dụng filter"
   - **Expected:** Load bookings trong khoảng thời gian

2. **Quick Filters:**
   - Click "Hôm nay" → Show today's bookings
   - Click "Ngày mai" → Show tomorrow's bookings
   - Click "7 ngày tới" → Show week range

3. **Stats Dashboard:**
   - **Expected:** Numbers update automatically
   - Total bookings, Pending, Checked-in, Checked-out

### **3.3 Test Check-in/Check-out Flow**

**Prerequisites:** Cần có ít nhất 1 booking với status `confirmed`

1. **Check-in Test:**
   - Find booking with status `confirmed`
   - Click "📥 Check-in" button
   - **Expected:** 
     - Status changes to `checked_in`
     - Shows check-in timestamp
     - Button becomes disabled
     - Success notification appears

2. **Check-out Test:**
   - Find booking with status `checked_in`
   - Click "📤 Check-out" button
   - **Expected:**
     - Status changes to `checked_out`
     - Shows check-out timestamp
     - Both buttons become disabled
     - Success notification appears

3. **Disabled States Test:**
   - Bookings with past dates: Buttons disabled
   - Status `no_show`, `canceled`, `completed`: Buttons disabled

### **3.4 Real-time Updates Test**
- Create/modify booking in Mini App
- **Expected:** Reception system auto-refreshes (30s interval)

---

## ✅ **Phase 4: Mini App End-to-End Test**

### **4.1 Access Mini App**
**URL:** https://zalo.me/s/3355586882348907634/

### **4.2 Complete Booking Flow**

1. **Navigate to Booking:**
   - Open Mini App
   - Go to booking/appointment section

2. **Fill Booking Form:**
   - Select service type
   - Choose appointment date (tomorrow or later)
   - Choose time slot
   - Fill customer information
   - Submit booking

3. **Verify Booking Creation:**
   - **Expected:** Status `confirmed`
   - **Expected:** Booking code format `KR-YYYYMMDD-#####`
   - **Expected:** OA notification sent via `message_token`

4. **Check OA Notification:**
   - Open Zalo app
   - **Expected:** Message from Kajo OA
   - **Content:** Booking confirmation with details

5. **Verify in Reception System:**
   - Refresh reception-system-v3-production.html
   - **Expected:** New booking appears
   - **Expected:** Status shows `confirmed`

---

## ✅ **Phase 5: Advanced Testing**

### **5.1 No-Show Automation Test** (Optional)

1. **Create Past Booking:**
   ```sql
   -- Manually create booking for yesterday
   INSERT INTO bookings (
     customer_name, phone_number, appointment_date, appointment_time,
     booking_status, service_type, clinic_location, created_at
   ) VALUES (
     'Test Customer', '0123456789', '2025-09-08', '10:00',
     'confirmed', 'Physical Therapy', 'Ho Chi Minh', NOW()
   );
   ```

2. **Run No-Show Cron:**
   ```sql
   SELECT public.auto_mark_no_show_vn();
   ```

3. **Verify Result:**
   - **Expected:** Booking status → `no_show`
   - **Expected:** Buttons disabled in reception system

### **5.2 Notification Logs Test**

```sql
-- Check notification delivery logs
SELECT * FROM notification_logs 
ORDER BY sent_at DESC 
LIMIT 10;
```

**Expected Fields:**
- `booking_id`: Link to booking
- `recipient_type`: `message_token` or `uid`
- `success`: `true` for successful delivery
- `zalo_response`: OA API response

---

## ✅ **Phase 6: Security & Monitoring**

### **6.1 Database Security Verification**

```sql
-- Test anonymous access (should fail)
SELECT * FROM bookings LIMIT 1;
-- Expected: No rows or permission error

-- Test service_role access (internal only)
-- This should only work in Edge Functions
```

### **6.2 Function Logs Monitoring**

**Supabase Dashboard → Functions → Select Function → Logs**

Monitor for:
- ✅ Successful function executions
- ❌ Authentication failures
- ⚠️ OA token expiration warnings

### **6.3 Token Rotation** (After Go-Live)

```env
# Generate new keys
ADMIN_API_KEY=<NEW_RANDOM_KEY>
ZALO_OA_ACCESS_TOKEN=<NEW_OA_TOKEN>
ZALO_OA_REFRESH_TOKEN=<NEW_REFRESH_TOKEN>
```

---

## 🎯 **END-TO-END TEST SCENARIO**

### **Complete User Journey:**

1. **👤 Patient (Mini App):**
   - Opens Mini App via deeplink
   - Books appointment for tomorrow 2pm
   - Receives booking confirmation OA message
   - Gets booking code: `KR-20250910-00123`

2. **👩‍⚨️ Receptionist (Admin System):**
   - Opens reception-system-v3-production.html
   - Filters for tomorrow's appointments
   - Sees new booking in `confirmed` status
   - When patient arrives: clicks "📥 Check-in"
   - After treatment: clicks "📤 Check-out"

3. **📊 System (Backend):**
   - Booking status: `pending` → `confirmed` → `checked_in` → `checked_out`
   - Timestamps: `created_at` → `checkin_timestamp` → `checkout_timestamp`
   - Audit trail: All actions logged in `notification_logs`
   - Security: All operations via Edge Functions only

### **Success Criteria:**

- ✅ Mini App booking works without errors
- ✅ OA notification delivered (message_token mode)
- ✅ Reception system loads data via Edge Functions
- ✅ Check-in/check-out flow completes successfully
- ✅ Real-time updates work
- ✅ Security policies block anonymous access
- ✅ All operations logged for audit

---

## 🚨 **Troubleshooting Common Issues**

### **Issue 1: OA Notification Failed**
```bash
# Check OA health
curl https://vekrhqotmgszgsredkud.functions.supabase.co/oa_health

# Check notification logs
SELECT * FROM notification_logs WHERE success = false;
```

### **Issue 2: Reception System 401 Error**
- Verify `ADMIN_API_KEY` in environment variables
- Check if Edge Functions are deployed
- Test admin key with curl

### **Issue 3: Mini App Cannot Book**
- Check Zalo API Domains configuration
- Verify Supabase environment variables
- Check browser console for errors

### **Issue 4: No Booking Code Generated**
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname LIKE '%booking%';

-- Manual fix if needed
UPDATE bookings SET booking_code = 'KR-' || TO_CHAR(created_at, 'YYYYMMDD') || '-' || LPAD(id::text, 5, '0') 
WHERE booking_code IS NULL;
```

---

## 🎉 **GO-LIVE CONFIRMATION**

**After completing all tests above, your system is ready for production!**

### **Final Checklist:**
- [ ] Environment variables set
- [ ] Edge Functions deployed
- [ ] Database migrations applied
- [ ] OA health check passes
- [ ] Admin security verified
- [ ] Reception system functional
- [ ] Mini App booking works
- [ ] OA notifications delivered
- [ ] Real-time updates working
- [ ] Audit trails logging
- [ ] Security policies active

**🏥 Kajo Rehabilitation Clinic is officially live! 🚀**
