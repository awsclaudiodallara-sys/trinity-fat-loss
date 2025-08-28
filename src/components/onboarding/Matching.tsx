import React, { useState, useEffect, useCallback } from "react";

import { supabase, matchingService } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";

interface MatchingData {
  name: string;
  goal: string;
  level: string;
  languages: string[];
  age: number;
  height: number; // in cm
  weight?: number; // in kg - per calcoli Navy
  neckcircumference?: number; // in cm - per calcoli Navy (database lowercase)
  waistcircumference?: number; // in cm - per calcoli Navy (database lowercase)
  hipcircumference?: number; // in cm - solo donne, per calcoli Navy (database lowercase)
  gender?: "male" | "female"; // per calcoli Navy
}

interface MatchingProps {
  userData: MatchingData;
  onComplete: () => void;
  skipAnimations?: boolean;
  goToResults?: boolean;
}

interface MatchingResult {
  state: "searching" | "found_partial" | "matched" | "queued";
  matches?: Array<{
    id: string;
    name: string;
    compatibility: number;
    shared_goals: string[];
  }>;
  queue_position?: number;
  estimated_wait_hours?: number;
  flexible_criteria?: string[];
}

const performRealMatching = async (
  userData: MatchingData
): Promise<MatchingResult> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("User not authenticated");

    const upsertData = {
      id: user.id,
      email: user.email || "",
      name: userData.name,
      age: userData.age,
      height: userData.height,
      // Nuovi campi Navy Body Fat dall'onboarding (database lowercase)
      weight: userData.weight,
      neckcircumference: userData.neckcircumference,
      waistcircumference: userData.waistcircumference,
      hipcircumference: userData.hipcircumference,
      gender: userData.gender,
      // Campi esistenti
      languages: userData.languages,
      weight_goal: userData.goal,
      fitness_level: userData.level,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from("users")
      .upsert(upsertData, { onConflict: "id" });

    if (upsertError) throw upsertError;

    const matchingResult = await matchingService.processMatching(user.id, {
      weight_goal: userData.goal,
      fitness_level: userData.level,
      age: userData.age,
      height: userData.height,
      languages: userData.languages,
    });

    await new Promise((resolve) =>
      setTimeout(resolve, 2000 + Math.random() * 3000)
    );

    if (matchingResult.status === "matched") {
      return {
        state: "matched",
        matches: [
          {
            id: "matched-user-1",
            name: "Compatible User 1",
            compatibility: 85 + Math.floor(Math.random() * 15),
            shared_goals: [userData.goal],
          },
          {
            id: "matched-user-2",
            name: "Compatible User 2",
            compatibility: 85 + Math.floor(Math.random() * 15),
            shared_goals: [userData.goal],
          },
        ],
      };
    } else if (matchingResult.matches && matchingResult.matches.length === 1) {
      await matchingService.addToQueue(user.id);
      await matchingService.updateMatchingStatus(user.id, "available");
      return {
        state: "found_partial",
        matches: [
          {
            id: matchingResult.matches[0].id,
            name: matchingResult.matches[0].name || "Compatible User",
            compatibility: 70 + Math.floor(Math.random() * 15),
            shared_goals: [userData.goal],
          },
        ],
      };
    } else {
      await matchingService.addToQueue(user.id);
      const queuePosition = await matchingService.getQueuePosition(user.id);
      await matchingService.updateMatchingStatus(user.id, "available");
      return {
        state: "queued",
        queue_position: queuePosition,
        estimated_wait_hours: 24 + Math.floor(Math.random() * 48),
        flexible_criteria: ["schedule_flexibility", "age_range"],
      };
    }
  } catch (error) {
    console.error("Real matching error:", error);
    return {
      state: "queued",
      queue_position: Math.floor(Math.random() * 20) + 1,
      estimated_wait_hours: 24,
      flexible_criteria: ["database_retry"],
    };
  }
};

const Matching: React.FC<MatchingProps> = ({
  userData,
  onComplete,
  skipAnimations = false,
  goToResults = false,
}) => {
  const { user } = useAuth();

  const [searchProgress, setSearchProgress] = useState(
    skipAnimations ? 100 : 0
  );
  const [currentPhase, setCurrentPhase] = useState<
    "searching" | "analyzing" | "finalizing"
  >("searching");
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(
    null
  );
  const [showResult, setShowResult] = useState(false);
  const [hasStartedMatching, setHasStartedMatching] = useState(!goToResults);
  const [userChoseToStartMatching, setUserChoseToStartMatching] =
    useState(false);
  const [hasCheckedQueue, setHasCheckedQueue] = useState(false);

  const startMatching = useCallback(() => {
    setHasStartedMatching(true);
    setUserChoseToStartMatching(true);
    setSearchProgress(0);
    setCurrentPhase("searching");
    setShowResult(false);
  }, []);

  const cancelMatching = useCallback(async () => {
    if (!user) return;
    try {
      await matchingService.removeFromQueue(user.id);
      await matchingService.updateMatchingStatus(user.id, "available");
      onComplete();
    } catch (error) {
      console.error("Error cancelling matching:", error);
    }
  }, [user, onComplete]);

  useEffect(() => {
    const checkQueueStatus = async () => {
      if (!user || !goToResults || hasCheckedQueue) return;
      try {
        const position = await matchingService.getQueuePosition(user.id);
        if (position > 0) {
          setHasStartedMatching(true);
          setMatchingResult({
            state: "queued",
            queue_position: position,
            estimated_wait_hours: 24 + Math.floor(Math.random() * 48),
            flexible_criteria: ["schedule_flexibility", "age_range"],
          });
          setShowResult(true);
        }
        setHasCheckedQueue(true);
      } catch (error) {
        console.error("Error checking queue status:", error);
        setHasCheckedQueue(true);
      }
    };

    checkQueueStatus();
  }, [user, goToResults, hasCheckedQueue]);

  useEffect(() => {
    if (!hasStartedMatching || showResult) return;

    const runMatching = async () => {
      if (matchingResult?.state === "queued") return;

      const matchingPromise = performRealMatching(userData);
      const shouldSkipAnimations = skipAnimations && !userChoseToStartMatching;

      if (shouldSkipAnimations) {
        setSearchProgress(100);
        matchingPromise.then(async (result) => {
          setMatchingResult(result);
          setShowResult(true);
        });
        return;
      }

      const interval = setInterval(() => {
        setSearchProgress((prev) => {
          if (prev < 100) {
            const increment =
              currentPhase === "searching"
                ? 1.5
                : currentPhase === "analyzing"
                ? 0.8
                : 2.0;
            const newProgress = Math.min(prev + increment, 100);

            if (newProgress > 30 && currentPhase === "searching") {
              setCurrentPhase("analyzing");
            } else if (newProgress > 70 && currentPhase === "analyzing") {
              setCurrentPhase("finalizing");
            }
            return newProgress;
          }
          return prev;
        });
      }, 150);

      try {
        const result = await matchingPromise;
        setMatchingResult(result);
        setShowResult(true);
        clearInterval(interval);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setMatchingResult({
          state: "queued",
          queue_position: 1,
          estimated_wait_hours: 24,
          flexible_criteria: ["error_fallback"],
        });
        setShowResult(true);
        clearInterval(interval);
      }
    };

    runMatching();
  }, [
    userData,
    currentPhase,
    goToResults,
    skipAnimations,
    user,
    hasStartedMatching,
    userChoseToStartMatching,
    matchingResult,
    cancelMatching,
    onComplete,
    showResult,
  ]);

  const getPhaseMessage = () => {
    if (showResult) return "Match complete!";
    switch (currentPhase) {
      case "searching":
        return `Searching Trinity database... ${Math.round(searchProgress)}%`;
      case "analyzing":
        return `Analyzing compatibility... ${Math.round(searchProgress)}%`;
      case "finalizing":
        return `Finalizing matches... ${Math.round(searchProgress)}%`;
      default:
        return `Matching ${Math.round(searchProgress)}%`;
    }
  };

  const getResultContent = () => {
    if (!matchingResult) return null;

    switch (matchingResult.state) {
      case "matched":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
                <span className="text-5xl">🎉</span>
              </div>
              <h2 className="text-4xl font-bold text-green-600 mb-4">
                Perfect Match Found!
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                We found {matchingResult.matches?.length} compatible training
                partners
              </p>
            </div>
            <div className="space-y-4">
              {matchingResult.matches?.map((match) => (
                <div
                  key={match.id}
                  className="bg-green-50 p-6 rounded-2xl border border-green-200"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-bold text-green-800">
                      {match.name}
                    </h3>
                    <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {match.compatibility}% Match
                    </div>
                  </div>
                  <p className="text-green-700">
                    Shared goals: {match.shared_goals.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      case "found_partial":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">⚡</span>
              </div>
              <h2 className="text-4xl font-bold text-orange-600 mb-4">
                Partial Match Found
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                We found some potential partners. Looking for better matches...
              </p>
            </div>
            {matchingResult.matches?.map((match) => (
              <div
                key={match.id}
                className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-yellow-800">
                    {match.name}
                  </h3>
                  <div className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {match.compatibility}% Match
                  </div>
                </div>
                <p className="text-yellow-700">
                  Shared goals: {match.shared_goals.join(", ")}
                </p>
              </div>
            ))}
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
              <p className="text-blue-700 font-medium">
                🔍 Still searching for your perfect match...
              </p>
              <p className="text-blue-600 text-sm">
                We'll notify you when we find better compatibility
              </p>
            </div>

            <button
              onClick={cancelMatching}
              className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center justify-center">
                <span className="text-2xl mr-3">❌</span>
                Cancel Queue Request
              </span>
            </button>
            <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <p className="text-blue-700 text-sm text-center">
                📱 Notifications will keep you updated about your matching
                progress
              </p>
            </div>
          </div>
        );
      case "queued":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">⏰</span>
              </div>
              <h2 className="text-4xl font-bold text-blue-600 mb-4">
                You're in the Queue!
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                No immediate matches, but don't worry - we're working on it
              </p>
            </div>
            <div className="text-center mb-6">
              <p className="text-2xl font-bold text-blue-600 mb-2">
                Queue Position
              </p>
              <div className="text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                #{matchingResult.queue_position}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                <p className="text-blue-700 font-medium">
                  📱 We'll notify you within{" "}
                  {matchingResult.estimated_wait_hours}h
                </p>
                <p className="text-blue-600 text-sm">
                  More users join daily - your match is coming!
                </p>
              </div>
              {matchingResult.flexible_criteria &&
                matchingResult.flexible_criteria.length > 0 && (
                  <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200">
                    <p className="text-purple-700 font-medium">
                      🔄 We'll gradually expand search criteria
                    </p>
                    <p className="text-purple-600 text-sm">
                      This increases your chances of finding a match
                    </p>
                  </div>
                )}
            </div>

            <button
              onClick={cancelMatching}
              className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center justify-center">
                <span className="text-2xl mr-3">❌</span>
                Cancel Queue Request
              </span>
            </button>
            <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <p className="text-blue-700 text-sm text-center">
                📱 Notifications will keep you updated about your matching
                progress
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center">
            <p className="text-gray-600">Processing match results...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-500 via-pink-600 to-orange-500 flex items-center justify-center p-4 animate-gradient">
      <div className="w-full max-w-2xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50/20 via-pink-50/10 to-orange-50/20 rounded-3xl pointer-events-none"></div>
          <div className="relative z-10 text-center space-y-8">
            {!hasStartedMatching ? (
              <>
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-4xl">🎯</span>
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                    Ready to Find Your Trinity Team?
                  </h1>
                  <p className="text-lg text-gray-600 leading-relaxed max-w-md mx-auto">
                    Start your journey to find the perfect training partners who
                    share your goals!
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={startMatching}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    🚀 Use Current Profile & Start Matching
                  </button>
                  <button
                    onClick={onComplete}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-8 rounded-2xl transition-all duration-300"
                  >
                    ← Back to Dashboard
                  </button>
                </div>
                <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
                  <p className="font-medium mb-2">Your Profile:</p>
                  <div className="space-y-1 text-left">
                    <p>📊 Goal: {userData.goal}</p>
                    <p>💪 Level: {userData.level}</p>
                    <p>🌍 Languages: {userData.languages.join(", ")}</p>
                    <p>🎂 Age: {userData.age}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {!showResult ? (
                  <>
                    <div className="mb-12 animate-fade-in-up">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse-glow">
                        <span className="text-4xl animate-bounce-gentle">
                          💫
                        </span>
                      </div>
                      <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-4 animate-text-shimmer">
                        Finding Your Perfect Match
                      </h2>
                      <p className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
                        We're searching for the best training partners based on
                        your preferences
                      </p>
                    </div>
                    <div className="mb-8 animate-slide-in-right animation-delay-100">
                      <div className="w-full bg-gray-200 rounded-full h-6 mb-4 relative overflow-hidden shadow-inner">
                        <div
                          className="bg-gradient-to-r from-rose-500 via-orange-500 to-yellow-500 h-full rounded-full transition-all duration-300 ease-out relative"
                          style={{ width: `${searchProgress}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                        </div>
                      </div>
                      <p className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent animate-pulse">
                        {getPhaseMessage()}
                      </p>
                    </div>
                    <div className="mb-8 text-left animate-slide-in-left animation-delay-200">
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="text-2xl mr-3 animate-bounce-subtle">
                          🎯
                        </span>
                        Matching based on:
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { icon: "🎯", text: "Goal", value: userData.goal },
                          { icon: "💪", text: "Level", value: userData.level },
                          {
                            icon: "🗣️",
                            text: "Languages",
                            value: userData.languages,
                          },
                          {
                            icon: "👤",
                            text: "Age",
                            value: `${userData.age} years`,
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="p-4 rounded-2xl bg-gradient-to-br from-white/80 to-gray-50/80 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-in-up"
                            style={{ animationDelay: `${300 + index * 100}ms` }}
                          >
                            <span className="text-2xl block mb-2 animate-pulse-subtle">
                              {item.icon}
                            </span>
                            <p className="text-sm font-medium text-gray-600 mb-1">
                              {item.text}
                            </p>
                            <p className="text-gray-800 font-semibold text-sm">
                              {Array.isArray(item.value)
                                ? item.value.join(", ")
                                : item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mb-8 space-y-4 animate-fade-in animation-delay-700">
                      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                        <p className="text-gray-700 font-medium flex items-center justify-center">
                          <span className="text-2xl mr-3 animate-pulse-slow">
                            👥
                          </span>
                          Looking for 2 people with similar goals & schedule
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200">
                        <p className="text-orange-700 font-bold flex items-center justify-center">
                          <span className="text-2xl mr-3 animate-twinkle">
                            📱
                          </span>
                          We'll notify you within 24-48h
                        </p>
                      </div>
                    </div>
                    <div className="text-center mb-6 animate-fade-in animation-delay-900">
                      <p className="text-gray-600 mb-3 flex items-center justify-center">
                        <span className="text-xl mr-2 animate-bounce-subtle">
                          📖
                        </span>
                        Meanwhile, learn about Trinity
                      </p>
                      <button className="text-rose-600 hover:text-orange-600 font-bold text-lg hover:scale-105 transition-all duration-200 p-2 rounded-xl hover:bg-rose-50">
                        Browse Success Stories
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="animate-fade-in">{getResultContent()}</div>
                )}
              </>
            )}

            <button
              onClick={onComplete}
              className="w-full py-4 px-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl hover:from-amber-600 hover:to-orange-600 hover:scale-102 active:scale-98 transition-all duration-200 font-bold text-lg shadow-lg"
            >
              Continue to Dashboard →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Matching;
