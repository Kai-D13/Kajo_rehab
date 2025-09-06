-- KajoTai Mini App Database Schema
-- Production Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create facilities table
CREATE TABLE IF NOT EXISTS facilities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  working_hours JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  specialties TEXT[],
  languages TEXT[],
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  zalo_user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  service_name TEXT NOT NULL DEFAULT 'Vật lý trị liệu, Phục hồi chức năng',
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  symptoms TEXT[],
  notes TEXT,
  qr_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_facility_id ON appointments(facility_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_users_zalo_id ON users(zalo_user_id);

-- Insert sample facilities
INSERT INTO facilities (id, name, address, phone, email, working_hours) VALUES
  ('f1234567-1234-1234-1234-123456789001', 'KajoTai - Cơ sở 1 (Quận 1)', '123 Nguyễn Huệ, Quận 1, TP.HCM', '028-1234-5678', 'cs1@kajotai.vn', 
   '{"monday": {"open": "08:00", "close": "17:00"}, "tuesday": {"open": "08:00", "close": "17:00"}, "wednesday": {"open": "08:00", "close": "17:00"}, "thursday": {"open": "08:00", "close": "17:00"}, "friday": {"open": "08:00", "close": "17:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "sunday": {"closed": true}}'),
  ('f1234567-1234-1234-1234-123456789002', 'KajoTai - Cơ sở 2 (Quận 7)', '456 Nguyễn Thị Thập, Quận 7, TP.HCM', '028-2234-5678', 'cs2@kajotai.vn', 
   '{"monday": {"open": "08:00", "close": "17:00"}, "tuesday": {"open": "08:00", "close": "17:00"}, "wednesday": {"open": "08:00", "close": "17:00"}, "thursday": {"open": "08:00", "close": "17:00"}, "friday": {"open": "08:00", "close": "17:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "sunday": {"closed": true}}'),
  ('f1234567-1234-1234-1234-123456789003', 'KajoTai - Cơ sở 3 (Thủ Đức)', '789 Võ Văn Ngân, Thủ Đức, TP.HCM', '028-3234-5678', 'cs3@kajotai.vn', 
   '{"monday": {"open": "08:00", "close": "17:00"}, "tuesday": {"open": "08:00", "close": "17:00"}, "wednesday": {"open": "08:00", "close": "17:00"}, "thursday": {"open": "08:00", "close": "17:00"}, "friday": {"open": "08:00", "close": "17:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "sunday": {"closed": true}}')
ON CONFLICT (id) DO NOTHING;

-- Insert sample doctors
INSERT INTO doctors (id, facility_id, name, title, specialties, languages) VALUES
  ('d1234567-1234-1234-1234-123456789001', 'f1234567-1234-1234-1234-123456789001', 'BS. Nguyễn Văn A', 'Bác sĩ', ARRAY['Vật lý trị liệu', 'Phục hồi chức năng'], ARRAY['Tiếng Việt', 'English']),
  ('d1234567-1234-1234-1234-123456789002', 'f1234567-1234-1234-1234-123456789001', 'BS. Trần Thị B', 'Bác sĩ chuyên khoa', ARRAY['Thần kinh', 'Cột sống'], ARRAY['Tiếng Việt']),
  ('d1234567-1234-1234-1234-123456789003', 'f1234567-1234-1234-1234-123456789002', 'BS. Lê Văn C', 'Bác sĩ', ARRAY['Vật lý trị liệu', 'Y học cổ truyền'], ARRAY['Tiếng Việt', 'English']),
  ('d1234567-1234-1234-1234-123456789004', 'f1234567-1234-1234-1234-123456789003', 'BS. Phạm Thị D', 'Bác sĩ chuyên khoa II', ARRAY['Phục hồi chức năng', 'Thể thao'], ARRAY['Tiếng Việt'])
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to facilities and doctors
CREATE POLICY "Facilities are publicly readable" ON facilities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Doctors are publicly readable" ON doctors
  FOR SELECT USING (is_active = true);

-- Create policies for user data (users can only access their own data)
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id::text OR zalo_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (zalo_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (zalo_user_id = current_setting('app.current_user_id', true));

-- Create policies for appointments (users can only access their own appointments)
CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE zalo_user_id = current_setting('app.current_user_id', true)));

CREATE POLICY "Users can create appointments" ON appointments
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE zalo_user_id = current_setting('app.current_user_id', true)));

CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE zalo_user_id = current_setting('app.current_user_id', true)));

-- Create function to auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON facilities TO anon;
GRANT SELECT ON doctors TO anon;
GRANT ALL ON users TO anon;
GRANT ALL ON appointments TO anon;
