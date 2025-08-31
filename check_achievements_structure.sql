-- Controlla la struttura attuale della tabella achievements
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'achievements'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Vedi alcuni record esistenti per capire la struttura
SELECT * FROM achievements LIMIT 5;

-- Conta quanti record ci sono
SELECT COUNT(*) as total_achievements FROM achievements;
