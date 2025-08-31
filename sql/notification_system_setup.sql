-- TRINITY FAT LOSS - Notification System Tables
-- Tabelle per il sistema di notifiche

-- 1. Tabella per i log delle notifiche
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('trio_formation', 'trio_formation_failed', 'video_call_reminder', 'chat_message', 'achievement')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channels TEXT[] NOT NULL, -- Array di canali: email, push, toast
  data JSONB DEFAULT '{}',
  success BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabella per token push notifications (per Android/iOS)
CREATE TABLE IF NOT EXISTS push_notification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- 3. Tabella per preferenze notifiche utente
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trio_formation_email BOOLEAN DEFAULT true,
  trio_formation_push BOOLEAN DEFAULT true,
  video_call_reminder_email BOOLEAN DEFAULT true,
  video_call_reminder_push BOOLEAN DEFAULT true,
  chat_message_email BOOLEAN DEFAULT false, -- Default disabilitato per evitare spam
  chat_message_push BOOLEAN DEFAULT true,
  achievement_email BOOLEAN DEFAULT true,
  achievement_push BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_notification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON push_notification_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_notification_prefs_user_id ON notification_preferences(user_id);

-- RLS (Row Level Security)
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policy per notification_logs: gli utenti possono vedere solo i propri log
CREATE POLICY "Users can view their own notification logs" ON notification_logs
    FOR SELECT USING (user_id = auth.uid());

-- Policy per push_notification_tokens: gli utenti possono gestire solo i propri token
CREATE POLICY "Users can manage their own push tokens" ON push_notification_tokens
    FOR ALL USING (user_id = auth.uid());

-- Policy per notification_preferences: gli utenti possono gestire solo le proprie preferenze
CREATE POLICY "Users can manage their own notification preferences" ON notification_preferences
    FOR ALL USING (user_id = auth.uid());

-- Funzione per creare preferenze default quando si registra un utente
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per creare preferenze default
DROP TRIGGER IF EXISTS create_notification_preferences_trigger ON users;
CREATE TRIGGER create_notification_preferences_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notification_preferences();

-- Commenti per documentazione
COMMENT ON TABLE notification_logs IS 'Log di tutte le notifiche inviate agli utenti';
COMMENT ON TABLE push_notification_tokens IS 'Token per push notifications Android/iOS';
COMMENT ON TABLE notification_preferences IS 'Preferenze utente per i vari tipi di notifiche';

-- Query di test per verificare il setup
-- SELECT 'notification_logs' as table_name, COUNT(*) as count FROM notification_logs
-- UNION ALL
-- SELECT 'push_notification_tokens' as table_name, COUNT(*) as count FROM push_notification_tokens  
-- UNION ALL
-- SELECT 'notification_preferences' as table_name, COUNT(*) as count FROM notification_preferences;
