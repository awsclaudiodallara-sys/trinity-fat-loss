import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

interface EmailVerificationProps {
  onBack: () => void;
  onContinue?: () => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  onBack,
  onContinue,
}) => {
  const { loading, user } = useAuth();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const email = user?.email || "";

  const handleResendVerification = async () => {
    if (!email) return;

    setResendLoading(true);
    setResendMessage("");

    try {
      // Chiamata per rinviare email di verifica
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        setResendMessage(`Error: ${error.message}`);
      } else {
        setResendMessage("✅ Verification email sent! Check your inbox.");
      }
    } catch (err) {
      setResendMessage(`Error: ${err}`);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📧</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Check Your Email
            </h1>
            <p className="text-gray-600">We've sent a verification link to</p>
            <p className="font-semibold text-blue-600 mt-1">{email}</p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Check your email inbox</li>
              <li>2. Look for an email from Trinity Fat Loss</li>
              <li>3. Click the "Confirm Email" button</li>
              <li>4. You'll be redirected back to continue</li>
            </ol>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 rounded-xl p-4 mb-6 text-left">
            <h4 className="font-semibold text-yellow-800 mb-2">💡 Tips:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Check your spam/junk folder</li>
              <li>• Email may take a few minutes to arrive</li>
              {email && (
                <li>• Make sure {email.split("@")[1]} allows our emails</li>
              )}
            </ul>
          </div>

          {/* Resend Message */}
          {resendMessage && (
            <div
              className={`p-3 rounded-lg mb-4 text-sm ${
                resendMessage.includes("✅")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {resendMessage}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleResendVerification}
              disabled={resendLoading || loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {resendLoading ? "Sending..." : "📤 Resend Verification Email"}
            </button>

            {/* Manual Continue button (for development/testing) */}
            {onContinue && (
              <button
                onClick={onContinue}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 font-semibold"
              >
                ✅ I've Verified My Email - Continue
              </button>
            )}

            <button
              onClick={onBack}
              disabled={loading}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 disabled:opacity-50 font-semibold"
            >
              ← Change Email Address
            </button>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-500 mt-6">
            Having trouble? Contact our support team for help.
          </p>
        </div>
      </div>
    </div>
  );
};
