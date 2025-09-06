# 🏊 ENHANCED SWIMLANE WORKFLOW ANALYSIS

## 📋 **CURRENT WORKFLOW REVIEW**

### ✅ **Strengths:**
- Clear separation of responsibilities between components
- Proper real-time synchronization flow
- Comprehensive database schema
- QR-based check-in system

### ⚠️ **Areas needing enhancement:**

#### 1. **Authentication Flow** (Cần chi tiết hơn)
```
Current: Login (Zalo OA) → OAuth2 → get user profile
Enhanced: Login → Zalo OAuth → Permission Request → Profile Sync → Mini App Session
```

#### 2. **Booking Confirmation Process** (Thiếu bước trung gian)
```
Current: Insert booking → Lễ tân xác nhận
Enhanced: Insert booking → Auto-validation → Staff notification → Manual confirm/reject
```

#### 3. **Check-in Process** (Cần backup method)
```
Current: QR scan only
Enhanced: QR scan + Phone number fallback + Staff manual check-in
```

## 🔧 **ENHANCED WORKFLOW DIAGRAM**

```
+-----------------+        +-----------------+        +------------------+        +-------------------+        +------------------+
|     User        |        |   Zalo MiniApp  |        |    Supabase DB   |        |   Reception App   |        |    Zalo OA       |
+-----------------+        +-----------------+        +------------------+        +-------------------+        +------------------+

   Mở Mini App
        │
        ▼
+------------------+
| Zalo OAuth Login |
+------------------+
        │  ← Request permissions: profile, phone
        ▼
                   ┌─────────────────────────────────────────────┐
                   │ Sync user data to Supabase users table     │
                   │ (zalo_id, name, phone, avatar)             │
                   └─────────────────────────────────────────────┘
                               │
                               ▼
                   ┌─────────────────────────────────────────────┐
                   │    Booking Interface                        │
                   │ (Service → Doctor → Date → Time → Symptoms) │
                   └─────────────────────────────────────────────┘
                               │
                               ▼
                [Conflict Check + Slot Reservation API]
                               │
                               ▼
                       +------------------+
                       | Insert booking   |
                       | (status=pending) |
                       | (qr_code=generated)|
                       +------------------+
                               │
                               ▼
               ┌───────────────────────────────────────┐
               │ Real-time notification to Reception   │
               │ + Zalo OA confirmation message        │
               └───────────────────────────────────────┘
                               │                               │
                               ▼                               ▼
                     +---------------------+         +-------------------+
                     | Reception: Review   |         | User: Receives   |
                     | booking + approve   |         | Zalo OA message   |
                     +---------------------+         +-------------------+
                               │                               │
                               ▼                               │
             [Auto-confirm after 10min OR Manual confirm]     │
                               │                               │
                               ▼                               │
                    +------------------------------+           │
                    | Update status=confirmed      |           │
                    | Send Zalo OA confirmation    | ─────────┘
                    +------------------------------+
                               │
                               ▼
─────────────────────── CHECK-IN PROCESS ───────────────────────
                               │
   User arrives → Scan QR code at clinic OR Enter phone number
                               │
                               ▼
                [Mini App check-in page with booking lookup]
                               │
                               ▼
                       +--------------------------+
                       | Update booking record    |
                       | checkin_status=checked   |
                       | checkin_timestamp=NOW()  |
                       +--------------------------+
                               │
                               ▼
               ┌───────────────────────────────────────┐
               │ Reception Dashboard: Real-time update │
               │ Patient queue management              │
               └───────────────────────────────────────┘
```

## 🎯 **CRITICAL INFORMATION NEEDED FOR IMPLEMENTATION**

### 1. **ZALO ECOSYSTEM INTEGRATION**
Please provide:
- **Zalo Mini App ID** (App ID từ Zalo Developer Console)
- **Zalo OA ID** và **OA Access Token** (để gửi notifications)
- **OAuth Redirect URL** (callback URL sau khi login)
- **Zalo Developer Account** credentials

### 2. **SUPABASE CONFIGURATION**
Please provide:
- **Supabase Project URL**
- **Supabase Anon Key** 
- **Supabase Service Role Key** (cho backend operations)
- **Database connection** access (nếu cần custom functions)

### 3. **DEPLOYMENT INFORMATION**
Please provide:
- **Domain name** cho Mini App hosting
- **SSL certificate** requirements
- **CDN** preferences (nếu có)

## 🛠 **ENHANCED TECHNICAL SPECIFICATIONS**

### **Database Schema Enhancement:**
```sql
-- Enhanced users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zalo_user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'patient' CHECK (role IN ('patient', 'reception', 'doctor', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Enhanced bookings table  
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  booking_code TEXT UNIQUE NOT NULL, -- For phone lookup
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  symptoms TEXT[],
  description TEXT,
  attachments JSONB, -- {images: [...], videos: [...]}
  
  -- Booking status workflow
  booking_status TEXT DEFAULT 'pending' 
    CHECK (booking_status IN ('pending', 'confirmed', 'completed', 'user_cancelled', 'system_cancelled')),
    
  -- Check-in workflow  
  checkin_status TEXT DEFAULT 'not_checked'
    CHECK (checkin_status IN ('not_checked', 'checked_in', 'completed', 'no_show')),
    
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  checkin_timestamp TIMESTAMP,
  
  -- QR and notifications
  qr_code_data TEXT UNIQUE,
  notification_sent BOOLEAN DEFAULT false,
  
  UNIQUE(doctor_id, appointment_date, appointment_time)
);

-- Booking status history for audit trail
CREATE TABLE booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  old_status TEXT,
  new_status TEXT,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW(),
  reason TEXT
);
```

### **API Endpoints Structure:**
```typescript
// Mini App API endpoints needed:
interface APIEndpoints {
  // Authentication
  POST: "/api/auth/zalo-login",     // OAuth callback
  GET:  "/api/auth/profile",        // Get user profile
  
  // Booking management  
  POST: "/api/bookings/create",     // Create new booking
  GET:  "/api/bookings/user/:id",   // Get user bookings
  PUT:  "/api/bookings/:id/cancel", // Cancel booking
  
  // Check-in process
  POST: "/api/checkin/qr-scan",     // Process QR check-in
  POST: "/api/checkin/phone",       // Phone number check-in
  GET:  "/api/checkin/status/:id",  // Check booking status
  
  // Reception webapp
  GET:  "/api/reception/queue",     // Current patient queue
  POST: "/api/reception/confirm",   // Confirm booking
  POST: "/api/reception/checkin",   // Manual check-in
  
  // Notifications
  POST: "/api/notifications/send",  // Send Zalo OA message
}
```

## 🚀 **IMMEDIATE NEXT STEPS**

### Step 1: **Setup Zalo Integration** 
```typescript
// Cần implement Zalo OAuth service
export class ZaloAuthService {
  static async login(): Promise<ZaloUser> {
    // Implement Zalo OAuth flow
    // Request permissions: profile, phone
    // Store user data to Supabase
  }
  
  static async sendOAMessage(userId: string, message: string) {
    // Send confirmation via Zalo OA
  }
}
```

### Step 2: **Enhanced Booking Service**
```typescript  
// Update BookingServiceV2 with new workflow
export class EnhancedBookingService {
  static async createBookingWithConfirmation(data: BookingData) {
    // 1. Validate time slot
    // 2. Reserve slot (5 min lock)
    // 3. Create booking (pending status)
    // 4. Generate unique QR code
    // 5. Notify reception + send Zalo OA
    // 6. Auto-confirm after 10 minutes if no conflicts
  }
}
```

### Step 3: **Reception Dashboard Implementation**
```typescript
// Create reception webapp
export const ReceptionDashboard = () => {
  // Real-time booking list
  // QR scanner integration  
  // Manual booking confirmation
  // Patient queue management
}
```

## 📝 **REQUIRED INFORMATION REQUEST**

To proceed with implementation, please provide:

1. **Zalo Developer Console Access:**
   - Mini App ID và Secret Key
   - OA ID và Access Token  
   - OAuth redirect URLs

2. **Supabase Project Details:**
   - Project URL và API Keys
   - Database access permissions

3. **Business Requirements:**
   - Clinic working hours
   - Appointment duration (15min? 30min?)  
   - Auto-cancellation timeframe
   - Staff roles và permissions

4. **Testing Environment:**
   - Test Zalo accounts
   - Development domain names
   - Staging database setup

Với những thông tin này, chúng ta có thể bắt đầu implement và test toàn bộ workflow một cách có hệ thống! 🏥✨
