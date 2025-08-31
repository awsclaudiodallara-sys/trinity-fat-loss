-- Query per vedere tutte le tabelle esistenti nel database Supabase
-- Esegui questo script nel SQL Editor di Supabase

-- 1. Vedi tutte le tabelle nel database corrente
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename;

-- 2. Conta quante tabelle ci sono per schema
SELECT
    schemaname,
    COUNT(*) as table_count
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
GROUP BY schemaname
ORDER BY schemaname;

-- 3. Vedi le colonne delle tabelle principali (se esistono)
-- Users table
SELECT
    'users' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Body measurements table
SELECT
    'user_body_measurements' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_body_measurements'
ORDER BY ordinal_position;

-- Chat messages table
SELECT
    'trinity_chat_messages' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'trinity_chat_messages'
ORDER BY ordinal_position;
