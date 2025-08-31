/**
 * TRINITY FAT LOSS - Queue Monitor Service
 * Monitora la coda di matching e invia notifiche per formazioni fallite
 */

import { supabase } from "../lib/supabase";
import { NotificationService } from "./notificationService";

interface QueueEntry {
  id: string;
  user_id: string;
  created_at: string;
  status: string;
}

/**
 * Service per monitorare la coda di matching e gestire i timeout
 */
export class QueueMonitorService {
  // Timeout in millisecondi (24 ore)
  private static readonly QUEUE_TIMEOUT_MS = 24 * 60 * 60 * 1000;

  /**
   * Controlla utenti in coda da troppo tempo e invia notifiche
   */
  static async checkQueueTimeouts(): Promise<void> {
    try {
      const timeoutDate = new Date(Date.now() - this.QUEUE_TIMEOUT_MS);

      // Trova utenti in coda da più di 24 ore
      const { data: timedOutEntries, error } = await supabase
        .from("matching_queue")
        .select("id, user_id, created_at, status")
        .eq("status", "active")
        .lt("created_at", timeoutDate.toISOString());

      if (error) {
        console.error("Error checking queue timeouts:", error);
        return;
      }

      if (!timedOutEntries || timedOutEntries.length === 0) {
        console.log("🟢 No queue timeouts found");
        return;
      }

      console.log(
        `⏰ Found ${timedOutEntries.length} users with queue timeout`
      );

      // Processa ogni entry scaduta
      for (const entry of timedOutEntries) {
        await this.processQueueTimeout(entry);
      }
    } catch (error) {
      console.error("Error in checkQueueTimeouts:", error);
    }
  }

  /**
   * Processa singola entry scaduta
   */
  private static async processQueueTimeout(entry: QueueEntry): Promise<void> {
    try {
      // Invia notifica di formazione fallita
      await NotificationService.notifyTrioFormationFailed(entry.user_id);

      // Marca l'entry come timeout (non eliminarla per analytics)
      await supabase
        .from("matching_queue")
        .update({
          status: "timeout",
          updated_at: new Date().toISOString(),
        })
        .eq("id", entry.id);

      console.log(`📧 Timeout notification sent to user: ${entry.user_id}`);
    } catch (error) {
      console.error(
        `Failed to process timeout for user ${entry.user_id}:`,
        error
      );
    }
  }

  /**
   * Avvia monitoraggio periodico (da chiamare in background)
   * In produzione dovrebbe essere un cron job o scheduled function
   */
  static startPeriodicCheck(intervalHours: number = 1): NodeJS.Timeout {
    const intervalMs = intervalHours * 60 * 60 * 1000;

    console.log(`🔄 Starting queue monitor with ${intervalHours}h interval`);

    // Check immediato
    this.checkQueueTimeouts();

    // Check periodico
    return setInterval(() => {
      this.checkQueueTimeouts();
    }, intervalMs);
  }

  /**
   * Ottieni statistiche della coda per debug/monitoring
   */
  static async getQueueStats(): Promise<{
    activeUsers: number;
    timedOutUsers: number;
    averageWaitTime: number;
  }> {
    try {
      const { data: stats, error } = await supabase
        .from("matching_queue")
        .select("status, created_at");

      if (error) throw error;

      const activeUsers =
        stats?.filter((s) => s.status === "active").length || 0;
      const timedOutUsers =
        stats?.filter((s) => s.status === "timeout").length || 0;

      // Calcola tempo di attesa medio per utenti attivi
      const activeEntries = stats?.filter((s) => s.status === "active") || [];
      const totalWaitTime = activeEntries.reduce((sum, entry) => {
        const waitTime = Date.now() - new Date(entry.created_at).getTime();
        return sum + waitTime;
      }, 0);

      const averageWaitTime =
        activeEntries.length > 0 ? totalWaitTime / activeEntries.length : 0;

      return {
        activeUsers,
        timedOutUsers,
        averageWaitTime: Math.round(averageWaitTime / 1000 / 60), // in minuti
      };
    } catch (error) {
      console.error("Error getting queue stats:", error);
      return { activeUsers: 0, timedOutUsers: 0, averageWaitTime: 0 };
    }
  }
}

export default QueueMonitorService;
