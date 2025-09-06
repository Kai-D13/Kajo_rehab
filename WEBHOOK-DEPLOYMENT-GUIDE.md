# 🚀 HƯỚNG DẪN DEPLOY WEBHOOK CHO ZALO OA
## KajoTai Rehab Clinic - Domain: kajorehab.gt.tc

---

## **📋 CHECKLIST TRƯỚC KHI DEPLOY**

### ✅ **Environment Variables**
```bash
NODE_ENV=production
PORT=3001
ZALO_OA_ID=2339827548685253412
ZALO_OA_APP_SECRET=1Yb5YMVFGwGB7J7mSR9C
ZALO_OA_ACCESS_TOKEN=[Token từ Zalo]
ZALO_OA_REFRESH_TOKEN=[Refresh token từ Zalo]
WEBHOOK_URL=https://kajorehab.gt.tc/webhook/zalo-oa
```

### ✅ **Files cần upload lên server**
- `webhook-server.ts` - Main webhook handler
- `webhook-package.json` - Dependencies
- `.env` - Environment variables

---

## **🔧 BƯỚC 1: Setup Server trên kajorehab.gt.tc**

### **1.1 Kết nối SSH vào server**
```bash
ssh username@kajorehab.gt.tc
# Hoặc sử dụng hosting panel
```

### **1.2 Tạo thư mục webhook**
```bash
mkdir -p /var/www/kajotai-webhook
cd /var/www/kajotai-webhook
```

### **1.3 Upload files**
```bash
# Upload webhook-server.ts
# Upload webhook-package.json (rename thành package.json)
# Upload .env file
```

### **1.4 Install dependencies**
```bash
npm install
# hoặc
yarn install
```

---

## **🚀 BƯỚC 2: Deploy Webhook Server**

### **2.1 Build TypeScript**
```bash
npm run build
```

### **2.2 Test locally**
```bash
npm run dev
# Kiểm tra http://localhost:3001/health
```

### **2.3 Start production**
```bash
npm start
# hoặc sử dụng PM2
pm2 start dist/webhook-server.js --name kajotai-webhook
```

---

## **🔗 BƯỚC 3: Cấu hình Domain & SSL**

### **3.1 Nginx Configuration** 
Thêm vào `/etc/nginx/sites-available/kajorehab.gt.tc`:

```nginx
server {
    listen 443 ssl;
    server_name kajorehab.gt.tc;
    
    # SSL certificates
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    
    # Webhook endpoint
    location /webhook/zalo-oa {
        proxy_pass http://localhost:3001/webhook/zalo-oa;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
    }
    
    # Static files cho Mini App (nếu cần)
    location / {
        root /var/www/kajotai-miniapp;
        try_files $uri $uri/ /index.html;
    }
}
```

### **3.2 Restart Nginx**
```bash
sudo systemctl reload nginx
```

---

## **🔧 BƯỚC 4: Đăng ký Webhook với Zalo**

### **4.1 Test webhook endpoint**
```bash
curl -X GET https://kajorehab.gt.tc/health
# Response: {"status":"healthy","service":"KajoTai Rehab Webhook",...}

curl -X GET "https://kajorehab.gt.tc/webhook/zalo-oa"
# Response: {"message":"KajoTai Rehab OA Webhook is running",...}
```

### **4.2 Đăng ký webhook với Zalo OA**

**Option A: Qua Zalo Developer Console**
1. Đăng nhập https://developers.zalo.me/
2. Chọn Official Account: `2339827548685253412`
3. Vào **Webhooks Settings**
4. Thêm URL: `https://kajorehab.gt.tc/webhook/zalo-oa`
5. Chọn events: `follow`, `unfollow`, `user_send_text`, `user_send_image`
6. Save & Test

**Option B: Qua API**
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

## **🧪 BƯỚC 5: Test Integration**

### **5.1 Test webhook manually**
```bash
curl -X POST https://kajorehab.gt.tc/test/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "[TEST_USER_ID]",
    "message": "Test message từ webhook server"
  }'
```

### **5.2 Test follow event**
- Follow OA KajoTai từ Zalo
- Check logs xem có nhận event không
- Kiểm tra welcome message

### **5.3 Test booking integration**
- Tạo booking mới từ Mini App
- Kiểm tra OA message được gửi
- Verify logs

---

## **📊 BƯỚC 6: Monitoring & Logs**

### **6.1 Setup PM2 monitoring**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

pm2 logs kajotai-webhook
```

### **6.2 Health check monitoring**
Cron job kiểm tra health:
```bash
# /etc/cron.d/kajotai-health-check
*/5 * * * * curl -f https://kajorehab.gt.tc/health || echo "Webhook down"
```

### **6.3 Log analysis**
```bash
# Real-time logs
tail -f /var/log/nginx/access.log | grep webhook

# Webhook server logs
pm2 logs kajotai-webhook --lines 100
```

---

## **⚡ BƯỚC 7: Performance Optimization**

### **7.1 PM2 Cluster Mode**
```bash
pm2 start dist/webhook-server.js --name kajotai-webhook -i max
pm2 save
pm2 startup
```

### **7.2 Rate limiting**
Thêm vào Nginx config:
```nginx
location /webhook/zalo-oa {
    limit_req zone=webhook burst=10 nodelay;
    # ... existing proxy config
}

# Thêm vào http block
limit_req_zone $binary_remote_addr zone=webhook:10m rate=100r/m;
```

---

## **🔒 BƯỚC 8: Security Hardening**

### **8.1 Firewall rules**
```bash
# Chỉ cho phép HTTPS traffic
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

### **8.2 Nginx security headers**
```nginx
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
```

---

## **📱 BƯỚC 9: Integration Test với Mini App**

### **9.1 Update Mini App config**
Đảm bảo Mini App pointing đến production:
```js
// src/services/zalo-oa-enhanced.service.ts
const config = {
  oaId: '2339827548685253412',
  webhookUrl: 'https://kajorehab.gt.tc/webhook/zalo-oa'
};
```

### **9.2 End-to-end test**
1. User đặt lịch từ Mini App
2. Booking được tạo trong database
3. OA message được gửi tự động
4. User nhận được confirmation

---

## **🎯 CHECKPOINT CUỐI CÙNG**

✅ **Webhook server running** - `https://kajorehab.gt.tc/health`  
✅ **Zalo OA đã connect** - Follow/unfollow test  
✅ **Booking integration** - Tạo booking → Nhận OA message  
✅ **Auto-reply working** - Chat với OA  
✅ **Logs monitoring** - PM2 logs clear  
✅ **SSL certificate** - HTTPS working  

---

## **📞 TROUBLESHOOTING**

### **Webhook không nhận events:**
- Kiểm tra URL đăng ký với Zalo
- Verify SSL certificate
- Check firewall rules

### **OA message không gửi được:**
- Verify access token còn hạn
- Check API rate limits
- Kiểm tra user đã follow OA chưa

### **Server down:**
```bash
pm2 restart kajotai-webhook
systemctl reload nginx
```

---

**🏥 KajoTai Rehab Clinic Webhook - Ready for Production! 🚀**
