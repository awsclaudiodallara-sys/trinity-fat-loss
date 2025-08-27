import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

// Define the weekly task structure based on database logs
interface WeeklyTask {
  id: string;
  user_id: string;
  trio_id: string;
  week_start: string;
  task_type: string;
  completed: boolean;
  target_value?: number | null;
  actual_value?: number | null;
  target_unit?: string | null;
  notes?: string | null;
}

// UI enhancement interface
interface WeeklyTaskWithUI extends WeeklyTask {
  name: string;
  emoji: string;
  description: string;
  hasValue?: boolean;
}

type WeeklyCheckInProps = Record<string, never>;

export const WeeklyCheckIn: React.FC<WeeklyCheckInProps> = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyTaskWithUI[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Calculate week start (Monday) like in supabase.ts
  const getWeekStart = () => {
    const weekStart = new Date();
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart.toISOString().split("T")[0];
  };

  const formattedWeekStart = getWeekStart();

  // Format week display
  const getWeekDisplay = () => {
    const startDate = new Date(formattedWeekStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const startFormatted = startDate.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
    });
    const endFormatted = endDate.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
    });

    return `${startFormatted} - ${endFormatted}`;
  };

  // Enrich tasks with UI data
  const enrichTasksWithUIData = useCallback(
    (tasks: WeeklyTask[]): WeeklyTaskWithUI[] => {
      const taskMetadata: Record<
        string,
        { name: string; emoji: string; description: string; hasValue?: boolean }
      > = {
        weight_measurement: {
          name: "Peso",
          emoji: "⚖️",
          description: "Misura il tuo peso (kg)",
          hasValue: true,
        },
        waist_measurement: {
          name: "Misure Vita",
          emoji: "📏",
          description: "Misura la circonferenza vita (cm)",
          hasValue: true,
        },
        neck_measurement: {
          name: "Misure Collo",
          emoji: "📐",
          description: "Misura la circonferenza collo (cm)",
          hasValue: true,
        },
        cardio_goal: {
          name: "Cardio Goal",
          emoji: "🏃",
          description: "Obiettivo cardio settimanale",
          hasValue: false,
        },
        strength_goal: {
          name: "Esercizi Peso/Plank/Calisthenics Goal",
          emoji: "💪",
          description: "Obiettivo allenamento peso/plank/calisthenics",
          hasValue: false,
        },
        weekly_call: {
          name: "Call Settimanale",
          emoji: "📞",
          description: "Chiamata settimanale di gruppo",
          hasValue: false,
        },
      };

      return tasks.map((task) => {
        const metadata = taskMetadata[task.task_type] || {
          name: task.task_type
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          emoji: "📋",
          description: `Complete ${task.task_type}`,
          hasValue: false,
        };

        return {
          ...task,
          name: metadata.name,
          emoji: metadata.emoji,
          description: metadata.description,
          hasValue: metadata.hasValue,
        } as WeeklyTaskWithUI;
      });
    },
    []
  );

  // Create default weekly tasks
  const createDefaultWeeklyTasks = async (
    userId: string,
    trioId: string,
    weekStart: string
  ): Promise<WeeklyTask[]> => {
    const defaultTasks = [
      {
        user_id: userId,
        trio_id: trioId,
        week_start: weekStart,
        task_type: "weight_measurement",
        completed: false,
        target_value: null,
        actual_value: null,
        target_unit: "kg",
        notes: null,
      },
      {
        user_id: userId,
        trio_id: trioId,
        week_start: weekStart,
        task_type: "waist_measurement",
        completed: false,
        target_value: null,
        actual_value: null,
        target_unit: "cm",
        notes: null,
      },
      {
        user_id: userId,
        trio_id: trioId,
        week_start: weekStart,
        task_type: "neck_measurement",
        completed: false,
        target_value: null,
        actual_value: null,
        target_unit: "cm",
        notes: null,
      },
      {
        user_id: userId,
        trio_id: trioId,
        week_start: weekStart,
        task_type: "cardio_goal",
        completed: false,
        target_value: null,
        actual_value: null,
        target_unit: null,
        notes: null,
      },
      {
        user_id: userId,
        trio_id: trioId,
        week_start: weekStart,
        task_type: "strength_goal",
        completed: false,
        target_value: null,
        actual_value: null,
        target_unit: null,
        notes: null,
      },
      {
        user_id: userId,
        trio_id: trioId,
        week_start: weekStart,
        task_type: "weekly_call",
        completed: false,
        target_value: null,
        actual_value: null,
        target_unit: null,
        notes: null,
      },
    ];

    const { data, error } = await supabase
      .from("weekly_tasks")
      .insert(defaultTasks)
      .select();

    if (error) throw error;

    return data || [];
  };

  const fetchWeeklyTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // First, get the user's current_trio_id
      const { data: userProfile, error: userError } = await supabase
        .from("users")
        .select("current_trio_id")
        .eq("id", user.id)
        .single();

      if (userError) {
        console.error("Error fetching user profile:", userError);
        setError("Failed to load user profile.");
        return;
      }

      const { data, error } = await supabase
        .from("weekly_tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("week_start", formattedWeekStart);

      if (error) throw error;

      // If no data found, create new weekly records
      if (!data || data.length === 0) {
        const newTasks = await createDefaultWeeklyTasks(
          user.id,
          userProfile?.current_trio_id || "",
          formattedWeekStart
        );
        const enrichedTasks = enrichTasksWithUIData(newTasks);
        setWeeklyTasks(enrichedTasks);
      } else {
        const enrichedTasks = enrichTasksWithUIData(data);
        setWeeklyTasks(enrichedTasks);
      }
    } catch (error) {
      console.error("Error fetching weekly tasks:", error);
      setError("Failed to load weekly check-in data.");
    } finally {
      setLoading(false);
    }
  }, [user, formattedWeekStart, enrichTasksWithUIData]);

  useEffect(() => {
    fetchWeeklyTasks();
  }, [fetchWeeklyTasks]);

  // Toggle task completion
  const toggleTask = async (taskId: string) => {
    if (!user) return;

    const task = weeklyTasks.find((t) => t.id === taskId);
    if (!task) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("weekly_tasks")
        .update({ completed: !task.completed })
        .eq("id", taskId);

      if (error) throw error;

      // Update UI
      const updatedTasks = weeklyTasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      setWeeklyTasks(updatedTasks);
    } catch (error) {
      console.error("Error updating task:", error);
      setError("Failed to update task.");
    } finally {
      setSaving(false);
    }
  };

  // Update task value
  const updateTaskValue = async (taskId: string, value: number) => {
    if (!user) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("weekly_tasks")
        .update({ actual_value: value })
        .eq("id", taskId);

      if (error) throw error;

      // Update UI
      const updatedTasks = weeklyTasks.map((t) =>
        t.id === taskId ? { ...t, actual_value: value } : t
      );
      setWeeklyTasks(updatedTasks);
    } catch (error) {
      console.error("Error updating task value:", error);
      setError("Failed to update task value.");
    } finally {
      setSaving(false);
    }
  };

  // Get task groups for better organization
  const measurementTasks = weeklyTasks.filter((task) =>
    ["weight_measurement", "waist_measurement", "neck_measurement"].includes(
      task.task_type
    )
  );
  const goalTasks = weeklyTasks.filter((task) =>
    ["cardio_goal", "strength_goal", "weekly_call"].includes(task.task_type)
  );

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-pulse text-blue-500">
          Caricamento dati settimanali...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
        <button className="ml-2 underline" onClick={() => setError(null)}>
          Chiudi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">📝 Weekly Check-In</h3>
        <span className="text-sm text-gray-500">{getWeekDisplay()}</span>
        {saving && (
          <span className="text-xs text-blue-500 animate-pulse">
            Salvando...
          </span>
        )}
      </div>

      {/* Measurements Section */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-800">📏 Misurazioni</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {measurementTasks.map((task) => (
            <div key={task.id} className="space-y-2">
              <label className="flex items-center space-x-2">
                <span className="text-lg">{task.emoji}</span>
                <span className="text-sm font-medium text-gray-700">
                  {task.name}
                </span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.1"
                  value={task.actual_value || ""}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      updateTaskValue(task.id, value);
                    }
                  }}
                  placeholder={
                    task.task_type === "weight_measurement"
                      ? "es. 95.8"
                      : "es. 96.1"
                  }
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-500">
                  {task.target_unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goals Section */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-800">🎯 Obiettivi</h4>
        <div className="space-y-3">
          {goalTasks.map((task) => (
            <div key={task.id} className="flex items-center space-x-3">
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-sm transition-colors duration-200 ${
                  task.completed
                    ? "bg-gradient-to-br from-green-400 to-green-500 text-white"
                    : "bg-gray-200/80 text-gray-400 hover:bg-gray-300"
                }`}
              >
                {task.completed ? "✓" : ""}
              </button>
              <div className="flex items-center space-x-2 flex-1">
                <span className="text-lg">{task.emoji}</span>
                <div className="flex flex-col">
                  <span
                    className={
                      task.completed ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    {task.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {task.description}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
