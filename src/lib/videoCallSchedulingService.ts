/**
 * TRINITY FAT LOSS - Video Call Scheduling Service
 * Flusso A: Sistema di Proposta Semplice
 *
 * Gestisce proposte di videochiamate e relative conferme/rifiuti
 */

import { supabase } from "./supabase";

// Tipi TypeScript per il sistema di scheduling
export interface VideoCallProposal {
  id: string;
  trio_id: string;
  proposed_by: string;
  proposed_datetime: string; // ISO string
  title: string;
  description?: string;
  status: "pending" | "confirmed" | "rejected" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface VideoCallConfirmation {
  id: string;
  proposal_id: string;
  user_id: string;
  response: "confirmed" | "rejected";
  responded_at: string;
}

export interface ScheduledVideoCall {
  id: string;
  proposal_id: string;
  trio_id: string;
  scheduled_datetime: string;
  title: string;
  description?: string;
  status: "scheduled" | "active" | "completed" | "missed";
  call_started_at?: string;
  call_ended_at?: string;
  call_duration_minutes?: number;
  created_at: string;
  updated_at: string;
}

export interface ProposalStatusView {
  proposal_id: string;
  trio_id: string;
  proposed_by: string;
  proposed_datetime: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
  confirmed_count: number;
  rejected_count: number;
  total_responses: number;
  confirmed_users: string[];
  rejected_users: string[];
}

/**
 * Service per gestire le proposte di videochiamata
 */
export class VideoCallSchedulingService {
  /**
   * Crea una nuova proposta di videochiamata
   */
  static async createProposal({
    trioId,
    proposedBy,
    proposedDatetime,
    title = "Weekly Trinity Call",
    description,
  }: {
    trioId: string;
    proposedBy: string;
    proposedDatetime: Date;
    title?: string;
    description?: string;
  }): Promise<VideoCallProposal | null> {
    try {
      // Controlla se esiste già una proposta pending per questo trio
      const { data: existingProposal } = await supabase
        .from("video_call_proposals")
        .select("id")
        .eq("trio_id", trioId)
        .eq("status", "pending")
        .single();

      if (existingProposal) {
        throw new Error("Esiste già una proposta in attesa per questo trio");
      }

      const { data, error } = await supabase
        .from("video_call_proposals")
        .insert({
          trio_id: trioId,
          proposed_by: proposedBy,
          proposed_datetime: proposedDatetime.toISOString(),
          title,
          description,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Errore nella creazione della proposta:", error);
      return null;
    }
  }

  /**
   * Ottieni le proposte per un trio
   */
  static async getProposalsForTrio(
    trioId: string
  ): Promise<ProposalStatusView[]> {
    try {
      const { data, error } = await supabase
        .from("proposal_status_view")
        .select("*")
        .eq("trio_id", trioId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Errore nel recupero delle proposte:", error);
      return [];
    }
  }

  /**
   * Ottieni la proposta attiva (pending) per un trio
   */
  static async getActivePendingProposal(
    trioId: string
  ): Promise<ProposalStatusView | null> {
    try {
      const { data, error } = await supabase
        .from("proposal_status_view")
        .select("*")
        .eq("trio_id", trioId)
        .eq("status", "pending")
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
      return data || null;
    } catch (error) {
      console.error("Errore nel recupero della proposta attiva:", error);
      return null;
    }
  }

  /**
   * Conferma o rifiuta una proposta
   */
  static async respondToProposal({
    proposalId,
    userId,
    response,
  }: {
    proposalId: string;
    userId: string;
    response: "confirmed" | "rejected";
  }): Promise<VideoCallConfirmation | null> {
    try {
      // Controlla se l'utente ha già risposto
      const { data: existingResponse } = await supabase
        .from("video_call_confirmations")
        .select("id")
        .eq("proposal_id", proposalId)
        .eq("user_id", userId)
        .single();

      if (existingResponse) {
        throw new Error("Hai già risposto a questa proposta");
      }

      const { data, error } = await supabase
        .from("video_call_confirmations")
        .insert({
          proposal_id: proposalId,
          user_id: userId,
          response,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Errore nella risposta alla proposta:", error);
      return null;
    }
  }

  /**
   * Cancella una proposta (solo chi l'ha creata)
   */
  static async cancelProposal(
    proposalId: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Verifica che l'utente sia chi ha fatto la proposta
      const { data: proposal } = await supabase
        .from("video_call_proposals")
        .select("proposed_by")
        .eq("id", proposalId)
        .single();

      if (!proposal || proposal.proposed_by !== userId) {
        throw new Error("Non puoi cancellare questa proposta");
      }

      const { error } = await supabase
        .from("video_call_proposals")
        .update({ status: "cancelled" })
        .eq("id", proposalId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Errore nella cancellazione della proposta:", error);
      return false;
    }
  }

  /**
   * Ottieni le videochiamate programmate per un trio
   */
  static async getScheduledCallsForTrio(
    trioId: string
  ): Promise<ScheduledVideoCall[]> {
    try {
      const { data, error } = await supabase
        .from("scheduled_video_calls")
        .select("*")
        .eq("trio_id", trioId)
        .order("scheduled_datetime", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Errore nel recupero delle chiamate programmate:", error);
      return [];
    }
  }

  /**
   * Ottieni la prossima videochiamata programmata per un trio
   */
  static async getNextScheduledCall(
    trioId: string
  ): Promise<ScheduledVideoCall | null> {
    try {
      const { data, error } = await supabase
        .from("scheduled_video_calls")
        .select("*")
        .eq("trio_id", trioId)
        .eq("status", "scheduled")
        .gte("scheduled_datetime", new Date().toISOString())
        .order("scheduled_datetime", { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data || null;
    } catch (error) {
      console.error("Errore nel recupero della prossima chiamata:", error);
      return null;
    }
  }

  /**
   * Segna una chiamata come iniziata
   */
  static async markCallAsStarted(callId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("scheduled_video_calls")
        .update({
          status: "active",
          call_started_at: new Date().toISOString(),
        })
        .eq("id", callId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Errore nel marcare la chiamata come iniziata:", error);
      return false;
    }
  }

  /**
   * Segna una chiamata come completata
   */
  static async markCallAsCompleted(
    callId: string,
    durationMinutes: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("scheduled_video_calls")
        .update({
          status: "completed",
          call_ended_at: new Date().toISOString(),
          call_duration_minutes: durationMinutes,
        })
        .eq("id", callId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Errore nel marcare la chiamata come completata:", error);
      return false;
    }
  }

  /**
   * Sottoscrizione real-time per i cambiamenti delle proposte di un trio
   */
  static subscribeToTrioProposals(
    trioId: string,
    callback: (proposal: ProposalStatusView) => void
  ) {
    return supabase
      .channel(`trio_proposals_${trioId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "video_call_proposals",
          filter: `trio_id=eq.${trioId}`,
        },
        async () => {
          // Quando cambia una proposta, ricarica la vista completa
          const proposals = await this.getProposalsForTrio(trioId);
          if (proposals.length > 0) {
            callback(proposals[0]); // Invia la più recente
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "video_call_confirmations",
        },
        async () => {
          // Quando cambia una conferma, ricarica le proposte
          const proposals = await this.getProposalsForTrio(trioId);
          if (proposals.length > 0) {
            callback(proposals[0]);
          }
        }
      )
      .subscribe();
  }
}

/**
 * Utility per formattare date e orari
 */
export class SchedulingUtils {
  /**
   * Formatta una data per la visualizzazione
   */
  static formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString("it-IT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Calcola se una data è nel futuro
   */
  static isFuture(dateString: string): boolean {
    return new Date(dateString) > new Date();
  }

  /**
   * Calcola il tempo rimanente in giorni/ore/minuti
   */
  static timeUntil(dateString: string): string {
    const now = new Date();
    const target = new Date(dateString);
    const diffMs = target.getTime() - now.getTime();

    if (diffMs <= 0) return "Passato";

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} giorni`;
    if (hours > 0) return `${hours} ore`;
    return `${minutes} minuti`;
  }

  /**
   * Verifica se una data è entro 15 minuti (per l'accesso anticipato)
   */
  static isWithin15Minutes(dateString: string): boolean {
    const now = new Date();
    const target = new Date(dateString);
    const diffMs = target.getTime() - now.getTime();

    return diffMs > 0 && diffMs <= 15 * 60 * 1000; // 15 minuti in millisecondi
  }
}
