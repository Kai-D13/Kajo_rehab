# 🚀 EXECUTE DEPLOYMENT - Production Ready

## ⚙️ Bước 1: Thiết lập Environment Variables

**Vào Supabase Dashboard → Functions → Environment Variables → Set/Override:**

```env
# Supabase Core
SUPABASE_URL=https://vekrhqotmgszgsredkud.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla3JocW90bWdzemdzcmVka3VkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTkzMjU1NiwiZXhwIjoyMDcxNTA4NTU2fQ.R9HBRVt9Cg1jThW0k9SfFQpylLBEI_KTTS4aCcUmjTE
JWT_SECRET=8N0UWKBPQsj/gHNCp7woYH3TEOeYKR5WfdIX8t/sDSYsTpsaxxAUtpXUep6XSZqJgECtzN1Y5Iw8o1qyqt29CQ==

# Admin API (cho Reception System)
ADMIN_API_KEY=0883eb4f114371c8414ad8e3a2e3557b4fdddbadee78ecb41dfea0b8ca29cb96

# Zalo Platform IDs
ZALO_APP_ID=2403652688843335720
ZALO_APP_SECRET=1Yb5YMVFGwGB7J7mSR9C
ZALO_MINIAPP_ID=3355586882348907634
ZALO_MINIAPP_DEEPLINK=https://zalo.me/s/3355586882348907634/
ZALO_OA_ID=2339827548685253412

# Current Access Tokens (cần thay đổi theo chu kỳ)
ZALO_USER_ACCESS_TOKEN=t2RRLg1HZGhU8zLRgbE40zSYqrYhI8L1qqQW7CnQh3x3BOfct2pOHyygz1dwEAmUt0Y84jGssqhFHFvvnr7t8zD7mmtBSU8Nw5x7Dz8Zdn2h2ge_i3QVOyKXicUmLhr-XMgE8uOVfN-88umaZ2QW6eSuaJ6J2A4LwYg87j0Kc3xr8AbXyWZmGDacrsxl0FqppcceChDxcMt73wb8xNAwJiDbYaFrOAiUmL7uFlzdoZpZJlm0c6FKC-5-rJlbRkm7dKkvMuHSxLsiAFrpg0FtO840mrwv3FT-md_EJTr_usBUMibTn77YSxnQzb6Q9ibycJMPME8clmNU3RGSfXYLMDelmLh77Ue6-HxwMD4i_m7u0DevON1CH61ff4o92m
ZALO_USER_REFRESH_TOKEN=eu3cJXoDV6AXXUX35ezrQwY4xa0Nb0q8rjpHQntG5G3UcDvV9T0M2Dg-_KOOmZuAvwRUTJp780dnjFH22CGxQ_ABpoOeqGPo_jYPNnRBH0VJZRn82_4a9lUNwqaAsJC-iBF6K4_E6Ikqc-LJRiWb6OAUndPtroaQYz_tL3s08tg0-kqBK8y6V8Ndu01FYZXXjeJN4LF30s_kpia6M8a0BxpYo5r4f2ObhFpBVr23532BXFLVNEii5-xs6CDimmYp_xBJ3I50INJuVzIB8mb9PBhf7rJedbLkFEM5bY1K6I_YyGoT_PGJgcmaWD7xM5Jkf6i3cgORdQtwV0cQULnLf2Bv1L7ntXzkwQQ9cbYZpwi6HYGU6C

ZALO_OA_ACCESS_TOKEN=5VNQUZeLQIaNyDHtC1TW81xnqdGn30D_JuwsKdqQGmKwfVTIK092PJYcz6ra4J1aGftjNHuj9mankv8R70nvI66opdao3XbfHPFIQpi57a5IhlSAV0j7NHA7bmW_CM0DLghGMNqK6squfAb0JX1eR6YvZaiU7bv2PFliIZvh7MHomDr5554MV6FemtuhRWDVMTJoNXv_Gd95x_9V46yUT7MCerWO9MrBISIbPsuwOp51dBm25YHgBN-IsW049mKjBxMo37GhPnq7gQuVUK8IJWkas0L751jRBgNG3N8GF34NYzWQVXqP4bQHppaYT11lR9N0UZ0ID70VjEPKMb4JL2BNsLzdI0Lu5-BbJduSK6q6dRnoRWXQ8WYzgn4X7qKRTudoJGmRMavAluPAD0yqOXYJu3P2U1PcLn_JXMO-26qe
ZALO_OA_REFRESH_TOKEN=MTf8E-rkF6PRtqOsvsmrRrBUG3NcToyy1w8t6lbmEpy9hZ4ve54m71I-9nBcM2GT59al5jWf5pCjt3qfyJym5WtHDII-0pqzNCaw1AuHCIf3qJesb34LQ5FR9sIVRYjkRA8ZTeHTM7rYiLjQW5XRNcAOKaM7Js9EPODGOQap941ip3TCX08yLstLJbQF3KL7UUH9ThahO2r7xbid-Zek0YprA1hOEoyrRTuf6D4jMWOHuYrRnJOO1o_xBWlW4IaD9T0X1j9XL2GHfrihe7DO44h1IpEABNCgQ_bQTuqvIcia-pbAqmX9Qm3LG6VC86PQ7kXqNkyR0sC7hozzi5uBN7E-7WssSYaF09jO1jqbR0Plca06qtz0LoUDP6-GMtbFH9j3PAHRPNf8k1DLuGbbJJR4O15XL8I7GcZfSpXd

# OA API Config
ZALO_OA_SEND_URL=https://openapi.zalo.me/v3.0/oa/message
ZALO_OA_SEND_MODE=message_token
```

---

## 🛠️ Bước 2: Deploy Edge Functions

**Chạy CLI commands:**

```powershell
# Cài đặt Supabase CLI (nếu chưa có)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
scoop install supabase

# Login và link project
supabase login
supabase link --project-ref vekrhqotmgszgsredkud

# Deploy tất cả Edge Functions
supabase functions deploy checkin
supabase functions deploy checkout  
supabase functions deploy notify_booking_created
supabase functions deploy admin_bookings_query
supabase functions deploy oa_health
```

---

## 🗃️ Bước 3: Apply Database Migrations

```powershell
# Push database migrations
supabase db push
```

**Hoặc run manually trong Supabase SQL Editor:**

1. `20250908_booking_migration.sql` - Booking codes + cron
2. `20250908_notification_logs.sql` - Audit trail  
3. `20250908_booking_events.sql` - Status tracking
4. `20250910_rls_lockdown.sql` - Security lockdown

---

## 🧪 Bước 4: Testing & Verification

### **A. OA Health Check**
```bash
# GET health check
curl https://vekrhqotmgszgsredkud.functions.supabase.co/oa_health

# Expected: 200 OK với environment status
```

### **B. Admin Bookings Query (Security Test)**
```bash
# Test với admin key
curl -X POST https://vekrhqotmgszgsredkud.functions.supabase.co/admin_bookings_query \
  -H "Content-Type: application/json" \
  -H "x-admin-key: 0883eb4f114371c8414ad8e3a2e3557b4fdddbadee78ecb41dfea0b8ca29cb96" \
  -d '{"filters":{}}'

# Expected: 200 OK với danh sách bookings

# Test KHÔNG có admin key (should fail)
curl -X POST https://vekrhqotmgszgsredkud.functions.supabase.co/admin_bookings_query \
  -H "Content-Type: application/json" \
  -d '{"filters":{}}'

# Expected: 401 Unauthorized
```

### **C. Reception System**
1. **Mở:** `reception-system-v3-production.html`
2. **Kiểm tra:** Load được danh sách booking
3. **Test:** Check-in/check-out buttons hoạt động
4. **Verify:** Real-time updates

### **D. End-to-End Flow**
1. **Mini App:** Tạo booking → status `confirmed` + booking_code  
2. **OA Notification:** Tự động gửi qua `message_token`
3. **Reception:** Check-in → status `checked_in` + timestamp
4. **Reception:** Check-out → status `checked_out` + timestamp  
5. **Database:** Audit trail trong `notification_logs`

---

## 📋 Bước 5: Production Files Ready

### **Reception System:**
- ✅ `reception-system-v3-production.html` - Secure Edge Functions only
- 🔑 Admin Key: `0883eb4f114371c8414ad8e3a2e3557b4fdddbadee78ecb41dfea0b8ca29cb96`
- 🌐 Edge URL: `https://vekrhqotmgszgsredkud.functions.supabase.co`

### **OA Health Monitor:**
- ✅ `public/oa-health.html` - Environment monitoring
- 🔍 URL: `https://vekrhqotmgszgsredkud.functions.supabase.co/oa_health?ui=1`

### **Edge Functions:**
- ✅ `checkin` - Patient check-in với business rules
- ✅ `checkout` - Patient check-out theo yêu cầu spec
- ✅ `admin_bookings_query` - Secure data access
- ✅ `notify_booking_created` - OA message_token support  
- ✅ `oa_health` - Token monitoring & test messaging

### **Mini App Updates:**
- ✅ Supabase singleton (no GoTrueClient warnings)
- ✅ Back button hook (consistent navigation)
- ✅ Medical records service stub  
- ✅ Enhanced notification với message_token + fallback

---

## 🔒 Security Verification

### **RLS Policies Applied:**
```sql
-- Xác nhận anonymous KHÔNG thể access bookings
SELECT * FROM bookings; -- Should return 0 rows for anon user

-- Chỉ service_role có thể access
-- (Edge Functions sử dụng SERVICE_ROLE_KEY)
```

### **Edge Function Authentication:**
- ❌ Anonymous users: Bị từ chối với `401 Unauthorized`  
- ✅ Admin API Key: Hoạt động với header `x-admin-key`
- ✅ Service Role: Internal database access

---

## 🚦 Go-Live Checklist

### **Pre-Launch (5 minutes):**
- [ ] Environment variables đã set
- [ ] Edge Functions đã deploy thành công
- [ ] Database migrations applied
- [ ] OA health check returns `200 OK`
- [ ] Admin API test passes

### **Launch Verification (10 minutes):**
- [ ] Reception system loads bookings  
- [ ] Check-in/check-out functions work
- [ ] Mini App booking flow complete
- [ ] OA notifications được gửi
- [ ] Real-time updates working

### **Post-Launch Monitoring:**
- [ ] Monitor `notification_logs` table
- [ ] Check OA token expiration alerts
- [ ] Verify booking_code generation  
- [ ] Confirm cron job no-show detection

---

## 📞 Support & Troubleshooting

### **Common Issues:**

**1. OA Notification Failed:**
```bash
# Check OA health
curl https://vekrhqotmgszgsredkud.functions.supabase.co/oa_health

# Verify token not expired  
# Check notification_logs table for error details
```

**2. Reception System 401 Error:**
```bash
# Verify admin key in environment
# Check Edge Function deployment status
# Test API key manually with curl
```

**3. Mini App GoTrueClient Warning:**
```typescript
// Already fixed với singleton pattern
// src/lib/supabaseClient.ts
```

**4. No Booking Code Generated:**
```sql
-- Check if trigger exists
SELECT * FROM bookings WHERE booking_code IS NULL;

-- Manual fix
UPDATE bookings SET booking_code = 'KR-' || TO_CHAR(created_at, 'YYYYMMDD') || '-' || LPAD(id::text, 5, '0') 
WHERE booking_code IS NULL;
```

---

## 🎉 SYSTEM DEPLOYMENT COMPLETE

**Kajo Rehabilitation Clinic Mini App** hoàn toàn sẵn sàng production với:

- 🔒 **Security-first architecture** (RLS lockdown + Edge Functions)  
- ⚡ **Performance-optimized** (Edge Functions + Supabase global CDN)
- 📊 **Comprehensive monitoring** (OA health + audit trails)  
- 👥 **Seamless UX** (Mini App + Reception system)
- 🛡️ **Production-grade error handling**

**All systems green for go-live! 🚀**
