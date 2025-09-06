-- Fix RLS policies for checkin_history table
-- This allows anonymous read access for testing

-- Drop existing policy if exists  
DROP POLICY IF EXISTS checkin_history_policy ON checkin_history;

-- Create permissive policy for testing
CREATE POLICY checkin_history_policy ON checkin_history FOR ALL
USING (true) 
WITH CHECK (true);

-- Also ensure bookings table has proper permissions
DROP POLICY IF EXISTS bookings_policy ON bookings;
CREATE POLICY bookings_policy ON bookings FOR ALL  
USING (true)
WITH CHECK (true);

-- Ensure staff table permissions
DROP POLICY IF EXISTS staff_policy ON staff;
CREATE POLICY staff_policy ON staff FOR ALL
USING (true) 
WITH CHECK (true);
