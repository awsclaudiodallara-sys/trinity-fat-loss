import React, { useState } from "react";
import { UserMenu } from "../common/UserMenu";

interface UserData {
  name: string;
  age: number;
  height: number; // in cm
  weight?: number; // in kg - per calcoli Navy
  neckcircumference?: number; // in cm - per calcoli Navy (database lowercase)
  waistcircumference?: number; // in cm - per calcoli Navy (database lowercase)
  hipcircumference?: number; // in cm - solo donne, per calcoli Navy (database lowercase)
  gender?: "male" | "female"; // per calcoli Navy
  languages: string[];
  weightGoal: string;
}

interface DataCollectionScreenProps {
  userName: string;
  onNext: (data: UserData) => void;
  onBack: () => void;
}

export const DataCollectionScreen: React.FC<DataCollectionScreenProps> = ({
  userName,
  onNext,
  onBack,
}) => {
  const [formData, setFormData] = useState<UserData>({
    name: userName,
    age: 28,
    height: 170, // default height in cm
    weight: undefined,
    neckcircumference: undefined,
    waistcircumference: undefined,
    hipcircumference: undefined,
    gender: undefined,
    languages: [],
    weightGoal: "",
  });

  const handleLanguageToggle = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language],
    }));
  };

  const handleSubmit = () => {
    const baseValidation =
      formData.languages.length > 0 &&
      formData.weightGoal &&
      formData.height >= 140 &&
      formData.height <= 220;

    if (baseValidation) {
      onNext(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center p-4 animate-gradient">
      {/* User Menu - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <UserMenu variant="dark" />
      </div>

      <div className="max-w-md w-full animate-fade-in-up">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-3xl pointer-events-none"></div>

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
                  <div className="w-10 h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse"></div>
                </div>
                <span className="text-sm text-gray-500 font-medium">
                  Step 2 of 3
                </span>
              </div>
            </div>

            {/* Welcome Section */}
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-2xl font-bold text-gray-800 mb-3">
                Welcome Claudio Dall'Ara! ✏️
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                👋 Let's find your perfect
                <br />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                  transformation trio
                </span>
              </p>
            </div>

            {/* Age Section */}
            <div className="mb-8 animate-slide-in-right animation-delay-100">
              <label className="text-gray-700 font-semibold mb-4 flex items-center">
                <span className="text-2xl mr-3 animate-bounce-subtle">🎂</span>
                How old are you?
              </label>
              <div className="relative group">
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      age: parseInt(e.target.value),
                    }))
                  }
                  className="w-full py-4 px-6 text-center text-2xl font-bold bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all duration-300 focus:scale-105 focus:shadow-lg"
                  min="18"
                  max="65"
                  placeholder="28"
                />
                <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-all duration-300"></div>
              </div>
            </div>

            {/* Height Section */}
            <div className="mb-8 animate-slide-in-left animation-delay-150">
              <label className="text-gray-700 font-semibold mb-4 flex items-center">
                <span className="text-2xl mr-3 animate-bounce-subtle">📏</span>
                What's your height?
              </label>
              <div className="relative group">
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      height: parseInt(e.target.value),
                    }))
                  }
                  className="w-full py-4 px-6 text-center text-2xl font-bold bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all duration-300 focus:scale-105 focus:shadow-lg"
                  min="140"
                  max="220"
                  placeholder="170"
                />
                <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-all duration-300"></div>
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium pointer-events-none">
                  cm
                </div>
              </div>
            </div>

            {/* Gender Section - Nuovo per calcoli Navy */}
            <div className="mb-8 animate-slide-in-left animation-delay-200">
              <label className="text-gray-700 font-semibold mb-4 flex items-center">
                <span className="text-2xl mr-3 animate-bounce-subtle">👤</span>
                Gender (for body composition analysis)
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "male", label: "Male", emoji: "👨" },
                  { value: "female", label: "Female", emoji: "👩" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        gender: option.value as "male" | "female",
                      }))
                    }
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 group ${
                      formData.gender === option.value
                        ? "border-indigo-500 bg-indigo-50 shadow-lg scale-105"
                        : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 hover:scale-102"
                    }`}
                  >
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                      {option.emoji}
                    </div>
                    <div className="font-semibold text-gray-700">
                      {option.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Weight Section - Nuovo per calcoli Navy */}
            <div className="mb-8 animate-slide-in-left animation-delay-250">
              <label className="text-gray-700 font-semibold mb-4 flex items-center">
                <span className="text-2xl mr-3 animate-bounce-subtle">⚖️</span>
                Current Weight (for body fat analysis)
              </label>
              <div className="relative group">
                <input
                  type="number"
                  value={formData.weight || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      weight: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-full py-4 px-6 text-center text-2xl font-bold bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all duration-300 focus:scale-105 focus:shadow-lg"
                  min="30"
                  max="300"
                  step="0.1"
                  placeholder="70.5"
                />
                <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-all duration-300"></div>
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium pointer-events-none">
                  kg
                </div>
              </div>
            </div>

            {/* Neck Circumference Section - Nuovo per calcoli Navy */}
            <div className="mb-8 animate-slide-in-left animation-delay-300">
              <label className="text-gray-700 font-semibold mb-4 flex items-center">
                <span className="text-2xl mr-3 animate-bounce-subtle">🏷️</span>
                Neck Circumference (for body fat analysis)
              </label>
              <div className="relative group">
                <input
                  type="number"
                  value={formData.neckcircumference || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      neckcircumference: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-full py-4 px-6 text-center text-2xl font-bold bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all duration-300 focus:scale-105 focus:shadow-lg"
                  min="20"
                  max="60"
                  step="0.5"
                  placeholder="35"
                />
                <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-all duration-300"></div>
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium pointer-events-none">
                  cm
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                📏 Measure just below the Adam's apple
              </p>
            </div>

            {/* Waist Circumference Section - Nuovo per calcoli Navy */}
            <div className="mb-8 animate-slide-in-left animation-delay-350">
              <label className="text-gray-700 font-semibold mb-4 flex items-center">
                <span className="text-2xl mr-3 animate-bounce-subtle">📐</span>
                Waist Circumference (for body fat analysis)
              </label>
              <div className="relative group">
                <input
                  type="number"
                  value={formData.waistcircumference || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      waistcircumference: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-full py-4 px-6 text-center text-2xl font-bold bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all duration-300 focus:scale-105 focus:shadow-lg"
                  min="50"
                  max="200"
                  step="0.5"
                  placeholder="80"
                />
                <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-all duration-300"></div>
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium pointer-events-none">
                  cm
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                📏 Measure at the narrowest point of your torso
              </p>
            </div>

            {/* Hip Circumference Section - Solo per donne */}
            {formData.gender === "female" && (
              <div className="mb-8 animate-slide-in-left animation-delay-400">
                <label className="text-gray-700 font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-3 animate-bounce-subtle">
                    🍑
                  </span>
                  Hip Circumference (for women's body fat analysis)
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    value={formData.hipcircumference || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hipcircumference: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      }))
                    }
                    className="w-full py-4 px-6 text-center text-2xl font-bold bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all duration-300 focus:scale-105 focus:shadow-lg"
                    min="60"
                    max="200"
                    step="0.5"
                    placeholder="90"
                  />
                  <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-all duration-300"></div>
                  <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium pointer-events-none">
                    cm
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  📏 Measure at the widest point of your hips
                </p>
              </div>
            )}

            {/* Languages Section */}
            <div className="mb-8 animate-slide-in-left animation-delay-500">
              <label className="text-gray-700 font-semibold mb-4 flex items-center">
                <span className="text-2xl mr-3 animate-spin-slow">🌍</span>
                Which languages do you speak fluently? (Select all)
              </label>
              <div className="space-y-3">
                {[
                  { name: "English", code: "GB" },
                  { name: "Italiano", code: "IT" },
                ].map((language, index) => (
                  <label
                    key={language.name}
                    className={`flex items-center space-x-4 cursor-pointer p-4 rounded-2xl border-2 transition-all duration-300 group animate-slide-in-right ${
                      formData.languages.includes(language.name)
                        ? "border-indigo-300 bg-indigo-50/70 shadow-md"
                        : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"
                    } hover:scale-102 active:scale-98`}
                    style={{ animationDelay: `${300 + index * 100}ms` }}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(language.name)}
                        onChange={() => handleLanguageToggle(language.name)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-2 transition-all duration-200"
                      />
                      {formData.languages.includes(language.name) && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 rounded-full animate-ping"></div>
                      )}
                    </div>

                    <div className="w-10 h-7 rounded-lg overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {language.code === "GB" ? (
                        <div className="w-full h-full bg-blue-800 relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-white transform rotate-45 absolute"></div>
                            <div className="w-full h-0.5 bg-white transform -rotate-45 absolute"></div>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-1 bg-red-600 absolute top-1/2 transform -translate-y-1/2"></div>
                            <div className="h-full w-1 bg-red-600 absolute left-1/2 transform -translate-x-1/2"></div>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-1.5 bg-white absolute top-1/2 transform -translate-y-1/2"></div>
                            <div className="h-full w-1.5 bg-white absolute left-1/2 transform -translate-x-1/2"></div>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-red-600 absolute top-1/2 transform -translate-y-1/2"></div>
                            <div className="h-full w-0.5 bg-red-600 absolute left-1/2 transform -translate-x-1/2"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex">
                          <div className="w-1/3 h-full bg-green-600"></div>
                          <div className="w-1/3 h-full bg-white"></div>
                          <div className="w-1/3 h-full bg-red-500"></div>
                        </div>
                      )}
                    </div>

                    <span className="text-gray-700 font-medium text-lg group-hover:text-indigo-700 transition-colors duration-300 flex-1">
                      {language.name}
                    </span>

                    {formData.languages.includes(language.name) && (
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center animate-bounce-in shadow-lg">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Weight Goal Section */}
            <div className="mb-8 animate-slide-in-right animation-delay-400">
              <label className="text-gray-700 font-semibold mb-4 flex items-center">
                <span className="text-2xl mr-3 animate-pulse-slow">🎯</span>
                What's your weight loss goal?
              </label>
              <div className="space-y-3">
                {[
                  { value: "5-10kg", label: "5-10kg (Moderate change)" },
                  { value: "10-15kg", label: "10-15kg (Solid results)" },
                  { value: "15+kg", label: "15+ kg (Major transformation)" },
                ].map((goal, index) => (
                  <label
                    key={goal.value}
                    className={`flex items-center cursor-pointer p-4 rounded-2xl border-2 transition-all duration-300 group animate-slide-in-left ${
                      formData.weightGoal === goal.value
                        ? "border-purple-300 bg-purple-50/70 shadow-md"
                        : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/30"
                    } hover:scale-102 active:scale-98`}
                    style={{ animationDelay: `${500 + index * 100}ms` }}
                  >
                    <div className="relative mr-4">
                      <input
                        type="radio"
                        name="weightGoal"
                        value={goal.value}
                        checked={formData.weightGoal === goal.value}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            weightGoal: e.target.value,
                          }))
                        }
                        className="w-5 h-5 text-purple-600 focus:ring-purple-500 focus:ring-2 transition-all duration-200"
                      />
                      {formData.weightGoal === goal.value && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-600 rounded-full animate-ping"></div>
                      )}
                    </div>
                    <span className="text-gray-700 font-medium text-lg group-hover:text-purple-700 transition-colors duration-300 flex-1">
                      {goal.label}
                    </span>
                    {formData.weightGoal === goal.value && (
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center animate-bounce-in shadow-lg">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Continue Button */}
            <div className="animate-fade-in-up animation-delay-800">
              <button
                onClick={handleSubmit}
                disabled={
                  formData.languages.length === 0 ||
                  !formData.weightGoal ||
                  formData.height < 140 ||
                  formData.height > 220
                }
                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:scale-105 enabled:active:scale-95 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10">Continue to Final Step</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out"></div>
              </button>
            </div>

            {/* Success Rate */}
            <div className="text-center mt-6 animate-fade-in animation-delay-1000">
              <p className="text-gray-500 text-sm flex items-center justify-center">
                <span className="text-yellow-500 mr-2 animate-twinkle">✨</span>
                92% find their trio in 48h
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
