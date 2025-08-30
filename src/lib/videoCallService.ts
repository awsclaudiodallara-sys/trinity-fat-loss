import { supabase } from './supabase';

// Interfacce per i messaggi di signaling
export interface SignalingMessage {
  id?: string;
  call_id: string;
  from_user_id: string;
  to_user_id: string;
  message_type: 'offer' | 'answer' | 'ice-candidate';
  message_data: RTCSessionDescriptionInit | RTCIceCandidateInit;
  created_at?: string;
}

export interface VideoCallSignalingService {
  // Invia messaggio di signaling
  sendSignalingMessage(message: Omit<SignalingMessage, 'id' | 'created_at'>): Promise<void>;
  
  // Ascolta messaggi di signaling per una chiamata
  subscribeToSignaling(
    callId: string, 
    userId: string, 
    onMessage: (message: SignalingMessage) => void
  ): () => void;
  
  // Crea una nuova chiamata
  createCall(callId: string, hostUserId: string): Promise<void>;
  
  // Partecipa a una chiamata esistente
  joinCall(callId: string, userId: string): Promise<void>;
}

export class SupabaseVideoCallSignaling implements VideoCallSignalingService {
  
  // Invia un messaggio di signaling tramite Supabase
  async sendSignalingMessage(message: Omit<SignalingMessage, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('trinity_video_signaling')
      .insert([message]);
      
    if (error) {
      console.error('Errore nell\'invio del messaggio di signaling:', error);
      throw error;
    }
  }

  // Sottoscrive ai messaggi di signaling per una chiamata specifica
  subscribeToSignaling(
    callId: string, 
    userId: string, 
    onMessage: (message: SignalingMessage) => void
  ): () => void {
    
    const channel = supabase
      .channel(`video-call-${callId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trinity_video_signaling',
          filter: `call_id=eq.${callId} AND to_user_id=eq.${userId}`
        },
        (payload) => {
          const message = payload.new as SignalingMessage;
          onMessage(message);
        }
      )
      .subscribe();

    // Funzione di cleanup per rimuovere la sottoscrizione
    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Crea una nuova chiamata nel database
  async createCall(callId: string, hostUserId: string): Promise<void> {
    const { error } = await supabase
      .from('trinity_video_calls')
      .insert([{
        id: callId,
        host_user_id: hostUserId,
        status: 'waiting',
        created_at: new Date().toISOString()
      }]);
      
    if (error) {
      console.error('Errore nella creazione della chiamata:', error);
      throw error;
    }
  }

  // Partecipa a una chiamata esistente
  async joinCall(callId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('trinity_video_participants')
      .insert([{
        call_id: callId,
        user_id: userId,
        joined_at: new Date().toISOString(),
        is_connected: true
      }]);
      
    if (error) {
      console.error('Errore nel join della chiamata:', error);
      throw error;
    }
  }
}

// Istanza singleton del servizio
export const signalingService = new SupabaseVideoCallSignaling();