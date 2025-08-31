// Supabase Configuration for Kajo Mini App
import { createClient } from '@supabase/supabase-js';

// Production Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vekrhqotmgszgsredkud.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla3JocW90bWdzemdzacmVka3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDM4NDM2MDAsImV4cCI6MjAxOTQxOTYwMH0.RLy8tAm-ZurkHtO8Z0-oHb1q1Y7_qJqB_ZqKsUOZo8s';

// Create single instance to avoid multiple GoTrueClient warning
let supabaseInstance: any = null;

export const supabase = supabaseInstance || (supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  realtime: {
    channels: {}
  }
}));

// Database Types
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
  clinic_id?: string;
  active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  patient_id?: string; // For backwards compatibility
  doctor_id?: string;
  doctor_name?: string; // Added for display
  service_id?: string;
  service_name?: string; // Added for display
  facility_id?: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes?: number;
  status: 'pending' | 'confirmed' | 'arrived' | 'completed' | 'cancelled';
  symptoms?: string; // Added for medical details
  description?: string; // Added for detailed notes
  qr_code?: string;
  qr_expires_at?: string;
  notes?: string;
  checked_in_at?: string;
  checked_in_by?: string;
  created_at: string;
  updated_at?: string;
  
  // Relations
  user?: User;
  doctor?: any;
  service?: any;
}

export interface CheckIn {
  id: string;
  appointment_id: string;
  staff_id: string;
  checked_in_at: string;
  qr_data?: any;
  notes?: string;
  
  // Relations
  appointment?: Appointment;
  staff?: Staff;
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
