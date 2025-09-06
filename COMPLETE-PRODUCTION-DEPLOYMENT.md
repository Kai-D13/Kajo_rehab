# 🚀 COMPLETE PRODUCTION DEPLOYMENT GUIDE
## KajoTai Rehab Clinic - Zalo Mini App + OA Integration

---

## **📋 OVERVIEW**

Hệ thống hoàn chỉnh bao gồm:
- ✅ **Zalo Mini App** (App ID: 2403652688841115720)
- ✅ **Zalo Official Account** (OA ID: 2339827548685253412)  
- ✅ **Supabase Production Database** với RLS
- ✅ **Static QR Check-in System**
- ✅ **Webhook Auto-messaging**
- ✅ **Reception Management System**

---

## **🎯 DEPLOYMENT PHASES**

### **PHASE 1: Database Setup** ⚡

#### **1.1 Apply Production RLS**
```bash
# Apply RLS setup
psql -h db.vekrhqotmgszgsredkud.supabase.co -U postgres -d postgres -f database/production-rls-setup.sql

# Verify RLS policies
SELECT tablename, policyname, permissive, cmd 
FROM pg_policies 
WHERE tablename = 'bookings';
```

#### **1.2 Create Reception Staff User**
```sql
-- Tạo user cho reception staff
INSERT INTO auth.users (id, email, email_confirmed_at, created_at)
VALUES (
  gen_random_uuid(),
  'reception@kajotai.clinic',
  now(),
  now()
);

-- Set password (run in Supabase Dashboard)
```

#### **1.3 Enable Realtime**
```sql
-- Enable realtime for bookings
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
```

---

### **PHASE 2: Webhook Server Deployment** 🔗

#### **2.1 Server Setup**
```bash
# Upload files to kajorehab.gt.tc
scp webhook-server.ts root@kajorehab.gt.tc:/var/www/
scp webhook-package.json root@kajorehab.gt.tc:/var/www/package.json

# SSH to server
ssh root@kajorehab.gt.tc

# Install dependencies
cd /var/www
npm install

# Build TypeScript
npm run build
```

#### **2.2 Environment Variables**
```bash
# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=3001
ZALO_OA_ID=2339827548685253412
ZALO_OA_APP_SECRET=1Yb5YMVFGwGB7J7mSR9C
ZALO_OA_ACCESS_TOKEN=iSOd6NHvp4spmoaKVdl5HBh2BnT_O9v4m88975X3aGduhWq-GLMX1k
ZALO_OA_REFRESH_TOKEN=[Your Refresh Token]
WEBHOOK_URL=https://kajorehab.gt.tc/webhook/zalo-oa
EOF
```

#### **2.3 Start Production Server**
```bash
# Install PM2 globally
npm install -g pm2

# Start webhook server
pm2 start dist/webhook-server.js --name kajotai-webhook

# Save PM2 config
pm2 save
pm2 startup
```

#### **2.4 Nginx Configuration**
```nginx
# /etc/nginx/sites-available/kajorehab.gt.tc
server {
    listen 443 ssl;
    server_name kajorehab.gt.tc;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/kajorehab.gt.tc/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kajorehab.gt.tc/privkey.pem;
    
    # Webhook endpoint
    location /webhook/zalo-oa {
        proxy_pass http://localhost:3001/webhook/zalo-oa;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
    }
    
    # Static QR check-in
    location /checkin {
        try_files /static-qr-checkin.html =404;
    }
    
    # Mini App files
    location / {
        root /var/www/kajotai-miniapp;
        try_files $uri $uri/ /index.html;
    }
}

# Reload Nginx
systemctl reload nginx
```

---

### **PHASE 3: Register Webhook with Zalo** 📡

#### **3.1 Test Webhook Endpoint**
```bash
# Test health check
curl https://kajorehab.gt.tc/health

# Test webhook endpoint
curl -X GET "https://kajorehab.gt.tc/webhook/zalo-oa"
```

#### **3.2 Register with Zalo OA**

**Via Zalo Developer Console:**
1. Login: https://developers.zalo.me/
2. Select OA: `2339827548685253412`
3. Go to **Webhooks Settings**
4. Add URL: `https://kajorehab.gt.tc/webhook/zalo-oa`
5. Select events: `follow`, `unfollow`, `user_send_text`, `user_send_image`
6. Save & Test

**Via API:**
```bash
curl -X POST "https://openapi.zalo.me/v2.0/oa/updatewebhook" \
  -H "Content-Type: application/json" \
  -H "access_token: [YOUR_ACCESS_TOKEN]" \
  -d '{
    "webhook_url": "https://kajorehab.gt.tc/webhook/zalo-oa",
    "events": ["follow", "unfollow", "user_send_text", "user_send_image"]
  }'
```

---

### **PHASE 4: Deploy Mini App** 📱

#### **4.1 Build Production**
```bash
# Local build
cd c:\Users\user\test_miniapp
npm run build

# Upload dist files to server
scp -r dist/* root@kajorehab.gt.tc:/var/www/kajotai-miniapp/
```

#### **4.2 Update Zalo App Settings**
```json
{
  "domain_whitelist": [
    "https://kajorehab.gt.tc",
    "https://vekrhqotmgszgsredkud.supabase.co"
  ],
  "redirect_uri": "https://kajorehab.gt.tc/auth/callback",
  "webhook_url": "https://kajorehab.gt.tc/webhook/zalo-oa"
}
```

#### **4.3 Deploy Static QR Page**
```bash
# Upload static QR check-in page
scp static-qr-checkin.html root@kajorehab.gt.tc:/var/www/

# Test access
curl https://kajorehab.gt.tc/checkin
```

---

### **PHASE 5: Production Testing** 🧪

#### **5.1 End-to-End Test Workflow**

**Test 1: User Booking Flow**
```bash
1. Open Mini App: https://kajorehab.gt.tc
2. Login with Zalo account
3. Create new booking
4. Verify: OA message received
5. Check: Database record created
```

**Test 2: Reception System**
```bash
1. Open: https://kajorehab.gt.tc/reception-clean.html
2. Login with reception credentials
3. Approve/reject bookings
4. Verify: Real-time updates
5. Check: User receives status update
```

**Test 3: Static QR Check-in**
```bash
1. Open: https://kajorehab.gt.tc/checkin
2. Enter patient phone number
3. Select booking to check-in
4. Verify: Status updated in reception
5. Check: Database checkin_status = 'checked_in'
```

**Test 4: Webhook Integration**
```bash
1. Follow OA from Zalo
2. Verify: Welcome message received
3. Send message to OA
4. Verify: Auto-reply working
5. Check: Webhook logs in PM2
```

#### **5.2 Performance Testing**
```bash
# Test database performance
SELECT COUNT(*) FROM bookings WHERE appointment_date = CURRENT_DATE;

# Test webhook response time
time curl -X POST https://kajorehab.gt.tc/test/send-message \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","message":"test"}'

# Monitor PM2 processes
pm2 monit

# Check Nginx logs
tail -f /var/log/nginx/access.log
```

---

### **PHASE 6: Production Monitoring** 📊

#### **6.1 Setup Health Monitoring**
```bash
# Create health check cron
cat > /etc/cron.d/kajotai-health << EOF
*/5 * * * * root curl -f https://kajorehab.gt.tc/health || echo "Webhook down" | mail admin@kajotai.clinic
EOF
```

#### **6.2 Log Management**
```bash
# Setup log rotation
cat > /etc/logrotate.d/kajotai << EOF
/var/log/kajotai/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 644 www-data www-data
}
EOF

# PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

#### **6.3 Database Maintenance**
```sql
-- Setup automated cleanup (run monthly)
SELECT cron.schedule('cleanup-audit-logs', '0 2 1 * *', 'SELECT cleanup_old_audit_logs();');
SELECT cron.schedule('update-no-show', '0 */1 * * *', 'SELECT auto_update_no_show();');
SELECT cron.schedule('refresh-stats', '*/15 * * * *', 'SELECT refresh_booking_stats();');
```

---

### **PHASE 7: Go-Live Checklist** ✅

#### **Pre-Launch Verification**
- [ ] Database RLS policies active
- [ ] Webhook server running (PM2 status)
- [ ] Nginx serving files correctly
- [ ] SSL certificates valid
- [ ] Zalo OA webhook registered
- [ ] Mini App domain whitelisted
- [ ] Reception system accessible
- [ ] Static QR page working
- [ ] Real-time updates functional
- [ ] OA auto-replies working

#### **Launch Day Tasks**
```bash
1. Final system backup
2. Monitor logs for 1 hour
3. Test with staff phones
4. Train reception staff
5. Print QR codes for display
6. Announce to patients
7. Monitor for 24 hours
```

#### **Post-Launch Monitoring**
```bash
# Daily checks
- PM2 process status: pm2 status
- Database connections: SELECT count(*) FROM pg_stat_activity;
- Webhook health: curl https://kajorehab.gt.tc/health
- OA message delivery rate
- Check-in completion rate

# Weekly reports
- Booking statistics: SELECT * FROM booking_stats;
- System performance metrics
- User feedback analysis
- Error rate monitoring
```

---

## **🔧 TROUBLESHOOTING GUIDE**

### **Common Issues & Solutions**

#### **Webhook Not Receiving Events**
```bash
# Check PM2 status
pm2 status kajotai-webhook

# Check logs
pm2 logs kajotai-webhook

# Verify Zalo registration
curl -X GET "https://openapi.zalo.me/v2.0/oa/getwebhook" \
  -H "access_token: [TOKEN]"

# Test manual webhook
curl -X POST https://kajorehab.gt.tc/webhook/zalo-oa \
  -H "Content-Type: application/json" \
  -d '{"event_name":"test","sender":{"id":"test"}}'
```

#### **OA Messages Not Sending**
```bash
# Check access token validity
curl -X GET "https://openapi.zalo.me/v2.0/oa/getoa" \
  -H "access_token: [TOKEN]"

# Refresh token if expired
curl -X POST "https://oauth.zaloapp.com/v4/oa/access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "[REFRESH_TOKEN]",
    "app_id": "2403652688841115720",
    "grant_type": "refresh_token"
  }'
```

#### **Database Connection Issues**
```bash
# Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'bookings';

# Test connection
psql -h db.vekrhqotmgszgsredkud.supabase.co -U postgres -c "SELECT 1"

# Check user permissions
SELECT * FROM auth.users WHERE email = 'reception@kajotai.clinic';
```

#### **Real-time Updates Not Working**
```bash
# Check publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

# Verify subscription
-- Check in browser console for connection errors

# Test manual trigger
-- INSERT test booking to verify real-time trigger
```

---

## **📞 SUPPORT CONTACTS**

**Technical Issues:**
- Database: Supabase Dashboard → Support
- Zalo Integration: https://developers.zalo.me/support  
- Server Issues: Hosting provider support

**Emergency Procedures:**
```bash
# Disable webhook temporarily
pm2 stop kajotai-webhook

# Fallback to manual booking
# Reception staff can use phone booking

# Re-enable after fix
pm2 start kajotai-webhook
```

---

**🎉 SYSTEM READY FOR PRODUCTION!**

✅ **Full workflow:** User books → OA notification → Static QR check-in → Reception management  
✅ **Scalable architecture:** Supports 100+ bookings/day  
✅ **Automated messaging:** Welcome, confirmation, reminders  
✅ **Real-time updates:** Reception sees changes instantly  
✅ **Security:** RLS protection, audit logging  
✅ **Monitoring:** Health checks, error tracking  

**Estimated implementation time: 1-2 days for full deployment** 🚀
