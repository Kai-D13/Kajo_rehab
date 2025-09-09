# 🎯 NEXT STEPS CHECKLIST - Kajo System v2.0
## Ngày 8 tháng 9, 2025

---

## 🚨 **BƯỚC TIẾP THEO CẦN LÀM NGAY**

### **PHASE 1: ZALO CONFIGURATION (Ưu tiên cao nhất)**

#### **1.1. Zalo Mini App Setup** ⏳
- [ ] **Truy cập**: https://developers.zalo.me/
- [ ] **App hiện tại**: 
  - App ID: `2403652688841115720`
  - App Name: `kajotai-rehab-clinic`
- [ ] **Domain Verification**:
  - [ ] Thêm domain production của bạn
  - [ ] Verify domain ownership
  - [ ] Cấu hình redirect URLs
- [ ] **Permissions Check**:
  - [ ] User profile access
  - [ ] OA messaging capability
  - [ ] File upload permissions

#### **1.2. Zalo Official Account Setup** 🚨 **URGENT**
- [ ] **Truy cập**: https://oa.zalo.me/
- [ ] **OA hiện tại**: `2339827548685253412`
- [ ] **Lấy Access Token**:
  - [ ] Vào **Cài đặt** → **Quản lý ứng dụng**
  - [ ] Tạo/Copy **Access Token**
  - [ ] Lưu token an toàn (cần cho bước tiếp theo)

#### **1.3. Template Messages Configuration**
- [ ] **Template 1 - Confirmation**:
```
🎉 Xác nhận đặt khám!

Mã đặt khám: {{booking_code}}
Khách hàng: {{customer_name}}
Ngày khám: {{appointment_date}}
Giờ khám: {{appointment_time}}
Dịch vụ: {{service_type}}

Cảm ơn bạn đã chọn dịch vụ của chúng tôi!
```

- [ ] **Template 2 - Reminder**:
```
⏰ Nhắc nhở khám bệnh!

Mã đặt khám: {{booking_code}}
Khách hàng: {{customer_name}}
Ngày khám: {{appointment_date}}
Giờ khám: {{appointment_time}}

Vui lòng có mặt đúng giờ. Cảm ơn!
```

- [ ] **Template 3 - Status Update**:
```
📋 Cập nhật trạng thái!

Mã đặt khám: {{booking_code}}
Trạng thái: {{booking_status}}
Cập nhật lúc: {{timestamp}}

Cảm ơn bạn!
```

---

### **PHASE 2: ENVIRONMENT SETUP**

#### **2.1. Supabase Environment Variables** 🔑
- [ ] **Truy cập**: Supabase Dashboard → Settings → Environment Variables
- [ ] **Set Variables**:
  ```
  ADMIN_API_KEY=kajo-admin-2025-secure-key-[random]
  ZALO_ACCESS_TOKEN=[Token từ bước 1.2]
  ```
- [ ] **Verify Settings**: Restart Edge Functions sau khi set

#### **2.2. Test Connection**
- [ ] **Test Zalo OA**:
```bash
curl -X POST "https://openapi.zalo.me/v3.0/oa/message" \
  -H "access_token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient":{"user_id":"test"},"message":{"text":"Test"}}'
```

---

### **PHASE 3: DEPLOYMENT**

#### **3.1. Database Migration**
- [ ] **Check Supabase CLI**:
```powershell
supabase --version
```
- [ ] **Apply Migration**:
```powershell
cd C:\Users\user\test_miniapp
supabase db push
```
- [ ] **Verify Tables**:
  - [ ] Booking codes column exists
  - [ ] Checkout timestamp column exists
  - [ ] Notification logs table created
  - [ ] Cron job scheduled

#### **3.2. Edge Functions Deployment**
- [ ] **Deploy Functions**:
```powershell
supabase functions deploy checkin
supabase functions deploy checkout
supabase functions deploy send-oa-notification
```
- [ ] **Test Each Function**:
  - [ ] Checkin API response
  - [ ] Checkout API response
  - [ ] OA notification API response

#### **3.3. Frontend Build & Deploy**
- [ ] **Build Production**:
```powershell
npm run build
```
- [ ] **Test Build**: Verify no errors
- [ ] **Deploy to Hosting**: Upload dist folder
- [ ] **Update Zalo Domain**: Point to production URL

---

### **PHASE 4: TESTING**

#### **4.1. Mini App Testing**
- [ ] **Navigation Test**:
  - [ ] Home button works
  - [ ] Back button works
  - [ ] No React Router warnings in console
- [ ] **Booking Flow**:
  - [ ] Create new booking
  - [ ] Verify booking code generated (KR-YYYYMMDD-#####)
  - [ ] Check database entry

#### **4.2. Admin Reception Testing**
- [ ] **Open Reception System**:
```
file:///C:/Users/user/test_miniapp/reception-system.html
```
- [ ] **Test Features**:
  - [ ] Real-time updates work
  - [ ] Booking codes display
  - [ ] Check-in functionality
  - [ ] Check-out functionality
  - [ ] Duration calculation
  - [ ] Search by phone/code
  - [ ] Auto-refresh toggle

#### **4.3. End-to-End Testing**
- [ ] **Complete Workflow**:
  1. [ ] Create booking trong mini app
  2. [ ] Verify booking xuất hiện trong reception
  3. [ ] Check-in patient
  4. [ ] Check-out patient
  5. [ ] Verify duration calculated
  6. [ ] Test OA notification
- [ ] **Auto No-Show Test**:
  - [ ] Create past booking với status 'confirmed'
  - [ ] Wait for midnight cron hoặc trigger manually
  - [ ] Verify status changed to 'no_show'

---

### **PHASE 5: MONITORING & OPTIMIZATION**

#### **5.1. Performance Monitoring**
- [ ] **Check Database Performance**:
  - [ ] Query execution times
  - [ ] Index usage
  - [ ] Connection pooling
- [ ] **Monitor Edge Functions**:
  - [ ] Response times
  - [ ] Error rates
  - [ ] Memory usage

#### **5.2. Error Tracking**
- [ ] **Setup Logging**:
  - [ ] Edge Function logs
  - [ ] Database query logs
  - [ ] OA notification logs
- [ ] **Alert System**:
  - [ ] Failed notifications
  - [ ] Database errors
  - [ ] Function timeouts

---

## 📊 **TESTING COMMANDS**

### **Database Testing**
```sql
-- Test booking code generation
INSERT INTO bookings (customer_name, phone_number, appointment_date, appointment_time) 
VALUES ('Test User', '0123456789', '2025-09-08', '10:00:00');

-- Verify booking code created
SELECT booking_code FROM bookings WHERE customer_name = 'Test User';

-- Test auto no-show function
SELECT mark_no_shows();
```

### **Edge Function Testing**
```bash
# Test checkin
curl -X POST https://vekrhqotmgszgsredkud.supabase.co/functions/v1/checkin \
  -H "X-Admin-Key: kajo-admin-2025-secure-key" \
  -H "Content-Type: application/json" \
  -d '{"booking_id": "[real-booking-id]", "staff_id": "reception-001"}'

# Test checkout
curl -X POST https://vekrhqotmgszgsredkud.supabase.co/functions/v1/checkout \
  -H "X-Admin-Key: kajo-admin-2025-secure-key" \
  -H "Content-Type: application/json" \
  -d '{"booking_id": "[real-booking-id]", "staff_id": "reception-001", "notes": "Khám hoàn tất"}'

# Test OA notification
curl -X POST https://vekrhqotmgszgsredkud.supabase.co/functions/v1/send-oa-notification \
  -H "X-Admin-Key: kajo-admin-2025-secure-key" \
  -H "Content-Type: application/json" \
  -d '{"booking_id": "[real-booking-id]", "type": "confirmation"}'
```

---

## 🚨 **CRITICAL PATH**

### **Must Do First (Today)**:
1. ✅ Get Zalo OA Access Token
2. ✅ Set Supabase Environment Variables
3. ✅ Deploy Database Migration

### **Must Do This Week**:
1. ✅ Deploy và test Edge Functions
2. ✅ Complete admin reception testing
3. ✅ Setup OA templates
4. ✅ End-to-end workflow testing

### **Can Do Later**:
1. Performance monitoring
2. Advanced error tracking
3. UI/UX improvements
4. Additional features

---

## 📞 **SUPPORT CONTACTS**

- **Zalo Developer Support**: developers.zalo.me/support
- **Supabase Support**: supabase.com/support
- **Technical Issues**: Check console logs và Edge Function logs

---

## 🎉 **SUCCESS CRITERIA**

System được coi là thành công khi:
- [ ] Booking codes hiển thị trong reception system
- [ ] Check-in/check-out workflow hoạt động trơn tru
- [ ] Real-time updates work without F5 refresh
- [ ] OA notifications gửi được
- [ ] Auto no-show detection runs properly
- [ ] No console errors trong mini app

**Timeline**: Hoàn thành trong 2-3 ngày làm việc
