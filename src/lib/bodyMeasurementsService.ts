import { supabase } from "./supabase";
import type { NavyMeasurements, NavyBodyComposition } from "./healthMetrics";

export interface UserBodyMeasurements {
  id?: string;
  user_id: string;
  weight: number;
  height: number;
  neck_circumference: number;
  waist_circumference: number;
  hip_circumference?: number;
  gender: "male" | "female";
  body_fat_percentage?: number;
  fat_mass?: number;
  lean_mass?: number;
  measurement_date: string;
  created_at?: string;
  updated_at?: string;
}

// Cache temporanea per performance - 30 secondi
const cache = new Map<
  string,
  { data: unknown; timestamp: number; ttl: number }
>();
const DEFAULT_TTL = 30000; // 30 secondi

const getCachedData = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
};

const setCachedData = <T>(key: string, data: T, ttl = DEFAULT_TTL) => {
  cache.set(key, { data, timestamp: Date.now(), ttl });
};

const clearUserCache = (userId: string) => {
  const keysToDelete = Array.from(cache.keys()).filter((key) =>
    key.includes(userId)
  );
  keysToDelete.forEach((key) => cache.delete(key));
};

export const bodyMeasurementsService = {
  /**
   * Save user body measurements and composition data
   */
  async saveMeasurements(
    userId: string,
    measurements: NavyMeasurements,
    composition: NavyBodyComposition
  ): Promise<void> {
    const measurementData: Omit<
      UserBodyMeasurements,
      "id" | "created_at" | "updated_at"
    > = {
      user_id: userId,
      weight: measurements.weight,
      height: measurements.height,
      neck_circumference: measurements.neck,
      waist_circumference: measurements.waist,
      hip_circumference: measurements.hip,
      gender: measurements.gender,
      body_fat_percentage: composition.bodyFatPercentage,
      fat_mass: composition.fatMass,
      lean_mass: composition.leanMass,
      measurement_date: new Date().toISOString().split("T")[0], // Today's date
    };

    const { error } = await supabase
      .from("user_body_measurements")
      .insert(measurementData);

    if (error) throw error;

    // Update the user's current measurements in the users table (using database lowercase names)
    const { error: userUpdateError } = await supabase
      .from("users")
      .update({
        current_weight: measurements.weight,
        weight: measurements.weight, // campo onboarding
        neck_circumference: measurements.neck,
        neckcircumference: measurements.neck, // campo onboarding (database lowercase)
        waist_circumference: measurements.waist,
        waistcircumference: measurements.waist, // campo onboarding (database lowercase)
        hip_circumference: measurements.hip,
        hipcircumference: measurements.hip, // campo onboarding (database lowercase)
        gender: measurements.gender,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (userUpdateError) throw userUpdateError;

    // Clear cache for this user to force fresh data
    clearUserCache(userId);
  },

  /**
   * Get user's measurement history
   */
  async getMeasurementHistory(userId: string): Promise<UserBodyMeasurements[]> {
    const { data, error } = await supabase
      .from("user_body_measurements")
      .select("*")
      .eq("user_id", userId)
      .order("measurement_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get user's latest measurements
   */
  async getLatestMeasurements(
    userId: string
  ): Promise<UserBodyMeasurements | null> {
    const { data, error } = await supabase
      .from("user_body_measurements")
      .select("*")
      .eq("user_id", userId)
      .order("measurement_date", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found
    return data || null;
  },

  /**
   * Get user's current measurements from users table + latest weekly tasks
   */
  async getCurrentUserData(
    userId: string
  ): Promise<Partial<NavyMeasurements> | null> {
    const cacheKey = `user_data_${userId}`;
    const cached = getCachedData<Partial<NavyMeasurements>>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      // Get user profile data (onboarding + any saved measurements)
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select(
          "current_weight, height, neck_circumference, waist_circumference, hip_circumference, gender, weight, neckcircumference, waistcircumference, hipcircumference"
        )
        .eq("id", userId)
        .single();

      if (userError) throw userError;

      // Get latest weekly task measurements (more recent)
      const weekStart = new Date();
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);
      const formattedWeekStart = weekStart.toISOString().split("T")[0];

      const { data: weeklyTasks } = await supabase
        .from("weekly_tasks")
        .select("task_type, actual_value, completed")
        .eq("user_id", userId)
        .eq("week_start", formattedWeekStart)
        .eq("completed", true)
        .in("task_type", [
          "weight_measurement",
          "waist_measurement",
          "neck_measurement",
        ]);

      if (!userData) return null;

      // Combine onboarding data with latest weekly measurements
      const result: Partial<NavyMeasurements> = {
        height: userData.height || undefined,
        gender: (userData.gender as "male" | "female") || undefined,
      };

      // Use weekly task data if available, fallback to onboarding data
      const weightTask = weeklyTasks?.find(
        (t) => t.task_type === "weight_measurement"
      );
      const waistTask = weeklyTasks?.find(
        (t) => t.task_type === "waist_measurement"
      );
      const neckTask = weeklyTasks?.find(
        (t) => t.task_type === "neck_measurement"
      );

      result.weight =
        weightTask?.actual_value ||
        userData.current_weight ||
        userData.weight ||
        undefined;
      result.waist =
        waistTask?.actual_value ||
        userData.waist_circumference ||
        userData.waistcircumference ||
        undefined;
      result.neck =
        neckTask?.actual_value ||
        userData.neck_circumference ||
        userData.neckcircumference ||
        undefined;
      result.hip =
        userData.hip_circumference || userData.hipcircumference || undefined;

      setCachedData(cacheKey, result, 15000); // Cache for 15 seconds since data changes more frequently
      return result;
    } catch (error) {
      console.error("Error loading user data:", error);
      return null;
    }
  },

  /**
   * Calculate progress between two measurements
   */
  calculateProgress(
    current: UserBodyMeasurements,
    previous: UserBodyMeasurements
  ): {
    weightChange: number;
    bodyFatChange: number;
    fatMassChange: number;
    leanMassChange: number;
    daysBetween: number;
  } {
    const currentDate = new Date(current.measurement_date);
    const previousDate = new Date(previous.measurement_date);
    const daysBetween = Math.round(
      (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      weightChange: current.weight - previous.weight,
      bodyFatChange:
        (current.body_fat_percentage || 0) -
        (previous.body_fat_percentage || 0),
      fatMassChange: (current.fat_mass || 0) - (previous.fat_mass || 0),
      leanMassChange: (current.lean_mass || 0) - (previous.lean_mass || 0),
      daysBetween,
    };
  },

  /**
   * Get measurement statistics for a user
   */
  async getMeasurementStats(userId: string): Promise<{
    totalMeasurements: number;
    firstMeasurementDate: string | null;
    latestMeasurementDate: string | null;
    averageFrequency: number; // days between measurements
    hasCompleteData: boolean;
  }> {
    const cacheKey = `stats_${userId}`;
    const cached = getCachedData<{
      totalMeasurements: number;
      firstMeasurementDate: string | null;
      latestMeasurementDate: string | null;
      averageFrequency: number;
      hasCompleteData: boolean;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const measurements = await this.getMeasurementHistory(userId);

    if (measurements.length === 0) {
      const emptyStats = {
        totalMeasurements: 0,
        firstMeasurementDate: null,
        latestMeasurementDate: null,
        averageFrequency: 0,
        hasCompleteData: false,
      };
      setCachedData(cacheKey, emptyStats, 10000); // Cache shorter for empty results
      return emptyStats;
    }

    const sortedMeasurements = measurements.sort(
      (a, b) =>
        new Date(a.measurement_date).getTime() -
        new Date(b.measurement_date).getTime()
    );

    const firstDate = sortedMeasurements[0].measurement_date;
    const lastDate =
      sortedMeasurements[sortedMeasurements.length - 1].measurement_date;

    const totalDays = Math.round(
      (new Date(lastDate).getTime() - new Date(firstDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const averageFrequency =
      measurements.length > 1 ? totalDays / (measurements.length - 1) : 0;

    const hasCompleteData = measurements.some(
      (m) =>
        m.body_fat_percentage !== null &&
        m.fat_mass !== null &&
        m.lean_mass !== null
    );

    const stats = {
      totalMeasurements: measurements.length,
      firstMeasurementDate: firstDate,
      latestMeasurementDate: lastDate,
      averageFrequency,
      hasCompleteData,
    };

    setCachedData(cacheKey, stats);
    return stats;
  },
};
