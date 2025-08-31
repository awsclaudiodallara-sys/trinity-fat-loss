import React from "react";

interface AchievementStatsProps {
  totalPoints: number;
  unlockedCount: number;
  totalCount: number;
}

export const AchievementStats: React.FC<AchievementStatsProps> = ({
  totalPoints,
  unlockedCount,
  totalCount,
}) => {
  const completionPercentage =
    totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-2">
          🏆 Achievement Center
        </h1>
        <p className="text-gray-600">
          I tuoi badge e premi conquistati nel viaggio Trinity Fat Loss
        </p>
      </div>

      <div className="text-right space-y-2">
        {/* Points */}
        <div>
          <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            {totalPoints.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Punti Totali
          </div>
        </div>

        {/* Achievement Count */}
        <div>
          <div className="text-2xl font-bold text-blue-600">
            {unlockedCount}/{totalCount}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Achievement Sbloccati
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-32">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progresso</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
