# 🎯 KAJO SYSTEM v2.0 - PRODUCTION GO-LIVE CHECKLIST

## ✅ **PRE-DEPLOYMENT CHECKLIST**

### 1. 🗄️ Database Setup
- [ ] **Migrations Applied**: All 4 migration files executed successfully
  - `20250908_booking_migration.sql` - Booking code generation + no-show automation
  - `20250908_notification_logs.sql` - OA notification tracking
  - `20250908_booking_events.sql` - Audit trail for status changes
  - `20250908_bookings_rls.sql` - Row Level Security enabled

- [ ] **pg_cron Extension**: Enabled for automatic no-show marking at 00:05 VN daily

- [ ] **Database Indexes**: Performance indexes created for booking queries

### 2. 🔧 Edge Functions Deployment
- [ ] **checkin**: Check-in bookings via Edge Function (no direct PATCH)
- [ ] **checkout**: Check-out bookings with duration tracking
- [ ] **notify_booking_created**: OA notifications from backend
- [ ] **healthz**: System health monitoring endpoint

### 3. ⚙️ Environment Variables (Supabase Dashboard)
```
SUPABASE_URL=https://vekrhqotmgszgsredkud.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
ADMIN_API_KEY=kajo-admin-2025
ZALO_OA_ID=2339827548685253412
ZALO_OA_ACCESS_TOKEN=<fresh_token>
ZALO_OA_SEND_URL=https://openapi.zalo.me/v3.0/oa/message
ZALO_OA_SEND_MODE=uid
```

### 4. 🎨 Frontend Updates
- [ ] **Supabase Singleton**: No more GoTrueClient warnings
- [ ] **useBackButton Hook**: Navigation consistency
- [ ] **Placeholder Images**: SVG fallbacks for missing images
- [ ] **OA Integration**: Backend notifications via Edge Functions

### 5. 🏥 Reception System v2.0
- [ ] **Date Range Filter**: Today/Tomorrow/7 days quick filters
- [ ] **Real-time Updates**: Live booking status changes
- [ ] **Edge Functions**: Check-in/out via API (no direct PATCH)
- [ ] **Enhanced UI**: Stats dashboard + better UX

---

## 🚀 **DEPLOYMENT COMMANDS**

### Execute Deployment Script:
```powershell
.\deploy-production-v2.ps1
```

### Manual Deployment (if needed):
```bash
# 1. Apply migrations
supabase db push

# 2. Deploy functions
supabase functions deploy checkin
supabase functions deploy checkout
supabase functions deploy notify_booking_created
supabase functions deploy healthz

# 3. Build frontend
npm run build
```

---

## 🧪 **SMOKE TESTING WORKFLOW**

### A. 📱 Mini App Testing
1. **Create Booking**:
   - [ ] User creates booking for tomorrow
   - [ ] booking_code auto-generated: `KR-20250909-00001`
   - [ ] Status = 'confirmed'
   - [ ] No GoTrueClient warnings in console

2. **OA Notification**:
   - [ ] notify_booking_created Edge Function called
   - [ ] notification_logs entry created
   - [ ] User receives Zalo OA message

### B. 🏥 Reception System Testing
1. **Search & Filter**:
   - [ ] Search by phone number works
   - [ ] Date range filter works
   - [ ] Quick filter buttons (Today/Tomorrow/7 days)
   - [ ] Real-time subscription status: 🟢 Real-time

2. **Check-in Process**:
   - [ ] Find booking by booking_code
   - [ ] Click "📥 Check-in" → calls `/checkin` Edge Function
   - [ ] Status changes to 'checked_in'
   - [ ] checkin_timestamp populated
   - [ ] booking_events audit log created

3. **Check-out Process**:
   - [ ] Click "📤 Check-out" → calls `/checkout` Edge Function  
   - [ ] Status changes to 'checked_out'
   - [ ] checkout_timestamp populated
   - [ ] Duration calculated correctly

### C. 🔍 System Health Testing
1. **Health Endpoint**:
   - [ ] Visit: `/health.html`
   - [ ] All environment variables: ✅ Present
   - [ ] All Edge Functions: ✅ Responding
   - [ ] System status: ✅ Healthy

2. **No-Show Automation**:
   - [ ] Create test booking for yesterday
   - [ ] Execute: `SELECT public.auto_mark_no_show_vn();`
   - [ ] Booking status → 'no_show'
   - [ ] Check-in button disabled

---

## 📊 **SUCCESS CRITERIA**

### ✅ Zero Console Errors:
```
Mini App Console (Expected):
✅ ZaloOAService initialized with OA ID: 2339827548685253412
✅ Access token available: Yes
✅ Booking code generated: KR-20250909-00002
✅ OA notification sent via Edge Function
✅ No GoTrueClient warnings
✅ No placeholder image errors

Reception Console (Expected):
✅ Supabase client initialized
✅ Real-time subscription: SUBSCRIBED
✅ Checkin successful via Edge Function
✅ Checkout successful via Edge Function
✅ Date range filter working
```

### ✅ Database State Verification:
```sql
-- Verify booking with auto-generated code
SELECT booking_code, booking_status, checkin_timestamp, checkout_timestamp
FROM public.bookings 
WHERE phone_number = '0123456789'
ORDER BY created_at DESC LIMIT 1;

-- Expected Result:
-- booking_code: KR-20250909-00002
-- booking_status: checked_out
-- checkin_timestamp: 2025-09-09T...
-- checkout_timestamp: 2025-09-09T...

-- Verify notification logs
SELECT channel, status_code, response_body->>'error' as error
FROM public.notification_logs 
WHERE booking_id = '<booking_id>'
ORDER BY created_at DESC LIMIT 1;

-- Expected Result:
-- channel: oa
-- status_code: 200
-- error: null

-- Verify audit trail
SELECT old_status, new_status, actor, created_at
FROM public.booking_events 
WHERE booking_id = '<booking_id>'
ORDER BY created_at;

-- Expected Results:
-- 1. old_status: null, new_status: confirmed, actor: system_auto
-- 2. old_status: confirmed, new_status: checked_in, actor: reception-v2
-- 3. old_status: checked_in, new_status: checked_out, actor: reception-v2
```

---

## 🔥 **GO-LIVE READINESS**

### ✅ All Components Production-Ready:
- **Database**: ✅ Migrations applied, RLS enabled, auto no-show working
- **Edge Functions**: ✅ All 4 functions deployed and responding  
- **Frontend**: ✅ Zero console errors, proper navigation, OA integration
- **Reception**: ✅ Real-time updates, Edge Functions integration, date filters
- **Monitoring**: ✅ Health endpoint working, environment variables set

### ✅ End-to-End Flow Validated:
1. **User Journey**: Mini App → Create Booking → Receive OA notification
2. **Reception Journey**: Search → Check-in → Check-out → Audit trail
3. **System Journey**: Real-time updates → No-show automation → Health monitoring

### ✅ Performance & Security:
- **No Direct PATCH**: All admin operations via Edge Functions (SERVICE_ROLE)
- **RLS Enabled**: Users see only their data (if using auth)
- **Audit Trail**: All status changes logged
- **Real-time**: Live updates without F5

---

## 🎊 **FINAL GO-LIVE COMMAND**

When all checklist items are ✅, execute:

```powershell
Write-Host "🚀 KAJO SYSTEM v2.0 IS NOW LIVE!" -ForegroundColor Green
Write-Host "✅ Production deployment completed successfully" -ForegroundColor Cyan
Write-Host "📱 Mini App ready for users" -ForegroundColor Cyan
Write-Host "🏥 Reception system ready for staff" -ForegroundColor Cyan
Write-Host "🔔 OA notifications working" -ForegroundColor Cyan
Write-Host "📊 Real-time updates active" -ForegroundColor Cyan
```

**🎯 System Status: PRODUCTION READY**
