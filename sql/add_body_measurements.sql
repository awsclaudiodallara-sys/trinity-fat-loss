-- Add body measurements for Navy body fat calculation
-- These measurements are needed for accurate body composition analysis

-- Add body measurement columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS neck_circumference NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS waist_circumference NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS hip_circumference NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS gender VARCHAR(10),
ADD COLUMN IF NOT EXISTS current_weight NUMERIC(5,2);

-- Add comments to explain the columns
COMMENT ON COLUMN users.neck_circumference IS 'Neck circumference in centimeters for Navy body fat calculation';
COMMENT ON COLUMN users.waist_circumference IS 'Waist circumference in centimeters for Navy body fat calculation';
COMMENT ON COLUMN users.hip_circumference IS 'Hip circumference in centimeters for Navy body fat calculation (females only)';
COMMENT ON COLUMN users.gender IS 'User gender (male/female) for body fat calculations';
COMMENT ON COLUMN users.current_weight IS 'Current weight in kilograms';

-- Add constraints for reasonable values
ALTER TABLE users 
ADD CONSTRAINT neck_circumference_check 
CHECK (neck_circumference IS NULL OR (neck_circumference >= 25 AND neck_circumference <= 60));

ALTER TABLE users 
ADD CONSTRAINT waist_circumference_check 
CHECK (waist_circumference IS NULL OR (waist_circumference >= 50 AND waist_circumference <= 200));

ALTER TABLE users 
ADD CONSTRAINT hip_circumference_check 
CHECK (hip_circumference IS NULL OR (hip_circumference >= 70 AND hip_circumference <= 200));

ALTER TABLE users 
ADD CONSTRAINT gender_check 
CHECK (gender IS NULL OR gender IN ('male', 'female'));

ALTER TABLE users 
ADD CONSTRAINT current_weight_check 
CHECK (current_weight IS NULL OR (current_weight >= 30 AND current_weight <= 300));

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);
CREATE INDEX IF NOT EXISTS idx_users_measurements ON users(neck_circumference, waist_circumference, hip_circumference) 
WHERE neck_circumference IS NOT NULL AND waist_circumference IS NOT NULL;

-- Create a view for body composition calculations
CREATE OR REPLACE VIEW user_body_composition AS
SELECT 
  u.id,
  u.name,
  u.age,
  u.height,
  u.current_weight,
  u.gender,
  u.neck_circumference,
  u.waist_circumference,
  u.hip_circumference,
  CASE 
    WHEN u.current_weight IS NOT NULL AND u.height IS NOT NULL THEN
      ROUND((u.current_weight / POWER(u.height / 100.0, 2))::NUMERIC, 1)
    ELSE NULL
  END AS bmi,
  CASE 
    WHEN u.neck_circumference IS NOT NULL 
     AND u.waist_circumference IS NOT NULL 
     AND u.height IS NOT NULL 
     AND u.current_weight IS NOT NULL
     AND u.gender IS NOT NULL
     AND (u.gender = 'male' OR (u.gender = 'female' AND u.hip_circumference IS NOT NULL))
    THEN true
    ELSE false
  END as has_complete_measurements
FROM users u;

-- Grant access to the view
GRANT SELECT ON user_body_composition TO anon, authenticated;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default, check_clause
FROM information_schema.columns c
LEFT JOIN information_schema.check_constraints cc ON cc.constraint_name LIKE '%' || c.column_name || '%'
WHERE c.table_name = 'users' 
AND c.column_name IN ('neck_circumference', 'waist_circumference', 'hip_circumference', 'gender', 'current_weight')
ORDER BY c.ordinal_position;
