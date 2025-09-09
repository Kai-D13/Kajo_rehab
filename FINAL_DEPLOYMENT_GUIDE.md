# 🚀 DEPLOYMENT & TESTING GUIDE
## Kajo Rehabilitation Clinic - Complete Implementation

---

## 📋 CHECKLIST TRIỂN KHAI

### 🔧 Bước 1: Database Migrations
```bash
# Áp dụng tất cả migrations (theo thứ tự)
supabase db push

# Kiểm tra migrations đã áp dụng
supabase db remote commit --check
```

**Files cần deploy:**
- `20250908_booking_migration.sql` ✅ Booking codes + cron no_show
- `20250908_notification_logs.sql` ✅ Audit trail
- `20250908_booking_events.sql` ✅ Status change logging
- `20250910_rls_lockdown.sql` ✅ Security lockdown

### 🔧 Bước 2: Environment Variables
**Supabase Dashboard > Project Settings > Edge Functions > Environment Variables**

```env
SUPABASE_URL=https://vekrhqotmgszgsredkud.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ADMIN_API_KEY=kajo-admin-2025
ZALO_OA_ID=2339827548685253412
ZALO_OA_ACCESS_TOKEN=iSOd6NHvp4spmoaKVdl5HBh2BnT_O9v4...
ZALO_OA_SEND_URL=https://openapi.zalo.me/v3.0/oa/message
ZALO_OA_SEND_MODE=uid
```

### 🔧 Bước 3: Deploy Edge Functions
```bash
# Deploy tất cả functions
supabase functions deploy checkin
supabase functions deploy checkout  
supabase functions deploy notify_booking_created
supabase functions deploy oa_health
supabase functions deploy admin_bookings_query

# Verify deployment
supabase functions list
```

### 🔧 Bước 4: Frontend Updates
- ✅ Mini App: Supabase singleton (`src/lib/supabaseClient.ts`)
- ✅ Mini App: Back button hook (`src/hooks/useBackButton.ts`)  
- ✅ Mini App: Medical records stub (`src/services/medical-record.service.ts`)
- ✅ Reception: Secure admin system (`reception-system-v3-secure.html`)
- ✅ Health Check: OA monitoring (`public/oa-health.html`)

---

## 🧪 SMOKE TESTS (PASS/FAIL)

### ✅ A. OA Health Check
**URL:** `/public/oa-health.html`

**Test Steps:**
1. Mở trang health check
2. Nhấn "🔍 PING ENV" 
3. Kiểm tra response:
   ```json
   {
     "ok": true,
     "report": {
       "zalo_oa_id_present": true,
       "zalo_oa_token_present": true,
       "zalo_oa_send_url": "https://openapi.zalo.me/v3.0/oa/message",
       "zalo_oa_send_mode": "uid"
     }
   }
   ```

**Send Test Message:**
1. Nhập UID test (hoặc message_token)
2. Nhấn "📤 SEND TEST MESSAGE"
3. Kiểm tra response status: `200` và `ok: true`

**Expected:** ✅ PASS - OA nhận được tin test

---

### ✅ B. Database Security
**Test RLS Lockdown:**

```javascript
// Test 1: Anonymous access bị chặn
fetch('https://vekrhqotmgszgsredkud.supabase.co/rest/v1/bookings', {
  headers: { 'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
})
// Expected: 401 Unauthorized hoặc empty result
```

```javascript
// Test 2: Admin access qua Edge Function hoạt động
fetch('https://vekrhqotmgszgsredkud.supabase.co/functions/v1/admin_bookings_query', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-admin-key': 'kajo-admin-2025'
  },
  body: JSON.stringify({ dateStart: '2025-09-01', dateEnd: '2025-09-30' })
})
// Expected: 200 OK với data array
```

**Expected:** ✅ PASS - Security đúng cấu hình

---

### ✅ C. Happy Path - End-to-End Flow

**Bước 1: Tạo booking từ Mini App**
1. User mở Mini App
2. Chọn ngày/giờ (H+1h)  
3. Điền thông tin và submit
4. **Expected:** 
   - DB có record với `booking_code` (format: KR-YYYYMMDD-#####)
   - `booking_status = 'confirmed'`
   - OA notification được gửi

**Bước 2: Reception Check-in**
1. Mở `reception-system-v3-secure.html`
2. Tìm booking theo SĐT
3. Nhấn "📥 Check-in"
4. **Expected:**
   - `booking_status = 'checked_in'`
   - `checkin_timestamp` được set
   - UI cập nhật realtime

**Bước 3: Reception Check-out**
1. Nhấn "📤 Check-out" cho booking đã check-in
2. **Expected:**
   - `booking_status = 'checked_out'`
   - `checkout_timestamp` được set
   - `booking_events` ghi lại history

**Expected:** ✅ PASS - Full flow hoàn tất

---

### ✅ D. No-Show Auto Detection

**Test Setup:**
```sql
-- Tạo booking ngày hôm qua
INSERT INTO bookings (customer_name, phone_number, appointment_date, appointment_time, booking_status)
VALUES ('Test No Show', '0000000000', '2025-09-08', '10:00', 'confirmed');
```

**Test Execution:**
```sql
-- Chạy function mark no-show
SELECT public.auto_mark_no_show_vn();
```

**Expected:** 
- ✅ PASS - Booking status thành `'no_show'`
- ✅ PASS - Nút check-in bị disabled trong Reception

---

### ✅ E. Date Range Filtering & Realtime

**Test 1: Date Range Filter**
1. Mở Reception system
2. Set filter: 2025-09-08 → 2025-09-10
3. Nhấn "📅 Áp dụng"
4. **Expected:** Chỉ hiển thị bookings trong khoảng ngày

**Test 2: Quick Filters**
1. Nhấn "Hôm nay" → chỉ hiển thị bookings hôm nay
2. Nhấn "Ngày mai" → chỉ hiển thị bookings ngày mai
3. Nhấn "7 ngày" → hiển thị bookings 7 ngày tới

**Test 3: Realtime Updates**
1. Mở 2 tab Reception system
2. Thực hiện check-in trên tab 1
3. **Expected:** Tab 2 tự động refresh và hiển thị thay đổi

**Expected:** ✅ PASS - Filtering và realtime hoạt động

---

## 🔍 DEBUGGING TOOLS

### 1. **Database Inspection**
```sql
-- Kiểm tra booking codes
SELECT booking_code, customer_name, booking_status FROM bookings ORDER BY created_at DESC LIMIT 10;

-- Kiểm tra audit trail
SELECT * FROM booking_events ORDER BY created_at DESC LIMIT 10;

-- Kiểm tra notifications
SELECT * FROM notification_logs ORDER BY created_at DESC LIMIT 10;
```

### 2. **Edge Function Logs**
```bash
# Realtime logs
supabase functions serve --debug

# Specific function logs  
supabase logs --type edge-function --function-name admin_bookings_query
```

### 3. **Reception System Debug**
- Mở DevTools Console
- Kiểm tra Network tab cho API calls
- Monitor realtime connection status

---

## 🎯 SUCCESS CRITERIA

### ✅ Security Goals
- ❌ Anonymous users CANNOT access bookings directly
- ✅ Admin functions work ONLY with valid API key
- ✅ Service role bypasses RLS correctly

### ✅ Operational Goals  
- ✅ OA health check prevents token expiration
- ✅ Reception system loads data via Edge Functions
- ✅ Check-in/check-out functions work reliably
- ✅ Real-time updates work across multiple users

### ✅ Data Integrity
- ✅ Booking codes generated automatically (KR-YYYYMMDD-#####)
- ✅ Cron job marks no-shows daily at 00:05 VN time
- ✅ All status changes logged in booking_events
- ✅ OA notifications logged in notification_logs

### ✅ User Experience
- ✅ Mini App: Supabase singleton prevents GoTrueClient warnings
- ✅ Mini App: Back button works consistently  
- ✅ Mini App: No medical records errors
- ✅ Reception: No Tailwind CDN warnings
- ✅ Reception: Secure admin access with proper authentication

---

## 🔮 POST-DEPLOYMENT MONITORING

### Daily Checks
1. **OA Health:** Monitor token expiration via `/oa-health.html`
2. **No-Show Cron:** Verify daily execution at 00:05 VN time
3. **Reception System:** Test admin access and realtime updates

### Weekly Reviews
1. **Booking Analytics:** Query booking_events for status change patterns
2. **Performance:** Monitor Edge Function response times
3. **Security:** Review notification_logs for failed attempts

### Emergency Procedures
1. **OA Token Expired:** Update ZALO_OA_ACCESS_TOKEN in Supabase env vars
2. **RLS Issues:** Verify service_role key is correct
3. **Edge Function Down:** Check Supabase function status and redeploy if needed

---

## 🎉 DEPLOYMENT COMPLETE!

Hệ thống Kajo Rehabilitation Clinic đã sẵn sàng cho production với:
- 🔒 **Security:** RLS lockdown, admin-only access
- ⚡ **Performance:** Edge Functions, realtime updates  
- 📊 **Monitoring:** Health checks, audit trails
- 👥 **User Experience:** Seamless Mini App & Reception workflows

**Hệ thống hiện tại hỗ trợ:**
- Đặt lịch qua Mini App với OA notifications
- Reception check-in/check-out với audit trail
- Auto no-show detection
- Realtime collaborative updates
- Comprehensive health monitoring
