-- TRINITY FAT LOSS - Database Schema Completo
-- Script per creare tutte le tabelle necessarie per l'app
-- Esegui questo nel SQL Editor di Supabase

-- ===========================================
-- 1. TABELLA USERS (se non esiste già)
-- ===========================================
-- Nota: La tabella users di solito viene creata automaticamente da Supabase Auth
-- Ma aggiungiamo le colonne necessarie per Trinity Fat Loss

-- Aggiungi colonne necessarie alla tabella users (se non esistono)
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_weight DECIMAL(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS height DECIMAL(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS neck_circumference DECIMAL(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS waist_circumference DECIMAL(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS hip_circumference DECIMAL(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS neckcircumference DECIMAL(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS waistcircumference DECIMAL(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS hipcircumference DECIMAL(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS measurements_complete BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_measurement_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_trio_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS matching_status VARCHAR(20) DEFAULT 'available';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_matched_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- ===========================================
-- 2. TABELLA USER_BODY_MEASUREMENTS
-- ===========================================
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

-- ===========================================
-- 3. TABELLE PER IL SISTEMA DI MATCHING/TRIO
-- ===========================================
CREATE TABLE IF NOT EXISTS trios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id),
  user2_id UUID NOT NULL REFERENCES users(id),
  user3_id UUID NOT NULL REFERENCES users(id),
  common_language VARCHAR(50),
  weight_goal VARCHAR(20),
  fitness_level VARCHAR(20),
  age_range_min INTEGER,
  age_range_max INTEGER,
  compatibility_score INTEGER DEFAULT 85,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE DEFAULT (CURRENT_DATE + INTERVAL '90 days'),
  status VARCHAR(20) DEFAULT 'active',
  current_day INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matching_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active',
  priority INTEGER DEFAULT 100,
  wait_time_hours INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 4. TABELLE PER IL SISTEMA DI TASK
-- ===========================================
CREATE TABLE IF NOT EXISTS daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trio_id UUID REFERENCES trios(id) ON DELETE CASCADE,
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  task_type VARCHAR(50) NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  target_value NUMERIC(8,2),
  actual_value NUMERIC(8,2),
  target_unit VARCHAR(20),
  notes TEXT,
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trio_id UUID REFERENCES trios(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  task_type VARCHAR(50) NOT NULL,
  completed BOOLEAN DEFAULT false,
  completion_date TIMESTAMP WITH TIME ZONE,
  target_value NUMERIC(8,2),
  actual_value NUMERIC(8,2),
  target_unit VARCHAR(20),
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  deadline_warning_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 5. TABELLE PER IL SISTEMA DI CHAT
-- ===========================================
CREATE TABLE IF NOT EXISTS trinity_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trio_id UUID REFERENCES trios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'achievement', 'system')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS trinity_chat_read_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES trinity_chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(message_id, user_id)
);

-- ===========================================
-- 6. TABELLE PER IL SISTEMA DI VIDEO CALL
-- ===========================================
CREATE TABLE IF NOT EXISTS video_call_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trio_id UUID NOT NULL REFERENCES trios(id) ON DELETE CASCADE,
  proposed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  proposed_datetime TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL DEFAULT 'Trinity Video Call',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scheduled_video_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trio_id UUID NOT NULL REFERENCES trios(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES video_call_proposals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_datetime TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  meeting_url TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 7. INDICI PER PERFORMANCE
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_user_body_measurements_user_id ON user_body_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_body_measurements_date ON user_body_measurements(measurement_date);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON daily_tasks(user_id, task_date);
CREATE INDEX IF NOT EXISTS idx_weekly_tasks_user_week ON weekly_tasks(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_trinity_chat_messages_trio_id ON trinity_chat_messages(trio_id);
CREATE INDEX IF NOT EXISTS idx_trinity_chat_messages_created_at ON trinity_chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matching_queue_status ON matching_queue(status);
CREATE INDEX IF NOT EXISTS idx_trios_status ON trios(status);

-- ===========================================
-- 8. ABILITA RLS (Row Level Security)
-- ===========================================
ALTER TABLE user_body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE trios ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trinity_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE trinity_chat_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_call_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_video_calls ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 9. POLICY RLS di BASE (da personalizzare)
-- ===========================================
-- Nota: Queste sono policy di base. Dovrebbero essere personalizzate
-- in base alle esigenze specifiche dell'applicazione

-- User body measurements - Users can only see their own data
CREATE POLICY "Users can view their own measurements" ON user_body_measurements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own measurements" ON user_body_measurements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own measurements" ON user_body_measurements
  FOR UPDATE USING (auth.uid() = user_id);

-- Daily tasks - Users can only see their own tasks
CREATE POLICY "Users can view their own daily tasks" ON daily_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily tasks" ON daily_tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- Weekly tasks - Users can only see their own tasks
CREATE POLICY "Users can view their own weekly tasks" ON weekly_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly tasks" ON weekly_tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- Chat messages - Temporarily allow all access (should be restricted to trio members)
CREATE POLICY "Allow public read access to chat" ON trinity_chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to chat" ON trinity_chat_messages
  FOR INSERT WITH CHECK (true);

-- ===========================================
-- 10. VERIFICA FINALE
-- ===========================================
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;
