-- TRINITY FAT LOSS - Fix Notification System RLS Policies
-- Aggiorna le policy RLS per risolvere i problemi di permessi 403

-- 1. NOTIFICATION_LOGS - Policy più permissive
DROP POLICY IF EXISTS "Users can view their own notification logs" ON notification_logs;
DROP POLICY IF EXISTS "Users can insert their own notification logs" ON notification_logs;
DROP POLICY IF EXISTS "Service role can manage all notification logs" ON notification_logs;

-- Policy per permettere agli utenti di vedere i propri log
CREATE POLICY "Users can view their own notification logs" ON notification_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Policy per permettere agli utenti di inserire i propri log
CREATE POLICY "Users can insert their own notification logs" ON notification_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy per il service role (sistema interno) - permette tutto
CREATE POLICY "Service role can manage all notification logs" ON notification_logs
  FOR ALL USING (
    auth.role() = 'service_role' OR 
    auth.jwt() ->> 'role' = 'service_role'
  );

-- 2. PUSH_NOTIFICATION_TOKENS - Policy aggiornate
DROP POLICY IF EXISTS "Users can manage their own push tokens" ON push_notification_tokens;

CREATE POLICY "Users can view their own push tokens" ON push_notification_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push tokens" ON push_notification_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push tokens" ON push_notification_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push tokens" ON push_notification_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- 3. NOTIFICATION_PREFERENCES - Policy aggiornate
DROP POLICY IF EXISTS "Users can manage their own notification preferences" ON notification_preferences;

CREATE POLICY "Users can view their own notification preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Grant permessi espliciti per il service role
GRANT ALL ON notification_logs TO service_role;
GRANT ALL ON push_notification_tokens TO service_role;
GRANT ALL ON notification_preferences TO service_role;

-- 5. Grant permessi per authenticated users
GRANT SELECT, INSERT ON notification_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON push_notification_tokens TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notification_preferences TO authenticated;

-- 6. Verifica che le tabelle esistano e siano accessibili
SELECT 'notification_logs' as table_name, count(*) as row_count FROM notification_logs
UNION ALL
SELECT 'push_notification_tokens', count(*) FROM push_notification_tokens
UNION ALL
SELECT 'notification_preferences', count(*) FROM notification_preferences;
