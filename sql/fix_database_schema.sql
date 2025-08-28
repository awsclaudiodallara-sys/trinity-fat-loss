-- Fix database schema by adding missing Navy measurement columns
-- This script addresses the 400/406 errors by adding required columns to users table

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female')),
ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2) CHECK (weight > 0 AND weight <= 999.99),
ADD COLUMN IF NOT EXISTS height DECIMAL(5,2) CHECK (height > 0 AND height <= 999.99),
ADD COLUMN IF NOT EXISTS neckCircumference DECIMAL(5,2) CHECK (neckCircumference > 0 AND neckCircumference <= 99.99),
ADD COLUMN IF NOT EXISTS waistCircumference DECIMAL(5,2) CHECK (waistCircumference > 0 AND waistCircumference <= 999.99),
ADD COLUMN IF NOT EXISTS hipCircumference DECIMAL(5,2) CHECK (hipCircumference > 0 AND hipCircumference <= 999.99);

-- Reset matching queue to fix position calculation
DELETE FROM matching_queue;

-- Add indexes for better performance on Navy measurement queries
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);
CREATE INDEX IF NOT EXISTS idx_users_weight ON users(weight);
CREATE INDEX IF NOT EXISTS idx_users_navy_measurements ON users(neckCircumference, waistCircumference, hipCircumference);

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Verify the schema update
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('gender', 'weight', 'height', 'neckCircumference', 'waistCircumference', 'hipCircumference')
ORDER BY column_name;
