-- Fix degli errori del BodyCompositionDashboard
-- Risolve i 400 Bad Request per colonne mancanti

-- 1. Aggiungi colonne mancanti alla tabella users
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS current_weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS height DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS neck_circumference DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS waist_circumference DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS hip_circumference DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS gender VARCHAR(10),
ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS neckcircumference DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS waistcircumference DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS chipcircumference DECIMAL(5,2);

-- 2. Crea la tabella user_body_measurements se non esiste
CREATE TABLE IF NOT EXISTS user_body_measurements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    measurement_date DATE DEFAULT CURRENT_DATE,
    weight DECIMAL(5,2),
    body_fat_percentage DECIMAL(5,2),
    muscle_mass DECIMAL(5,2),
    neck_circumference DECIMAL(5,2),
    waist_circumference DECIMAL(5,2),
    hip_circumference DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Abilita RLS per user_body_measurements
ALTER TABLE user_body_measurements ENABLE ROW LEVEL SECURITY;

-- 4. Policy RLS per user_body_measurements
DROP POLICY IF EXISTS "Users can read their own measurements" ON user_body_measurements;
CREATE POLICY "Users can read their own measurements" ON user_body_measurements
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own measurements" ON user_body_measurements;
CREATE POLICY "Users can insert their own measurements" ON user_body_measurements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own measurements" ON user_body_measurements;
CREATE POLICY "Users can update their own measurements" ON user_body_measurements
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own measurements" ON user_body_measurements;
CREATE POLICY "Users can delete their own measurements" ON user_body_measurements
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Verifica finale
SELECT 'Body measurements tables fixed successfully' as status;
