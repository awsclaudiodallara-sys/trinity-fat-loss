-- ===========================================
-- TRINITY FAT LOSS - Achievement Engine
-- Sistema completo di achievement con trigger automatici
-- ===========================================

-- ===========================================
-- NOTA: La tabella achievements esiste già con la struttura corretta
-- Procediamo con l'aggiunta delle altre tabelle e funzioni
-- ===========================================

-- ===========================================
-- 1. TABELLA USER_ACHIEVEMENTS (Achievement sbloccati dagli utenti)
-- ===========================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress_value NUMERIC DEFAULT 0, -- Per achievement progressivi
  metadata JSONB DEFAULT '{}', -- Informazioni aggiuntive
  UNIQUE(user_id, achievement_id)
);

-- ===========================================
-- 2. TABELLA ACHIEVEMENT_PROGRESS (Tracking progresso)
-- ===========================================
CREATE TABLE IF NOT EXISTS achievement_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  current_value NUMERIC DEFAULT 0,
  target_value NUMERIC NOT NULL,
  progress_percentage NUMERIC(5,2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ===========================================
-- 3. FUNZIONI PER IL CALCOLO DEGLI ACHIEVEMENT
-- ===========================================

-- Funzione per calcolare il progresso del peso perso
CREATE OR REPLACE FUNCTION calculate_weight_loss_progress(user_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  initial_weight NUMERIC;
  current_weight NUMERIC;
  weight_lost NUMERIC := 0;
BEGIN
  -- Peso iniziale (prima misurazione)
  SELECT weight INTO initial_weight
  FROM user_body_measurements
  WHERE user_id = user_uuid
  ORDER BY measurement_date ASC
  LIMIT 1;

  -- Peso corrente (ultima misurazione)
  SELECT weight INTO current_weight
  FROM user_body_measurements
  WHERE user_id = user_uuid
  ORDER BY measurement_date DESC
  LIMIT 1;

  IF initial_weight IS NOT NULL AND current_weight IS NOT NULL THEN
    weight_lost := initial_weight - current_weight;
  END IF;

  RETURN GREATEST(weight_lost, 0);
END;
$$ LANGUAGE plpgsql;

-- Funzione per calcolare la streak di giorni consecutivi
CREATE OR REPLACE FUNCTION calculate_consecutive_days(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  consecutive_days INTEGER := 0;
  last_date DATE;
  current_date DATE := CURRENT_DATE;
  check_date DATE;
BEGIN
  -- Trova l'ultima data con attività
  SELECT MAX(measurement_date) INTO last_date
  FROM user_body_measurements
  WHERE user_id = user_uuid;

  IF last_date IS NULL THEN
    RETURN 0;
  END IF;

  -- Se l'ultima attività non è oggi o ieri, streak interrotta
  IF last_date < current_date - INTERVAL '1 day' THEN
    RETURN 0;
  END IF;

  -- Conta i giorni consecutivi all'indietro
  consecutive_days := 1; -- Oggi/ieri
  check_date := last_date - INTERVAL '1 day';

  WHILE check_date >= last_date - INTERVAL '30 days' LOOP
    IF EXISTS (
      SELECT 1 FROM user_body_measurements
      WHERE user_id = user_uuid
      AND measurement_date = check_date
    ) THEN
      consecutive_days := consecutive_days + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;

  RETURN consecutive_days;
END;
$$ LANGUAGE plpgsql;

-- Funzione principale per controllare e sbloccare achievement
CREATE OR REPLACE FUNCTION check_and_unlock_achievements(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  achievement_record RECORD;
  current_value NUMERIC;
  should_unlock BOOLEAN;
BEGIN
  -- Itera attraverso tutti gli achievement attivi
  FOR achievement_record IN
    SELECT * FROM achievements WHERE active = true
  LOOP
    should_unlock := false;

    -- Controlla il tipo di criteria
    CASE achievement_record.criteria_type
      WHEN 'weight_loss' THEN
        -- Achievement basati su perdita di peso
        current_value := calculate_weight_loss_progress(user_uuid);
        IF current_value >= achievement_record.criteria_value THEN
          should_unlock := true;
        END IF;

      WHEN 'measurements_count' THEN
        -- Achievement basati su numero di misurazioni
        SELECT COUNT(*) INTO current_value
        FROM user_body_measurements
        WHERE user_id = user_uuid;
        IF current_value >= achievement_record.criteria_value THEN
          should_unlock := true;
        END IF;

      WHEN 'streak' THEN
        -- Achievement basati su streak di giorni attivi
        current_value := calculate_consecutive_days(user_uuid);
        IF current_value >= achievement_record.criteria_value THEN
          should_unlock := true;
        END IF;

      -- Nuovi tipi di achievement (da implementare con logica specifica)
      WHEN 'body_fat' THEN
        -- Achievement basati su percentuale massa grassa (richiede colonna body_fat_percentage)
        current_value := 0; -- Placeholder: implementare logica per calcolare body fat attuale
        should_unlock := false; -- Non implementato

      WHEN 'bmi' THEN
        -- Achievement basati su BMI (richiede colonne height e weight)
        current_value := 0; -- Placeholder: implementare calcolo BMI
        should_unlock := false; -- Non implementato

      WHEN 'steps' THEN
        -- Achievement basati su passi giornalieri (richiede tabella steps)
        current_value := 0; -- Placeholder: implementare logica per passi
        should_unlock := false; -- Non implementato

      WHEN 'cardio' THEN
        -- Achievement basati su minuti di cardio (richiede tabella cardio_sessions)
        current_value := 0; -- Placeholder: implementare logica per cardio
        should_unlock := false; -- Non implementato

      WHEN 'messages' THEN
        -- Achievement basati su messaggi incoraggianti (richiede tabella chat_messages)
        current_value := 0; -- Placeholder: implementare conteggio messaggi
        should_unlock := false; -- Non implementato

      WHEN 'video_calls' THEN
        -- Achievement basati su partecipazione video call (richiede tabella video_calls)
        current_value := 0; -- Placeholder: implementare logica video calls
        should_unlock := false; -- Non implementato

      WHEN 'tasks_streak' THEN
        -- Achievement basati su completamento tasks giornalieri (richiede tabella daily_tasks)
        current_value := 0; -- Placeholder: implementare logica tasks
        should_unlock := false; -- Non implementato

      WHEN 'trio_streak' THEN
        -- Achievement basati su streak con trio (richiede logica trio)
        current_value := 0; -- Placeholder: implementare logica trio
        should_unlock := false; -- Non implementato

      WHEN 'trio_completion_rate' THEN
        -- Achievement basati su tasso completamento trio
        current_value := 0; -- Placeholder: implementare logica trio completion
        should_unlock := false; -- Non implementato

      WHEN 'measurements_streak' THEN
        -- Achievement basati su streak misurazioni complete
        SELECT COUNT(*) INTO current_value
        FROM user_body_measurements
        WHERE user_id = user_uuid
        AND measurement_date >= CURRENT_DATE - INTERVAL '14 days';
        IF current_value >= 14 THEN
          should_unlock := true;
        END IF;

      WHEN 'body_fat_reduction' THEN
        -- Achievement basati su riduzione massa grassa
        current_value := 0; -- Placeholder: implementare calcolo riduzione
        should_unlock := false; -- Non implementato

      WHEN 'cardio_streak' THEN
        -- Achievement basati su streak cardio giornaliero
        current_value := 0; -- Placeholder: implementare logica cardio streak
        should_unlock := false; -- Non implementato

      WHEN 'steps_streak' THEN
        -- Achievement basati su streak passi giornalieri
        current_value := 0; -- Placeholder: implementare logica steps streak
        should_unlock := false; -- Non implementato

      WHEN 'steps_weekly' THEN
        -- Achievement basati su media passi settimanale
        current_value := 0; -- Placeholder: implementare calcolo media settimanale
        should_unlock := false; -- Non implementato

      WHEN 'cardio_monthly' THEN
        -- Achievement basati su minuti cardio mensili totali
        current_value := 0; -- Placeholder: implementare somma mensile cardio
        should_unlock := false; -- Non implementato

      WHEN 'trio_steps' THEN
        -- Achievement trio basati su passi
        current_value := 0; -- Placeholder: implementare logica trio steps
        should_unlock := false; -- Non implementato

      WHEN 'trio_cardio' THEN
        -- Achievement trio basati su cardio
        current_value := 0; -- Placeholder: implementare logica trio cardio
        should_unlock := false; -- Non implementato

      WHEN 'trio_sync' THEN
        -- Achievement trio basati su sincronizzazione
        current_value := 0; -- Placeholder: implementare logica trio sync
        should_unlock := false; -- Non implementato

      WHEN 'trio_perfect_day' THEN
        -- Achievement trio perfect day
        current_value := 0; -- Placeholder: implementare logica perfect day trio
        should_unlock := false; -- Non implementato

      WHEN 'deficit_streak' THEN
        -- Achievement basati su deficit calorico
        current_value := 0; -- Placeholder: implementare logica deficit
        should_unlock := false; -- Non implementato

      WHEN 'reactions' THEN
        -- Achievement basati su reazioni agli achievement altrui
        current_value := 0; -- Placeholder: implementare conteggio reazioni
        should_unlock := false; -- Non implementato

      WHEN 'meal_logging' THEN
        -- Achievement basati su logging pasti mindful
        current_value := 0; -- Placeholder: implementare logica meal logging
        should_unlock := false; -- Non implementato

      WHEN 'protein_streak' THEN
        -- Achievement basati su raggiungimento goal proteico
        current_value := 0; -- Placeholder: implementare logica protein goal
        should_unlock := false; -- Non implementato

      WHEN 'sleep_streak' THEN
        -- Achievement basati su qualità sonno
        current_value := 0; -- Placeholder: implementare logica sleep quality
        should_unlock := false; -- Non implementato

      WHEN 'hydration_streak' THEN
        -- Achievement basati su goal idratazione
        current_value := 0; -- Placeholder: implementare logica hydration
        should_unlock := false; -- Non implementato

      WHEN 'video_calls_streak' THEN
        -- Achievement basati su streak partecipazione video call
        current_value := 0; -- Placeholder: implementare logica video calls streak
        should_unlock := false; -- Non implementato

      WHEN 'measurements_complete' THEN
        -- Achievement per completamento tutte le misurazioni
        SELECT COUNT(*) INTO current_value
        FROM user_body_measurements
        WHERE user_id = user_uuid
        AND measurement_date = (SELECT MAX(measurement_date) FROM user_body_measurements WHERE user_id = user_uuid);
        IF current_value >= 1 THEN
          should_unlock := true;
        END IF;

      WHEN 'metrics_tracked' THEN
        -- Achievement per tracking metriche salute
        SELECT COUNT(*) INTO current_value
        FROM user_body_measurements
        WHERE user_id = user_uuid;
        IF current_value >= achievement_record.criteria_value THEN
          should_unlock := true;
        END IF;

      WHEN 'profile_setup' THEN
        -- Achievement per setup profilo completo
        SELECT COUNT(*) INTO current_value
        FROM users
        WHERE id = user_uuid
        AND (full_name IS NOT NULL OR email IS NOT NULL);
        IF current_value >= 1 THEN
          should_unlock := true;
        END IF;

      ELSE
        -- Altri tipi non implementati
        should_unlock := false;
    END CASE;

    -- Se l'achievement deve essere sbloccato e non è già sbloccato
    IF should_unlock AND NOT EXISTS (
      SELECT 1 FROM user_achievements
      WHERE user_id = user_uuid AND achievement_id = achievement_record.id
    ) THEN
      -- Sblocca l'achievement
      INSERT INTO user_achievements (user_id, achievement_id, progress_value, metadata)
      VALUES (user_uuid, achievement_record.id, current_value, jsonb_build_object('unlocked_at', NOW()));

      -- Aggiorna i punti dell'utente (usa points_awarded dalla tabella esistente)
      UPDATE users SET total_points = total_points + achievement_record.points_awarded
      WHERE id = user_uuid;
    END IF;

    -- Aggiorna il progresso (anche se non sbloccato)
    INSERT INTO achievement_progress (user_id, achievement_id, current_value, target_value, progress_percentage, last_updated)
    VALUES (
      user_uuid,
      achievement_record.id,
      current_value,
      achievement_record.criteria_value,
      LEAST((current_value / achievement_record.criteria_value) * 100, 100),
      NOW()
    )
    ON CONFLICT (user_id, achievement_id)
    DO UPDATE SET
      current_value = EXCLUDED.current_value,
      progress_percentage = EXCLUDED.progress_percentage,
      last_updated = EXCLUDED.last_updated;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 4. TRIGGER PER AGGIORNARE AUTOMATICAMENTE GLI ACHIEVEMENT
-- ===========================================

-- Trigger dopo inserimento/aggiornamento misurazioni
CREATE OR REPLACE FUNCTION trigger_update_achievements()
RETURNS TRIGGER AS $$
BEGIN
  -- Aggiorna achievement per l'utente che ha fatto la misurazione
  PERFORM check_and_unlock_achievements(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crea il trigger
DROP TRIGGER IF EXISTS trigger_achievement_update ON user_body_measurements;
CREATE TRIGGER trigger_achievement_update
  AFTER INSERT OR UPDATE ON user_body_measurements
  FOR EACH ROW EXECUTE FUNCTION trigger_update_achievements();

-- ===========================================
-- 5. ACHIEVEMENT PREDEFINITI
-- ===========================================

-- Adatta l'INSERT alla struttura esistente della tabella
INSERT INTO achievements (
    name,
    description,
    category,
    criteria_type,
    criteria_value,
    criteria_data,
    points_awarded,
    rarity,
    active
) VALUES
-- Legendary Achievements
('1-Year Legend', 'Be active for 365 days', 'consistency', 'streak', 365, '{"type": "streak", "target": 365}', 750, 'legendary', true),
('Inseparable Three', 'Complete full 90 days with same trio', 'social', 'trio_streak', 90, '{"type": "trio_streak", "target": 90}', 750, 'legendary', true),
('Phoenix Rising', 'Complete all 7 daily tasks for 60 days straight', 'consistency', 'tasks_streak', 60, '{"type": "tasks_streak", "target": 60}', 500, 'legendary', true),
('Peak Performer', 'Reach body fat below 15% (US Navy)', 'fitness', 'body_fat', 15, '{"type": "body_fat", "target": 15}', 500, 'legendary', true),
('BMI Master', 'Reach BMI below 25', 'fitness', 'bmi', 25, '{"type": "bmi", "target": 25}', 400, 'legendary', true),
('Elite Athlete', 'Reach body fat below 20% (US Navy)', 'fitness', 'body_fat', 20, '{"type": "body_fat", "target": 20}', 350, 'legendary', true),
('Step Legend', 'Take 20,000+ steps in a single day', 'fitness', 'steps', 20000, '{"type": "steps", "target": 20000}', 300, 'legendary', true),
('Cardio Legend', 'Complete 90+ minutes cardio in single session', 'fitness', 'cardio', 90, '{"type": "cardio", "target": 90}', 200, 'legendary', true),
('Campione', 'Hai perso 25 chili! Sei un vero campione!', 'weight_loss', 'weight_loss', 25, '{"type": "weight_loss", "target": 25}', 150, 'legendary', true),

-- Epic Achievements
('Trinity Power', 'Trio maintains 80%+ completion rate for 30 days', 'social', 'trio_completion_rate', 80, '{"type": "trio_completion_rate", "target": 80}', 400, 'epic', true),
('6-Month Champion', 'Be active for 180 days', 'consistency', 'streak', 180, '{"type": "streak", "target": 180}', 400, 'epic', true),
('Transformation', 'Lose 20kg from starting weight', 'weight_loss', 'weight_loss', 20, '{"type": "weight_loss", "target": 20}', 300, 'epic', true),
('Trinity Talker', 'Attend all 13 video calls in 90-day cycle', 'social', 'video_calls', 13, '{"type": "video_calls", "target": 13}', 300, 'epic', true),
('Inferno', 'Complete all 7 daily tasks for 30 days straight', 'consistency', 'tasks_streak', 30, '{"type": "tasks_streak", "target": 30}', 250, 'epic', true),
('Lean Warrior', 'Reach body fat below 25% (US Navy)', 'fitness', 'body_fat', 25, '{"type": "body_fat", "target": 25}', 200, 'epic', true),
('Monthly Machine', 'Complete 600+ total cardio minutes in a month', 'fitness', 'cardio_monthly', 600, '{"type": "cardio_monthly", "target": 600}', 200, 'epic', true),
('BMI Challenger', 'Reach BMI below 30', 'fitness', 'bmi', 30, '{"type": "bmi", "target": 30}', 200, 'epic', true),
('Step Marathon', 'Take 15,000 steps in a single day', 'fitness', 'steps', 15000, '{"type": "steps", "target": 15000}', 150, 'epic', true),
('Venti Chili', 'Hai perso 20 chili! Sei una leggenda!', 'weight_loss', 'weight_loss', 20, '{"type": "weight_loss", "target": 20}', 100, 'epic', true),
('Cardio Champion', 'Complete 60 minutes cardio in single session', 'fitness', 'cardio', 60, '{"type": "cardio", "target": 60}', 120, 'epic', true),
('Un Mese', 'Hai mantenuto la streak per 30 giorni!', 'consistency', 'streak', 30, '{"target": 30}', 60, 'epic', true),

-- Rare Achievements
('Triple Step Masters', 'All trio members average 10K+ steps for 1 week', 'social', 'trio_steps', 10000, '{"type": "trio_steps", "target": 10000}', 250, 'rare', true),
('Cardio Trinity', 'All trio members complete 60+ min cardio in same week', 'social', 'trio_cardio', 60, '{"type": "trio_cardio", "target": 60}', 250, 'rare', true),
('3-Month Veteran', 'Be active for 90 days', 'consistency', 'streak', 90, '{"type": "streak", "target": 90}', 200, 'rare', true),
('Synchronized Squad', 'All 3 members complete tasks within 2 hours 5 times', 'social', 'trio_sync', 5, '{"type": "trio_sync", "target": 5}', 200, 'rare', true),
('Step Champion', 'Reach 10K+ steps for 30 days straight', 'fitness', 'steps_streak', 30, '{"type": "steps_streak", "target": 30}', 180, 'rare', true),
('Weekly Wanderer', 'Average 10K+ steps for 7 consecutive days', 'fitness', 'steps_weekly', 10000, '{"type": "steps_weekly", "target": 10000}', 150, 'rare', true),
('Data Consistency', 'Maintain complete measurements for 14 days', 'consistency', 'measurements_streak', 14, '{"type": "measurements_streak", "target": 14}', 150, 'rare', true),
('Weight Warrior', 'Lose 10kg from starting weight', 'weight_loss', 'weight_loss', 10, '{"type": "weight_loss", "target": 10}', 150, 'rare', true),
('Cardio Beast', 'Complete 30+ minutes cardio for 21 days straight', 'fitness', 'cardio_streak', 21, '{"type": "cardio_streak", "target": 21}', 150, 'rare', true),
('Trio Champion', 'Send 250 encouraging messages in trio chat', 'social', 'messages', 250, '{"type": "messages", "target": 250}', 150, 'rare', true),
('Triple Threat', 'All 3 trio members complete perfect day (7/7 tasks) same day', 'social', 'trio_perfect_day', 1, '{"type": "trio_perfect_day", "target": 1}', 150, 'rare', true),
('Deficit Master', 'Maintain caloric deficit for 28 days straight', 'fitness', 'deficit_streak', 28, '{"type": "deficit_streak", "target": 28}', 140, 'rare', true),
('Motivation Master', 'React to 300 trio member achievements', 'social', 'reactions', 300, '{"type": "reactions", "target": 300}', 120, 'rare', true),
('Mindful Logger', 'Log meals mindfully for 30 days straight', 'consistency', 'meal_logging', 30, '{"type": "meal_logging", "target": 30}', 120, 'rare', true),
('Step Master', 'Reach 8K+ steps for 21 days straight', 'fitness', 'steps_streak', 21, '{"type": "steps_streak", "target": 21}', 120, 'common', true),
('Fat Burner', 'Reduce body fat by 3% (US Navy method)', 'fitness', 'body_fat_reduction', 3, '{"type": "body_fat_reduction", "target": 3}', 120, 'rare', true),
('Burning Bright', 'Complete all 7 daily tasks for 14 days straight', 'consistency', 'tasks_streak', 14, '{"type": "tasks_streak", "target": 14}', 100, 'rare', true),
('Monthly Mover', 'Complete 300+ total cardio minutes in a month', 'fitness', 'cardio_monthly', 300, '{"type": "cardio_monthly", "target": 300}', 100, 'rare', true),
('BMI Improver', 'Reach BMI below 35', 'fitness', 'bmi', 35, '{"type": "bmi", "target": 35}', 100, 'rare', true),
('Step Explorer', 'Take 10,000 steps in a single day', 'fitness', 'steps', 10000, '{"type": "steps", "target": 10000}', 80, 'rare', true),
('Data Driven', 'Track 3 different health metrics', 'consistency', 'metrics_tracked', 3, '{"type": "metrics_tracked", "target": 3}', 80, 'rare', true),
('Meeting Maven', 'Attend 8 video calls without missing', 'social', 'video_calls_streak', 8, '{"type": "video_calls_streak", "target": 8}', 80, 'rare', true),
('Cardio Warrior', 'Complete 45 minutes cardio in single session', 'fitness', 'cardio', 45, '{"type": "cardio", "target": 45}', 80, 'rare', true),
('Quindici Chili', 'Hai perso 15 chili! Incredibile!', 'weight_loss', 'weight_loss', 15, '{"type": "weight_loss", "target": 15}', 75, 'rare', true),
('Dieci Chili', 'Hai perso 10 chili! Sei un campione!', 'weight_loss', 'weight_loss', 10, '{"type": "weight_loss", "target": 10}', 50, 'rare', true),
('Trenta Misurazioni', 'Hai completato 30 misurazioni!', 'consistency', 'measurements_count', 30, '{"type": "measurements_count", "target": 30}', 40, 'rare', true),
('Due Settimane', 'Hai mantenuto la streak per 14 giorni!', 'consistency', 'streak', 14, '{"target": 14}', 30, 'rare', true),

-- Common Achievements
('Protein Powerhouse', 'Meet protein goal for 21 days straight', 'fitness', 'protein_streak', 21, '{"type": "protein_streak", "target": 21}', 100, 'common', true),
('Cardio King', 'Complete 20+ minutes cardio for 14 days straight', 'fitness', 'cardio_streak', 14, '{"type": "cardio_streak", "target": 14}', 100, 'common', true),
('Sleep Champion', 'Achieve quality sleep for 21 days straight', 'fitness', 'sleep_streak', 21, '{"type": "sleep_streak", "target": 21}', 100, 'common', true),
('Weekly Walker', 'Average 8K+ steps for 7 consecutive days', 'fitness', 'steps_weekly', 8000, '{"type": "steps_weekly", "target": 8000}', 100, 'common', true),
('Step Squad', 'All 3 trio members reach 8K+ steps same day', 'social', 'trio_steps', 8000, '{"type": "trio_steps", "target": 8000}', 100, 'common', true),
('Cardio Crew', 'All 3 trio members complete 20+ min cardio same day', 'social', 'trio_cardio', 20, '{"type": "trio_cardio", "target": 20}', 100, 'common', true),
('Hydration Hero', 'Meet hydration goal for 14 days straight', 'fitness', 'hydration_streak', 14, '{"type": "hydration_streak", "target": 14}', 75, 'common', true),
('Cheerleader', 'Send 100 encouraging messages in trio chat', 'social', 'messages', 100, '{"type": "messages", "target": 100}', 75, 'common', true),
('Measurement Master', 'Complete all body measurements', 'consistency', 'measurements_complete', 1, '{"type": "measurements_complete", "target": 1}', 75, 'common', true),
('First Kilo', 'Lose 5kg from starting weight', 'weight_loss', 'weight_loss', 5, '{"type": "weight_loss", "target": 5}', 75, 'common', true),
('Support Squad', 'React to 100 trio member achievements', 'social', 'reactions', 100, '{"type": "reactions", "target": 100}', 60, 'common', true),
('Hot Streak', 'Complete all 7 daily tasks for 7 days straight', 'consistency', 'tasks_streak', 7, '{"type": "tasks_streak", "target": 7}', 50, 'common', true),
('Step Climber', 'Take 8,000 steps in a single day', 'fitness', 'steps', 8000, '{"type": "steps", "target": 8000}', 50, 'common', true),
('Cardio Enthusiast', 'Complete 30 minutes cardio in single session', 'fitness', 'cardio', 30, '{"type": "cardio", "target": 30}', 50, 'common', true),
('Health Tracker', 'Track any health metric', 'consistency', 'metrics_tracked', 1, '{"type": "metrics_tracked", "target": 1}', 45, 'common', true),
('Call Keeper', 'Attend 4 video calls without missing', 'social', 'video_calls_streak', 4, '{"type": "video_calls_streak", "target": 4}', 40, 'common', true),
('Supporter', 'Send first message in trio chat', 'social', 'messages', 1, '{"type": "messages", "target": 1}', 35, 'common', true),
('Cardio Starter', 'Complete 20 minutes cardio in single session', 'fitness', 'cardio', 20, '{"type": "cardio", "target": 20}', 30, 'common', true),
('First Steps', 'Take 5,000 steps in a single day', 'fitness', 'steps', 5000, '{"type": "steps", "target": 5000}', 30, 'common', true),
('Team Player', 'Send 25 encouraging messages in trio chat', 'social', 'messages', 25, '{"type": "messages", "target": 25}', 30, 'common', true),
('Welcome Aboard', 'Complete profile setup', 'milestone', 'profile_setup', 1, '{"type": "profile_setup", "target": 1}', 25, 'common', true),
('Cinque Chili', 'Hai perso 5 chili! Continua così!', 'weight_loss', 'weight_loss', 5, '{"type": "weight_loss", "target": 5}', 25, 'common', true),
('Fire Starter', 'Complete all 7 daily tasks for 3 days straight', 'consistency', 'tasks_streak', 3, '{"type": "tasks_streak", "target": 3}', 25, 'common', true),
('Dieci Misurazioni', 'Hai completato 10 misurazioni!', 'consistency', 'measurements_count', 10, '{"type": "measurements_count", "target": 10}', 20, 'common', true),
('Prima Settimana', 'Hai mantenuto la streak per 7 giorni!', 'consistency', 'streak', 7, '{"target": 7}', 15, 'common', true),
('Inizio del Viaggio', 'Hai iniziato il tuo viaggio Trinity Fat Loss!', 'milestone', 'measurements_count', 1, '{"type": "measurements_count", "target": 1}', 10, 'common', true),
('Costante', 'Sei costante nelle tue misurazioni!', 'consistency', 'streak', 3, '{"target": 3}', 10, 'common', true),
('Primo Chilo', 'Hai perso il tuo primo chilo!', 'weight_loss', 'weight_loss', 1, '{"type": "weight_loss", "target": 1}', 10, 'common', true),
('Prima Misurazione', 'Hai completato la tua prima misurazione!', 'consistency', 'measurements_count', 1, '{"type": "measurements_count", "target": 1}', 5, 'common', true)

ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 6. INDICI PER PERFORMANCE
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_user_id ON achievement_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_achievement_id ON achievement_progress(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_criteria_type ON achievements(criteria_type);

-- ===========================================
-- 7. ABILITA RLS (Row Level Security)
-- ===========================================
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_progress ENABLE ROW LEVEL SECURITY;

-- Policy per achievements (lettura pubblica)
CREATE POLICY "Achievements are viewable by everyone" ON achievements
  FOR SELECT USING (true);

-- Policy per user_achievements (solo il proprietario)
CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Policy per achievement_progress (solo il proprietario)
CREATE POLICY "Users can view their own achievement progress" ON achievement_progress
  FOR SELECT USING (auth.uid() = user_id);

-- ===========================================
-- 8. VERIFICA FINALE
-- ===========================================
SELECT
    'Achievement Engine installato correttamente!' as status,
    COUNT(*) as achievements_creati
FROM achievements;

-- Mostra gli achievement creati
SELECT name, description, points_awarded, rarity
FROM achievements
ORDER BY points_awarded DESC;
