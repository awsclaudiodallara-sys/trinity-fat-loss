import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

interface ResetPasswordProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({
  onSuccess,
  onError,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    // Check if we have the reset token in the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");

    if (!accessToken) {
      onError("Invalid or expired reset link. Please request a new one.");
    }
  }, [onError]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center items-center space-x-2 text-3xl">
              <span>🔑</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Set New Password
            </h1>
            <p className="text-gray-600">Enter your new password below</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter new password"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm new password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>

          {/* Password Requirements */}
          <div className="bg-gray-50 rounded-xl p-4 mt-6">
            <h4 className="font-semibold text-gray-900 mb-2">
              Password Requirements:
            </h4>
            <ul className="text-sm space-y-1">
              <li
                className={
                  password.length >= 8 ? "✅ text-green-600" : "• text-gray-600"
                }
              >
                At least 8 characters long
              </li>
              <li
                className={
                  /[a-z]/.test(password)
                    ? "✅ text-green-600"
                    : "• text-gray-600"
                }
              >
                One lowercase letter (a-z)
              </li>
              <li
                className={
                  /[A-Z]/.test(password)
                    ? "✅ text-green-600"
                    : "• text-gray-600"
                }
              >
                One uppercase letter (A-Z)
              </li>
              <li
                className={
                  /\d/.test(password) ? "✅ text-green-600" : "• text-gray-600"
                }
              >
                One digit (0-9)
              </li>
              <li
                className={
                  /[^a-zA-Z0-9]/.test(password)
                    ? "✅ text-green-600"
                    : "• text-gray-600"
                }
              >
                One symbol (!@#$%^&*)
              </li>
              <li
                className={
                  password === confirmPassword && password
                    ? "✅ text-green-600"
                    : "• text-gray-600"
                }
              >
                Passwords match
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
