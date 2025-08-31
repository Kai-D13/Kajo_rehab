# 🏥 Kajo Rehab - End-to-End Integration Architecture

## 📋 **Current Status & Issues Analysis**

### **Console Logs Analysis:**
- ✅ Booking creation working: appointments created with real user_id
- ✅ QR generation working: QR codes generated successfully  
- ✅ Data persistence working: 7 appointments in Zalo storage
- ❌ Navigation issues: Success page routing problems
- ❌ Schedule page not showing new bookings: Using wrong user_id

## 🎯 **Proposed End-to-End Architecture**

### **Phase 1: Current Implementation (Working)**
```
User Mini App (Zalo) → BookingServiceV2 → MockDatabaseService → Zalo Native Storage
```

### **Phase 2: Production Backend (Recommended)**
```
User Mini App → API Gateway → Supabase → Reception Mini App → Zalo OA
```

## 🔧 **Technical Implementation Plan**

### **1. Backend API Layer**
```typescript
// API Endpoints Structure
POST   /api/bookings           // Create new booking
GET    /api/bookings           // Get bookings (with filters)
PATCH  /api/bookings/:id       // Update booking status
GET    /api/bookings/:id       // Get specific booking
DELETE /api/bookings/:id       // Cancel booking

// Authentication
POST   /api/auth/zalo          // Authenticate with Zalo
GET    /api/auth/me            // Get current user
```

### **2. Database Schema (Supabase)**
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zalo_user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings table  
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  doctor_id TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  facility_id TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  symptoms TEXT,
  description TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  qr_code TEXT,
  qr_expires_at TIMESTAMP,
  checked_in_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
```

### **3. Realtime Integration**
```typescript
// Reception App - Listen for booking updates
supabase
  .channel('bookings-channel')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'bookings'
  }, (payload) => {
    console.log('📡 Booking update:', payload);
    // Update UI immediately
    refreshBookingsList();
  })
  .subscribe();
```

### **4. Zalo OA Integration**
```typescript
// Webhook for OA notifications
POST /api/webhook/zalo-oa

// Send notification when status changes
const sendOANotification = async (booking: Booking) => {
  const message = {
    recipient: { user_id: booking.user_id },
    message: {
      text: `🏥 Lịch hẹn của bạn đã được xác nhận!\n📅 ${booking.appointment_date}\n⏰ ${booking.appointment_time}\n👨‍⚕️ ${booking.doctor_name}`
    }
  };
  
  await zaloOAApi.sendMessage(message);
};
```

## 🚀 **Implementation Steps**

### **Immediate Fixes (Localhost Testing)**
1. ✅ Fix TypeScript interface issues
2. ✅ Fix schedule page user_id  
3. 🔄 Fix navigation routing
4. 🔄 Test complete booking flow

### **Short-term (Next 1-2 days)**
1. Create proper API layer with Express.js/Fastify
2. Migrate from MockDatabaseService to real Supabase
3. Implement Realtime subscriptions
4. Create Reception Mini App

### **Long-term (Next week)**
1. Implement Zalo OA integration
2. Add webhook system
3. Deploy full production architecture
4. Add monitoring and analytics

## ⚠️ **Current Blocking Issues**

### **Critical Issues to Fix Now:**
1. **Navigation not working**: Button clicks don't navigate
2. **Success page route**: 404 errors after booking
3. **Schedule page empty**: Not showing new appointments

### **Root Cause Analysis:**
- Router configuration conflicts
- Success page import/path issues  
- User_id mismatch in schedule page
- Possible React strict mode double-rendering

## 💡 **Recommended Immediate Actions**

1. **Fix Router Issues** (Priority 1)
2. **Fix Success Page Navigation** (Priority 1)  
3. **Fix Schedule Data Loading** (Priority 1)
4. **Test Complete Flow on Localhost** (Priority 2)
5. **Plan Backend API Migration** (Priority 3)

## 🎯 **Success Metrics**

### **Phase 1 Success (Localhost):**
- [ ] Click "Đặt lịch mới" → Navigate to booking form
- [ ] Complete booking form → Navigate to success page  
- [ ] Success page shows complete booking details + QR
- [ ] Schedule page shows new appointments
- [ ] QR codes work correctly

### **Phase 2 Success (Production Backend):**
- [ ] API endpoints respond correctly
- [ ] Supabase data persistence
- [ ] Reception app real-time updates
- [ ] Zalo OA notifications working

---

**Next Action**: Fix localhost navigation issues first, then migrate to production backend architecture.
