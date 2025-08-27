import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

interface WelcomeScreenProps {
  onNext: (loginMethod: string) => void;
  onBack?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNext,
  onBack,
}) => {
  const { signInWithGoogle, signInWithApple, loading, error } = useAuth();
  const [authLoading, setAuthLoading] = useState(false);

  const isLoading = loading || authLoading;

  const handleSocialLogin = async (method: string) => {
    // Se è email, naviga al form di autenticazione email
    if (method === "email") {
      onNext("email");
      return;
    }

    setAuthLoading(true);

    try {
      let result;

      if (method === "google") {
        result = await signInWithGoogle();
      } else if (method === "apple") {
        result = await signInWithApple();
      }

      if (result && !result.error) {
        console.log(`✅ Login successful with ${method}`);
        onNext(method);
      } else if (result?.error) {
        console.error(`❌ Login failed with ${method}:`, result.error.message);
      }
    } catch (err) {
      console.error(`❌ Login error with ${method}:`, err);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          {/* Trinity Visual */}
          <div className="mb-8 flex justify-center items-center space-x-2 text-4xl">
            <span className="animate-pulse">🏃‍♂️</span>
            <span className="animate-pulse" style={{ animationDelay: "0.3s" }}>
              👥
            </span>
            <span className="animate-pulse" style={{ animationDelay: "0.6s" }}>
              🏃‍♀️
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Trinity Fat Loss
          </h1>
          <p className="text-lg text-gray-600 mb-2">"Transform together.</p>
          <p className="text-lg text-gray-600 mb-8">Three minds, one goal."</p>

          {/* Subtitle */}
          <p className="text-gray-700 mb-8">
            Join thousands transforming with trio accountability
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error.message}
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => handleSocialLogin("email")}
              disabled={isLoading}
              className="w-full trinity-button bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>📧</span>
              <span>{isLoading ? "Loading..." : "Continue with Email"}</span>
            </button>

            <button
              onClick={() => handleSocialLogin("google")}
              disabled={isLoading}
              className="w-full trinity-button bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>🔍</span>
              <span>{isLoading ? "Loading..." : "Continue with Google"}</span>
            </button>

            <button
              onClick={() => handleSocialLogin("apple")}
              disabled={isLoading}
              className="w-full trinity-button bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>🍎</span>
              <span>{isLoading ? "Loading..." : "Continue with Apple"}</span>
            </button>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 mt-8 leading-relaxed">
            By continuing, you agree to our
            <br />
            <span className="text-blue-600">Terms of Service</span> &{" "}
            <span className="text-blue-600">Privacy Policy</span>
          </p>

          {/* Back Button */}
          {onBack && (
            <div className="mt-6">
              <button
                onClick={onBack}
                className="w-full trinity-button-secondary text-gray-600 border border-gray-300 hover:bg-gray-50"
              >
                ← Back to Landing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
