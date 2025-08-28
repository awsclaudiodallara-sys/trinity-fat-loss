-- Script SQL semplificato per Trinity Chat
-- Esegui questo nel SQL Editor di Supabase

-- 1. Crea la tabella dei messaggi di chat
CREATE TABLE IF NOT EXISTS trinity_chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trio_id TEXT NOT NULL,
    user_id UUID NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'achievement', 'system')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Crea indici per performance
CREATE INDEX IF NOT EXISTS idx_trinity_chat_messages_trio_id ON trinity_chat_messages(trio_id);
CREATE INDEX IF NOT EXISTS idx_trinity_chat_messages_created_at ON trinity_chat_messages(created_at DESC);

-- 3. Abilita RLS (Row Level Security)
ALTER TABLE trinity_chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. Policy per permettere a tutti di leggere i messaggi (per ora, temporaneo)
CREATE POLICY "Allow public read access" ON trinity_chat_messages
    FOR SELECT USING (true);

-- 5. Policy per permettere a tutti di inserire messaggi (per ora, temporaneo)
CREATE POLICY "Allow public insert access" ON trinity_chat_messages
    FOR INSERT WITH CHECK (true);

-- 6. Trigger per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trinity_chat_messages_updated_at 
    BEFORE UPDATE ON trinity_chat_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Inserisci alcuni messaggi di test
INSERT INTO trinity_chat_messages (trio_id, user_id, user_name, user_email, message, message_type) VALUES
('demo-trio-id', 'user1', 'Marco', 'marco@test.com', 'Ciao a tutti! Come va l''allenamento oggi?', 'text'),
('demo-trio-id', 'user2', 'Giulia', 'giulia@test.com', 'Tutto bene! Ho appena finito la sessione di cardio 💪', 'text'),
('demo-trio-id', 'user3', 'Andrea', 'andrea@test.com', 'Perfetto! Anch''io sto per iniziare 🔥', 'text'),
('demo-trio-id', 'system', 'Trinity Bot', 'bot@trinity.com', '🏆 Marco ha raggiunto un nuovo traguardo!', 'achievement');

-- 8. Verifica che tutto funzioni
SELECT * FROM trinity_chat_messages ORDER BY created_at DESC LIMIT 5;
