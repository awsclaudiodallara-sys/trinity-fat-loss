-- Trinity Fat Loss - Chat System Database Schema
-- Tabelle per gestire il sistema di chat real-time con Supabase

-- Tabella per i messaggi del gruppo
CREATE TABLE IF NOT EXISTS trinity_chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trio_id UUID NOT NULL REFERENCES user_matches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'achievement', 'system')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabella per tracciare i messaggi letti da ogni utente
CREATE TABLE IF NOT EXISTS trinity_chat_read_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES trinity_chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(message_id, user_id)
);

-- Tabella per lo stato di typing degli utenti
CREATE TABLE IF NOT EXISTS trinity_chat_typing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trio_id UUID NOT NULL REFERENCES user_matches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    is_typing BOOLEAN DEFAULT true,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(trio_id, user_id)
);

-- Indici per ottimizzare le query
CREATE INDEX IF NOT EXISTS idx_trinity_chat_messages_trio_id ON trinity_chat_messages(trio_id);
CREATE INDEX IF NOT EXISTS idx_trinity_chat_messages_created_at ON trinity_chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trinity_chat_read_status_user_id ON trinity_chat_read_status(user_id);
CREATE INDEX IF NOT EXISTS idx_trinity_chat_typing_trio_id ON trinity_chat_typing(trio_id);

-- RLS (Row Level Security) policies
ALTER TABLE trinity_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE trinity_chat_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE trinity_chat_typing ENABLE ROW LEVEL SECURITY;

-- Policy per i messaggi: gli utenti possono vedere solo i messaggi del loro trio
CREATE POLICY "Users can view messages from their trio" ON trinity_chat_messages
    FOR SELECT USING (
        trio_id IN (
            SELECT id FROM user_matches 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid() OR user3_id = auth.uid()
        )
    );

-- Policy per inserire messaggi: solo nel proprio trio
CREATE POLICY "Users can insert messages in their trio" ON trinity_chat_messages
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        trio_id IN (
            SELECT id FROM user_matches 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid() OR user3_id = auth.uid()
        )
    );

-- Policy per aggiornare i propri messaggi
CREATE POLICY "Users can update their own messages" ON trinity_chat_messages
    FOR UPDATE USING (user_id = auth.uid());

-- Policy per read status
CREATE POLICY "Users can manage their read status" ON trinity_chat_read_status
    FOR ALL USING (user_id = auth.uid());

-- Policy per typing status
CREATE POLICY "Users can manage their typing status" ON trinity_chat_typing
    FOR ALL USING (user_id = auth.uid());

-- Trigger per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trinity_chat_messages_updated_at BEFORE UPDATE
    ON trinity_chat_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funzione per pulire automaticamente i typing status vecchi (>30 secondi)
CREATE OR REPLACE FUNCTION cleanup_old_typing_status()
RETURNS void AS $$
BEGIN
    DELETE FROM trinity_chat_typing 
    WHERE started_at < NOW() - INTERVAL '30 seconds';
END;
$$ language 'plpgsql';

-- View per ottenere facilmente i dati completi dei messaggi con info utente
CREATE OR REPLACE VIEW trinity_chat_messages_with_user AS
SELECT 
    m.id,
    m.trio_id,
    m.user_id,
    m.message,
    m.message_type,
    m.metadata,
    m.created_at,
    m.updated_at,
    u.name as user_name,
    u.email as user_email
FROM trinity_chat_messages m
JOIN user_profiles u ON m.user_id = u.id
ORDER BY m.created_at ASC;
