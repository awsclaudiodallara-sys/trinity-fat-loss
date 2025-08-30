-- TRINITY FAT LOSS - Tabelle per Video Call Scheduling
-- Creare queste tabelle nel database Supabase

-- 1. Tabella per le proposte di video call
CREATE TABLE IF NOT EXISTS video_call_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trio_id UUID NOT NULL REFERENCES trios(id) ON DELETE CASCADE,
  proposed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  proposed_datetime TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL DEFAULT 'Trinity Video Call',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabella per le risposte alle proposte
CREATE TABLE IF NOT EXISTS video_call_proposal_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES video_call_proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  response TEXT NOT NULL CHECK (response IN ('confirmed', 'rejected')),
  responded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proposal_id, user_id)
);

-- 3. Tabella per le video call confermate/programmate
CREATE TABLE IF NOT EXISTS scheduled_video_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trio_id UUID NOT NULL REFERENCES trios(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES video_call_proposals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_datetime TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  meeting_url TEXT, -- Per Jitsi/WebRTC room URL
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabella per i partecipanti alle video call
CREATE TABLE IF NOT EXISTS video_call_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES scheduled_video_calls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'joined', 'left', 'no_show')),
  UNIQUE(call_id, user_id)
);

-- 5. Vista per le proposte con status aggregate
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
  COALESCE(
    ARRAY_AGG(
      CASE WHEN r.response = 'confirmed' THEN r.user_id END
    ) FILTER (WHERE r.response = 'confirmed'), 
    ARRAY[]::UUID[]
  ) as confirmed_users,
  COALESCE(
    ARRAY_AGG(
      CASE WHEN r.response = 'rejected' THEN r.user_id END
    ) FILTER (WHERE r.response = 'rejected'), 
    ARRAY[]::UUID[]
  ) as rejected_users,
  COUNT(CASE WHEN r.response = 'confirmed' THEN 1 END) as confirmed_count,
  COUNT(CASE WHEN r.response = 'rejected' THEN 1 END) as rejected_count,
  COUNT(r.id) as total_responses
FROM video_call_proposals p
LEFT JOIN video_call_proposal_responses r ON p.id = r.proposal_id
GROUP BY p.id, p.trio_id, p.proposed_by, p.proposed_datetime, p.title, p.description, p.status, p.created_at;

-- 6. Trigger per auto-update di updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Applica trigger alle tabelle
CREATE TRIGGER update_video_call_proposals_updated_at 
  BEFORE UPDATE ON video_call_proposals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_video_calls_updated_at 
  BEFORE UPDATE ON scheduled_video_calls 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Indici per performance
CREATE INDEX IF NOT EXISTS idx_video_call_proposals_trio_status ON video_call_proposals(trio_id, status);
CREATE INDEX IF NOT EXISTS idx_video_call_proposals_datetime ON video_call_proposals(proposed_datetime);
CREATE INDEX IF NOT EXISTS idx_scheduled_video_calls_trio_datetime ON scheduled_video_calls(trio_id, scheduled_datetime);
CREATE INDEX IF NOT EXISTS idx_video_call_participants_call_user ON video_call_participants(call_id, user_id);

-- 8. Row Level Security (RLS) - gli utenti possono vedere solo i loro trii
ALTER TABLE video_call_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_call_proposal_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_call_participants ENABLE ROW LEVEL SECURITY;

-- Policy per video_call_proposals
CREATE POLICY "Users can view proposals for their trios" ON video_call_proposals
  FOR SELECT USING (
    trio_id IN (
      SELECT id FROM trios 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid() OR user3_id = auth.uid()
    )
  );

CREATE POLICY "Users can create proposals for their trios" ON video_call_proposals
  FOR INSERT WITH CHECK (
    trio_id IN (
      SELECT id FROM trios 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid() OR user3_id = auth.uid()
    )
    AND proposed_by = auth.uid()
  );

-- Policy per video_call_proposal_responses
CREATE POLICY "Users can view responses for their trio proposals" ON video_call_proposal_responses
  FOR SELECT USING (
    proposal_id IN (
      SELECT p.id FROM video_call_proposals p
      JOIN trios t ON p.trio_id = t.id
      WHERE t.user1_id = auth.uid() OR t.user2_id = auth.uid() OR t.user3_id = auth.uid()
    )
  );

CREATE POLICY "Users can respond to proposals in their trios" ON video_call_proposal_responses
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    proposal_id IN (
      SELECT p.id FROM video_call_proposals p
      JOIN trios t ON p.trio_id = t.id
      WHERE t.user1_id = auth.uid() OR t.user2_id = auth.uid() OR t.user3_id = auth.uid()
    )
  );

-- Policy per scheduled_video_calls
CREATE POLICY "Users can view scheduled calls for their trios" ON scheduled_video_calls
  FOR SELECT USING (
    trio_id IN (
      SELECT id FROM trios 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid() OR user3_id = auth.uid()
    )
  );

-- Policy per video_call_participants
CREATE POLICY "Users can view participants for their trio calls" ON video_call_participants
  FOR SELECT USING (
    call_id IN (
      SELECT c.id FROM scheduled_video_calls c
      JOIN trios t ON c.trio_id = t.id
      WHERE t.user1_id = auth.uid() OR t.user2_id = auth.uid() OR t.user3_id = auth.uid()
    )
  );

-- 9. Funzione per auto-confermare una proposta quando tutti confermano
CREATE OR REPLACE FUNCTION check_proposal_confirmation()
RETURNS TRIGGER AS $$
DECLARE
  trio_member_count INTEGER;
  confirmed_count INTEGER;
  proposal_trio_id UUID;
BEGIN
  -- Ottieni trio_id della proposta
  SELECT trio_id INTO proposal_trio_id 
  FROM video_call_proposals 
  WHERE id = NEW.proposal_id;
  
  -- Conta i membri del trio (sempre 3)
  trio_member_count := 3;
  
  -- Conta quanti hanno confermato
  SELECT COUNT(*) INTO confirmed_count
  FROM video_call_proposal_responses
  WHERE proposal_id = NEW.proposal_id AND response = 'confirmed';
  
  -- Se tutti hanno confermato, crea la scheduled call
  IF confirmed_count = trio_member_count THEN
    INSERT INTO scheduled_video_calls (
      trio_id, 
      proposal_id, 
      title, 
      description, 
      scheduled_datetime, 
      created_by
    )
    SELECT 
      p.trio_id,
      p.id,
      p.title,
      p.description,
      p.proposed_datetime,
      p.proposed_by
    FROM video_call_proposals p
    WHERE p.id = NEW.proposal_id;
    
    -- Aggiorna lo status della proposta
    UPDATE video_call_proposals 
    SET status = 'confirmed' 
    WHERE id = NEW.proposal_id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per auto-conferma
CREATE TRIGGER trigger_check_proposal_confirmation
  AFTER INSERT ON video_call_proposal_responses
  FOR EACH ROW EXECUTE FUNCTION check_proposal_confirmation();

-- 10. Commenti per documentazione
COMMENT ON TABLE video_call_proposals IS 'Proposte di videochiamata fatte dai membri del trio';
COMMENT ON TABLE video_call_proposal_responses IS 'Risposte (conferma/rifiuto) alle proposte';
COMMENT ON TABLE scheduled_video_calls IS 'Videochiamata confermate e programmate';
COMMENT ON TABLE video_call_participants IS 'Partecipanti alle videochiamata';
COMMENT ON VIEW proposal_status_view IS 'Vista aggregata delle proposte con conteggi di conferme/rifiuti';
