import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { dashboardService } from "../../lib/supabase";
import { UserMenu } from "../common/UserMenu";
import { DailyCheckIn } from "../checkin/DailyCheckIn";
import { WeeklyCheckIn } from "../checkin/WeeklyCheckIn";
import { BodyCompositionDashboard } from "../health/BodyCompositionDashboard";
import { ChatPreview } from "../chat/ChatPreview";
import { VideoCallWidget } from "../video/VideoCallWidget";

interface TrioMember {
  id: string;
  name: string;
  age: number;
}

interface TrioData {
  id: string;
  name: string;
  goal: string;
  level: string;
  language: string;
  members: TrioMember[];
  createdAt: string;
  daysActive: number;
}

interface QueueData {
  position: number;
  goal: string;
  level: string;
  joinedAt: string;
  estimatedWaitHours: number;
}

interface DashboardProps {
  userData: {
    name: string;
    goal: string;
    level: string;
    languages: string[];
    age: number;
  };
  onLogout?: () => void;
  onGoToMatching?: () => void;
  onGoToChat?: () => void;
  onGoToVideo?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userData,
  onGoToMatching,
  onGoToChat,
  onGoToVideo,
}) => {
  const { user } = useAuth();
  const [userStatus, setUserStatus] = useState<{
    status: "loading" | "in_trio" | "in_queue" | "no_group";
    trio?: TrioData | null;
    queue?: QueueData | null;
  }>({ status: "loading" });

  const [dailyProgress, setDailyProgress] = useState({
    completed: 0,
    total: 0,
    percentage: 0,
  });

  const [weeklyProgress, setWeeklyProgress] = useState<{
    completed: number;
    total: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    const fetchUserStatus = async () => {
      if (!user) return;

      try {
        const status = await dashboardService.getUserStatus(user.id);
        setUserStatus(status);
      } catch (error) {
        console.error("Errore nel recupero stato utente:", error);
        setUserStatus({ status: "no_group" });
      }
    };

    const fetchWeeklyProgress = async () => {
      if (!user) return;
      try {
        const progress = await dashboardService.getWeeklyProgress(user.id);
        setWeeklyProgress(progress);
      } catch (err) {
        console.error("Failed to fetch weekly progress", err);
      }
    };

    fetchUserStatus();
    fetchWeeklyProgress();
  }, [user]);

  const handleDailyTasksUpdated = (completed: number, total: number) => {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    setDailyProgress({
      completed,
      total,
      percentage,
    });
  };

  const handleWeeklyTasksUpdated = async () => {
    if (!user) return;
    try {
      const progress = await dashboardService.getWeeklyProgress(user.id);
      setWeeklyProgress(progress);
    } catch (err) {
      console.error("Failed to fetch weekly progress", err);
    }
  };

  const goToMatchingStatus = () => {
    if (onGoToMatching) {
      onGoToMatching();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl">
        <div className="px-6 py-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {getGreeting()}, {userData.name}! ☀️
              </h1>
              <p className="text-blue-100 mt-1">
                Welcome to your Trinity dashboard
              </p>
            </div>
            <UserMenu variant="dark" />
          </div>

          {userStatus.status === "loading" && (
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 mb-4 border border-blue-400/30">
              <div className="text-center">
                <div className="animate-pulse text-white">
                  🔄 Caricamento stato...
                </div>
              </div>
            </div>
          )}

          {userStatus.status === "in_queue" && userStatus.queue && (
            <div className="bg-amber-500/20 backdrop-blur-sm rounded-xl p-4 mb-4 border border-amber-400/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    ⏰ In coda per il matching
                  </h3>
                  <p className="text-amber-100 text-sm">
                    Posizione #{userStatus.queue.position} • Goal:{" "}
                    {userStatus.queue.goal} • Level: {userStatus.queue.level}
                  </p>
                  <p className="text-amber-100 text-xs mt-1">
                    Stima attesa: ~{userStatus.queue.estimatedWaitHours}h
                  </p>
                </div>
                <button
                  onClick={goToMatchingStatus}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200"
                >
                  View Status
                </button>
              </div>
            </div>
          )}

          {userStatus.status === "in_trio" && userStatus.trio && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
              <h2 className="font-semibold mb-2 text-white">
                👥 {userStatus.trio.name}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-blue-100 mb-2">
                <span>
                  {userStatus.trio.members
                    .map((m: TrioMember) => m.name)
                    .join(" • ")}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-blue-100">
                <span>🎯 {userStatus.trio.goal}</span>
                <span>💪 {userStatus.trio.level}</span>
                <span>🗣️ {userStatus.trio.language}</span>
                <span>📅 {userStatus.trio.daysActive} giorni</span>
              </div>
            </div>
          )}

          {userStatus.status === "no_group" && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-6 mb-4 border border-green-400/30">
              <div className="text-center">
                <h2 className="font-bold text-white text-xl mb-3">
                  🚀 Inizia il tuo percorso Trinity!
                </h2>
                <p className="text-green-100 mb-4">
                  Non fai ancora parte di un gruppo. Completa il tuo profilo e
                  trova i tuoi compagni di allenamento ideali!
                </p>
                <button
                  onClick={onGoToMatching}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
                >
                  🎯 Trova il mio Trinity Team
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {userStatus.status === "in_trio" && (
        <div className="px-6 py-6 space-y-6">
          {/* Today's Progress */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                ⭐ Today's Progress: {dailyProgress.completed}/
                {dailyProgress.total}
              </h3>
              <span className="text-2xl animate-pulse">✨</span>
            </div>

            <div className="mb-6">
              <div className="bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-md"
                  style={{ width: `${dailyProgress.percentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                {dailyProgress.percentage}% Complete
              </p>
            </div>
          </div>

          {/* Daily Check-in  */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <DailyCheckIn onTasksUpdated={handleDailyTasksUpdated} />
          </div>

          {/* Weekly Progress */}
          {weeklyProgress && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  📊 Weekly Progress: {weeklyProgress.completed}/
                  {weeklyProgress.total}
                </h3>
                <span className="text-2xl animate-pulse">📈</span>
              </div>

              <div className="mb-6">
                <div className="bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-gradient-to-r from-green-400 via-lime-400 to-yellow-400 h-3 rounded-full transition-all duration-500 shadow-md"
                    style={{ width: `${weeklyProgress.percentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {weeklyProgress.percentage}% Complete
                </p>
              </div>
            </div>
          )}

          {/* Weekly Check-in */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <WeeklyCheckIn onTasksUpdated={handleWeeklyTasksUpdated} />
          </div>

          {/* Trinity Communication Hub */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chat Preview */}
            <ChatPreview
              trioId={userStatus.trio?.id || ""}
              currentUserId={user?.id || ""}
              onOpenChat={onGoToChat}
            />

            {/* Video Call Widget */}
            <VideoCallWidget
              currentUserId={user?.id || ""}
              onOpenVideo={onGoToVideo}
            />
          </div>

          {/* Body Composition Analytics Dashboard */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
            <BodyCompositionDashboard />
          </div>
        </div>
      )}

      {(userStatus.status === "in_queue" ||
        userStatus.status === "no_group") && (
        <div className="px-6 py-6 space-y-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-sm text-gray-700 shadow-md border border-white/30">
            <h4 className="font-medium mb-2 text-gray-800">Il tuo profilo:</h4>
            <div>👤 Nome: {userData.name}</div>
            <div>🎯 Obiettivo: {userData.goal}</div>
            <div>💪 Livello: {userData.level}</div>
            <div>🗣️ Lingue: {userData.languages.join(", ")}</div>
            <div>🎂 Età: {userData.age}</div>
            <div>📧 Email: {user?.email}</div>

            {userStatus.status === "in_queue" && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                <p className="text-amber-800 font-medium">
                  ⏰ Sei in coda per il matching!
                </p>
                <p className="text-amber-600 text-sm">
                  Ti contatteremo non appena troviamo partner compatibili.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
