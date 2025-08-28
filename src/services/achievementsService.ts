import { supabase } from "../lib/supabase";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category:
    | "progress"
    | "consistency"
    | "trio"
    | "support"
    | "body_composition";
  icon_emoji: string;
  color_hex: string;
  badge_image_url?: string;
  criteria_type: string;
  criteria_value: number;
  criteria_data?: Record<string, unknown>;
  points_awarded: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  progression_tier: number;
  trio_required: boolean;
  notify_on_unlock: boolean;
  celebrate_in_chat: boolean;
  active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  points_earned: number;
  achievement?: Achievement;
}

class AchievementsService {
  // Get all available achievements
  async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("active", true)
      .order("category, progression_tier, points_awarded");

    if (error) {
      console.error("Error fetching achievements:", error);
      return [];
    }

    return data || [];
  }

  // Get achievements by category
  async getAchievementsByCategory(category: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("category", category)
      .eq("active", true)
      .order("progression_tier, points_awarded");

    if (error) {
      console.error("Error fetching achievements by category:", error);
      return [];
    }

    return data || [];
  }

  // Get user's unlocked achievements
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from("user_achievements")
      .select(
        `
        *,
        achievement:achievements(*)
      `
      )
      .eq("user_id", userId)
      .order("unlocked_at", { ascending: false });

    if (error) {
      console.error("Error fetching user achievements:", error);
      return [];
    }

    return data || [];
  }

  // Get user's progress towards achievements
  async getUserProgress(userId: string): Promise<{
    totalPoints: number;
    totalAchievements: number;
    recentUnlocks: UserAchievement[];
    categoryProgress: { [key: string]: { unlocked: number; total: number } };
    rarityProgress: { [key: string]: { unlocked: number; total: number } };
  }> {
    try {
      // Get all achievements
      const allAchievements = await this.getAllAchievements();

      // Get user's unlocked achievements
      const userAchievements = await this.getUserAchievements(userId);

      // Calculate total points
      const totalPoints = userAchievements.reduce(
        (sum, ua) => sum + ua.points_earned,
        0
      );

      // Recent unlocks (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentUnlocks = userAchievements.filter(
        (ua) => new Date(ua.unlocked_at) >= sevenDaysAgo
      );

      // Category progress
      const categoryProgress: {
        [key: string]: { unlocked: number; total: number };
      } = {};
      const categories = ["progress", "consistency", "trio", "support"];

      categories.forEach((category) => {
        const totalInCategory = allAchievements.filter(
          (a) => a.category === category
        ).length;
        const unlockedInCategory = userAchievements.filter(
          (ua) => ua.achievement?.category === category
        ).length;

        categoryProgress[category] = {
          unlocked: unlockedInCategory,
          total: totalInCategory,
        };
      });

      // Rarity progress
      const rarityProgress: {
        [key: string]: { unlocked: number; total: number };
      } = {};
      const rarities = ["common", "rare", "epic", "legendary"];

      rarities.forEach((rarity) => {
        const totalInRarity = allAchievements.filter(
          (a) => a.rarity === rarity
        ).length;
        const unlockedInRarity = userAchievements.filter(
          (ua) => ua.achievement?.rarity === rarity
        ).length;

        rarityProgress[rarity] = {
          unlocked: unlockedInRarity,
          total: totalInRarity,
        };
      });

      return {
        totalPoints,
        totalAchievements: userAchievements.length,
        recentUnlocks,
        categoryProgress,
        rarityProgress,
      };
    } catch (error) {
      console.error("Error calculating user progress:", error);
      return {
        totalPoints: 0,
        totalAchievements: 0,
        recentUnlocks: [],
        categoryProgress: {},
        rarityProgress: {},
      };
    }
  }

  // Check if user should unlock any body composition achievements
  async checkBodyCompositionAchievements(
    userId: string,
    bodyData: {
      bodyFat: number;
      leanMass: number;
      fatMass: number;
      weight: number;
      waist?: number;
    }
  ): Promise<Achievement[]> {
    try {
      // Get body composition specific achievements (we'll need to add these to DB)
      const bodyAchievements = await this.getAchievementsByCategory(
        "body_composition"
      );
      const userAchievements = await this.getUserAchievements(userId);
      const unlockedIds = userAchievements.map((ua) => ua.achievement_id);

      const newUnlocks: Achievement[] = [];

      for (const achievement of bodyAchievements) {
        if (unlockedIds.includes(achievement.id)) continue;

        let shouldUnlock = false;

        switch (achievement.criteria_type) {
          case "body_fat_milestone":
            shouldUnlock = bodyData.bodyFat <= achievement.criteria_value;
            break;
          case "lean_mass_milestone":
            shouldUnlock = bodyData.leanMass >= achievement.criteria_value;
            break;
          case "fat_loss_milestone":
            // Need to compare with previous data
            shouldUnlock = await this.checkFatLossProgress(
              userId,
              achievement.criteria_value
            );
            break;
          case "waist_milestone":
            shouldUnlock = bodyData.waist
              ? bodyData.waist <= achievement.criteria_value
              : false;
            break;
          case "body_recomposition":
            // Special logic for simultaneous muscle gain + fat loss
            shouldUnlock = await this.checkRecompositionProgress(userId);
            break;
        }

        if (shouldUnlock) {
          newUnlocks.push(achievement);
        }
      }

      return newUnlocks;
    } catch (error) {
      console.error("Error checking body composition achievements:", error);
      return [];
    }
  }

  // Helper: Check fat loss progress
  private async checkFatLossProgress(
    userId: string,
    targetLoss: number
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("body_measurements")
        .select("fat_mass")
        .eq("user_id", userId)
        .order("measured_at", { ascending: true })
        .limit(2);

      if (error || !data || data.length < 2) return false;

      const initialFatMass = data[0].fat_mass;
      const currentFatMass = data[data.length - 1].fat_mass;
      const fatLoss = initialFatMass - currentFatMass;

      return fatLoss >= targetLoss;
    } catch (error) {
      console.error("Error checking fat loss progress:", error);
      return false;
    }
  }

  // Helper: Check body recomposition (gaining muscle while losing fat)
  private async checkRecompositionProgress(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("body_measurements")
        .select("lean_mass, fat_mass")
        .eq("user_id", userId)
        .order("measured_at", { ascending: true })
        .limit(2);

      if (error || !data || data.length < 2) return false;

      const initialData = data[0];
      const currentData = data[data.length - 1];

      const muscleGain = currentData.lean_mass - initialData.lean_mass;
      const fatLoss = initialData.fat_mass - currentData.fat_mass;

      // Body recomposition: gained muscle AND lost fat
      return muscleGain > 0 && fatLoss > 0;
    } catch (error) {
      console.error("Error checking recomposition progress:", error);
      return false;
    }
  }

  // Unlock achievement for user
  async unlockAchievement(
    userId: string,
    achievementId: string
  ): Promise<boolean> {
    try {
      // Check if already unlocked
      const { data: existing } = await supabase
        .from("user_achievements")
        .select("id")
        .eq("user_id", userId)
        .eq("achievement_id", achievementId)
        .single();

      if (existing) return false; // Already unlocked

      // Get achievement details
      const { data: achievement, error: achievementError } = await supabase
        .from("achievements")
        .select("*")
        .eq("id", achievementId)
        .single();

      if (achievementError || !achievement) return false;

      // Unlock achievement
      const { error: insertError } = await supabase
        .from("user_achievements")
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          points_earned: achievement.points_awarded,
          unlocked_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error unlocking achievement:", insertError);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error unlocking achievement:", error);
      return false;
    }
  }

  // Get suggested next achievements for user
  async getNextAchievements(
    userId: string,
    limit: number = 5
  ): Promise<Achievement[]> {
    try {
      const allAchievements = await this.getAllAchievements();
      const userAchievements = await this.getUserAchievements(userId);
      const unlockedIds = userAchievements.map((ua) => ua.achievement_id);

      // Filter out unlocked achievements and sort by progression tier and points
      const availableAchievements = allAchievements
        .filter((a) => !unlockedIds.includes(a.id))
        .sort((a, b) => {
          // Prioritize lower tier (easier) achievements
          if (a.progression_tier !== b.progression_tier) {
            return a.progression_tier - b.progression_tier;
          }
          // Then by points (lower points = easier)
          return a.points_awarded - b.points_awarded;
        })
        .slice(0, limit);

      return availableAchievements;
    } catch (error) {
      console.error("Error getting next achievements:", error);
      return [];
    }
  }
}

export const achievementsService = new AchievementsService();
