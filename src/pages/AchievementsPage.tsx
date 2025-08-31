import React, { useState, useEffect } from "react";
import { achievementsService } from "../services/achievementsService";
import type {
  Achievement,
  UserAchievement,
} from "../services/achievementsService";
import { useAuth } from "../hooks/useAuth";
import {
  AchievementCard,
  AchievementFilters,
  AchievementStats,
  AchievementModal,
} from "../components/achievements";

type TabType = "all" | "unlocked" | "locked";

export const AchievementsPage: React.FC = () => {
  const { user } = useAuth();

  // State
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");

  // Modal
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        const [achievements, userAchievementsData] = await Promise.all([
          achievementsService.getAllAchievements(),
          achievementsService.getUserAchievements(user.id),
        ]);

        setAllAchievements(achievements);
        setUserAchievements(userAchievementsData);
      } catch (err) {
        console.error("Error loading achievements:", err);
        setError("Errore nel caricamento degli achievement");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  // Filter achievements
  const getFilteredAchievements = (): Achievement[] => {
    let filtered = allAchievements;

    // Filter by tab
    if (activeTab === "unlocked") {
      const unlockedIds = userAchievements.map((ua) => ua.achievement_id);
      filtered = filtered.filter((achievement) =>
        unlockedIds.includes(achievement.id)
      );
    } else if (activeTab === "locked") {
      const unlockedIds = userAchievements.map((ua) => ua.achievement_id);
      filtered = filtered.filter(
        (achievement) => !unlockedIds.includes(achievement.id)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (achievement) => achievement.category === selectedCategory
      );
    }

    // Filter by rarity
    if (selectedRarity !== "all") {
      filtered = filtered.filter(
        (achievement) => achievement.rarity === selectedRarity
      );
    }

    return filtered;
  };

  // Get achievement status
  const getAchievementStatus = (achievement: Achievement) => {
    const userAchievement = userAchievements.find(
      (ua) => ua.achievement_id === achievement.id
    );
    return {
      isUnlocked: !!userAchievement,
      unlockedAt: userAchievement?.unlocked_at,
    };
  };

  // Event handlers
  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleCardClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAchievement(null);
  };

  // Calculate stats
  const totalPoints = userAchievements.reduce((sum, ua) => {
    const achievement = allAchievements.find((a) => a.id === ua.achievement_id);
    return sum + (achievement?.points_awarded || 0);
  }, 0);

  const categories = [...new Set(allAchievements.map((a) => a.category))];
  const rarities = [...new Set(allAchievements.map((a) => a.rarity))];
  const filteredAchievements = getFilteredAchievements();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Caricamento achievements...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-8 shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Errore</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AchievementStats
            totalPoints={totalPoints}
            unlockedCount={userAchievements.length}
            totalCount={allAchievements.length}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-lg border border-gray-100">
            {[
              {
                id: "all" as const,
                label: "🔍 Tutti",
                count: allAchievements.length,
              },
              {
                id: "unlocked" as const,
                label: "✅ Sbloccati",
                count: userAchievements.length,
              },
              {
                id: "locked" as const,
                label: "🔒 Da Sbloccare",
                count: allAchievements.length - userAchievements.length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`
                  flex-1 py-4 px-6 rounded-lg text-sm font-bold 
                  transition-all duration-300 transform hover:scale-105
                  ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <AchievementFilters
          categories={categories}
          rarities={rarities}
          selectedCategory={selectedCategory}
          selectedRarity={selectedRarity}
          onCategoryChange={setSelectedCategory}
          onRarityChange={setSelectedRarity}
        />

        {/* Achievement Grid */}
        {filteredAchievements.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAchievements.map((achievement) => {
              const status = getAchievementStatus(achievement);
              return (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={status.isUnlocked}
                  unlockedAt={status.unlockedAt}
                  onCardClick={() => handleCardClick(achievement)}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">
              {activeTab === "unlocked"
                ? "🎯"
                : activeTab === "locked"
                ? "🔒"
                : "🔍"}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {activeTab === "unlocked"
                ? "Nessun achievement sbloccato"
                : activeTab === "locked"
                ? "Tutti gli achievement sono stati sbloccati!"
                : "Nessun achievement trovato"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {activeTab === "unlocked"
                ? "Continua il tuo viaggio Trinity Fat Loss per sbloccare i primi achievement!"
                : activeTab === "locked"
                ? "Congratulazioni! Hai sbloccato tutti gli achievement disponibili."
                : "Prova a modificare i filtri per visualizzare altri achievement."}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedAchievement && (
        <AchievementModal
          achievement={selectedAchievement}
          isUnlocked={getAchievementStatus(selectedAchievement).isUnlocked}
          unlockedAt={getAchievementStatus(selectedAchievement).unlockedAt}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};
