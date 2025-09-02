# 🔧 TROUBLESHOOTING ZMP START PERMISSION ISSUE

## 🚨 VẤN ĐỀ HIỆN TẠI:
```
Error: listen EACCES: permission denied ::1:3000
```

## 🛠️ CÁC CÁCH FIX:

### **Option 1: Run as Administrator**
1. Mở PowerShell **as Administrator**
2. `cd C:\Users\user\test_miniapp`
3. `npm start`

### **Option 2: Disable IPv6 for localhost**
```powershell
# Trong PowerShell as Admin:
netsh interface ipv6 set global randomizeidentifiers=disabled
netsh interface ipv6 set privacy state=disabled
```

### **Option 3: Use different port**
```powershell
# Check zmp-cli.json để thay đổi port:
# hoặc set environment variable
$env:PORT=3001; npm start
```

### **Option 4: Kill existing processes**
```powershell
# Kill any node processes
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force

# Kill processes using port 3000
netstat -ano | findstr :3000
# Sau đó: taskkill /PID [PID_NUMBER] /F
```

### **Option 5: Use Zalo Mini App Simulator**
1. Install Zalo app trên phone
2. Enable Developer Mode
3. Scan QR code từ zmp deploy

---

## ⚡ IMMEDIATE ACTIONS:
1. **DEPLOY DATABASE FIRST** ✅ (Can do without zmp start)  
2. **TEST DATABASE CONNECTION** ✅ (Using database-test.html)
3. **GET OA ACCESS TOKEN** ✅ (Can do without zmp start)
4. **FIX zmp start** (Try run as Administrator)
