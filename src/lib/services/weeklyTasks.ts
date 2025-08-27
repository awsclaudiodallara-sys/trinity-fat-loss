import { supabase } from "../supabase";

export interface WeeklyTask {
  id: string;
  user_id: string;
  trio_id: string;
  week_start: string;
  task_type: string;
  completed: boolean;
  completion_date?: string | null;
  actual_value?: number | null;
  target_value?: number | null;
  target_unit?: string | null;
  notes?: string | null;
  reminder_sent?: boolean;
  deadline_warning_sent?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const weeklyTasksService = {
  // Recupera i task per una settimana specifica
  async getWeeklyTasks(
    userId: string,
    weekStart: string
  ): Promise<WeeklyTask[]> {
    const { data, error } = await supabase
      .from("weekly_tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("week_start", weekStart);

    if (error) throw error;
    return data || [];
  },

  // Verifica se una settimana è modificabile (fino al lunedì successivo alle 3:00 AM)
  isWeekEditable(weekStart: string): boolean {
    const weekStartDate = new Date(weekStart);
    const nextMonday = new Date(weekStartDate);
    nextMonday.setDate(weekStartDate.getDate() + 7); // Next Monday
    nextMonday.setHours(3, 0, 0, 0); // 3:00 AM

    const now = new Date();
    return now <= nextMonday;
  },

  // Aggiorna lo stato di un task (solo se modificabile e stato cambiato)
  async updateTaskStatus(taskId: string, completed: boolean): Promise<void> {
    const { data: task, error: taskError } = await supabase
      .from("weekly_tasks")
      .select("*")
      .eq("id", taskId)
      .single();

    if (taskError) throw taskError;

    // Verifica se la settimana è ancora modificabile
    if (!this.isWeekEditable(task.week_start)) {
      throw new Error("Week is no longer editable (cutoff passed)");
    }

    // Solo se lo stato è diverso, procedi con l'aggiornamento
    if (task.completed !== completed) {
      const updateData: {
        completed: boolean;
        updated_at: string;
        completion_date?: string | null;
      } = {
        completed,
        updated_at: new Date().toISOString(),
      };

      // Se completando, salva la data di completion
      if (completed) {
        updateData.completion_date = new Date().toISOString();
      } else {
        updateData.completion_date = null;
      }

      const { error } = await supabase
        .from("weekly_tasks")
        .update(updateData)
        .eq("id", taskId);

      if (error) throw error;
    }
  },

  // Aggiorna il valore di un task (misurazioni)
  async updateTaskValue(taskId: string, value: number | null): Promise<void> {
    const { data: task, error: taskError } = await supabase
      .from("weekly_tasks")
      .select("*")
      .eq("id", taskId)
      .single();

    if (taskError) throw taskError;

    // Verifica se la settimana è ancora modificabile
    if (!this.isWeekEditable(task.week_start)) {
      throw new Error("Week is no longer editable (cutoff passed)");
    }

    const { error } = await supabase
      .from("weekly_tasks")
      .update({
        actual_value: value,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (error) throw error;
  },

  // Calcola le settimane che necessitano di cutoff (passate le 3:00 AM del lunedì)
  async getWeeksForCutoff(): Promise<string[]> {
    const now = new Date();
    const cutoffWeeks: string[] = [];

    // Cerca le settimane degli ultimi 14 giorni che necessitano cutoff
    for (let i = 0; i < 14; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const weekStart = this.getWeekStart(date);

      // Se la settimana non è più modificabile ma non ha cutoff
      if (!this.isWeekEditable(weekStart)) {
        cutoffWeeks.push(weekStart);
      }
    }

    return cutoffWeeks;
  },

  // Calcola l'inizio della settimana (lunedì) per una data
  getWeekStart(date: Date = new Date()): string {
    const weekStart = new Date(date);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart.toISOString().split("T")[0];
  },
};
