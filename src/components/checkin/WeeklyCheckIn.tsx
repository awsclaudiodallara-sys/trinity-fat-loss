import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase, type WeeklyTasks } from "../../lib/supabase";

// Fix: Remove empty interface or use proper type
type WeeklyCheckInProps = Record<string, never>;

export const WeeklyCheckIn: React.FC<WeeklyCheckInProps> = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyTasks | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formattedDateForDB = new Date().toISOString().split("T")[0];

  const fetchWeeklyTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("weekly_tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("week_start", formattedDateForDB)
        .single();

      if (error) throw error;

      setWeeklyTasks(data);
    } catch (error) {
      console.error("Error fetching weekly tasks:", error);
      setError("Failed to load weekly check-in data.");
    } finally {
      setLoading(false);
    }
  }, [user, formattedDateForDB]);

  useEffect(() => {
    fetchWeeklyTasks();
  }, [fetchWeeklyTasks]);

  // Fix: Replace 'any' with proper union type
  const updateWeeklyTask = async (
    column: string,
    value: number | boolean | null
  ) => {
    if (!user || !weeklyTasks) return;
    try {
      const { error } = await supabase
        .from("weekly_tasks")
        .update({ [column]: value })
        .eq("id", weeklyTasks.id);

      if (error) throw error;

      setWeeklyTasks((prevTasks) => {
        if (!prevTasks) return prevTasks;

        return {
          ...prevTasks,
          [column]: value,
        } as WeeklyTasks;
      });
    } catch (error) {
      console.error(`Error updating ${column}:`, error);
      setError(`Failed to update ${column}.`);
    }
  };

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">📝 Weekly Check-In</h3>
      </div>
      {weeklyTasks && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={weeklyTasks.weight || ""}
                onChange={(e) =>
                  updateWeeklyTask("weight", parseFloat(e.target.value))
                }
                placeholder="Enter weight"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Waist (cm)
              </label>
              <input
                type="number"
                step="0.1"
                value={weeklyTasks.waist_circumference || ""}
                onChange={(e) =>
                  updateWeeklyTask(
                    "waist_circumference",
                    parseFloat(e.target.value)
                  )
                }
                placeholder="Enter waist circumference"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Neck (cm)
              </label>
              <input
                type="number"
                step="0.1"
                value={weeklyTasks.neck_circumference || ""}
                onChange={(e) =>
                  updateWeeklyTask(
                    "neck_circumference",
                    parseFloat(e.target.value)
                  )
                }
                placeholder="Enter neck circumference"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold text-gray-800 mb-2">Routine</h4>
            <div className="flex space-x-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Pes Routine
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-green-500"
                    checked={weeklyTasks.routine_pesi_1 || false}
                    onChange={(e) =>
                      updateWeeklyTask("routine_pesi_1", e.target.checked)
                    }
                  />
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-green-500"
                    checked={weeklyTasks.routine_pesi_2 || false}
                    onChange={(e) =>
                      updateWeeklyTask("routine_pesi_2", e.target.checked)
                    }
                  />
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-green-500"
                    checked={weeklyTasks.routine_pesi_3 || false}
                    onChange={(e) =>
                      updateWeeklyTask("routine_pesi_3", e.target.checked)
                    }
                  />
                </label>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Cardio Routine
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-green-500"
                    checked={weeklyTasks.routine_cardio_1 || false}
                    onChange={(e) =>
                      updateWeeklyTask("routine_cardio_1", e.target.checked)
                    }
                  />
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-green-500"
                    checked={weeklyTasks.routine_cardio_2 || false}
                    onChange={(e) =>
                      updateWeeklyTask("routine_cardio_2", e.target.checked)
                    }
                  />
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-green-500"
                    checked={weeklyTasks.routine_cardio_3 || false}
                    onChange={(e) =>
                      updateWeeklyTask("routine_cardio_3", e.target.checked)
                    }
                  />
                </label>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Weekly Call
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-green-500"
                    checked={weeklyTasks.weekly_call || false}
                    onChange={(e) =>
                      updateWeeklyTask("weekly_call", e.target.checked)
                    }
                  />
                </label>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
