import { createClient } from "@supabase/supabase-js";

// ✅ Leggi le credenziali dalle variabili di ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "🚨 Missing Supabase credentials! Please check your .env.local file:\n" +
      "- VITE_SUPABASE_URL\n" +
      "- VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipi per il database (basati sul documento)
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age?: number;
  height?: number; // in cm
  languages?: string[];
  weight_goal?: string;
  fitness_level?: string;
  created_at: string;
  updated_at: string;
}

export interface MatchingPreferences {
  id: string;
  user_id: string;
  age_min?: number;
  age_max?: number;
  languages: string[];
  fitness_level: string;
  weight_goal: string;
  created_at: string;
}

export interface UserMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  user3_id: string;
  status: "pending" | "active" | "completed";
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "match_found" | "trio_completed" | "reminder" | "system";
  is_read: boolean;
  created_at: string;
}

export interface MatchingQueueEntry {
  id: string;
  user_id: string;
  priority: number;
  wait_time_hours: number;
  status: "active" | "paused" | "matched";
  flexible_age_range: boolean;
  flexible_fitness_level: boolean;
  flexible_goal: boolean;
  preferred_times?: string[];
  timezone_preference?: string;
  waiting_notification_sent: boolean;
  progress_notification_sent: boolean;
  extended_wait_notification_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface WeeklyTasks {
  id: string;
  user_id: string;
  trio_id: string;
  week_start: string;
  weight: number | null;
  waist_circumference: number | null;
  neck_circumference: number | null;
  routine_pesi_1: boolean;
  routine_pesi_2: boolean;
  routine_pesi_3: boolean;
  routine_cardio_1: boolean;
  routine_cardio_2: boolean;
  routine_cardio_3: boolean;
  weekly_call: boolean;
}

// 🆕 Matching Service Functions
export const matchingService = {
  async addToQueue(userId: string): Promise<MatchingQueueEntry> {
    await this.cleanDuplicateEntries(userId);

    const { data: existing, error: existingError } = await supabase
      .from("matching_queue")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1);

    if (existingError) throw existingError;

    if (existing && existing.length > 0) {
      console.log("🔄 User already in queue, returning existing entry");
      return existing[0];
    }

    const { data, error } = await supabase
      .from("matching_queue")
      .insert({
        user_id: userId,
        status: "active",
        priority: 100,
        wait_time_hours: 0,
      })
      .select()
      .single();

    if (error) throw error;
    console.log("✅ New queue entry created");
    return data;
  },

  async cleanDuplicateEntries(userId: string): Promise<void> {
    const { data: entries, error: fetchError } = await supabase
      .from("matching_queue")
      .select("id, created_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (fetchError) throw fetchError;
    if (!entries || entries.length <= 1) return;

    const entriesToDelete = entries.slice(1).map((entry) => entry.id);

    if (entriesToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("matching_queue")
        .delete()
        .in("id", entriesToDelete);

      if (deleteError) throw deleteError;
      console.log(
        `🧹 Cleaned ${entriesToDelete.length} duplicate queue entries`
      );
    }
  },

  async findMatches(userData: {
    weight_goal: string;
    fitness_level: string;
    age: number;
    height: number;
    languages: string[];
    userId: string;
  }): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("matching_status", "available")
      .eq("weight_goal", userData.weight_goal)
      .eq("fitness_level", userData.fitness_level)
      .neq("id", userData.userId)
      .gte("age", userData.age - 10)
      .lte("age", userData.age + 10)
      .gte("height", userData.height - 15)
      .lte("height", userData.height + 15)
      .overlaps("languages", userData.languages)
      .limit(2);

    if (error) throw error;
    return data || [];
  },

  async getQueuePosition(userId: string): Promise<number> {
    const { data: userData, error: userError } = await supabase
      .from("matching_queue")
      .select("created_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1);

    if (userError) throw userError;
    if (!userData || userData.length === 0) return 0;

    const userCreatedAt = userData[0].created_at;

    const { count, error } = await supabase
      .from("matching_queue")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .lt("created_at", userCreatedAt);

    if (error) throw error;
    return (count || 0) + 1;
  },

  async updateMatchingStatus(
    userId: string,
    status: "available" | "matching" | "in_trio"
  ): Promise<void> {
    const { error } = await supabase
      .from("users")
      .update({
        matching_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;
  },

  async removeFromQueue(userId: string): Promise<void> {
    const { error } = await supabase
      .from("matching_queue")
      .delete()
      .eq("user_id", userId)
      .eq("status", "active");

    if (error) throw error;
    console.log("🗑️ User removed from matching queue");
  },

  async updateWaitTimes(): Promise<void> {
    const { error } = await supabase.rpc("update_queue_wait_times");
    if (error) throw error;
  },

  async createTrio(users: {
    user1_id: string;
    user2_id: string;
    user3_id: string;
    commonData: {
      weight_goal: string;
      fitness_level: string;
      common_language: string;
      age_range_min: number;
      age_range_max: number;
    };
  }): Promise<string> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 90);

    const { data: trio, error: trioError } = await supabase
      .from("trios")
      .insert({
        user1_id: users.user1_id,
        user2_id: users.user2_id,
        user3_id: users.user3_id,
        common_language: users.commonData.common_language,
        weight_goal: users.commonData.weight_goal,
        fitness_level: users.commonData.fitness_level,
        age_range_min: users.commonData.age_range_min,
        age_range_max: users.commonData.age_range_max,
        compatibility_score: 85,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        status: "active",
        current_day: 1,
      })
      .select()
      .single();

    if (trioError) throw trioError;

    const allUserIds = [users.user1_id, users.user2_id, users.user3_id];

    for (const userId of allUserIds) {
      await this.updateMatchingStatus(userId, "in_trio");

      const { error: updateError } = await supabase
        .from("users")
        .update({
          current_trio_id: trio.id,
          last_matched_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) throw updateError;
      await this.removeFromQueue(userId);
    }

    console.log("🎉 TRIO CREATED SUCCESSFULLY!", trio.id);
    return trio.id;
  },

  async processMatching(
    userId: string,
    userData: {
      weight_goal: string;
      fitness_level: string;
      age: number;
      height: number;
      languages: string[];
    }
  ): Promise<{
    status: "queued" | "matched";
    trioId?: string;
    matches?: UserProfile[];
  }> {
    const matches = await this.findMatches({
      ...userData,
      userId,
    });

    console.log(
      `🔍 Found ${matches.length} potential matches for user ${userId}`
    );

    if (matches.length >= 2) {
      const { data: allUsers, error } = await supabase
        .from("users")
        .select("*")
        .in("id", [userId, matches[0].id, matches[1].id]);

      if (error) throw error;

      if (allUsers && allUsers.length === 3) {
        const ages = allUsers.map((u) => u.age || 0);
        const commonLanguage =
          userData.languages.find((lang) =>
            allUsers.every((u) => u.languages?.includes(lang))
          ) || userData.languages[0];

        const trioId = await this.createTrio({
          user1_id: userId,
          user2_id: matches[0].id,
          user3_id: matches[1].id,
          commonData: {
            weight_goal: userData.weight_goal,
            fitness_level: userData.fitness_level,
            common_language: commonLanguage,
            age_range_min: Math.min(...ages),
            age_range_max: Math.max(...ages),
          },
        });

        return { status: "matched", trioId };
      }
    }

    return { status: "queued", matches };
  },
};

// 🏠 Dashboard Service
export const dashboardService = {
  async getUserStatus(userId: string): Promise<{
    status: "in_queue" | "in_trio" | "no_group";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trio?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queue?: any;
  }> {
    try {
      const { data: queueEntry, error: queueError } = await supabase
        .from("matching_queue")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (queueError) throw queueError;

      if (queueEntry) {
        const queueData = await this.getUserQueueStatus(userId);
        return {
          status: "in_queue",
          queue: queueData,
        };
      }

      const { data: userInTrio, error: trioError } = await supabase
        .from("users")
        .select("matching_status")
        .eq("id", userId)
        .single();

      if (trioError) throw trioError;

      if (userInTrio?.matching_status === "in_trio") {
        const trioData = await this.getUserTrio(userId);
        return {
          status: "in_trio",
          trio: trioData,
        };
      }

      return {
        status: "no_group",
      };
    } catch (error) {
      console.error("Errore nel recupero stato utente:", error);
      return {
        status: "no_group",
      };
    }
  },

  async getUserTrio(userId: string) {
    try {
      const { data: trio, error } = await supabase
        .from("trios")
        .select(
          `
          id,
          user1_id,
          user2_id,
          user3_id,
          weight_goal,
          fitness_level,
          common_language,
          created_at
        `
        )
        .or(`user1_id.eq.${userId},user2_id.eq.${userId},user3_id.eq.${userId}`)
        .single();

      if (error) throw error;

      const userIds = [trio.user1_id, trio.user2_id, trio.user3_id];
      const { data: members, error: membersError } = await supabase
        .from("users")
        .select("id, name, age")
        .in("id", userIds);

      if (membersError) throw membersError;

      return {
        id: trio.id,
        name: `Trinity ${trio.weight_goal} Group`,
        goal: trio.weight_goal,
        level: trio.fitness_level,
        language: trio.common_language,
        members: members || [],
        createdAt: trio.created_at,
        daysActive: Math.floor(
          (new Date().getTime() - new Date(trio.created_at).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      };
    } catch (error) {
      console.error("Errore nel recupero trio:", error);
      return null;
    }
  },

  async getUserQueueStatus(userId: string) {
    try {
      const position = await matchingService.getQueuePosition(userId);

      const { data: userData, error } = await supabase
        .from("users")
        .select("weight_goal, fitness_level")
        .eq("id", userId)
        .single();

      if (error) throw error;

      const { data: queueData, error: queueError } = await supabase
        .from("matching_queue")
        .select("created_at")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (queueError) throw queueError;

      return {
        position,
        goal: userData.weight_goal || "Unknown",
        level: userData.fitness_level || "Unknown",
        joinedAt: queueData.created_at,
        estimatedWaitHours: Math.max(1, Math.floor(position * 12)),
      };
    } catch (error) {
      console.error("Errore nel recupero stato coda:", error);
      return null;
    }
  },

  async hasCompletedOnboarding(userId: string) {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("name, age, weight_goal, fitness_level, languages")
        .eq("id", userId)
        .single();

      if (error) return false;

      return !!(
        user?.name &&
        user?.age &&
        user?.weight_goal &&
        user?.fitness_level &&
        user?.languages?.length
      );
    } catch {
      return false;
    }
  },

  async getWeeklyProgress(userId: string): Promise<{
    completed: number;
    total: number;
    percentage: number;
  } | null> {
    try {
      const weekStart = new Date();
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);
      const formattedWeekStart = weekStart.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("weekly_tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("week_start", formattedWeekStart);

      if (error) throw error;

      const totalTasks = 7;
      let completedTasks = 0;

      if (data && data.length > 0) {
        completedTasks += data[0].weight !== null ? 1 : 0;
        completedTasks += data[0].waist_circumference !== null ? 1 : 0;
        completedTasks += data[0].neck_circumference !== null ? 1 : 0;
        completedTasks += data[0].routine_pesi_1 ? 1 : 0;
        completedTasks += data[0].routine_pesi_2 ? 1 : 0;
        completedTasks += data[0].routine_pesi_3 ? 1 : 0;
        completedTasks += data[0].weekly_call ? 1 : 0;
      }

      const percentage =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        completed: completedTasks,
        total: totalTasks,
        percentage,
      };
    } catch (error) {
      console.error("Error fetching weekly progress:", error);
      return null;
    }
  },
};
