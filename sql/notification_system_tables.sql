-- TRINITY FAT LOSS - Notification System Database Tables
-- Tabelle per il sistema di notifiche completo

-- 1. Tabella per i log delle notifiche
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'trio_formation',
    'trio_formation_failed', 
    'video_call_reminder',
    'chat_message',
    'achievement'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channels TEXT[] NOT NULL, -- Array di canali: email, push, toast
  data JSONB,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'sent',
    'failed',
    'partial'
  )),
  email_status TEXT DEFAULT 'not_sent' CHECK (email_status IN (
    'not_sent',
    'sent',
    'failed'
  )),
  push_status TEXT DEFAULT 'not_sent' CHECK (push_status IN (
    'not_sent', 
    'sent',
    'failed'
  )),
  toast_status TEXT DEFAULT 'not_sent' CHECK (toast_status IN (
    'not_sent',
    'sent', 
    'failed'
  )),
  error_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabella per i token di push notification (FCM)
CREATE TABLE IF NOT EXISTS push_notification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  device_info JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabella per le preferenze di notifica degli utenti
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  toast_enabled BOOLEAN DEFAULT TRUE,
  trio_formation_email BOOLEAN DEFAULT TRUE,
  trio_formation_push BOOLEAN DEFAULT TRUE,
  video_call_email BOOLEAN DEFAULT TRUE,
  video_call_push BOOLEAN DEFAULT TRUE,
  chat_message_push BOOLEAN DEFAULT TRUE,
  achievement_email BOOLEAN DEFAULT TRUE,
  achievement_push BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes per performance
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_notification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON push_notification_tokens(is_active);

CREATE INDEX IF NOT EXISTS idx_notification_prefs_user_id ON notification_preferences(user_id);

-- RLS (Row Level Security) policies
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notification logs
CREATE POLICY "Users can view their own notification logs" ON notification_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only manage their own push tokens
CREATE POLICY "Users can manage their own push tokens" ON push_notification_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Policy: Users can only manage their own notification preferences  
CREATE POLICY "Users can manage their own notification preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Insert default notification preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM user_profiles 
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- Function to auto-create notification preferences for new users
CREATE OR REPLACE FUNCTION create_notification_preferences_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notification preferences when a user is created
DROP TRIGGER IF EXISTS trigger_create_notification_preferences ON user_profiles;
CREATE TRIGGER trigger_create_notification_preferences
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_preferences_for_new_user();

-- Function to update notification log status
CREATE OR REPLACE FUNCTION update_notification_log_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Update overall status based on individual channel statuses
  IF NEW.email_status = 'sent' AND NEW.push_status = 'sent' AND NEW.toast_status = 'sent' THEN
    NEW.status = 'sent';
  ELSIF NEW.email_status = 'failed' AND NEW.push_status = 'failed' AND NEW.toast_status = 'failed' THEN
    NEW.status = 'failed';
  ELSIF NEW.email_status != 'not_sent' OR NEW.push_status != 'not_sent' OR NEW.toast_status != 'not_sent' THEN
    NEW.status = 'partial';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update notification status
DROP TRIGGER IF EXISTS trigger_update_notification_status ON notification_logs;
CREATE TRIGGER trigger_update_notification_status
  BEFORE UPDATE ON notification_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_log_status();
