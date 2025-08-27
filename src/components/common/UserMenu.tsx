import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

interface UserMenuProps {
  variant?: "light" | "dark";
  className?: string;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  variant = "light",
  className = "",
}) => {
  const { user, signOut, signInWithGoogleForceSelection } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      // The auth state change will automatically redirect to landing
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  };

  const handleSwitchAccount = async () => {
    setIsSwitching(true);
    try {
      // First sign out current user
      await signOut();
      // Small delay to ensure logout is complete
      setTimeout(() => {
        // Force Google account selection
        signInWithGoogleForceSelection();
      }, 500);
    } catch (error) {
      console.error("Switch account error:", error);
    } finally {
      setIsSwitching(false);
      setIsOpen(false);
    }
  };

  const isDark = variant === "dark";

  return (
    <div className={`relative ${className}`}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 hover:scale-105
          ${
            isDark
              ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
          }
        `}
      >
        <div
          className={`
          w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
          ${
            isDark
              ? "bg-white/20 text-white"
              : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
          }
        `}
        >
          {user.email?.charAt(0).toUpperCase() || "U"}
        </div>
        <span className="text-sm font-medium truncate max-w-32">
          {user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
          absolute top-full right-0 mt-2 w-64 rounded-xl shadow-xl border z-50
          ${
            isDark
              ? "bg-gray-800/95 backdrop-blur-sm border-gray-700 text-white"
              : "bg-white/95 backdrop-blur-sm border-gray-200 text-gray-700"
          }
        `}
        >
          {/* User Info */}
          <div
            className={`p-4 border-b ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <p className="font-semibold text-sm">
              {user.user_metadata?.full_name || "Trinity User"}
            </p>
            <p
              className={`text-xs ${
                isDark ? "text-gray-300" : "text-gray-500"
              }`}
            >
              {user.email}
            </p>
            <p
              className={`text-xs mt-1 ${
                isDark ? "text-gray-400" : "text-gray-400"
              }`}
            >
              Signed in via {user.app_metadata?.provider || "email"}
            </p>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {/* Switch Account Button */}
            <button
              onClick={handleSwitchAccount}
              disabled={isSwitching || isLoggingOut}
              className={`
                w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 mb-1
                ${
                  isDark
                    ? "hover:bg-blue-500/20 text-blue-300 hover:text-blue-200"
                    : "hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              <span className="font-medium">
                {isSwitching ? "Switching..." : "Switch Google Account"}
              </span>
            </button>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut || isSwitching}
              className={`
                w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200
                ${
                  isDark
                    ? "hover:bg-red-500/20 text-red-300 hover:text-red-200"
                    : "hover:bg-red-50 text-red-600 hover:text-red-700"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="font-medium">
                {isLoggingOut ? "Signing out..." : "Sign out"}
              </span>
            </button>

            <div
              className={`mt-2 p-3 rounded-lg text-xs ${
                isDark ? "bg-white/5 text-gray-300" : "bg-gray-50 text-gray-500"
              }`}
            >
              💡 <strong>Switch Account:</strong> Choose a different Google
              account
              <br />
              🚪 <strong>Sign Out:</strong> Completely log out from Trinity
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
