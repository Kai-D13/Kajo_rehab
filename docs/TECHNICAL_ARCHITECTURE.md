# 🏗️ KajoTai Rehab Clinic - Technical Architecture

## System Components Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           🏥 KajoTai Rehab Clinic System                            │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   📱 CLIENT     │    │  🌐 FRONTEND    │    │  💾 BACKEND     │    │  🔧 SERVICES    │
│   DEVICES       │    │  APPLICATIONS   │    │  INFRASTRUCTURE │    │  & INTEGRATIONS │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
                                
🤳 iOS/Android          📱 Zalo Mini App        🗄️  Supabase DB        📨 Zalo OA
   Zalo App              - React 18            - PostgreSQL           - Notifications
                        - TypeScript           - Real-time            - Deep Links
📧 Web Browser          - Tailwind CSS        - Auth & RLS
   Reception Staff      - ZMP SDK v4.0.1      - Edge Functions       💳 Zalo Pay (Future)
                                                                      - Payment Processing
🖥️  Admin Panel         💻 Reception Web       ⚡ Infrastructure      
   (Future)             - Vanilla JS          - Supabase Cloud       📊 Analytics (Future)
                        - Real-time Sub       - CDN & Caching        - Business Intelligence
                        - Service Role Auth   - SSL/TLS              
                                              - Backup & Recovery     🔐 Security Services
                                                                      - OAuth 2.0
                                                                      - JWT Tokens
                                                                      - Data Encryption
```

## Data Flow Architecture

```
📱 USER INTERACTION FLOW:
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  User Action → Mini App → Validation → API Call → Database → Real-time → Reception  │
└─────────────────────────────────────────────────────────────────────────────────────┘

📊 DETAILED DATA FLOW:

User Opens App
       │
       ▼
┌─────────────────┐     HTTP/HTTPS     ┌─────────────────┐
│ Zalo Mini App   │◄─────────────────►│ Zalo Platform   │
│ (React/TS)      │   OAuth 2.0       │ Authentication  │
└─────────────────┘                   └─────────────────┘
       │                                       │
       │ Authenticated                         │
       ▼                                       │
┌─────────────────┐     REST API      ┌─────────────────┐
│ Booking Form    │─────────────────→│ Form Validation │
│ Components      │                   │ (Client-side)   │
└─────────────────┘                   └─────────────────┘
       │                                       │
       │ Valid Data                            │
       ▼                                       ▼
┌─────────────────┐     HTTPS         ┌─────────────────┐
│ Supabase Client │─────────────────→│ Supabase API    │
│ (Browser)       │   JWT Bearer      │ Gateway         │
└─────────────────┘                   └─────────────────┘
       │                                       │
       │                                       ▼
       │                               ┌─────────────────┐
       │                               │ Row Level       │
       │                               │ Security (RLS)  │
       │                               └─────────────────┘
       │                                       │
       │                                       ▼
       │                               ┌─────────────────┐
       │                               │ PostgreSQL      │
       │                               │ Database        │
       │                               └─────────────────┘
       │                                       │
       │ INSERT Success                        │ Trigger
       │◄─────────────────────────────────────│
       │                                       ▼
       │                               ┌─────────────────┐
       │                               │ Edge Function   │
       │                               │ (Notification)  │
       │                               └─────────────────┘
       │                                       │
       │                                       ▼
       │                               ┌─────────────────┐
       │                               │ Zalo OA API     │
       │                               │ (Push Message)  │
       │                               └─────────────────┘
       │
       ▼
┌─────────────────┐     WebSocket     ┌─────────────────┐
│ Real-time Sub   │◄─────────────────│ Supabase        │
│ (Mini App)      │   Live Updates    │ Realtime        │
└─────────────────┘                   └─────────────────┘
                                             │
                                             ▼
                                     ┌─────────────────┐
                                     │ Reception       │
                                     │ Dashboard       │
                                     │ (Auto Refresh)  │
                                     └─────────────────┘
```

## Security Architecture

```
🛡️ SECURITY LAYERS:

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              SECURITY PERIMETER                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ 🔐 Layer 1: Authentication                                                          │
│    ├── Zalo OAuth 2.0 (User Identity)                                             │
│    ├── JWT Tokens (Session Management)                                            │
│    └── Service Role Keys (Admin Operations)                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ 🛡️  Layer 2: Authorization                                                          │
│    ├── Row Level Security (RLS) Policies                                          │
│    ├── Role-based Access Control (RBAC)                                           │
│    └── API Route Protection                                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ 🔒 Layer 3: Data Protection                                                        │
│    ├── HTTPS/TLS 1.3 (Transport Encryption)                                      │
│    ├── AES-256 (QR Code Encryption)                                               │
│    ├── Environment Variables (Secrets Management)                                 │
│    └── Database Column Encryption (PII Data)                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ 📊 Layer 4: Monitoring & Auditing                                                 │
│    ├── Access Logs (All API Calls)                                                │
│    ├── Error Tracking (Client & Server)                                           │
│    ├── Performance Monitoring                                                     │
│    └── Security Event Alerts                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Database Schema Architecture

```sql
-- 🗄️ DATABASE SCHEMA DESIGN

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          PRODUCTION DATABASE SCHEMA                                │
└─────────────────────────────────────────────────────────────────────────────────────┘

📊 CORE TABLES (Production Ready):

bookings (25+ records) 
├── id: UUID (Primary Key) 
├── customer_name: TEXT NOT NULL
├── phone_number: TEXT NOT NULL  
├── user_id: TEXT (Zalo User ID)
├── appointment_date: DATE NOT NULL
├── appointment_time: TIME NOT NULL
├── symptoms: TEXT
├── detailed_description: TEXT
├── image_urls: TEXT[] (Supabase Storage)
├── video_urls: TEXT[] (Future)
├── booking_status: ENUM (pending, confirmed, cancelled, completed)
├── checkin_status: ENUM (not_arrived, checked_in, no_show)
├── checkin_timestamp: TIMESTAMPTZ
├── qr_code_data: TEXT (AES Encrypted)
├── doctor_id: TEXT (Foreign Key)
├── service_id: TEXT (Service Type)
├── created_via: TEXT ('zalo_miniapp')
├── booking_timestamp: TIMESTAMPTZ DEFAULT NOW()
└── updated_at: TIMESTAMPTZ DEFAULT NOW()

doctors (Sample Data)
├── id: SERIAL (Primary Key)
├── name: TEXT NOT NULL
├── title: TEXT
├── specialties: TEXT[]
├── languages: TEXT[]
├── image: TEXT (URL)
├── is_available: BOOLEAN DEFAULT true
├── available_times: JSONB
└── created_at: TIMESTAMPTZ DEFAULT NOW()

checkin_history (Audit Trail)
├── id: UUID (Primary Key)
├── booking_id: UUID (Foreign Key → bookings.id)
├── user_id: TEXT
├── checkin_timestamp: TIMESTAMPTZ DEFAULT NOW()
├── staff_id: TEXT (Who processed check-in)
├── notes: TEXT
├── location: TEXT ('main_clinic')
└── device_info: JSONB (Check-in device details)

staff (Future Expansion)
├── id: UUID (Primary Key) 
├── name: TEXT NOT NULL
├── role: ENUM (receptionist, nurse, doctor, admin)
├── phone: TEXT
├── email: TEXT
├── is_active: BOOLEAN DEFAULT true
└── created_at: TIMESTAMPTZ DEFAULT NOW()

🔐 SECURITY POLICIES (Row Level Security):

-- Users can only see their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (user_id = auth.uid()::text);

-- Staff can view all bookings with service role
CREATE POLICY "Staff can view all bookings" ON bookings  
  FOR ALL USING (auth.role() = 'service_role');

-- Only authenticated users can insert bookings
CREATE POLICY "Authenticated users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

📊 INDEXES (Performance Optimization):

-- Primary lookups
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_appointment_date ON bookings(appointment_date);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_checkin ON bookings(checkin_status);

-- Compound indexes for common queries
CREATE INDEX idx_bookings_date_doctor ON bookings(appointment_date, doctor_id);
CREATE INDEX idx_bookings_user_status ON bookings(user_id, booking_status);
```

## Deployment Architecture

```
🚀 DEPLOYMENT PIPELINE:

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           PRODUCTION DEPLOYMENT                                    │
└─────────────────────────────────────────────────────────────────────────────────────┘

🔧 DEVELOPMENT ENVIRONMENT:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Local Dev       │    │ Staging         │    │ Production      │
│                 │    │                 │    │                 │
│ zmp start       │───▶│ zmp build       │───▶│ zmp deploy      │
│ Port 8081       │    │ Vite Build      │    │ Zalo Platform   │
│                 │    │                 │    │                 │
│ Hot Reload      │    │ Test Build      │    │ CDN Optimized   │
│ Source Maps     │    │ Performance     │    │ Minified        │
│ Debug Mode      │    │ Testing         │    │ Production      │
└─────────────────┘    └─────────────────┘    └─────────────────┘

💾 DATABASE ENVIRONMENTS:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Local SQLite    │    │ Staging DB      │    │ Production DB   │
│ (Development)   │    │ (Supabase)      │    │ (Supabase)      │
│                 │    │                 │    │                 │
│ Seed Data       │───▶│ Test Data       │───▶│ Real Bookings   │
│ No Auth         │    │ Full Auth       │    │ 25+ Records     │
│ Fast Iteration  │    │ Real-time Test  │    │ 24/7 Uptime     │
└─────────────────┘    └─────────────────┘    └─────────────────┘

🌐 HOSTING & CDN:
Mini App Frontend → Zalo Platform CDN
Reception System → GitHub Pages / Netlify
Static Assets → Supabase Storage
Database → Supabase Cloud (AWS)
Real-time → WebSocket (wss://)
```

---

**🏥 Complete technical architecture for KajoTai Rehab Clinic system - Ready for partnership and scaling!** 🚀
