import React, { useState, useEffect } from "react";
import { achievementsService } from "../../services/achievementsService";
import type {
  Achievement,
  UserAchievement,
} from "../../services/achievementsService";
import { useAuth } from "../../hooks/useAuth";

interface AchievementsAnalyticsProps {
  className?: string;
}

export const AchievementsAnalytics: React.FC<AchievementsAnalyticsProps> = ({
  className = "",
}) => {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<{
    totalPoints: number;
    totalAchievements: number;
    recentUnlocks: UserAchievement[];
    categoryProgress: { [key: string]: { unlocked: number; total: number } };
    rarityProgress: { [key: string]: { unlocked: number; total: number } };
  } | null>(null);
  const [nextAchievements, setNextAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "categories" | "recent" | "next"
  >("overview");

  useEffect(() => {
    const loadAchievementsData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const [progress, nextAchs] = await Promise.all([
          achievementsService.getUserProgress(user.id),
          achievementsService.getNextAchievements(user.id, 6),
        ]);

        setUserProgress(progress);
        setNextAchievements(nextAchs);
      } catch (error) {
        console.error("Error loading achievements data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAchievementsData();
  }, [user]);

  if (loading) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-lg border ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userProgress) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-lg border ${className}`}>
        <div className="text-center text-gray-500">
          <span className="text-2xl">🏆</span>
          <p className="mt-2">Achievements data not available</p>
        </div>
      </div>
    );
  }

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case "common":
        return "#95A5A6";
      case "rare":
        return "#3498DB";
      case "epic":
        return "#9B59B6";
      case "legendary":
        return "#F1C40F";
      default:
        return "#BDC3C7";
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case "progress":
        return "📈";
      case "consistency":
        return "🔥";
      case "trio":
        return "👥";
      case "support":
        return "❤️";
      case "body_composition":
        return "🧬";
      default:
        return "🏆";
    }
  };

  const getCategoryName = (category: string): string => {
    switch (category) {
      case "progress":
        return "Progress";
      case "consistency":
        return "Consistency";
      case "trio":
        return "Trio Power";
      case "support":
        return "Support";
      case "body_composition":
        return "Body Comp";
      default:
        return category;
    }
  };

  const ProgressRing = ({
    percentage,
    size = 80,
    strokeWidth = 8,
    color = "#3B82F6",
  }: {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute text-center">
          <span className="text-lg font-bold" style={{ color }}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-xl p-6 shadow-lg border ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <span className="text-2xl mr-3">🏆</span>
          Achievements & Gamification
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <span className="text-2xl mr-1">⭐</span>
            <span className="font-bold text-yellow-600">
              {userProgress.totalPoints}
            </span>
            <span className="text-gray-600 ml-1">points</span>
          </div>
          <div className="flex items-center">
            <span className="text-2xl mr-1">🏅</span>
            <span className="font-bold text-blue-600">
              {userProgress.totalAchievements}
            </span>
            <span className="text-gray-600 ml-1">unlocked</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {[
          { key: "overview", label: "📊 Overview", icon: "📊" },
          { key: "categories", label: "📂 Categories", icon: "📂" },
          { key: "recent", label: "🆕 Recent", icon: "🆕" },
          { key: "next", label: "🎯 Next Goals", icon: "🎯" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() =>
              setActiveTab(
                tab.key as "overview" | "categories" | "recent" | "next"
              )
            }
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(userProgress.rarityProgress).map(
              ([rarity, progress]) => (
                <div
                  key={rarity}
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: `${getRarityColor(rarity)}15`,
                    borderColor: `${getRarityColor(rarity)}40`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-sm font-medium capitalize"
                      style={{ color: getRarityColor(rarity) }}
                    >
                      {rarity}
                    </span>
                    <ProgressRing
                      percentage={
                        progress.total > 0
                          ? (progress.unlocked / progress.total) * 100
                          : 0
                      }
                      size={40}
                      strokeWidth={4}
                      color={getRarityColor(rarity)}
                    />
                  </div>
                  <div
                    className="text-lg font-bold"
                    style={{ color: getRarityColor(rarity) }}
                  >
                    {progress.unlocked}/{progress.total}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Recent Activity */}
          {userProgress.recentUnlocks.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
                <span className="text-xl mr-2">🎉</span>
                Recent Achievements (Last 7 Days)
              </h4>
              <div className="space-y-2">
                {userProgress.recentUnlocks.slice(0, 3).map((unlock) => (
                  <div
                    key={unlock.id}
                    className="flex items-center justify-between bg-white rounded p-3 border"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {unlock.achievement?.icon_emoji}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {unlock.achievement?.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {unlock.achievement?.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-yellow-600">
                        +{unlock.points_earned}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(unlock.unlocked_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          {Object.entries(userProgress.categoryProgress).map(
            ([category, progress]) => {
              const percentage =
                progress.total > 0
                  ? (progress.unlocked / progress.total) * 100
                  : 0;
              return (
                <div
                  key={category}
                  className="bg-gray-50 rounded-lg p-4 border"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {getCategoryIcon(category)}
                      </span>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {getCategoryName(category)}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {progress.unlocked} of {progress.total} achievements
                          unlocked
                        </p>
                      </div>
                    </div>
                    <ProgressRing
                      percentage={percentage}
                      size={60}
                      strokeWidth={6}
                      color="#3B82F6"
                    />
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{progress.unlocked} unlocked</span>
                    <span>{progress.total - progress.unlocked} remaining</span>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* Recent Tab */}
      {activeTab === "recent" && (
        <div className="space-y-4">
          {userProgress.recentUnlocks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl block mb-2">🎯</span>
              <p>No recent achievements</p>
              <p className="text-sm">Keep working towards your goals!</p>
            </div>
          ) : (
            userProgress.recentUnlocks.map((unlock) => (
              <div
                key={unlock.id}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-4"
                      style={{
                        backgroundColor: unlock.achievement?.color_hex + "20",
                        border: `2px solid ${unlock.achievement?.color_hex}40`,
                      }}
                    >
                      {unlock.achievement?.icon_emoji}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {unlock.achievement?.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {unlock.achievement?.description}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor:
                              getRarityColor(
                                unlock.achievement?.rarity || "common"
                              ) + "20",
                            color: getRarityColor(
                              unlock.achievement?.rarity || "common"
                            ),
                          }}
                        >
                          {unlock.achievement?.rarity}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getCategoryName(unlock.achievement?.category || "")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-yellow-600 text-lg">
                      +{unlock.points_earned}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(unlock.unlocked_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Next Goals Tab */}
      {activeTab === "next" && (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <span className="text-xl mr-2">🎯</span>
              Suggested Next Achievements
            </h4>
            <p className="text-sm text-blue-800">
              These are your most achievable goals based on your current
              progress. Start with easier ones to build momentum!
            </p>
          </div>

          {nextAchievements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl block mb-2">🏆</span>
              <p>Amazing! You've unlocked all available achievements!</p>
              <p className="text-sm">More achievements coming soon...</p>
            </div>
          ) : (
            nextAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-4"
                      style={{
                        backgroundColor: achievement.color_hex + "20",
                        border: `2px solid ${achievement.color_hex}40`,
                      }}
                    >
                      {achievement.icon_emoji}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {achievement.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {achievement.description}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor:
                              getRarityColor(achievement.rarity) + "20",
                            color: getRarityColor(achievement.rarity),
                          }}
                        >
                          {achievement.rarity}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getCategoryName(achievement.category)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Tier {achievement.progression_tier}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600 text-lg">
                      +{achievement.points_awarded}
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                    {achievement.trio_required && (
                      <div className="text-xs text-purple-600 mt-1">
                        👥 Trio Required
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
