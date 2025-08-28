-- Body Composition Achievements per Trinity Fat Loss
-- Da eseguire nel Supabase SQL Editor

-- Assicuriamoci che esista la tabella user_achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  points_earned INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

-- RLS per user_achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements" ON user_achievements
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON user_achievements
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at);

-- 1. Body Fat Milestones
INSERT INTO achievements (
  name, description, category, icon_emoji, color_hex, 
  criteria_type, criteria_value, points_awarded, rarity, progression_tier,
  trio_required, notify_on_unlock, celebrate_in_chat, active
) VALUES 
-- Body Fat Reduction Milestones
('Fat Fighter', 'Reach 25% body fat or lower', 'body_composition', '🥊', '#E74C3C', 'body_fat_milestone', 25, 50, 'common', 1, false, true, true, true),
('Lean Machine', 'Reach 20% body fat or lower', 'body_composition', '⚡', '#F39C12', 'body_fat_milestone', 20, 100, 'rare', 2, false, true, true, true),
('Athletic Physique', 'Reach 15% body fat or lower', 'body_composition', '🏆', '#2ECC71', 'body_fat_milestone', 15, 200, 'epic', 3, false, true, true, true),
('Elite Definition', 'Reach 12% body fat or lower', 'body_composition', '💎', '#3498DB', 'body_fat_milestone', 12, 300, 'legendary', 4, false, true, true, true),

-- Lean Mass Milestones
('Muscle Builder', 'Reach 60kg lean mass', 'body_composition', '💪', '#27AE60', 'lean_mass_milestone', 60, 75, 'common', 1, false, true, true, true),
('Strength Seeker', 'Reach 65kg lean mass', 'body_composition', '🦾', '#2ECC71', 'lean_mass_milestone', 65, 125, 'rare', 2, false, true, true, true),
('Power Builder', 'Reach 70kg lean mass', 'body_composition', '🔥', '#E67E22', 'lean_mass_milestone', 70, 200, 'epic', 3, false, true, true, true),
('Muscle Master', 'Reach 75kg lean mass', 'body_composition', '⚡', '#9B59B6', 'lean_mass_milestone', 75, 300, 'legendary', 4, false, true, true, true),

-- Fat Loss Milestones
('Fat Burner', 'Lose 2kg of fat mass', 'body_composition', '🔥', '#E74C3C', 'fat_loss_milestone', 2, 75, 'common', 1, false, true, true, true),
('Fat Destroyer', 'Lose 5kg of fat mass', 'body_composition', '💥', '#C0392B', 'fat_loss_milestone', 5, 150, 'rare', 2, false, true, true, true),
('Fat Annihilator', 'Lose 10kg of fat mass', 'body_composition', '⚡', '#8E44AD', 'fat_loss_milestone', 10, 250, 'epic', 3, false, true, true, true),
('Fat Obliterator', 'Lose 15kg of fat mass', 'body_composition', '💎', '#2C3E50', 'fat_loss_milestone', 15, 400, 'legendary', 4, false, true, true, true),

-- Waist Circumference Milestones
('Waist Warrior', 'Reduce waist to 95cm or less', 'body_composition', '📏', '#3498DB', 'waist_milestone', 95, 60, 'common', 1, false, true, true, true),
('Trim Triumph', 'Reduce waist to 90cm or less', 'body_composition', '🎯', '#E67E22', 'waist_milestone', 90, 100, 'rare', 2, false, true, true, true),
('Narrow Navigator', 'Reduce waist to 85cm or less', 'body_composition', '⭐', '#F1C40F', 'waist_milestone', 85, 150, 'epic', 3, false, true, true, true),
('Waist Wizard', 'Reduce waist to 80cm or less', 'body_composition', '🏆', '#27AE60', 'waist_milestone', 80, 250, 'legendary', 4, false, true, true, true),

-- Special Body Recomposition Achievements
('Body Alchemist', 'Achieve body recomposition (gain muscle + lose fat)', 'body_composition', '🧬', '#9B59B6', 'body_recomposition', 1, 200, 'epic', 1, false, true, true, true),
('Transformation Trinity', 'Complete perfect body recomposition in trio', 'body_composition', '🔱', '#8E44AD', 'trio_body_recomposition', 1, 500, 'legendary', 1, true, true, true, true),

-- US Navy Method Achievements
('Navy Approved', 'Complete first Navy body fat measurement', 'body_composition', '⚓', '#34495E', 'navy_measurement_complete', 1, 25, 'common', 1, false, true, true, true),
('Precision Tracker', 'Complete 5 Navy measurements with consistent results', 'body_composition', '📊', '#2ECC71', 'navy_consistency', 5, 75, 'rare', 1, false, true, true, true),

-- BMI Achievements
('Healthy Range', 'Achieve healthy BMI (18.5-24.9)', 'body_composition', '💚', '#27AE60', 'bmi_healthy_range', 1, 100, 'rare', 1, false, true, true, true),
('Optimal Health', 'Maintain healthy BMI for 30 days', 'body_composition', '🌟', '#F39C12', 'bmi_maintenance', 30, 150, 'epic', 2, false, true, true, true);

-- Nota: Alcuni achievements richiedono logica custom nel servizio per verificare trend e confronti temporali
