import React, { useState } from "react";
import { UserMenu } from "../common/UserMenu";

interface FitnessLevelScreenProps {
  onNext: (fitnessLevel: string) => void;
  onBack: () => void;
  userData?: {
    // ✅ Aggiunta prop opzionale userData
    age: number;
    languages: string[];
    weightGoal: string;
  } | null;
}

const fitnessLevels = [
  {
    level: "beginner",
    emoji: "🌱",
    title: "Beginner",
    description: "New to fitness & diet tracking",
  },
  {
    level: "intermediate",
    emoji: "⚡",
    title: "Intermediate",
    description: "Some gym & healthy eating exp",
  },
  {
    level: "advanced",
    emoji: "🔥",
    title: "Advanced",
    description: "Regular athlete/fitness pro",
  },
];

export const FitnessLevelScreen: React.FC<FitnessLevelScreenProps> = ({
  onNext,
  onBack,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>("");

  const handleSubmit = () => {
    if (selectedLevel) {
      onNext(selectedLevel);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 flex items-center justify-center p-4 animate-gradient">
      {/* User Menu - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <UserMenu variant="dark" />
      </div>

      <div className="max-w-md w-full animate-fade-in-up">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-3xl pointer-events-none"></div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center mb-8 animate-slide-in-left">
              <button
                onClick={onBack}
                className="text-2xl hover:scale-110 transition-transform duration-200 p-2 rounded-full hover:bg-gray-100 active:scale-95"
              >
                ←
              </button>
              <div className="flex-1 text-center">
                <div className="w-16 h-2 bg-gradient-to-r from-gray-200 to-gray-200 rounded-full mx-auto mb-2 relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full animate-pulse"></div>
                </div>
                <span className="text-sm text-gray-500 font-medium">
                  Final Step
                </span>
              </div>
            </div>

            {/* Welcome Section */}
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-2xl font-bold text-gray-800 mb-3">
                Ready for transformation!
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed flex items-center justify-center">
                <span className="text-2xl mr-2 animate-bounce-subtle">🏆</span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold">
                  Final step: experience level
                </span>
              </p>
            </div>

            {/* Experience Label */}
            <div className="mb-6 animate-slide-in-right animation-delay-100">
              <label className="text-gray-700 font-semibold text-lg flex items-center justify-center">
                <span className="text-2xl mr-3 animate-pulse-slow">💪</span>
                Your current fitness experience:
              </label>
            </div>

            {/* Fitness Level Selection */}
            <div className="mb-8 space-y-4">
              {fitnessLevels.map((option, index) => (
                <button
                  key={option.level}
                  onClick={() => setSelectedLevel(option.level)}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 group animate-slide-in-left hover:scale-102 active:scale-98 ${
                    selectedLevel === option.level
                      ? "border-purple-400 bg-purple-50/80 shadow-lg"
                      : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/30"
                  }`}
                  style={{ animationDelay: `${200 + index * 150}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <span
                        className={`text-3xl transition-transform duration-300 inline-block ${
                          selectedLevel === option.level
                            ? "animate-bounce-in scale-110"
                            : "group-hover:scale-110"
                        }`}
                      >
                        {option.emoji}
                      </span>
                      {selectedLevel === option.level && (
                        <>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 rounded-full animate-ping"></div>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 rounded-full"></div>
                        </>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3
                        className={`font-bold text-xl transition-colors duration-300 ${
                          selectedLevel === option.level
                            ? "text-purple-700"
                            : "text-gray-900 group-hover:text-purple-700"
                        }`}
                      >
                        {option.title}
                      </h3>
                      <p
                        className={`text-sm transition-colors duration-300 ${
                          selectedLevel === option.level
                            ? "text-purple-600"
                            : "text-gray-600 group-hover:text-purple-600"
                        }`}
                      >
                        {option.description}
                      </p>
                    </div>

                    {selectedLevel === option.level && (
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center animate-bounce-in shadow-lg">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                    )}
                  </div>

                  {/* Selection glow effect */}
                  {selectedLevel === option.level && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 pointer-events-none animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Find Trio Button */}
            <div className="animate-fade-in-up animation-delay-800">
              <button
                onClick={handleSubmit}
                disabled={!selectedLevel}
                className="w-full py-5 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl rounded-2xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:scale-105 enabled:active:scale-95 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center">
                  <span className="text-2xl mr-3 animate-twinkle">🔍</span>
                  Find My Perfect Trio
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out"></div>
              </button>
            </div>

            {/* Success Rate */}
            <div className="text-center mt-6 space-y-2 animate-fade-in animation-delay-1000">
              <p className="text-gray-500 text-sm flex items-center justify-center">
                <span className="text-yellow-500 mr-2 animate-twinkle">✨</span>
                94% love their trio experience
              </p>
              <p className="text-gray-600 font-medium">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Ready to join them?
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
