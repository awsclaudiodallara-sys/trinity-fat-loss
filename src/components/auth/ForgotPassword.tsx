import React, { useState } from "react";
import { supabase } from "../../lib/supabase";

interface ForgotPasswordProps {
  onBack: () => void;
  onSuccess: (email: string) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  onBack,
  onSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        onSuccess(email);
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
              <span>🔒</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600">
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email address"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? "Sending Reset Link..." : "Send Reset Link"}
            </button>
          </form>

          {/* Info */}
          <div className="bg-blue-50 rounded-xl p-4 mt-6">
            <h4 className="font-semibold text-blue-900 mb-2">
              What happens next?
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You'll receive an email with a reset link</li>
              <li>• Click the link to set a new password</li>
              <li>• The link expires in 1 hour for security</li>
            </ul>
          </div>

          {/* Back Button */}
          <div className="mt-6">
            <button
              onClick={onBack}
              disabled={loading}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 disabled:opacity-50 font-semibold"
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
