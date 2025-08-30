import { useState, useEffect, useCallback } from 'react';
import { webrtcService } from './webrtc';
import { signalingService } from './videoCallService';
import type { SignalingMessage } from './videoCallService';

export interface WebRTCSignalingState {
  isConnecting: boolean;
  isConnected: boolean;
  remoteStream: MediaStream | null;
  error: string | null;
}

export const useWebRTCSignaling = (callId: string, userId: string) => {
  const [state, setState] = useState<WebRTCSignalingState>({
    isConnecting: false,
    isConnected: false,
    remoteStream: null,
    error: null
  });

  // Handler per messaggi di signaling ricevuti
  const handleSignalingMessage = useCallback(async (message: SignalingMessage) => {
    try {
      console.log('Messaggio signaling ricevuto:', message);

      switch (message.message_type) {
        case 'offer': {
          // Ricevuta un'offerta - creare risposta
          const answer = await webrtcService.createAnswer(message.message_data as RTCSessionDescriptionInit);
          await signalingService.sendSignalingMessage({
            call_id: callId,
            from_user_id: userId,
            to_user_id: message.from_user_id,
            message_type: 'answer',
            message_data: answer
          });
          break;
        }

        case 'answer': {
          // Ricevuta risposta - impostare descrizione remota
          await webrtcService.handleAnswer(message.message_data as RTCSessionDescriptionInit);
          setState(prev => ({ ...prev, isConnected: true, isConnecting: false }));
          break;
        }

        case 'ice-candidate': {
          // Ricevuto ICE candidate - aggiungerlo
          await webrtcService.addIceCandidate(message.message_data as RTCIceCandidateInit);
          break;
        }
      }
    } catch (error) {
      console.error('Errore nella gestione del messaggio signaling:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Errore nella connessione P2P',
        isConnecting: false 
      }));
    }
  }, [callId, userId]);

  // Inizia una chiamata (caller)
  const startCall = useCallback(async (targetUserId: string) => {
    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));

      // Configura callback per ICE candidates e stream remoto
      webrtcService.setSignalingCallbacks(
        // On ICE Candidate
        async (candidate) => {
          await signalingService.sendSignalingMessage({
            call_id: callId,
            from_user_id: userId,
            to_user_id: targetUserId,
            message_type: 'ice-candidate',
            message_data: candidate
          });
        },
        // On Remote Stream
        (stream) => {
          setState(prev => ({ ...prev, remoteStream: stream }));
        }
      );

      // Crea offerta
      const offer = await webrtcService.createOffer();
      
      // Invia offerta tramite signaling
      await signalingService.sendSignalingMessage({
        call_id: callId,
        from_user_id: userId,
        to_user_id: targetUserId,
        message_type: 'offer',
        message_data: offer
      });

    } catch (error) {
      console.error('Errore nell\'avviare la chiamata:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Impossibile avviare la chiamata',
        isConnecting: false 
      }));
    }
  }, [callId, userId]);

  // Termina la chiamata
  const endCall = useCallback(() => {
    webrtcService.disconnect();
    setState({
      isConnecting: false,
      isConnected: false,
      remoteStream: null,
      error: null
    });
  }, []);

  // Sottoscrizione al signaling quando il componente viene montato
  useEffect(() => {
    const unsubscribe = signalingService.subscribeToSignaling(
      callId,
      userId,
      handleSignalingMessage
    );

    return () => {
      unsubscribe();
    };
  }, [callId, userId, handleSignalingMessage]);

  return {
    state,
    startCall,
    endCall
  };
};
