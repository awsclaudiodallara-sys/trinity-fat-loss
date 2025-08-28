-- Add height column to users table
-- This script adds the height field to track user height in centimeters

-- Add height column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS height INTEGER;

-- Add comment to explain the column
COMMENT ON COLUMN users.height IS 'User height in centimeters (cm)';

-- Update existing users with a default height of 170cm (average height)
-- This is a safe default that won't break existing functionality
UPDATE users 
SET height = 170 
WHERE height IS NULL;

-- Add a constraint to ensure reasonable height values (140cm to 220cm)
ALTER TABLE users 
ADD CONSTRAINT height_range_check 
CHECK (height IS NULL OR (height >= 140 AND height <= 220));

-- Create an index on height for faster matching queries
CREATE INDEX IF NOT EXISTS idx_users_height ON users(height);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'height';
