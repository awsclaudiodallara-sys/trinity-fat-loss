import { supabase } from "../supabase";

export interface DailyTask {
  id: string;
  user_id: string;
  trio_id: string;
  task_date: string;
  task_type: string;
  completed: boolean;
  completed_at: string | null;
  target_value: number | null;
  actual_value: number | null;
  target_unit: string | null;
  notes: string | null;
  modified_at: string;
}

export const dailyTasksService = {
  // Recupera i task per una data specifica
  async getDailyTasks(userId: string, date: Date): Promise<DailyTask[]> {
    const formattedDate = date.toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("daily_tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("task_date", formattedDate);
    if (error) throw error;
    return data || [];
  },

  //Verifica se una data è modificabile (oggi o ieri prima delle 3:00)
  isDateEditable(date: Date): boolean {
    const now = new Date();

    // Normalizza la data del task al solo giorno (rimuove orario)
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    // Data di oggi (normalizzata)
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Data di ieri
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    console.log("🔍 DEBUG isDateEditable:");
    console.log("📅 Original date:", date);
    console.log("📅 Task date (normalized):", taskDate);
    console.log("📅 Today (normalized):", today);
    console.log("📅 Yesterday:", yesterday);
    console.log("⏰ Current time:", now);

    // Se è oggi, sempre modificabile
    if (taskDate.getTime() === today.getTime()) {
      console.log("✅ Task date is today - EDITABLE");
      return true;
    }

    // Se è ieri, modificabile solo prima delle 3:00 AM di oggi
    if (taskDate.getTime() === yesterday.getTime()) {
      const cutoffTime = new Date(today);
      cutoffTime.setHours(3, 0, 0, 0); // 3:00 AM di oggi
      const isEditable = now < cutoffTime;
      console.log("⏰ Task date is yesterday - cutoff time:", cutoffTime);
      console.log(
        isEditable
          ? "✅ Before cutoff - EDITABLE"
          : "❌ After cutoff - NOT EDITABLE"
      );
      return isEditable;
    }

    // Altre date non modificabili
    console.log("❌ Task date is not today or yesterday - NOT EDITABLE");
    return false;
  },

  // Aggiorna lo stato di un task (solo se modificabile e stato cambiato)
  async updateTaskStatus(taskId: string, completed: boolean): Promise<void> {
    const { data: task, error: taskError } = await supabase
      .from("daily_tasks")
      .select("*")
      .eq("id", taskId)
      .single();

    if (taskError) throw taskError;

    // Solo se lo stato è diverso, procedi con l'aggiornamento
    if (task.completed === completed) {
      return; // Nessuna modifica necessaria
    }

    // Verifica se la data è modificabile
    if (!this.isDateEditable(new Date(task.task_date))) {
      throw new Error("This task is no longer editable");
    }

    // Prepara i nuovi valori
    const now = new Date().toISOString();
    const newValues = {
      completed,
      completed_at: completed ? now : null,
      modified_at: now,
    };

    // Aggiorna il task
    const { error: updateError } = await supabase
      .from("daily_tasks")
      .update(newValues)
      .eq("id", taskId);

    if (updateError) throw updateError;
  },
};
