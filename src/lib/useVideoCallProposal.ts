/**
 * TRINITY FAT LOSS - React Hook per Video Call Scheduling
 * Flusso A: Sistema di Proposta Semplice
 * 
 * Hook per gestire lo stato delle proposte di videochiamata in React
 */

import { useState, useEffect, useCallback } from 'react';
import { VideoCallSchedulingService, SchedulingUtils } from './videoCallSchedulingService';
import type { ProposalStatusView, ScheduledVideoCall } from './videoCallSchedulingService';

export interface UseVideoCallProposalState {
  // Stato corrente
  activePendingProposal: ProposalStatusView | null;
  nextScheduledCall: ScheduledVideoCall | null;
  
  // Stati di caricamento
  isLoading: boolean;
  isCreatingProposal: boolean;
  isResponding: boolean;
  
  // Errori
  error: string | null;
  
  // Contatori utili
  pendingResponsesCount: number;
  canJoinCall: boolean; // true se la call è entro 15 minuti
  timeUntilCall: string | null;
}

export interface UseVideoCallProposalActions {
  // Azioni per le proposte
  createProposal: (datetime: Date, title?: string, description?: string) => Promise<boolean>;
  confirmProposal: (proposalId: string) => Promise<boolean>;
  rejectProposal: (proposalId: string) => Promise<boolean>;
  cancelProposal: (proposalId: string) => Promise<boolean>;
  
  // Azioni per le chiamate
  markCallAsStarted: (callId: string) => Promise<boolean>;
  markCallAsCompleted: (callId: string, durationMinutes: number) => Promise<boolean>;
  
  // Utilities
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export interface UseVideoCallProposalReturn extends UseVideoCallProposalState, UseVideoCallProposalActions {}

/**
 * Hook principale per gestire le proposte di videochiamata
 */
export function useVideoCallProposal(
  trioId: string,
  currentUserId: string
): UseVideoCallProposalReturn {
  
  // Stati
  const [activePendingProposal, setActivePendingProposal] = useState<ProposalStatusView | null>(null);
  const [nextScheduledCall, setNextScheduledCall] = useState<ScheduledVideoCall | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcoli derivati
  const pendingResponsesCount = activePendingProposal 
    ? (2 - activePendingProposal.total_responses) // 2 = altri membri che devono rispondere
    : 0;

  const canJoinCall = nextScheduledCall 
    ? SchedulingUtils.isWithin15Minutes(nextScheduledCall.scheduled_datetime)
    : false;

  const timeUntilCall = nextScheduledCall 
    ? SchedulingUtils.timeUntil(nextScheduledCall.scheduled_datetime)
    : null;

  /**
   * Carica i dati iniziali
   */
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Carica proposta attiva e prossima chiamata in parallelo
      const [pendingProposal, scheduledCall] = await Promise.all([
        VideoCallSchedulingService.getActivePendingProposal(trioId),
        VideoCallSchedulingService.getNextScheduledCall(trioId),
      ]);

      setActivePendingProposal(pendingProposal);
      setNextScheduledCall(scheduledCall);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati');
    } finally {
      setIsLoading(false);
    }
  }, [trioId]);

  /**
   * Crea una nuova proposta
   */
  const createProposal = useCallback(async (
    datetime: Date, 
    title = 'Weekly Trinity Call', 
    description?: string
  ): Promise<boolean> => {
    try {
      setIsCreatingProposal(true);
      setError(null);

      const result = await VideoCallSchedulingService.createProposal({
        trioId,
        proposedBy: currentUserId,
        proposedDatetime: datetime,
        title,
        description,
      });

      if (result) {
        await refreshData(); // Ricarica i dati
        return true;
      } else {
        setError('Errore nella creazione della proposta');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella creazione della proposta');
      return false;
    } finally {
      setIsCreatingProposal(false);
    }
  }, [trioId, currentUserId, refreshData]);

  /**
   * Conferma una proposta
   */
  const confirmProposal = useCallback(async (proposalId: string): Promise<boolean> => {
    try {
      setIsResponding(true);
      setError(null);

      const result = await VideoCallSchedulingService.respondToProposal({
        proposalId,
        userId: currentUserId,
        response: 'confirmed',
      });

      if (result) {
        await refreshData();
        return true;
      } else {
        setError('Errore nella conferma della proposta');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella conferma della proposta');
      return false;
    } finally {
      setIsResponding(false);
    }
  }, [currentUserId, refreshData]);

  /**
   * Rifiuta una proposta
   */
  const rejectProposal = useCallback(async (proposalId: string): Promise<boolean> => {
    try {
      setIsResponding(true);
      setError(null);

      const result = await VideoCallSchedulingService.respondToProposal({
        proposalId,
        userId: currentUserId,
        response: 'rejected',
      });

      if (result) {
        await refreshData();
        return true;
      } else {
        setError('Errore nel rifiuto della proposta');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel rifiuto della proposta');
      return false;
    } finally {
      setIsResponding(false);
    }
  }, [currentUserId, refreshData]);

  /**
   * Cancella una proposta (solo chi l'ha creata)
   */
  const cancelProposal = useCallback(async (proposalId: string): Promise<boolean> => {
    try {
      setError(null);

      const result = await VideoCallSchedulingService.cancelProposal(proposalId, currentUserId);

      if (result) {
        await refreshData();
        return true;
      } else {
        setError('Errore nella cancellazione della proposta');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella cancellazione della proposta');
      return false;
    }
  }, [currentUserId, refreshData]);

  /**
   * Segna chiamata come iniziata
   */
  const markCallAsStarted = useCallback(async (callId: string): Promise<boolean> => {
    try {
      setError(null);

      const result = await VideoCallSchedulingService.markCallAsStarted(callId);

      if (result) {
        await refreshData();
        return true;
      } else {
        setError('Errore nel segnare la chiamata come iniziata');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel segnare la chiamata come iniziata');
      return false;
    }
  }, [refreshData]);

  /**
   * Segna chiamata come completata
   */
  const markCallAsCompleted = useCallback(async (callId: string, durationMinutes: number): Promise<boolean> => {
    try {
      setError(null);

      const result = await VideoCallSchedulingService.markCallAsCompleted(callId, durationMinutes);

      if (result) {
        await refreshData();
        return true;
      } else {
        setError('Errore nel segnare la chiamata come completata');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel segnare la chiamata come completata');
      return false;
    }
  }, [refreshData]);

  /**
   * Pulisce gli errori
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Carica dati iniziali
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Sottoscrizione real-time ai cambiamenti
  useEffect(() => {
    const subscription = VideoCallSchedulingService.subscribeToTrioProposals(
      trioId,
      () => {
        // Quando arriva un aggiornamento, ricarica i dati
        refreshData();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [trioId, refreshData]);

  // Ritorna stato e azioni
  return {
    // Stato
    activePendingProposal,
    nextScheduledCall,
    isLoading,
    isCreatingProposal,
    isResponding,
    error,
    pendingResponsesCount,
    canJoinCall,
    timeUntilCall,
    
    // Azioni
    createProposal,
    confirmProposal,
    rejectProposal,
    cancelProposal,
    markCallAsStarted,
    markCallAsCompleted,
    refreshData,
    clearError,
  };
}

/**
 * Hook semplificato per solo visualizzare lo stato senza azioni
 * Utile per componenti che mostrano solo informazioni
 */
export function useVideoCallStatus(trioId: string) {
  const {
    activePendingProposal,
    nextScheduledCall,
    isLoading,
    error,
    pendingResponsesCount,
    canJoinCall,
    timeUntilCall,
  } = useVideoCallProposal(trioId, ''); // userId vuoto perché non serve per solo leggere

  return {
    activePendingProposal,
    nextScheduledCall,
    isLoading,
    error,
    pendingResponsesCount,
    canJoinCall,
    timeUntilCall,
  };
}

/**
 * Hook per utility di formattazione (senza chiamate API)
 */
export function useSchedulingUtils() {
  return {
    formatDateTime: SchedulingUtils.formatDateTime,
    isFuture: SchedulingUtils.isFuture,
    timeUntil: SchedulingUtils.timeUntil,
    isWithin15Minutes: SchedulingUtils.isWithin15Minutes,
  };
}
