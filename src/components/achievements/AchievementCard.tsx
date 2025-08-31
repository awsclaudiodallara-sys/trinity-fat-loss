import React from "react";
import type { Achievement } from "../../services/achievementsService";

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  unlockedAt?: string;
  onCardClick: () => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  isUnlocked,
  unlockedAt,
  onCardClick,
}) => {
  const getRarityColor = (rarity: string): string => {
    const colors = {
      legendary: "from-yellow-400 to-orange-500",
      epic: "from-purple-400 to-pink-500",
      rare: "from-blue-400 to-cyan-500",
      common: "from-gray-400 to-gray-500",
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityIcon = (rarity: string): string => {
    const icons = {
      legendary: "👑",
      epic: "💎",
      rare: "⭐",
      common: "🎯",
    };
    return icons[rarity as keyof typeof icons] || icons.common;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleClick = () => {
    onCardClick();
  };

  return (
    <div
      className={`
        bg-white rounded-xl p-6 cursor-pointer
        transform transition-all duration-300 hover:scale-105
        shadow-lg hover:shadow-xl border border-gray-100
        ${
          isUnlocked
            ? "ring-2 ring-green-400 shadow-green-100"
            : "opacity-80 hover:opacity-100"
        }
      `}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div
          className={`
            w-14 h-14 rounded-full 
            bg-gradient-to-r ${getRarityColor(achievement.rarity)}
            flex items-center justify-center text-white text-xl
            shadow-lg
          `}
        >
          {getRarityIcon(achievement.rarity)}
        </div>

        <div className="text-right">
          <div
            className={`
              text-xs font-bold px-3 py-1 rounded-full text-white
              bg-gradient-to-r ${getRarityColor(achievement.rarity)}
              uppercase tracking-wider
            `}
          >
            {achievement.rarity}
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium">
            +{achievement.points_awarded} pts
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3
          className={`
          font-bold text-lg mb-2 leading-tight
          ${isUnlocked ? "text-gray-900" : "text-gray-600"}
        `}
        >
          {achievement.name}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {achievement.description}
        </p>
      </div>

      {/* Category */}
      <div className="mb-4">
        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
          {achievement.category
            .replace("_", " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())}
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        {isUnlocked ? (
          <div className="flex items-center text-green-600 text-sm font-medium">
            <span className="mr-2">✅</span>
            <span>Sbloccato</span>
          </div>
        ) : (
          <div className="flex items-center text-gray-500 text-sm">
            <span className="mr-2">🔒</span>
            <span>Bloccato</span>
          </div>
        )}

        {isUnlocked && unlockedAt && (
          <div className="text-xs text-gray-500">{formatDate(unlockedAt)}</div>
        )}
      </div>
    </div>
  );
};
