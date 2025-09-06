-- Add missing columns to bookings table for production
-- This ensures all required columns exist for the application

-- Add created_at if it doesn't exist
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Add confirmed_by if it doesn't exist  
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS confirmed_by TEXT;

-- Add confirmed_at if it doesn't exist
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Add service_type if it doesn't exist
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'Vật lý trị liệu';

-- Add preferred_therapist if it doesn't exist  
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS preferred_therapist TEXT;

-- Add checkin columns if they don't exist
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS checkin_method TEXT DEFAULT 'qr_code';

-- Update existing records to have created_at if null
UPDATE bookings 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_confirmed_at ON bookings(confirmed_at);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;
