-- Fix per errori database schema - versione aggiornata

-- 1. Controlliamo lo schema della tabella users
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Controlliamo lo schema della tabella user_body_measurements
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_body_measurements' 
ORDER BY ordinal_position;

-- 3. Se la tabella users non ha le colonne necessarie, le aggiungiamo
-- (Esegui solo se le colonne non esistono)
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_weight DECIMAL(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS height DECIMAL(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS neck_circumference DECIMAL(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS waist_circumference DECIMAL(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS hip_circumference DECIMAL(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS neckcircumference DECIMAL(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS waistcircumference DECIMAL(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS chipcircumference DECIMAL(5,2);

-- 4. Se la tabella user_body_measurements non ha measurement_date, la aggiungiamo
ALTER TABLE user_body_measurements ADD COLUMN IF NOT EXISTS measurement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Creiamo la tabella trinity_chat_read_status se non esiste
CREATE TABLE IF NOT EXISTS trinity_chat_read_status (
    message_id UUID REFERENCES trinity_chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (message_id, user_id)
);

-- 6. Aggiungiamo RLS per trinity_chat_read_status
ALTER TABLE trinity_chat_read_status ENABLE ROW LEVEL SECURITY;

-- Policy per permettere agli utenti di leggere solo i propri record
DROP POLICY IF EXISTS "Users can read their own read status" ON trinity_chat_read_status;
CREATE POLICY "Users can read their own read status" ON trinity_chat_read_status
    FOR SELECT USING (auth.uid() = user_id);

-- Policy per permettere agli utenti di inserire/aggiornare solo i propri record
DROP POLICY IF EXISTS "Users can insert their own read status" ON trinity_chat_read_status;
CREATE POLICY "Users can insert their own read status" ON trinity_chat_read_status
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own read status" ON trinity_chat_read_status;
CREATE POLICY "Users can update their own read status" ON trinity_chat_read_status
    FOR UPDATE USING (auth.uid() = user_id);

-- Verifica finale
SELECT 'users table columns:' as check_type;
SELECT column_name FROM information_schema.columns WHERE table_name = 'users';

SELECT 'user_body_measurements table columns:' as check_type;
SELECT column_name FROM information_schema.columns WHERE table_name = 'user_body_measurements';

SELECT 'trinity_chat_read_status table exists:' as check_type;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'trinity_chat_read_status'
) as table_exists;
