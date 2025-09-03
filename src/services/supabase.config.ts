// Supabase Configuration for Kajo Mini App
import { createClient } from '@supabase/supabase-js';

// Production Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vekrhqotmgszgsredkud.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla3JocW90bWdzemdzacmVka3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDM4NDM2MDAsImV4cCI6MjAxOTQxOTYwMH0.RLy8tAm-ZurkHtO8Z0-oHb1q1Y7_qJqB_ZqKsUOZo8s';

// Create single global instance to avoid multiple GoTrueClient warning
let _supabaseInstance: any = null;

export const supabase = _supabaseInstance || (_supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
}));

console.log('🔧 Supabase client initialized (single instance)');
// Database Types - REAL SUPABASE SCHEMA
export interface User {
  id: string;
  zalo_id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  created_at: string;
}

export interface Staff {
  id: string;
  zalo_id: string;
  name: string;
  role: 'reception' | 'admin' | 'doctor';
  phone_number?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
}

// REAL Bookings Table Structure from Supabase
export interface Booking {
  id: string;
  customer_name: string;
  phone_number: string;
  user_id: string;
  appointment_date: string; // date
  appointment_time: string; // time without timezone
  symptoms?: string;
  detailed_description?: string;
  image_urls?: string[]; // ARRAY
  video_urls?: string[]; // ARRAY
  booking_timestamp: string; // timestamptz
  updated_at: string; // timestamptz
  booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  checkin_status: 'not_checked' | 'checked_in' | 'completed';
  checkin_timestamp?: string; // timestamptz
  qr_code_data?: string;
  doctor_id?: string;
  service_id?: string;
  clinic_location?: string;
  created_via: string;
  created_at: string; // timestamptz
  confirmed_by?: string;
  confirmed_at?: string; // timestamptz
  service_type?: string;
  preferred_therapist?: string;
}

// Checkin History Table
export interface CheckinHistory {
  id: string;
  booking_id: string;
  checkin_timestamp: string; // timestamptz
  checkin_method: 'qr_scan' | 'phone_lookup' | 'manual';
  reception_staff_id?: string;
  notes?: string;
}

// For backward compatibility
export interface Appointment extends Booking {
  // Legacy fields mapping
  status: Booking['booking_status'];
  qr_code?: string; // mapped from qr_code_data
}

// Database Schema SQL for reference
export const DATABASE_SCHEMA = `
-- Users table (patients)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zalo_id VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  phone VARCHAR,
  email VARCHAR,
  avatar VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Staff table (employees)
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zalo_id VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL CHECK (role IN ('reception', 'admin', 'doctor')),
  clinic_id UUID,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  doctor_id UUID,
  service_id UUID,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status VARCHAR DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'arrived', 'completed', 'cancelled')),
  qr_code TEXT,
  qr_expires_at TIMESTAMP,
  notes TEXT,
  checked_in_at TIMESTAMP,
  checked_in_by UUID REFERENCES staff(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Check-ins table (audit trail)
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id),
  staff_id UUID REFERENCES staff(id),
  checked_in_at TIMESTAMP DEFAULT NOW(),
  qr_data JSONB,
  notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_users_zalo_id ON users(zalo_id);
CREATE INDEX idx_staff_zalo_id ON staff(zalo_id);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, appointment_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_check_ins_appointment_id ON check_ins(appointment_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (customize based on requirements)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = zalo_id);
CREATE POLICY "Staff can view all appointments" ON appointments FOR SELECT TO authenticated;
CREATE POLICY "Users can view own appointments" ON appointments FOR SELECT USING (user_id IN (SELECT id FROM users WHERE zalo_id = auth.uid()::text));
`;
