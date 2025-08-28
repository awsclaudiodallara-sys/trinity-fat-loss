-- Fix Trinity Chat Foreign Key Relationships
-- Esegui questo nel SQL Editor di Supabase

-- 1. Prima controlliamo se esiste la tabella user_profiles
DO $$
BEGIN
    -- Se non esiste user_profiles, la creiamo
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        CREATE TABLE user_profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Abilita RLS
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
        
        -- Policy per user_profiles
        CREATE POLICY "Allow users to read all profiles" ON user_profiles
            FOR SELECT USING (true);
            
        CREATE POLICY "Allow users to update own profile" ON user_profiles
            FOR UPDATE USING (auth.uid() = id);
            
        CREATE POLICY "Allow users to insert own profile" ON user_profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END
$$;

-- 2. Ora ricreiamo la tabella trinity_chat_messages con la foreign key corretta
DROP TABLE IF EXISTS trinity_chat_messages;

CREATE TABLE trinity_chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trio_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'achievement', 'system')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Crea indici per performance
CREATE INDEX idx_trinity_chat_messages_trio_id ON trinity_chat_messages(trio_id);
CREATE INDEX idx_trinity_chat_messages_created_at ON trinity_chat_messages(created_at DESC);
CREATE INDEX idx_trinity_chat_messages_user_id ON trinity_chat_messages(user_id);

-- 4. Abilita RLS
ALTER TABLE trinity_chat_messages ENABLE ROW LEVEL SECURITY;

-- 5. Policy per i messaggi
CREATE POLICY "Allow authenticated users to read messages" ON trinity_chat_messages
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert messages" ON trinity_chat_messages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- 6. Trigger per aggiornare updated_at
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

-- 7. Inserisci/aggiorna il profilo utente corrente (modifica con i tuoi dati)
INSERT INTO user_profiles (id, name, email) 
VALUES (
    'cf5b65c4-811a-4b06-8f18-7846c974de4d', 
    'DevBooba Green', 
    'devboobagreen@gmail.com'
) 
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = NOW();

-- 8. Crea alcuni utenti di test con UUID validi (solo se non esistono già)
INSERT INTO user_profiles (id, name, email) 
SELECT gen_random_uuid(), 'Marco Rossi', 'marco@test.com'
WHERE NOT EXISTS (SELECT 1 FROM user_profiles WHERE email = 'marco@test.com');

INSERT INTO user_profiles (id, name, email) 
SELECT gen_random_uuid(), 'Giulia Bianchi', 'giulia@test.com'
WHERE NOT EXISTS (SELECT 1 FROM user_profiles WHERE email = 'giulia@test.com');

INSERT INTO user_profiles (id, name, email) 
SELECT gen_random_uuid(), 'Andrea Verdi', 'andrea@test.com'
WHERE NOT EXISTS (SELECT 1 FROM user_profiles WHERE email = 'andrea@test.com');

-- 9. Inserisci messaggi di test con riferimenti corretti agli utenti
-- Prima otteniamo gli UUID dei test users
DO $$
DECLARE
    user_marco UUID;
    user_giulia UUID;
    user_andrea UUID;
BEGIN
    -- Ottieni gli ID degli utenti di test
    SELECT id INTO user_marco FROM user_profiles WHERE email = 'marco@test.com';
    SELECT id INTO user_giulia FROM user_profiles WHERE email = 'giulia@test.com';
    SELECT id INTO user_andrea FROM user_profiles WHERE email = 'andrea@test.com';
    
    -- Inserisci i messaggi di test
    INSERT INTO trinity_chat_messages (trio_id, user_id, message, message_type) VALUES
    ('demo-trio-id', 'cf5b65c4-811a-4b06-8f18-7846c974de4d', 'Ciao a tutti! Come va l''allenamento oggi?', 'text'),
    ('demo-trio-id', COALESCE(user_giulia, gen_random_uuid()), 'Tutto bene! Ho appena finito la sessione di cardio 💪', 'text'),
    ('demo-trio-id', COALESCE(user_andrea, gen_random_uuid()), 'Perfetto! Anch''io sto per iniziare 🔥', 'text'),
    ('demo-trio-id', COALESCE(user_marco, gen_random_uuid()), '🏆 Marco ha raggiunto un nuovo traguardo!', 'achievement');
END
$$;

-- 10. Abilita realtime per la tabella
ALTER PUBLICATION supabase_realtime ADD TABLE trinity_chat_messages;

-- 11. Verifica che tutto funzioni
SELECT 
    m.*,
    p.name,
    p.email
FROM trinity_chat_messages m
JOIN user_profiles p ON m.user_id = p.id
ORDER BY m.created_at DESC 
LIMIT 5;
