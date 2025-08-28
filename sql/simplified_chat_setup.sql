-- Simplified Trinity Chat Setup without Auth constraints for test data
-- Esegui questo nel SQL Editor di Supabase

-- 1. Drop existing tables if they exist
DROP TABLE IF EXISTS trinity_chat_messages CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- 2. Create user_profiles table without auth constraint for now
CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create trinity_chat_messages table with foreign key to user_profiles
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

-- 4. Create indices for performance
CREATE INDEX idx_trinity_chat_messages_trio_id ON trinity_chat_messages(trio_id);
CREATE INDEX idx_trinity_chat_messages_created_at ON trinity_chat_messages(created_at DESC);
CREATE INDEX idx_trinity_chat_messages_user_id ON trinity_chat_messages(user_id);

-- 5. Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trinity_chat_messages ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for user_profiles
CREATE POLICY "Allow everyone to read profiles" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow everyone to insert profiles" ON user_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow everyone to update profiles" ON user_profiles
    FOR UPDATE USING (true);

-- 7. Create policies for messages
CREATE POLICY "Allow everyone to read messages" ON trinity_chat_messages
    FOR SELECT USING (true);

CREATE POLICY "Allow everyone to insert messages" ON trinity_chat_messages
    FOR INSERT WITH CHECK (true);

-- 8. Create trigger for updated_at
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

-- 9. Insert your user profile
INSERT INTO user_profiles (id, name, email) 
VALUES (
    'cf5b65c4-811a-4b06-8f18-7846c974de4d', 
    'DevBooba Green', 
    'devboobagreen@gmail.com'
);

-- 10. Insert test users
INSERT INTO user_profiles (name, email) VALUES
('Marco Rossi', 'marco@test.com'),
('Giulia Bianchi', 'giulia@test.com'),
('Andrea Verdi', 'andrea@test.com');

-- 11. Insert test messages
DO $$
DECLARE
    user_main UUID := 'cf5b65c4-811a-4b06-8f18-7846c974de4d';
    user_marco UUID;
    user_giulia UUID;
    user_andrea UUID;
BEGIN
    -- Get test user IDs
    SELECT id INTO user_marco FROM user_profiles WHERE email = 'marco@test.com';
    SELECT id INTO user_giulia FROM user_profiles WHERE email = 'giulia@test.com';
    SELECT id INTO user_andrea FROM user_profiles WHERE email = 'andrea@test.com';
    
    -- Insert test messages
    INSERT INTO trinity_chat_messages (trio_id, user_id, message, message_type) VALUES
    ('demo-trio-id', user_main, 'Ciao a tutti! Come va l''allenamento oggi?', 'text'),
    ('demo-trio-id', user_giulia, 'Tutto bene! Ho appena finito la sessione di cardio 💪', 'text'),
    ('demo-trio-id', user_andrea, 'Perfetto! Anch''io sto per iniziare 🔥', 'text'),
    ('demo-trio-id', user_marco, '🏆 Marco ha raggiunto un nuovo traguardo!', 'achievement');
END
$$;

-- 12. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE trinity_chat_messages;

-- 13. Verify setup
SELECT 
    m.id,
    m.trio_id,
    m.message,
    m.message_type,
    m.created_at,
    p.name as user_name,
    p.email as user_email
FROM trinity_chat_messages m
JOIN user_profiles p ON m.user_id = p.id
ORDER BY m.created_at DESC 
LIMIT 5;

-- Show table counts
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL
SELECT 'trinity_chat_messages' as table_name, COUNT(*) as count FROM trinity_chat_messages;
