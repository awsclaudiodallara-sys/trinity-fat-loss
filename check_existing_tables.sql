-- Query semplice per vedere i nomi delle tabelle esistenti
-- Esegui questo nel SQL Editor di Supabase

SELECT
    tablename AS "Nome Tabella",
    tableowner AS "Proprietario"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;
