-- TRINITY FAT LOSS - Fix Finale per Notifiche Toast
-- Esegui questi comandi nel dashboard Supabase SQL Editor

-- 1. ABILITA REALTIME sulla tabella notification_logs
ALTER PUBLICATION supabase_realtime ADD TABLE notification_logs;

-- 2. CONTROLLA constraint esistenti
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'notification_logs'::regclass;

-- 3. AGGIUNGI policy RLS mancanti per INSERT e UPDATE
-- Policy: Allow service to insert notifications for any user
CREATE POLICY "Allow notification service to insert notifications" ON notification_logs
  FOR INSERT WITH CHECK (true);

-- Policy: Allow users to update their own notification status  
CREATE POLICY "Allow users to update their own notifications" ON notification_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. VERIFICA che Realtime sia abilitato
SELECT schemaname, tablename, pubname 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'notification_logs';

-- 5. OPZIONALE: Se ci sono problemi di constraint, rimuovi constraint di unicità problematici
-- Esegui prima il comando 2 per vedere i constraint, poi usa questo se necessario:
-- ALTER TABLE notification_logs DROP CONSTRAINT nome_constraint_problematico;
