-- Query con limite ridotto per evitare timeout
-- Prova questa se la query precedente va in timeout

SELECT
    tablename AS "Nome Tabella"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
ORDER BY tablename
LIMIT 10;
