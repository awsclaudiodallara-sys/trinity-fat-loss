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
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(3, 0, 0, 0);
    return date >= yesterday && date <= now;
  },
  // isDateEditable(date: Date): boolean {
  //   const now = new Date();
  //   const yesterday = new Date(now);
  //   yesterday.setDate(yesterday.getDate() - 1);
  //   yesterday.setHours(10, 10, 0, 0); // TEST: cambia a 10:00
  //   return date >= yesterday && date <= now;
  // },

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
