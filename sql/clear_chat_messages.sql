-- Pulisce tutti i messaggi dalla chat per testare
DELETE FROM trinity_chat_messages;

-- Verifica che sia vuota
SELECT COUNT(*) as message_count FROM trinity_chat_messages;
