-- Create table for storing body measurements history
-- This allows tracking changes in body composition over time

CREATE TABLE IF NOT EXISTS user_body_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight NUMERIC(5,2) NOT NULL CHECK (weight >= 30 AND weight <= 300),
  height NUMERIC(5,2) NOT NULL CHECK (height >= 140 AND height <= 220),
  neck_circumference NUMERIC(5,2) NOT NULL CHECK (neck_circumference >= 25 AND neck_circumference <= 60),
  waist_circumference NUMERIC(5,2) NOT NULL CHECK (waist_circumference >= 50 AND waist_circumference <= 200),
  hip_circumference NUMERIC(5,2) CHECK (hip_circumference IS NULL OR (hip_circumference >= 70 AND hip_circumference <= 200)),
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
  body_fat_percentage NUMERIC(4,1) CHECK (body_fat_percentage IS NULL OR (body_fat_percentage >= 2 AND body_fat_percentage <= 50)),
  fat_mass NUMERIC(5,2) CHECK (fat_mass IS NULL OR (fat_mass >= 1 AND fat_mass <= 150)),
  lean_mass NUMERIC(5,2) CHECK (lean_mass IS NULL OR (lean_mass >= 20 AND lean_mass <= 200)),
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE user_body_measurements IS 'Historical body measurements and composition data for users';
COMMENT ON COLUMN user_body_measurements.user_id IS 'Reference to the user who owns this measurement';
COMMENT ON COLUMN user_body_measurements.weight IS 'Body weight in kilograms';
COMMENT ON COLUMN user_body_measurements.height IS 'Height in centimeters';
COMMENT ON COLUMN user_body_measurements.neck_circumference IS 'Neck circumference in centimeters for Navy body fat calculation';
COMMENT ON COLUMN user_body_measurements.waist_circumference IS 'Waist circumference in centimeters for Navy body fat calculation';
COMMENT ON COLUMN user_body_measurements.hip_circumference IS 'Hip circumference in centimeters (required for females)';
COMMENT ON COLUMN user_body_measurements.gender IS 'User gender for body fat calculations';
COMMENT ON COLUMN user_body_measurements.body_fat_percentage IS 'Calculated body fat percentage using Navy method';
COMMENT ON COLUMN user_body_measurements.fat_mass IS 'Calculated fat mass in kilograms';
COMMENT ON COLUMN user_body_measurements.lean_mass IS 'Calculated lean mass in kilograms';
COMMENT ON COLUMN user_body_measurements.measurement_date IS 'Date when the measurements were taken';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_body_measurements_user_id ON user_body_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_body_measurements_date ON user_body_measurements(measurement_date);
CREATE INDEX IF NOT EXISTS idx_user_body_measurements_user_date ON user_body_measurements(user_id, measurement_date DESC);

-- Create unique constraint to prevent duplicate measurements on the same day
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_body_measurements_unique_date 
ON user_body_measurements(user_id, measurement_date);

-- Enable Row Level Security
ALTER TABLE user_body_measurements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own measurements" ON user_body_measurements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own measurements" ON user_body_measurements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own measurements" ON user_body_measurements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own measurements" ON user_body_measurements
  FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_body_measurements_updated_at 
    BEFORE UPDATE ON user_body_measurements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create a view for the latest measurements per user
CREATE OR REPLACE VIEW user_latest_measurements AS
SELECT DISTINCT ON (user_id) 
    user_id,
    weight,
    height,
    neck_circumference,
    waist_circumference,
    hip_circumference,
    gender,
    body_fat_percentage,
    fat_mass,
    lean_mass,
    measurement_date,
    created_at
FROM user_body_measurements
ORDER BY user_id, measurement_date DESC;

-- Grant access to the view
GRANT SELECT ON user_latest_measurements TO anon, authenticated;

-- Create a function to calculate BMI
CREATE OR REPLACE FUNCTION calculate_bmi(weight_kg NUMERIC, height_cm NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
    IF weight_kg <= 0 OR height_cm <= 0 THEN
        RETURN NULL;
    END IF;
    
    RETURN ROUND((weight_kg / POWER(height_cm / 100.0, 2))::NUMERIC, 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a view with calculated BMI and other metrics
CREATE OR REPLACE VIEW user_body_metrics AS
SELECT 
    ubm.*,
    calculate_bmi(ubm.weight, ubm.height) as bmi,
    CASE 
        WHEN calculate_bmi(ubm.weight, ubm.height) < 18.5 THEN 'underweight'
        WHEN calculate_bmi(ubm.weight, ubm.height) < 25 THEN 'normal'
        WHEN calculate_bmi(ubm.weight, ubm.height) < 30 THEN 'overweight'
        ELSE 'obese'
    END as bmi_category,
    CASE 
        WHEN ubm.gender = 'male' AND ubm.body_fat_percentage < 6 THEN 'essential'
        WHEN ubm.gender = 'male' AND ubm.body_fat_percentage < 14 THEN 'athletic'
        WHEN ubm.gender = 'male' AND ubm.body_fat_percentage < 18 THEN 'fitness'
        WHEN ubm.gender = 'male' AND ubm.body_fat_percentage < 25 THEN 'average'
        WHEN ubm.gender = 'male' AND ubm.body_fat_percentage >= 25 THEN 'high'
        WHEN ubm.gender = 'female' AND ubm.body_fat_percentage < 16 THEN 'essential'
        WHEN ubm.gender = 'female' AND ubm.body_fat_percentage < 20 THEN 'athletic'
        WHEN ubm.gender = 'female' AND ubm.body_fat_percentage < 25 THEN 'fitness'
        WHEN ubm.gender = 'female' AND ubm.body_fat_percentage < 32 THEN 'average'
        WHEN ubm.gender = 'female' AND ubm.body_fat_percentage >= 32 THEN 'high'
        ELSE NULL
    END as body_fat_category
FROM user_body_measurements ubm;

-- Grant access to the metrics view
GRANT SELECT ON user_body_metrics TO anon, authenticated;

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'user_body_measurements' 
ORDER BY ordinal_position;
