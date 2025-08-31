import { supabase } from "../lib/supabase";

// ===========================================
// INTERFACCIE PER TYPE SAFETY
// ===========================================

interface Achievement {
  name: string;
  points_awarded: number;
  description: string;
  rarity: string;
}

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

// ===========================================
// FRONTEND TRIGGERS PER ACHIEVEMENT ENGINE
// ===========================================

export class AchievementTriggers {
  // ===========================================
  // 1. TRIGGER DOPO MISURAZIONE CORPO
  // ===========================================
  static async onBodyMeasurementAdded(userId: string) {
    try {
      console.log("🔥 Trigger: Body measurement added for user", userId);

      // Il trigger del database si attiva automaticamente,
      // ma possiamo anche controllare manualmente qui se necessario
      await this.checkAchievementProgress(userId);

      // Notifica all'utente
      this.showAchievementNotification(
        "Misurazione completata! Controllando achievement..."
      );
    } catch (error) {
      console.error("Error in body measurement trigger:", error);
    }
  }

  // ===========================================
  // 2. TRIGGER DOPO PASSI REGISTRATI
  // ===========================================
  static async onStepsLogged(userId: string, steps: number, date: string) {
    try {
      console.log(
        `🔥 Trigger: ${steps} steps logged for user ${userId} on ${date}`
      );

      // Salva i dati dei passi (se hai una tabella dedicata)
      await this.saveStepsData(userId, steps, date);

      // Controlla achievement relativi ai passi
      await this.checkStepsAchievements(userId);

      // Mostra progresso se vicino a un achievement
      await this.showStepsProgress(userId, steps);
    } catch (error) {
      console.error("Error in steps trigger:", error);
    }
  }

  // ===========================================
  // 3. TRIGGER DOPO SESSIONE CARDIO
  // ===========================================
  static async onCardioCompleted(
    userId: string,
    minutes: number,
    type: string
  ) {
    try {
      console.log(
        `🔥 Trigger: ${minutes} min ${type} cardio completed by user ${userId}`
      );

      // Salva dati cardio
      await this.saveCardioData(userId, minutes, type);

      // Controlla achievement cardio
      await this.checkCardioAchievements(userId);

      // Aggiorna streak cardio se applicabile
      await this.updateCardioStreak(userId);
    } catch (error) {
      console.error("Error in cardio trigger:", error);
    }
  }

  // ===========================================
  // 4. TRIGGER DOPO MESSAGGIO IN CHAT
  // ===========================================
  static async onMessageSent(
    userId: string,
    messageData: Record<string, unknown>
  ) {
    try {
      console.log("🔥 Trigger: Message sent by user", userId);

      // Salva dati messaggio per achievement social
      await this.saveMessageData(userId, messageData);

      // Controlla achievement messaggi
      await this.checkMessageAchievements(userId);

      // Controlla achievement trio se è un messaggio di gruppo
      if (messageData.isTrioChat) {
        await this.checkTrioAchievements(userId);
      }
    } catch (error) {
      console.error("Error in message trigger:", error);
    }
  }

  // ===========================================
  // 5. TRIGGER DOPO VIDEO CALL
  // ===========================================
  static async onVideoCallAttended(
    userId: string,
    callData: Record<string, unknown>
  ) {
    try {
      console.log("🔥 Trigger: Video call attended by user", userId);

      // Registra partecipazione alla call
      await this.saveVideoCallData(userId, callData);

      // Controlla achievement video calls
      await this.checkVideoCallAchievements(userId);

      // Aggiorna streak partecipazione
      await this.updateVideoCallStreak(userId);
    } catch (error) {
      console.error("Error in video call trigger:", error);
    }
  }

  // ===========================================
  // 6. TRIGGER DOPO COMPLETAMENTO TASK GIORNALIERO
  // ===========================================
  static async onDailyTaskCompleted(
    userId: string,
    taskData: Record<string, unknown>
  ) {
    try {
      console.log("🔥 Trigger: Daily task completed by user", userId, taskData);

      // Salva completamento task
      await this.saveTaskData(userId, taskData);

      // Controlla achievement task
      await this.checkTaskAchievements(userId);

      // Se tutti i 7 task sono completati, controlla achievement speciali
      const completedTasks = await this.getCompletedTasksToday(userId);
      if (completedTasks.length === 7) {
        await this.onPerfectDayAchieved(userId);
      }
    } catch (error) {
      console.error("Error in daily task trigger:", error);
    }
  }

  // ===========================================
  // 7. TRIGGER PER ACHIEVEMENT SOCIAL (REACTIONS)
  // ===========================================
  static async onAchievementReaction(
    userId: string,
    reactedToUserId: string,
    achievementId: string
  ) {
    try {
      console.log(
        `🔥 Trigger: User ${userId} reacted to achievement ${achievementId} of user ${reactedToUserId}`
      );

      // Salva la reazione
      await this.saveReactionData(userId, reactedToUserId, achievementId);

      // Controlla achievement reazioni
      await this.checkReactionAchievements(userId);

      // Potrebbe sbloccare achievement per l'utente che ha ricevuto la reazione
      await this.checkSupportAchievements(reactedToUserId);
    } catch (error) {
      console.error("Error in reaction trigger:", error);
    }
  }

  // ===========================================
  // FUNZIONI DI SUPPORTO
  // ===========================================

  static async checkAchievementProgress(userId: string) {
    try {
      // Chiama la funzione del database per controllare achievement
      const { error } = await supabase.rpc("check_and_unlock_achievements", {
        user_uuid: userId,
      });

      if (error) {
        console.error("Error checking achievements:", error);
        return;
      }

      // Controlla se ci sono achievement appena sbloccati
      await this.checkNewlyUnlockedAchievements(userId);
    } catch (error) {
      console.error("Error in checkAchievementProgress:", error);
    }
  }

  static async checkNewlyUnlockedAchievements(userId: string) {
    try {
      // Ottieni achievement sbloccati recentemente
      const { data: newAchievements, error } = await supabase
        .from("user_achievements")
        .select(
          `
          *,
          achievement:achievements(*)
        `
        )
        .eq("user_id", userId)
        .gte("unlocked_at", new Date(Date.now() - 60000).toISOString()) // Ultimo minuto
        .order("unlocked_at", { ascending: false });

      if (error) {
        console.error("Error fetching new achievements:", error);
        return;
      }

      // Mostra notifiche per achievement appena sbloccati
      newAchievements?.forEach((userAchievement) => {
        this.showAchievementUnlockNotification(userAchievement);
      });
    } catch (error) {
      console.error("Error in checkNewlyUnlockedAchievements:", error);
    }
  }

  static showAchievementUnlockNotification(userAchievement: UserAchievement) {
    // Implementa notifica (toast, modal, etc.)
    console.log("🎉 Achievement sbloccato:", userAchievement.achievement?.name);
    console.log(
      "⭐ Punti guadagnati:",
      userAchievement.achievement?.points_awarded
    );

    // Qui puoi integrare con una libreria di notifiche come react-toastify
    // toast.success(`🎉 ${userAchievement.achievement?.name}! +${userAchievement.achievement?.points_awarded} punti`);
  }

  static showAchievementNotification(message: string) {
    console.log("📢 Achievement notification:", message);
    // Implementa notifica
  }

  // ===========================================
  // PLACEHOLDER PER FUNZIONI DA IMPLEMENTARE
  // ===========================================

  static async saveStepsData(userId: string, steps: number, date: string) {
    // TODO: Implementare salvataggio dati passi
    console.log("📊 Saving steps data:", { userId, steps, date });
  }

  static async saveCardioData(userId: string, minutes: number, type: string) {
    // TODO: Implementare salvataggio dati cardio
    console.log("💪 Saving cardio data:", { userId, minutes, type });
  }

  static async saveMessageData(
    userId: string,
    messageData: Record<string, unknown>
  ) {
    // TODO: Implementare salvataggio dati messaggi
    console.log("💬 Saving message data:", { userId, messageData });
  }

  static async saveVideoCallData(
    userId: string,
    callData: Record<string, unknown>
  ) {
    // TODO: Implementare salvataggio dati video call
    console.log("📹 Saving video call data:", { userId, callData });
  }

  static async saveTaskData(userId: string, taskData: Record<string, unknown>) {
    // TODO: Implementare salvataggio dati task
    console.log("✅ Saving task data:", { userId, taskData });
  }

  static async saveReactionData(
    userId: string,
    reactedToUserId: string,
    achievementId: string
  ) {
    // TODO: Implementare salvataggio dati reazioni
    console.log("👍 Saving reaction data:", {
      userId,
      reactedToUserId,
      achievementId,
    });
  }

  static async checkStepsAchievements(userId: string) {
    // TODO: Implementare controllo achievement passi
    console.log("👣 Checking steps achievements for user:", userId);
  }

  static async checkCardioAchievements(userId: string) {
    // TODO: Implementare controllo achievement cardio
    console.log("💪 Checking cardio achievements for user:", userId);
  }

  static async checkMessageAchievements(userId: string) {
    // TODO: Implementare controllo achievement messaggi
    console.log("💬 Checking message achievements for user:", userId);
  }

  static async checkVideoCallAchievements(userId: string) {
    // TODO: Implementare controllo achievement video call
    console.log("📹 Checking video call achievements for user:", userId);
  }

  static async checkTaskAchievements(userId: string) {
    // TODO: Implementare controllo achievement task
    console.log("✅ Checking task achievements for user:", userId);
  }

  static async checkTrioAchievements(userId: string) {
    // TODO: Implementare controllo achievement trio
    console.log("👥 Checking trio achievements for user:", userId);
  }

  static async checkReactionAchievements(userId: string) {
    // TODO: Implementare controllo achievement reazioni
    console.log("👍 Checking reaction achievements for user:", userId);
  }

  static async checkSupportAchievements(userId: string) {
    // TODO: Implementare controllo achievement supporto
    console.log("🤝 Checking support achievements for user:", userId);
  }

  static async updateCardioStreak(userId: string) {
    // TODO: Implementare aggiornamento streak cardio
    console.log("🔥 Updating cardio streak for user:", userId);
  }

  static async updateVideoCallStreak(userId: string) {
    // TODO: Implementare aggiornamento streak video call
    console.log("📹 Updating video call streak for user:", userId);
  }

  static async getCompletedTasksToday(userId: string) {
    // TODO: Implementare recupero task completati oggi
    console.log("📋 Getting completed tasks today for user:", userId);
    return [];
  }

  static async onPerfectDayAchieved(userId: string) {
    // TODO: Implementare logica per giorno perfetto
    console.log("🌟 Perfect day achieved by user:", userId);
  }

  static async showStepsProgress(userId: string, steps: number) {
    // TODO: Implementare mostra progresso passi
    console.log("📊 Showing steps progress:", { userId, steps });
  }
}

export const useAchievementTriggers = () => {
  return {
    onBodyMeasurementAdded: AchievementTriggers.onBodyMeasurementAdded,
    onStepsLogged: AchievementTriggers.onStepsLogged,
    onCardioCompleted: AchievementTriggers.onCardioCompleted,
    onMessageSent: AchievementTriggers.onMessageSent,
    onVideoCallAttended: AchievementTriggers.onVideoCallAttended,
    onDailyTaskCompleted: AchievementTriggers.onDailyTaskCompleted,
    onAchievementReaction: AchievementTriggers.onAchievementReaction,
    checkAchievementProgress: AchievementTriggers.checkAchievementProgress,
  };
};
