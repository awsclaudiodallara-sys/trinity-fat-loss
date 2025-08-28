-- Verifica e crea la tabella trinity_chat_read_status se non esiste
-- Questo risolverà gli errori 404 per il contatore messaggi non letti

-- 1. Verifica se la tabella esiste
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'trinity_chat_read_status'
) as table_exists;

-- 2. Se non esiste, creiamola
CREATE TABLE IF NOT EXISTS trinity_chat_read_status (
    message_id UUID REFERENCES trinity_chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (message_id, user_id)
);

-- 3. Abilita RLS
ALTER TABLE trinity_chat_read_status ENABLE ROW LEVEL SECURITY;

-- 4. Crea le policy RLS
DROP POLICY IF EXISTS "Users can read their own read status" ON trinity_chat_read_status;
CREATE POLICY "Users can read their own read status" ON trinity_chat_read_status
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own read status" ON trinity_chat_read_status;
CREATE POLICY "Users can insert their own read status" ON trinity_chat_read_status
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own read status" ON trinity_chat_read_status;
CREATE POLICY "Users can update their own read status" ON trinity_chat_read_status
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. Verifica finale
SELECT 'trinity_chat_read_status created successfully' as status;
