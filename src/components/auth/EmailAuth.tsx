import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

interface EmailAuthProps {
  onSuccess: (isSignUp: boolean) => void;
  onBack: () => void;
  onForgotPassword?: () => void;
}

export const EmailAuth: React.FC<EmailAuthProps> = ({
  onSuccess,
  onBack,
  onForgotPassword,
}) => {
  const { signInWithEmail, signUpWithEmail, loading, error } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  const isLoading = loading || formLoading;

  // 🔒 Password validation function
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/\d/.test(password)) {
      return "Password must contain at least one digit";
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      return "Password must contain at least one symbol (!@#$%^&*)";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (mode === "signup") {
        // Validazioni per signup
        if (formData.password !== formData.confirmPassword) {
          alert("Passwords do not match!");
          return;
        }

        const passwordError = validatePassword(formData.password);
        if (passwordError) {
          alert(passwordError);
          return;
        }

        const result = await signUpWithEmail(
          formData.email,
          formData.password,
          formData.fullName
        );

        if (result.error) {
          console.error("Signup error:", result.error.message);
        } else {
          console.log(
            "✅ Signup successful! Check your email for verification."
          );
          onSuccess(true); // isSignUp = true
        }
      } else {
        // Sign In
        const result = await signInWithEmail(formData.email, formData.password);

        if (result.error) {
          console.error("Signin error:", result.error.message);
        } else {
          console.log("✅ Login successful!");
          onSuccess(false); // isSignUp = false
        }
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center items-center space-x-2 text-3xl">
              <span>🏃‍♂️</span>
              <span>👥</span>
              <span>🏃‍♀️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {mode === "signin" ? "Welcome Back!" : "Join Trinity"}
            </h1>
            <p className="text-gray-600">
              {mode === "signin"
                ? "Sign in to continue your transformation"
                : "Create your account to get started"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error.message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>

            {/* Password Requirements for Signup */}
            {mode === "signup" && formData.password && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Password Requirements:
                </h4>
                <ul className="text-sm space-y-1">
                  <li
                    className={
                      formData.password.length >= 8
                        ? "✅ text-green-600"
                        : "• text-gray-600"
                    }
                  >
                    At least 8 characters long
                  </li>
                  <li
                    className={
                      /[a-z]/.test(formData.password)
                        ? "✅ text-green-600"
                        : "• text-gray-600"
                    }
                  >
                    One lowercase letter (a-z)
                  </li>
                  <li
                    className={
                      /[A-Z]/.test(formData.password)
                        ? "✅ text-green-600"
                        : "• text-gray-600"
                    }
                  >
                    One uppercase letter (A-Z)
                  </li>
                  <li
                    className={
                      /\d/.test(formData.password)
                        ? "✅ text-green-600"
                        : "• text-gray-600"
                    }
                  >
                    One digit (0-9)
                  </li>
                  <li
                    className={
                      /[^a-zA-Z0-9]/.test(formData.password)
                        ? "✅ text-green-600"
                        : "• text-gray-600"
                    }
                  >
                    One symbol (!@#$%^&*)
                  </li>
                </ul>
              </div>
            )}

            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isLoading
                ? "Loading..."
                : mode === "signin"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          {/* Forgot Password Link (only for signin mode) */}
          {mode === "signin" && onForgotPassword && (
            <div className="text-center mt-4">
              <button
                onClick={onForgotPassword}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 text-sm disabled:opacity-50"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* Toggle Mode */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              {mode === "signin"
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50"
            >
              {mode === "signin" ? "Create Account" : "Sign In"}
            </button>
          </div>

          {/* Back Button */}
          <div className="mt-6">
            <button
              onClick={onBack}
              disabled={isLoading}
              className="w-full trinity-button-secondary text-gray-600 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              ← Back to Options
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
