-- TRINITY FAT LOSS - Video Call Scheduling Schema
-- Flusso A: Sistema di Proposta Semplice
-- 
-- WORKFLOW:
-- 1. Un membro del trio propone una data/ora
-- 2. Gli altri 2 membri confermano o rifiutano
-- 3. Se tutti confermano → call programmata
-- 4. Se qualcuno rifiuta → proposta cancellata

-- Tabella per le proposte di videochiamata
CREATE TABLE IF NOT EXISTS video_call_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trio_id UUID NOT NULL, -- ID del trio (gruppo di 3 persone)
  proposed_by UUID NOT NULL, -- ID dell'utente che ha fatto la proposta
  proposed_datetime TIMESTAMPTZ NOT NULL, -- Data e ora proposta
  title VARCHAR(255) DEFAULT 'Weekly Trinity Call', -- Titolo della chiamata
  description TEXT, -- Descrizione opzionale
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
  
  -- Metadati
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Vincoli
  CONSTRAINT future_datetime CHECK (proposed_datetime > NOW()),
  CONSTRAINT valid_trio FOREIGN KEY (trio_id) REFERENCES trios(id),
  CONSTRAINT valid_proposer FOREIGN KEY (proposed_by) REFERENCES users(id)
);

-- Tabella per le conferme/rifiuti delle proposte
CREATE TABLE IF NOT EXISTS video_call_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES video_call_proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- ID dell'utente che risponde
  response VARCHAR(10) NOT NULL CHECK (response IN ('confirmed', 'rejected')),
  responded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Vincoli per evitare risposte duplicate
  UNIQUE(proposal_id, user_id)
);

-- Tabella per le videochiamate confermate (quando tutti hanno detto sì)
CREATE TABLE IF NOT EXISTS scheduled_video_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES video_call_proposals(id),
  trio_id UUID NOT NULL,
  scheduled_datetime TIMESTAMPTZ NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Stati della chiamata
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'missed')),
  
  -- Tracking della chiamata
  call_started_at TIMESTAMPTZ,
  call_ended_at TIMESTAMPTZ,
  call_duration_minutes INTEGER,
  
  -- Metadati
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_trio FOREIGN KEY (trio_id) REFERENCES trios(id)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_proposals_trio_status ON video_call_proposals(trio_id, status);
CREATE INDEX IF NOT EXISTS idx_proposals_datetime ON video_call_proposals(proposed_datetime);
CREATE INDEX IF NOT EXISTS idx_confirmations_proposal ON video_call_confirmations(proposal_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_trio ON scheduled_video_calls(trio_id, status);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_datetime ON scheduled_video_calls(scheduled_datetime);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_proposals_updated_at 
    BEFORE UPDATE ON video_call_proposals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_calls_updated_at 
    BEFORE UPDATE ON scheduled_video_calls 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funzione per controllare se una proposta è completa (tutti hanno risposto)
CREATE OR REPLACE FUNCTION check_proposal_completion()
RETURNS TRIGGER AS $$
DECLARE
    trio_member_count INTEGER;
    response_count INTEGER;
    confirmed_count INTEGER;
    rejected_count INTEGER;
BEGIN
    -- Conta i membri del trio (dovrebbero essere sempre 3)
    SELECT COUNT(*) INTO trio_member_count 
    FROM trio_members 
    WHERE trio_id = (SELECT trio_id FROM video_call_proposals WHERE id = NEW.proposal_id);
    
    -- Conta le risposte per questa proposta
    SELECT COUNT(*) INTO response_count 
    FROM video_call_confirmations 
    WHERE proposal_id = NEW.proposal_id;
    
    -- Conta conferme e rifiuti
    SELECT COUNT(*) INTO confirmed_count 
    FROM video_call_confirmations 
    WHERE proposal_id = NEW.proposal_id AND response = 'confirmed';
    
    SELECT COUNT(*) INTO rejected_count 
    FROM video_call_confirmations 
    WHERE proposal_id = NEW.proposal_id AND response = 'rejected';
    
    -- Se tutti hanno risposto
    IF response_count = trio_member_count - 1 THEN -- -1 perché chi propone non deve confermare
        IF rejected_count > 0 THEN
            -- Almeno uno ha rifiutato → proposta rifiutata
            UPDATE video_call_proposals 
            SET status = 'rejected' 
            WHERE id = NEW.proposal_id;
        ELSIF confirmed_count = trio_member_count - 1 THEN
            -- Tutti hanno confermato → proposta confermata
            UPDATE video_call_proposals 
            SET status = 'confirmed' 
            WHERE id = NEW.proposal_id;
            
            -- Crea la videochiamata programmata
            INSERT INTO scheduled_video_calls (
                proposal_id, trio_id, scheduled_datetime, title, description
            ) 
            SELECT 
                id, trio_id, proposed_datetime, title, description
            FROM video_call_proposals 
            WHERE id = NEW.proposal_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger che si attiva quando qualcuno risponde a una proposta
CREATE TRIGGER check_proposal_completion_trigger
    AFTER INSERT OR UPDATE ON video_call_confirmations
    FOR EACH ROW EXECUTE FUNCTION check_proposal_completion();

-- View per ottenere facilmente lo stato delle proposte con le risposte
CREATE OR REPLACE VIEW proposal_status_view AS
SELECT 
    p.id as proposal_id,
    p.trio_id,
    p.proposed_by,
    p.proposed_datetime,
    p.title,
    p.description,
    p.status,
    p.created_at,
    
    -- Conta delle risposte
    COALESCE(conf_count.confirmed, 0) as confirmed_count,
    COALESCE(conf_count.rejected, 0) as rejected_count,
    COALESCE(conf_count.total_responses, 0) as total_responses,
    
    -- Lista degli utenti che hanno risposto
    COALESCE(responders.confirmed_users, '[]'::jsonb) as confirmed_users,
    COALESCE(responders.rejected_users, '[]'::jsonb) as rejected_users
    
FROM video_call_proposals p
LEFT JOIN (
    SELECT 
        proposal_id,
        SUM(CASE WHEN response = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN response = 'rejected' THEN 1 ELSE 0 END) as rejected,
        COUNT(*) as total_responses
    FROM video_call_confirmations
    GROUP BY proposal_id
) conf_count ON p.id = conf_count.proposal_id
LEFT JOIN (
    SELECT 
        proposal_id,
        jsonb_agg(CASE WHEN response = 'confirmed' THEN user_id ELSE NULL END) 
            FILTER (WHERE response = 'confirmed') as confirmed_users,
        jsonb_agg(CASE WHEN response = 'rejected' THEN user_id ELSE NULL END) 
            FILTER (WHERE response = 'rejected') as rejected_users
    FROM video_call_confirmations
    GROUP BY proposal_id
) responders ON p.id = responders.proposal_id;
