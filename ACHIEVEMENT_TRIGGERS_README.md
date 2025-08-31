# 🎯 Achievement Engine - Frontend Triggers

## 🔥 Sistema di Trigger per il Frontend

Il sistema di achievement del Trinity Fat Loss app richiede trigger sia nel **database** che nel **frontend** per funzionare correttamente.

## 📊 Trigger Database (Già Implementati)

I trigger del database PostgreSQL si attivano automaticamente per:

- ✅ **Misurazioni corpo** → `trigger_achievement_update`
- ✅ **Controllo achievement** → `check_and_unlock_achievements()`

## 🎮 Trigger Frontend (Da Implementare)

I trigger frontend servono per azioni che non hanno trigger automatici nel database.

### File Creati:

- `src/services/achievementTriggers.ts` - Classe principale dei trigger
- `src/components/AchievementTriggerExamples.tsx` - Esempi di utilizzo

## 🚀 Come Utilizzare i Trigger

### 1. Importa l'Hook

```typescript
import { useAchievementTriggers } from "../services/achievementTriggers";

const MyComponent = () => {
  const triggers = useAchievementTriggers();
  // ...
};
```

### 2. Usa i Trigger nelle Tue Funzioni

#### Dopo Registrazione Passi:

```typescript
const handleStepsLogged = async (userId: string, steps: number) => {
  // Salva nel database
  await saveStepsToDatabase(userId, steps);

  // Attiva trigger achievement
  await triggers.onStepsLogged(userId, steps, new Date().toISOString());
};
```

#### Dopo Sessione Cardio:

```typescript
const handleCardioComplete = async (
  userId: string,
  minutes: number,
  type: string
) => {
  // Salva sessione
  await saveCardioSession(userId, minutes, type);

  // Attiva trigger
  await triggers.onCardioCompleted(userId, minutes, type);
};
```

#### Dopo Invio Messaggio:

```typescript
const handleMessageSent = async (messageData) => {
  // Salva messaggio
  await sendMessage(messageData);

  // Attiva trigger social
  await triggers.onMessageSent(messageData.userId, messageData);
};
```

## 📋 Lista Completa dei Trigger Disponibili

| Trigger                  | Quando Usarlo             | Parametri                             |
| ------------------------ | ------------------------- | ------------------------------------- |
| `onBodyMeasurementAdded` | Dopo misurazione corpo    | `userId: string`                      |
| `onStepsLogged`          | Dopo registrazione passi  | `userId, steps, date`                 |
| `onCardioCompleted`      | Dopo sessione cardio      | `userId, minutes, type`               |
| `onMessageSent`          | Dopo invio messaggio      | `userId, messageData`                 |
| `onVideoCallAttended`    | Dopo partecipazione call  | `userId, callData`                    |
| `onDailyTaskCompleted`   | Dopo completamento task   | `userId, taskData`                    |
| `onAchievementReaction`  | Dopo reazione achievement | `userId, targetUserId, achievementId` |

## 🎯 Achievement Che Richiedono Trigger Frontend

Questi achievement **NON** si sbloccano automaticamente e richiedono trigger frontend:

### 🏃‍♂️ Fitness & Attività:

- **Step Legend** (20,000+ passi) → `onStepsLogged`
- **Step Champion** (10K+ passi per 30 giorni) → `onStepsLogged`
- **Cardio Legend** (90+ min cardio) → `onCardioCompleted`
- **Cardio Champion** (60 min cardio) → `onCardioCompleted`

### 💬 Social & Trio:

- **Trinity Talker** (13 video calls) → `onVideoCallAttended`
- **Trio Champion** (250 messaggi) → `onMessageSent`
- **Triple Step Masters** (10K+ passi trio) → `onStepsLogged`
- **Cardio Trinity** (60+ min cardio trio) → `onCardioCompleted`

### ✅ Tasks & Consistency:

- **Phoenix Rising** (7 tasks per 60 giorni) → `onDailyTaskCompleted`
- **Inferno** (7 tasks per 30 giorni) → `onDailyTaskCompleted`
- **Hot Streak** (7 tasks per 7 giorni) → `onDailyTaskCompleted`

### 🎉 Reactions & Support:

- **Motivation Master** (300 reazioni) → `onAchievementReaction`
- **Cheerleader** (100 messaggi) → `onMessageSent`
- **Support Squad** (100 reazioni) → `onAchievementReaction`

## 🔧 Implementazione dei Trigger

### 1. Nelle Tue Funzioni Esistenti:

```typescript
// Esempio: In una funzione di salvataggio passi
export const saveUserSteps = async (userId: string, steps: number) => {
  // Salva nel database
  const { error } = await supabase
    .from("user_steps")
    .insert({ user_id: userId, steps, date: new Date() });

  if (!error) {
    // Attiva trigger achievement
    const triggers = useAchievementTriggers();
    await triggers.onStepsLogged(userId, steps, new Date().toISOString());
  }

  return { error };
};
```

### 2. In Componenti React:

```typescript
const StepsTracker: React.FC = () => {
  const triggers = useAchievementTriggers();

  const submitSteps = async () => {
    const steps = 8500;
    const userId = "user-123";

    // Salva e attiva trigger
    await triggers.onStepsLogged(userId, steps, new Date().toISOString());

    // Mostra feedback
    toast.success("Passi registrati! 🔥");
  };

  return <button onClick={submitSteps}>Registra {steps} Passi</button>;
};
```

## 📊 Controllo Periodico Achievement

Per achievement che richiedono tempo (streak, progresso), aggiungi controllo periodico:

```typescript
useEffect(() => {
  const checkAchievements = async () => {
    const userId = getCurrentUserId();
    if (userId) {
      await triggers.checkAchievementProgress(userId);
    }
  };

  // Controllo ogni 5 minuti
  const interval = setInterval(checkAchievements, 5 * 60 * 1000);

  return () => clearInterval(interval);
}, [triggers]);
```

## 🎨 Notifiche Achievement

Implementa notifiche per achievement sbloccati:

```typescript
// Nel servizio achievementTriggers.ts
static showAchievementUnlockNotification(userAchievement: UserAchievement) {
  // Usa react-toastify o simili
  toast.success(
    `🎉 ${userAchievement.achievement?.name}!`,
    {
      description: `+${userAchievement.achievement?.points_awarded} punti`,
      duration: 5000,
    }
  );
}
```

## 🚧 Placeholder da Implementare

I seguenti metodi sono placeholder e richiedono implementazione:

- `saveStepsData()` - Salva dati passi
- `saveCardioData()` - Salva dati cardio
- `saveMessageData()` - Salva dati messaggi
- `saveVideoCallData()` - Salva dati video call
- `checkStepsAchievements()` - Controlla achievement passi
- `checkCardioAchievements()` - Controlla achievement cardio
- `checkTrioAchievements()` - Controlla achievement trio

## 🎯 Prossimi Passi

1. **Implementa tabelle mancanti** per passi, cardio, messaggi, video calls
2. **Aggiungi trigger** nelle tue funzioni esistenti
3. **Implementa notifiche** per achievement sbloccati
4. **Testa il sistema** con dati di esempio
5. **Ottimizza performance** per controlli periodici

## 📞 Supporto

Per domande sui trigger frontend, consulta:

- `src/services/achievementTriggers.ts`
- `src/components/AchievementTriggerExamples.tsx`
