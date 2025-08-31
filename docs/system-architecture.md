# KajoTai System Architecture v2.0

## Overview
QR Code-based check-in system with auto-confirmation booking flow.

## Components

### 1. Zalo Mini App (Frontend)
- User registration/authentication
- Booking with conflict detection  
- Auto-confirmation
- QR Code display
- Appointment management

### 2. Reception System (Web App)
- QR Code scanner (camera integration)
- Patient information display
- Check-in confirmation
- Queue management

### 3. Backend API (Node.js + Express)
- Booking management
- Conflict detection algorithm
- QR Code generation
- Real-time updates
- Reception endpoints

### 4. Database (Supabase)
- Users table
- Appointments table
- Doctors table  
- QR Codes table
- Check-ins table

## Data Flow

### Booking Flow:
```
User Input → Conflict Check → Auto Confirm → Generate QR → Save to DB
```

### Check-in Flow:
```
QR Scan → Decode → Lookup Appointment → Display Info → Confirm Check-in
```

## Security
- QR codes expire after appointment time
- Reception system authentication
- Rate limiting for API calls
- Input validation and sanitization
