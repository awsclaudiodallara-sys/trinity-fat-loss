import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { AchievementTriggers } from "../../services/achievementTriggers";

// Define the weekly task structure based on database logs
interface WeeklyTask {
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

// UI enhancement interface
interface WeeklyTaskWithUI extends WeeklyTask {
  name: string;
  emoji: string;
  description: string;
  hasValue?: boolean;
}

interface WeeklyCheckInProps {
  onTasksUpdated?: () => void;
}

export const WeeklyCheckIn: React.FC<WeeklyCheckInProps> = ({
  onTasksUpdated,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyTaskWithUI[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

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

  // Check if the week is still editable (until Sunday midnight)
  // Check if the week is still editable (Monday 00:00 to Sunday 23:59)
  const isWeekEditable = (weekStart: string): boolean => {
    // Week is always editable from Monday 00:00 to Sunday 23:59
    // Only frozen for the brief moment of Sunday 00:00 registration (which happens automatically)
    // For UI purposes, we consider it always editable during the week
    const isEditable = true;

    // DEBUG: Log the calculation
    const now = new Date();
    const currentDay = now.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    console.log("🔍 WeeklyCheckIn isWeekEditable DEBUG:", {
      weekStart,
      now,
      currentDay,
      dayName: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][currentDay],
      isEditable,
      logic: "Always editable: Monday 00:00 to Sunday 23:59",
    });

    return isEditable;
  };

  const [isEditable, setIsEditable] = useState<boolean>(true);

  // Validation function for measurement values
  const isValidValue = (taskType: string, value: number): boolean => {
    if (value <= 0) return false; // No negative or zero values

    switch (taskType) {
      case "weight_measurement":
        return value >= 10 && value <= 300; // kg
      case "waist_measurement":
        return value >= 20 && value <= 500; // cm
      case "neck_measurement":
        return value >= 20 && value <= 200; // cm
      default:
        return true;
    }
  };

  // Get validation range text for placeholders
  const getValidationHint = (taskType: string): string => {
    switch (taskType) {
      case "weight_measurement":
        return "es. 90 (10-300 kg)";
      case "waist_measurement":
        return "es. 95 (20-500 cm)";
      case "neck_measurement":
        return "es. 40 (20-200 cm)";
      default:
        return "";
    }
  };

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
          name: "Esercizi Peso/Plank/Calisthenics",
          emoji: "💪",
          description: "Allenamento forza/plank/calisthenics",
          hasValue: false,
        },
        weekly_call: {
          name: "Call Settimanale di Gruppo",
          emoji: "📞",
          description: "Chiamata settimanale del trio",
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

    console.log("📝 Inserting default tasks:", defaultTasks.length, "tasks");
    console.log(
      "📋 Tasks to insert:",
      defaultTasks.map((t) => t.task_type)
    );

    const { data, error } = await supabase
      .from("weekly_tasks")
      .upsert(defaultTasks, {
        onConflict: "user_id,week_start,task_type",
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error("❌ Error upserting tasks:", error);
      console.error(
        "❌ Error details:",
        error.message,
        error.details,
        error.hint
      );
      throw error;
    }

    console.log("✅ Successfully upserted tasks:", data?.length || 0);
    return data || [];
  };

  const fetchWeeklyTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // ⚡ Load user profile and tasks in parallel for speed
      const [userProfileResult, tasksResult] = await Promise.all([
        supabase
          .from("users")
          .select("current_trio_id")
          .eq("id", user.id)
          .single(),
        supabase
          .from("weekly_tasks")
          .select("*")
          .eq("user_id", user.id)
          .eq("week_start", formattedWeekStart),
      ]);

      if (userProfileResult.error) {
        console.error(
          "❌ Error fetching user profile:",
          userProfileResult.error
        );
        setError("Failed to load user profile.");
        return;
      }

      const userProfile = userProfileResult.data;
      const existingTasks = tasksResult.data || [];

      // ⚡ Quick check: if we have exactly 6 tasks, use them immediately
      if (existingTasks.length === 6) {
        const enrichedTasks = enrichTasksWithUIData(existingTasks);
        setWeeklyTasks(enrichedTasks);
        setIsEditable(isWeekEditable(formattedWeekStart));
        setLoading(false);
        return;
      }

      // Only create/recreate if we don't have complete tasks
      if (existingTasks.length > 0 && existingTasks.length < 6) {
        // Clean up incomplete tasks
        await supabase
          .from("weekly_tasks")
          .delete()
          .eq("user_id", user.id)
          .eq("week_start", formattedWeekStart);
      }

      // Create new complete set
      const newTasks = await createDefaultWeeklyTasks(
        user.id,
        userProfile?.current_trio_id || "",
        formattedWeekStart
      );

      const enrichedTasks = enrichTasksWithUIData(newTasks);
      setWeeklyTasks(enrichedTasks);
      setIsEditable(isWeekEditable(formattedWeekStart));
    } catch (error) {
      console.error("❌ Error fetching weekly tasks:", error);
      setError("Failed to load weekly check-in data.");
    } finally {
      setLoading(false);
    }
  }, [user, formattedWeekStart, enrichTasksWithUIData]);

  useEffect(() => {
    fetchWeeklyTasks();
  }, [fetchWeeklyTasks]);

  // Toggle task completion with special logic for measurements
  const toggleTask = async (taskId: string) => {
    if (!user || !isEditable) return;

    const task = weeklyTasks.find((t) => t.id === taskId);
    if (!task) return;

    // For measurements, check if there's a valid value before allowing completion
    if (task.hasValue && !task.completed) {
      if (
        !task.actual_value ||
        !isValidValue(task.task_type, task.actual_value)
      ) {
        return; // Don't allow checking if no value or invalid value
      }
    }

    setSaving(true);

    try {
      const newCompleted = !task.completed;

      // If unchecking a measurement, also clear the actual_value
      const updateData: { completed: boolean; actual_value?: number | null } = {
        completed: newCompleted,
      };
      if (task.hasValue && !newCompleted) {
        updateData.actual_value = null;
      }

      const { error } = await supabase
        .from("weekly_tasks")
        .update(updateData)
        .eq("id", taskId);

      if (error) throw error;

      // Update UI
      const updatedTasks = weeklyTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: newCompleted,
              ...(task.hasValue && !newCompleted ? { actual_value: null } : {}),
            }
          : t
      );
      setWeeklyTasks(updatedTasks);

      // Notify parent component to update weekly progress
      if (onTasksUpdated) {
        onTasksUpdated();
      }

      // 🎯 TRIGGER ACHIEVEMENT SYSTEM
      if (newCompleted) {
        // Se il task è stato appena completato
        try {
          await AchievementTriggers.onDailyTaskCompleted(user.id, {
            taskId,
            taskName: task.name,
            taskType: task.task_type,
            isWeeklyTask: true,
            completedAt: new Date().toISOString(),
            totalCompletedThisWeek: updatedTasks.filter((t) => t.completed)
              .length,
          });
        } catch (achievementError) {
          console.warn("Achievement trigger failed:", achievementError);
          // Non bloccare l'UI per errori achievement
        }
      }
    } catch (error) {
      console.error("Error updating task:", error);
      setError("Failed to update task.");
    } finally {
      setSaving(false);
    }
  };

  // Update task value
  const updateTaskValue = async (taskId: string, value: number | null) => {
    if (!user || !isEditable) return;

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

      // Notify parent component to update weekly progress (value changes can affect completion)
      if (onTasksUpdated) {
        onTasksUpdated();
      }

      // 🎯 TRIGGER ACHIEVEMENT SYSTEM for body measurements
      const task = weeklyTasks.find((t) => t.id === taskId);
      if (
        task &&
        value !== null &&
        [
          "weight_measurement",
          "waist_measurement",
          "neck_measurement",
        ].includes(task.task_type)
      ) {
        try {
          await AchievementTriggers.onBodyMeasurementAdded(user.id);
        } catch (achievementError) {
          console.warn(
            "Body measurement achievement trigger failed:",
            achievementError
          );
          // Non bloccare l'UI per errori achievement
        }
      }
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
      {/* Collapsible Header */}
      <div
        className="flex items-center justify-between cursor-pointer p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold">📝 Weekly Check-In</h3>
          <span className="text-sm text-gray-500">{getWeekDisplay()}</span>
        </div>
        <div className="flex items-center space-x-3">
          {saving && (
            <span className="text-xs text-blue-500 animate-pulse">
              Salvando...
            </span>
          )}
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            {isExpanded ? "🔽" : "▶️"}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <>
          {/* Measurements Section */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-800">
              📏 Misurazioni
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {measurementTasks.map((task) => (
                <div
                  key={task.id}
                  className="space-y-3 p-4 bg-gray-50 rounded-lg"
                >
                  {/* Task completion checkbox */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2">
                      <span className="text-lg">{task.emoji}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {task.name}
                      </span>
                    </label>
                    <button
                      onClick={() => toggleTask(task.id)}
                      disabled={
                        !isEditable ||
                        (task.hasValue &&
                          (!task.actual_value ||
                            !isValidValue(task.task_type, task.actual_value)) &&
                          !task.completed)
                      }
                      className={`w-5 h-5 rounded flex items-center justify-center text-xs shadow-sm transition-colors duration-200 ${
                        task.completed
                          ? "bg-gradient-to-br from-green-400 to-green-500 text-white"
                          : !isEditable
                          ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                          : task.hasValue &&
                            (!task.actual_value ||
                              !isValidValue(task.task_type, task.actual_value))
                          ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                          : "bg-gray-200/80 text-gray-400 hover:bg-gray-300 cursor-pointer"
                      }`}
                      title={
                        !isEditable
                          ? "Sistema in aggiornamento settimanale"
                          : task.hasValue &&
                            (!task.actual_value ||
                              !isValidValue(
                                task.task_type,
                                task.actual_value
                              )) &&
                            !task.completed
                          ? "Inserisci un valore valido per completare"
                          : ""
                      }
                    >
                      {task.completed ? "✓" : ""}
                    </button>
                  </div>

                  {/* Value input */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="0.1"
                      value={task.actual_value || ""}
                      disabled={!isEditable}
                      onChange={(e) => {
                        const inputValue = e.target.value;

                        // If empty, clear the value in database
                        if (inputValue === "" || inputValue === null) {
                          updateTaskValue(task.id, null);
                          return;
                        }

                        const value = parseFloat(inputValue);
                        if (!isNaN(value)) {
                          updateTaskValue(task.id, value);
                        }
                      }}
                      placeholder={getValidationHint(task.task_type)}
                      className={`w-full p-2 border rounded-md text-sm focus:ring-2 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                        !isEditable
                          ? "border-gray-200 text-gray-500"
                          : task.actual_value &&
                            !isValidValue(task.task_type, task.actual_value)
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    <span className="text-sm text-gray-500 font-medium">
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
                    disabled={!isEditable}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-sm transition-colors duration-200 ${
                      task.completed
                        ? "bg-gradient-to-br from-green-400 to-green-500 text-white"
                        : !isEditable
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                        : "bg-gray-200/80 text-gray-400 hover:bg-gray-300 cursor-pointer"
                    }`}
                    title={
                      !isEditable ? "Sistema in aggiornamento settimanale" : ""
                    }
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

          {/* Editable status message */}
          {!isEditable && (
            <div className="text-sm text-gray-500 text-center mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              ⏳ <strong>Registrazione in corso...</strong>
              <br />
              Le modifiche sono disponibili da{" "}
              <strong>Lunedì 00:00 a Domenica 23:59</strong>.<br />
              Sistema in fase di aggiornamento settimanale.
            </div>
          )}
        </>
      )}
    </div>
  );
};
