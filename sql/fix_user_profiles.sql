-- Fix user_profiles per risolvere il problema foreign key
-- L'utente df5dd055-aa0e-4a26-9cff-c9a843c395f3 deve esistere in user_profiles

-- Prima controlliamo se l'utente esiste
SELECT id, email, name FROM auth.users WHERE id = 'df5dd055-aa0e-4a26-9cff-c9a843c395f3';

-- Controlliamo se esiste in user_profiles
SELECT * FROM user_profiles WHERE id = 'df5dd055-aa0e-4a26-9cff-c9a843c395f3';

-- Se non esiste, lo inseriamo
INSERT INTO user_profiles (id, name, email, avatar_url, created_at, updated_at)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'name', email) as name,
    email,
    raw_user_meta_data->>'avatar_url' as avatar_url,
    created_at,
    NOW() as updated_at
FROM auth.users 
WHERE id = 'df5dd055-aa0e-4a26-9cff-c9a843c395f3'
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = NOW();

-- Verifica finale
SELECT id, name, email FROM user_profiles WHERE id = 'df5dd055-aa0e-4a26-9cff-c9a843c395f3';
