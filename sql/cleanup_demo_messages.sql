-- Pulizia messaggi demo dal database
-- Mantieni solo i messaggi del trio reale

-- 1. Verifica i trio_id esistenti
SELECT trio_id, COUNT(*) as message_count 
FROM trinity_chat_messages 
GROUP BY trio_id;

-- 2. Elimina tutti i messaggi con trio_id demo
DELETE FROM trinity_chat_messages 
WHERE trio_id = 'demo-trio-id';

-- 3. Verifica che siano rimasti solo i messaggi del trio reale
SELECT trio_id, COUNT(*) as message_count 
FROM trinity_chat_messages 
GROUP BY trio_id;

-- 4. Mostra gli ultimi 5 messaggi del trio reale
SELECT 
    id,
    trio_id, 
    user_id, 
    message, 
    created_at
FROM trinity_chat_messages 
WHERE trio_id = '3b2b8e7d-0712-4007-9221-36be8b1835d9'
ORDER BY created_at DESC
LIMIT 5;
