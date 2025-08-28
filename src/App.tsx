import { useState, useEffect } from "react";
import { LandingPage } from "./pages/LandingPage";
import { WelcomeScreen } from "./components/onboarding/WelcomeScreen";
import { EmailAuth } from "./components/auth/EmailAuth";
import { EmailVerification } from "./components/auth/EmailVerification";
import { ForgotPassword } from "./components/auth/ForgotPassword";
import { ResetPassword } from "./components/auth/ResetPassword";
import { DataCollectionScreen } from "./components/onboarding/DataCollectionScreen";
import { FitnessLevelScreen } from "./components/onboarding/FitnessLevelScreen";
import { Dashboard } from "./components/dashboard/Dashboard";
import { useAuth } from "./hooks/useAuth";
import Matching from "./components/onboarding/Matching";
import { supabase, matchingService } from "./lib/supabase";
import AnalyticsDemo from "./pages/AnalyticsDemo";
import { TrinityChat } from "./pages/TrinityChat";
import { TrinityVideo } from "./pages/TrinityVideo";

type AppScreen =
  | "landing"
  | "welcome"
  | "email-auth"
  | "email-verification"
  | "forgot-password"
  | "reset-password"
  | "data-collection"
  | "fitness-level"
  | "matching"
  | "dashboard"
  | "analytics-demo"
  | "trinity-chat"
  | "trinity-video";

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

interface UserProgress {
  name: string;
  loginMethod: string;
  userData: UserData | null;
  fitnessLevel: string;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("landing");
  const [matchingState, setMatchingState] = useState({
    skipAnimations: false,
    goToResults: false,
    isModifying: false, // New flag to track when user is modifying data
  });
  const [userProgress, setUserProgress] = useState<UserProgress>({
    name: "",
    loginMethod: "",
    userData: null,
    fitnessLevel: "",
  });
  const [userStatus, setUserStatus] = useState<{
    hasProfile: boolean;
    isInQueue: boolean;
    isInTrio: boolean;
    loading: boolean;
  }>({
    hasProfile: false,
    isInQueue: false,
    isInTrio: false,
    loading: true,
  });

  const { user, loading } = useAuth();

  const checkUserStatus = async (userId: string) => {
    try {
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select(
          "id, name, age, languages, weight_goal, fitness_level, matching_status"
        )
        .eq("id", userId)
        .single();

      if (profileError) {
        setUserStatus({
          hasProfile: false,
          isInQueue: false,
          isInTrio: false,
          loading: false,
        });
        return;
      }

      let isInQueue = false;
      try {
        const position = await matchingService.getQueuePosition(userId);
        isInQueue = position > 0;
      } catch {
        isInQueue = false;
      }

      const isInTrio = userProfile.matching_status === "in_trio";
      const hasCompleteProfile = !!(
        userProfile.name &&
        userProfile.age &&
        userProfile.languages &&
        userProfile.weight_goal &&
        userProfile.fitness_level
      );

      setUserStatus({
        hasProfile: hasCompleteProfile,
        isInQueue,
        isInTrio,
        loading: false,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setUserStatus({
        hasProfile: false,
        isInQueue: false,
        isInTrio: false,
        loading: false,
      });
    }
  };

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const type = hashParams.get("type");
    if (type === "recovery" && accessToken) {
      setCurrentScreen("reset-password");
    }
  }, []);

  useEffect(() => {
    if (!loading && user) {
      if (user.email_confirmed_at === null) {
        setCurrentScreen("email-verification");
        return;
      }
      checkUserStatus(user.id);
    } else if (!loading && !user) {
      setCurrentScreen("landing");
    }
  }, [user, loading]);

  useEffect(() => {
    if (!userStatus.loading && user) {
      if (userStatus.isInTrio) {
        setCurrentScreen("dashboard");
      } else if (userStatus.isInQueue) {
        setCurrentScreen("dashboard");
      } else if (userStatus.hasProfile) {
        setCurrentScreen("dashboard");
      } else {
        setCurrentScreen("landing");
      }
    }
  }, [userStatus, user]);

  const handleOnboardingStep = (
    screen: AppScreen,
    data?: Partial<UserProgress>
  ) => {
    setCurrentScreen(screen);
    if (data) {
      setUserProgress((prev) => ({ ...prev, ...data }));
    }
  };

  const handleStartOnboarding = () => {
    if (user) {
      setUserProgress((prev) => ({
        ...prev,
        name:
          user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        loginMethod: user.app_metadata?.provider || "google",
      }));
      setCurrentScreen("data-collection");
    } else {
      setCurrentScreen("welcome");
    }
  };

  const renderCurrentScreen = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin text-6xl mb-4">⚪</div>
            <h2 className="text-2xl font-bold mb-2">Connecting...</h2>
            <p className="text-lg opacity-90">
              Setting up your Trinity experience
            </p>
          </div>
        </div>
      );
    }

    switch (currentScreen) {
      case "landing":
        return <LandingPage onStartOnboarding={handleStartOnboarding} />;
      case "welcome":
        return (
          <WelcomeScreen
            onNext={(method: string) => {
              if (method === "email") {
                setCurrentScreen("email-auth");
              } else {
                handleOnboardingStep("data-collection", {
                  loginMethod: method,
                  name:
                    method === "google"
                      ? "Google User"
                      : method === "apple"
                      ? "Apple User"
                      : "User",
                });
              }
            }}
            onBack={() => setCurrentScreen("landing")}
          />
        );
      case "email-auth":
        return (
          <EmailAuth
            onSuccess={(isSignUp) => {
              if (isSignUp) {
                setCurrentScreen("email-verification");
              } else {
                handleOnboardingStep("data-collection", {
                  loginMethod: "email",
                  name: "Email User",
                });
              }
            }}
            onBack={() => setCurrentScreen("welcome")}
            onForgotPassword={() => setCurrentScreen("forgot-password")}
          />
        );
      case "email-verification":
        return (
          <EmailVerification
            onContinue={() => {
              handleOnboardingStep("data-collection", {
                loginMethod: "email",
                name: user?.email?.split("@")[0] || "Email User",
              });
            }}
            onBack={() => setCurrentScreen("email-auth")}
          />
        );
      case "forgot-password":
        return (
          <ForgotPassword
            onSuccess={() => {
              alert("Password reset email sent! Check your inbox.");
              setCurrentScreen("email-auth");
            }}
            onBack={() => setCurrentScreen("email-auth")}
          />
        );
      case "reset-password":
        return (
          <ResetPassword
            onSuccess={() => {
              alert("Password updated successfully! You can now sign in.");
              setCurrentScreen("email-auth");
            }}
            onError={(error) => {
              alert(error);
              setCurrentScreen("forgot-password");
            }}
          />
        );
      case "data-collection":
        return (
          <DataCollectionScreen
            userName={userProgress.name}
            onNext={(data: UserData) =>
              handleOnboardingStep("fitness-level", { userData: data })
            }
            onBack={() => setCurrentScreen("welcome")}
          />
        );
      case "fitness-level":
        return (
          <FitnessLevelScreen
            userData={userProgress.userData}
            onNext={(level: string) =>
              handleOnboardingStep("matching", { fitnessLevel: level })
            }
            onBack={() => setCurrentScreen("data-collection")}
          />
        );
      case "matching":
        return (
          <Matching
            userData={{
              name: userProgress.name,
              goal: userProgress.userData?.weightGoal || "10-15kg",
              level: userProgress.fitnessLevel,
              languages: userProgress.userData?.languages || ["English"],
              age: userProgress.userData?.age || 28,
              height: userProgress.userData?.height || 170,
              // Nuovi campi Navy Body Fat (database lowercase)
              weight: userProgress.userData?.weight,
              neckcircumference: userProgress.userData?.neckcircumference,
              waistcircumference: userProgress.userData?.waistcircumference,
              hipcircumference: userProgress.userData?.hipcircumference,
              gender: userProgress.userData?.gender,
            }}
            onComplete={() => {
              if (user) {
                checkUserStatus(user.id);
              }
              setMatchingState({
                skipAnimations: false,
                goToResults: false,
                isModifying: false,
              });
              setCurrentScreen("dashboard");
            }}
            skipAnimations={matchingState.skipAnimations}
            goToResults={
              matchingState.goToResults && !matchingState.isModifying
            }
          />
        );
      case "dashboard":
        return (
          <Dashboard
            userData={{
              name: userProgress.name,
              goal: userProgress.userData?.weightGoal || "10-15kg",
              level: userProgress.fitnessLevel,
              languages: userProgress.userData?.languages || ["English"],
              age: userProgress.userData?.age || 28,
            }}
            onGoToMatching={async () => {
              if (user) {
                try {
                  const { data: dbUserData, error } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", user.id)
                    .single();
                  if (error) throw error;
                  if (dbUserData) {
                    setUserProgress({
                      name: dbUserData.name || userProgress.name,
                      loginMethod: userProgress.loginMethod,
                      fitnessLevel:
                        dbUserData.fitness_level || userProgress.fitnessLevel,
                      userData: {
                        name:
                          dbUserData.name ||
                          userProgress.userData?.name ||
                          userProgress.name,
                        weightGoal:
                          dbUserData.weight_goal ||
                          userProgress.userData?.weightGoal ||
                          "10-15kg",
                        languages: dbUserData.languages ||
                          userProgress.userData?.languages || ["English"],
                        age: dbUserData.age || userProgress.userData?.age || 28,
                        height:
                          dbUserData.height ||
                          userProgress.userData?.height ||
                          170,
                      },
                    });
                  }
                } catch (error) {
                  console.error("Error loading user data:", error);
                }
              }
              setMatchingState({
                skipAnimations: true,
                goToResults: true,
                isModifying: false,
              });
              setCurrentScreen("matching");
            }}
            onLogout={() => {
              setCurrentScreen("landing");
              setUserProgress({
                name: "",
                loginMethod: "",
                userData: null,
                fitnessLevel: "",
              });
            }}
            onGoToChat={() => {
              setCurrentScreen("trinity-chat");
            }}
            onGoToVideo={() => {
              setCurrentScreen("trinity-video");
            }}
          />
        );
      case "analytics-demo":
        return <AnalyticsDemo />;
      case "trinity-chat":
        return (
          <TrinityChat
            trioId="demo-trio-id"
            onGoBack={() => setCurrentScreen("dashboard")}
          />
        );
      case "trinity-video":
        return <TrinityVideo onGoBack={() => setCurrentScreen("dashboard")} />;
      default:
        return <LandingPage onStartOnboarding={handleStartOnboarding} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentScreen()}
      {/* Development Navigation (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed top-1/2 right-4 transform -translate-y-1/2 bg-white rounded-lg shadow-lg p-4 text-xs z-50">
          <div className="font-semibold mb-2 text-gray-700">
            Dev Navigation:
          </div>
          <button
            onClick={() => setCurrentScreen("landing")}
            className={`block mb-1 px-2 py-1 rounded ${
              currentScreen === "landing"
                ? "bg-blue-100 text-blue-800"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            🏠 Landing
          </button>
          <button
            onClick={() => setCurrentScreen("welcome")}
            className={`block mb-1 px-2 py-1 rounded ${
              currentScreen === "welcome"
                ? "bg-blue-100 text-blue-800"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            👋 Welcome
          </button>
          <button
            onClick={() => setCurrentScreen("email-auth")}
            className={`block mb-1 px-2 py-1 rounded ${
              currentScreen === "email-auth"
                ? "bg-blue-100 text-blue-800"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            📧 Email Auth
          </button>
          <button
            onClick={() => setCurrentScreen("data-collection")}
            className={`block mb-1 px-2 py-1 rounded ${
              currentScreen === "data-collection"
                ? "bg-blue-100 text-blue-800"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            📊 Data
          </button>
          <button
            onClick={() => setCurrentScreen("fitness-level")}
            className={`block mb-1 px-2 py-1 rounded ${
              currentScreen === "fitness-level"
                ? "bg-blue-100 text-blue-800"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            💪 Fitness
          </button>
          <button
            onClick={() => setCurrentScreen("matching")}
            className={`block mb-1 px-2 py-1 rounded ${
              currentScreen === "matching"
                ? "bg-blue-100 text-blue-800"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            🔄 Matching
          </button>
          <button
            onClick={() => setCurrentScreen("dashboard")}
            className={`block mb-1 px-2 py-1 rounded ${
              currentScreen === "dashboard"
                ? "bg-blue-100 text-blue-800"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            🏆 Dashboard
          </button>
          <button
            onClick={() => setCurrentScreen("analytics-demo")}
            className={`block mb-1 px-2 py-1 rounded ${
              currentScreen === "analytics-demo"
                ? "bg-blue-100 text-blue-800"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            📊 Analytics Demo
          </button>
          <button
            onClick={() => setCurrentScreen("trinity-chat")}
            className={`block mb-1 px-2 py-1 rounded ${
              currentScreen === "trinity-chat"
                ? "bg-blue-100 text-blue-800"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            💬 Trinity Chat
          </button>
          <button
            onClick={() => setCurrentScreen("trinity-video")}
            className={`block px-2 py-1 rounded ${
              currentScreen === "trinity-video"
                ? "bg-blue-100 text-blue-800"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            📹 Trinity Video
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
