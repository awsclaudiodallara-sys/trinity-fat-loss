import React, { useEffect } from "react";
import { useAchievementTriggers } from "../services/achievementTriggers";

// ===========================================
// ESEMPIO DI UTILIZZO DEI TRIGGER NEL FRONTEND
// ===========================================

export const AchievementTriggerExamples: React.FC = () => {
  const triggers = useAchievementTriggers();

  // ===========================================
  // ESEMPI DI UTILIZZO (COMMENTATI PER EVITARE ERRORI LINTING)
  // ===========================================

  /*
  // 1. ESEMPIO: TRIGGER DOPO MISURAZIONE CORPO
  const handleBodyMeasurementSubmit = async (measurementData: { userId: string; weight: number; date: string }) => {
    try {
      // Prima salva la misurazione nel database
      // await saveBodyMeasurement(measurementData);

      // Poi attiva il trigger per controllare achievement
      await triggers.onBodyMeasurementAdded(measurementData.userId);

      console.log("✅ Misurazione salvata e achievement controllati");
    } catch (error) {
      console.error("❌ Errore nel salvataggio misurazione:", error);
    }
  };

  // 2. ESEMPIO: TRIGGER DOPO REGISTRAZIONE PASSI
  const handleStepsSubmit = async (stepsData: { userId: string; steps: number; date: string }) => {
    try {
      // Salva i passi (se hai una tabella dedicata)
      // await saveSteps(stepsData);

      // Attiva trigger passi
      await triggers.onStepsLogged(stepsData.userId, stepsData.steps, stepsData.date);

      console.log(`✅ ${stepsData.steps} passi registrati`);
    } catch (error) {
      console.error("❌ Errore nella registrazione passi:", error);
    }
  };

  // 3. ESEMPIO: TRIGGER DOPO SESSIONE CARDIO
  const handleCardioComplete = async (cardioData: { userId: string; minutes: number; type: string }) => {
    try {
      // Salva sessione cardio
      // await saveCardioSession(cardioData);

      // Attiva trigger cardio
      await triggers.onCardioCompleted(cardioData.userId, cardioData.minutes, cardioData.type);

      console.log(`✅ ${cardioData.minutes} minuti di ${cardioData.type} completati`);
    } catch (error) {
      console.error("❌ Errore nel salvataggio cardio:", error);
    }
  };

  // 4. ESEMPIO: TRIGGER DOPO INVIO MESSAGGIO
  const handleMessageSent = async (messageData: {
    userId: string;
    content: string;
    isTrioChat: boolean;
    receiverIds?: string[]
  }) => {
    try {
      // Salva messaggio nel database
      // await sendMessage(messageData);

      // Attiva trigger messaggio
      await triggers.onMessageSent(messageData.userId, messageData);

      console.log("✅ Messaggio inviato e achievement controllati");
    } catch (error) {
      console.error("❌ Errore nell'invio messaggio:", error);
    }
  };

  // 5. ESEMPIO: TRIGGER DOPO PARTECIPAZIONE VIDEO CALL
  const handleVideoCallJoin = async (callData: {
    userId: string;
    callId: string;
    startTime: string;
    duration?: number
  }) => {
    try {
      // Registra partecipazione alla call
      // await joinVideoCall(callData);

      // Attiva trigger video call
      await triggers.onVideoCallAttended(callData.userId, callData);

      console.log("✅ Partecipazione alla video call registrata");
    } catch (error) {
      console.error("❌ Errore nella partecipazione alla call:", error);
    }
  };

  // 6. ESEMPIO: TRIGGER DOPO COMPLETAMENTO TASK
  const handleTaskComplete = async (taskData: {
    userId: string;
    taskId: string;
    taskName: string;
    completedAt: string
  }) => {
    try {
      // Marca task come completato
      // await completeTask(taskData);

      // Attiva trigger task
      await triggers.onDailyTaskCompleted(taskData.userId, taskData);

      console.log(`✅ Task "${taskData.taskName}" completato`);
    } catch (error) {
      console.error("❌ Errore nel completamento task:", error);
    }
  };

  // 7. ESEMPIO: TRIGGER DOPO REAZIONE AD ACHIEVEMENT
  const handleAchievementReaction = async (reactionData: {
    userId: string;
    reactedToUserId: string;
    achievementId: string;
    reactionType: 'like' | 'celebrate' | 'support'
  }) => {
    try {
      // Salva reazione
      // await saveAchievementReaction(reactionData);

      // Attiva trigger reazione
      await triggers.onAchievementReaction(
        reactionData.userId,
        reactionData.reactedToUserId,
        reactionData.achievementId
      );

      console.log(`✅ Reazione ${reactionData.reactionType} registrata`);
    } catch (error) {
      console.error("❌ Errore nella reazione:", error);
    }
  };
  */

  // ===========================================
  // 8. ESEMPIO: CONTROLLO PERIODICO ACHIEVEMENT
  // ===========================================
  useEffect(() => {
    const checkAchievementsPeriodically = async () => {
      const userId = "current-user-id"; // Ottieni dall'auth context

      if (userId) {
        // Controlla achievement ogni 5 minuti
        await triggers.checkAchievementProgress(userId);
      }
    };

    // Controllo iniziale
    checkAchievementsPeriodically();

    // Imposta controllo periodico
    const interval = setInterval(checkAchievementsPeriodically, 5 * 60 * 1000); // 5 minuti

    return () => clearInterval(interval);
  }, [triggers]);

  return (
    <div className="achievement-triggers-examples">
      <h2>🔥 Achievement Triggers - Esempi di Utilizzo</h2>

      <div className="trigger-examples">
        <h3>Esempi di chiamate ai trigger:</h3>

        <div className="example-code">
          <h4>1. Dopo misurazione corpo:</h4>
          <pre>{`await triggers.onBodyMeasurementAdded(userId);`}</pre>
        </div>

        <div className="example-code">
          <h4>2. Dopo registrazione passi:</h4>
          <pre>{`await triggers.onStepsLogged(userId, 8500, "2025-08-31");`}</pre>
        </div>

        <div className="example-code">
          <h4>3. Dopo sessione cardio:</h4>
          <pre>{`await triggers.onCardioCompleted(userId, 45, "running");`}</pre>
        </div>

        <div className="example-code">
          <h4>4. Dopo messaggio inviato:</h4>
          <pre>{`await triggers.onMessageSent(userId, messageData);`}</pre>
        </div>

        <div className="example-code">
          <h4>5. Dopo partecipazione video call:</h4>
          <pre>{`await triggers.onVideoCallAttended(userId, callData);`}</pre>
        </div>

        <div className="example-code">
          <h4>6. Dopo completamento task:</h4>
          <pre>{`await triggers.onDailyTaskCompleted(userId, taskData);`}</pre>
        </div>

        <div className="example-code">
          <h4>7. Dopo reazione ad achievement:</h4>
          <pre>{`await triggers.onAchievementReaction(userId, targetUserId, achievementId);`}</pre>
        </div>
      </div>

      <div className="integration-notes">
        <h3>📋 Note di Integrazione:</h3>
        <ul>
          <li>
            <strong>Database Triggers:</strong> I trigger del database si
            attivano automaticamente per le misurazioni corpo
          </li>
          <li>
            <strong>Frontend Triggers:</strong> Usa questi trigger per azioni
            che non hanno trigger automatici
          </li>
          <li>
            <strong>Notifiche:</strong> Implementa notifiche toast/modal per
            achievement sbloccati
          </li>
          <li>
            <strong>Controllo Periodico:</strong> Aggiungi controllo periodico
            per achievement che richiedono tempo
          </li>
          <li>
            <strong>Real-time:</strong> Per esperienze migliori, usa WebSocket
            per notifiche real-time
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AchievementTriggerExamples;
