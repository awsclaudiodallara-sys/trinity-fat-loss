-- ===========================================
-- PIANO DI RIPRISTINO DATABASE TRINITY FAT LOSS
-- ===========================================
-- Esegui questi script in ordine nel SQL Editor di Supabase
-- dopo aver creato un nuovo progetto o riattivato quello esistente

-- ===========================================
-- 1. PRIMA: Verifica connessione database
-- ===========================================
-- Script: test_connection.sql
-- SELECT 1 as test;

-- ===========================================
-- 2. Verifica tabelle esistenti
-- ===========================================
-- Script: check*existing_tables.sql
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'pg*%' ORDER BY tablename;

-- ===========================================
-- 3. CREAZIONE TABELLE BASE (in ordine di dipendenza)
-- ===========================================

-- 3.1 Tabella misurazioni corporee
-- Script: sql/create_body_measurements_table.sql
-- IMPORTANTE: Questa tabella fa riferimento a users(id), assicurati che la tabella users esista

-- 3.2 Sistema di chat completo
-- Script: sql/trinity_chat_system.sql
-- Include: trinity_chat_messages, trinity_chat_read_status, trinity_chat_typing

-- 3.3 Tabelle video call
-- Script: sql/video_call_tables.sql
-- Include: video_call_proposals, scheduled_video_calls

-- ===========================================
-- 4. FIX E MIGRAZIONI
-- ===========================================

-- 4.1 Fix schema database
-- Script: sql/fix_database_schema_complete.sql

-- 4.2 Fix relazioni chat
-- Script: sql/fix_chat_relationships.sql

-- 4.3 Fix profili utente
-- Script: sql/fix_user_profiles.sql

-- 4.4 Fix errori misurazioni
-- Script: sql/fix_body_measurements_errors.sql

-- ===========================================
-- 5. AGGIUNTE SUCCESSIVE
-- ===========================================

-- 5.1 Aggiungi colonna altezza
-- Script: sql/add_height_column.sql

-- 5.2 Aggiungi misurazioni corporee
-- Script: sql/add_body_measurements.sql

-- 5.3 Tabella stato lettura messaggi
-- Script: sql/create_read_status_table.sql

-- ===========================================
-- 6. PULIZIA E SETUP DEMO
-- ===========================================

-- 6.1 Setup chat semplificato
-- Script: sql/simplified_chat_setup.sql

-- 6.2 Pulizia messaggi demo
-- Script: sql/cleanup_demo_messages.sql

-- 6.3 Pulizia messaggi chat
-- Script: sql/clear_chat_messages.sql

-- ===========================================
-- 7. VERIFICA FINALE
-- ===========================================

-- Script: check_existing_tables.sql
-- Verifica che tutte le tabelle siano state create correttamente

-- ===========================================
-- NOTE IMPORTANTI:
-- ===========================================
-- 1. Esegui gli script in ordine per evitare errori di dipendenza
-- 2. La tabella 'users' di solito viene creata automaticamente da Supabase Auth
-- 3. Se ricevi errori di "relation does not exist", controlla le dipendenze
-- 4. Dopo il ripristino, testa l'app per verificare che tutto funzioni
-- 5. Aggiorna le credenziali dell'app se hai creato un nuovo progetto Supabase
