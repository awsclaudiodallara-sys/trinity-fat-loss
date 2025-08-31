import React from "react";
import type { Achievement } from "../../services/achievementsService";

interface AchievementModalProps {
  achievement: Achievement;
  isUnlocked: boolean;
  unlockedAt?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementModal: React.FC<AchievementModalProps> = ({
  achievement,
  isUnlocked,
  unlockedAt,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

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
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-t-2xl">
          <button
            onClick={handleCloseClick}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="flex items-center space-x-4">
            <div
              className={`
                w-16 h-16 rounded-full 
                bg-gradient-to-r ${getRarityColor(achievement.rarity)}
                flex items-center justify-center text-white text-2xl
                shadow-lg border-4 border-white
              `}
            >
              {getRarityIcon(achievement.rarity)}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-1">{achievement.name}</h2>
              <div className="flex items-center space-x-2">
                <span
                  className={`
                    px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                    bg-gradient-to-r ${getRarityColor(
                      achievement.rarity
                    )} text-white
                  `}
                >
                  {achievement.rarity}
                </span>
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-bold">
                  +{achievement.points_awarded} punti
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2">📝 Descrizione</h3>
            <p className="text-gray-600 leading-relaxed">
              {achievement.description}
            </p>
          </div>

          {/* Category */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2">📂 Categoria</h3>
            <span className="inline-block px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg">
              {achievement.category
                .replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
          </div>

          {/* Status */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2">🎯 Stato</h3>
            {isUnlocked ? (
              <div className="space-y-2">
                <div className="flex items-center text-green-600 font-medium">
                  <span className="mr-2">✅</span>
                  <span>Achievement Sbloccato!</span>
                </div>
                {unlockedAt && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Sbloccato il:</span>
                    <br />
                    {formatDate(unlockedAt)}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center text-gray-500 font-medium">
                <span className="mr-2">🔒</span>
                <span>Achievement non ancora sbloccato</span>
              </div>
            )}
          </div>

          {/* Rarity Info */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2">💎 Rarità</h3>
            <div className="text-sm text-gray-600">
              {achievement.rarity === "legendary" &&
                "👑 Leggendario - Il massimo riconoscimento per risultati eccezionali"}
              {achievement.rarity === "epic" &&
                "💎 Epico - Achievement per risultati straordinari"}
              {achievement.rarity === "rare" &&
                "⭐ Raro - Achievement per buoni progressi"}
              {achievement.rarity === "common" &&
                "🎯 Comune - Achievement per primi passi e costanza"}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-6">
          <button
            onClick={handleCloseClick}
            className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
