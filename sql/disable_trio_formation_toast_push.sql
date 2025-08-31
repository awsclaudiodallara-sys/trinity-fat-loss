-- TRINITY FAT LOSS - Disabilita Toast e Push per Formazione Trio
-- Query per disabilitare definitivamente notifiche toast e push per trio formation

-- 1. Aggiorna le preferenze esistenti per disabilitare toast trio formation
UPDATE notification_preferences 
SET 
  trio_formation_push = FALSE,
  updated_at = NOW()
WHERE trio_formation_push = TRUE;

-- 2. Aggiorna la funzione per creare preferenze di default senza push trio
CREATE OR REPLACE FUNCTION create_notification_preferences_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (
    user_id,
    email_enabled,
    push_enabled,
    toast_enabled,
    trio_formation_email,
    trio_formation_push, -- FALSE per default
    video_call_email,
    video_call_push,
    chat_message_push,
    achievement_email,
    achievement_push
  )
  VALUES (
    NEW.id,
    TRUE,  -- email generale ON
    TRUE,  -- push generale ON
    TRUE,  -- toast generale ON
    TRUE,  -- trio formation EMAIL ON
    FALSE, -- trio formation PUSH OFF
    TRUE,  -- video call email ON
    TRUE,  -- video call push ON
    TRUE,  -- chat message push ON
    TRUE,  -- achievement email ON
    TRUE   -- achievement push ON
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Verifica le preferenze aggiornate
SELECT 
  user_id,
  trio_formation_email,
  trio_formation_push,
  updated_at
FROM notification_preferences 
LIMIT 5;

COMMENT ON TABLE notification_preferences IS 'AGGIORNATO: trio_formation_push=FALSE per tutti gli utenti. Solo EMAIL per formazione trio.';
