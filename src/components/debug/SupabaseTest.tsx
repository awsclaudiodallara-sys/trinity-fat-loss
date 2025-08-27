import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface TestDetails {
  user: string;
  session: string;
  projectUrl: string;
  hasAnonKey: boolean;
}

export const SupabaseTest: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState<TestDetails | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("🔍 Testing Supabase connection...");

        // Test 1: Basic connection
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ Supabase connection error:", error);
          setStatus("error");
          setMessage(`Connection Error: ${error.message}`);
          return;
        }

        console.log("✅ Supabase connection successful!");

        // Test 2: Try to get user (will be null if not logged in, but shouldn't error)
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("❌ Auth error:", userError);
          setStatus("error");
          setMessage(`Auth Error: ${userError.message}`);
          return;
        }

        setStatus("success");
        setMessage("Supabase connection successful! Ready for authentication.");
        setDetails({
          user: user
            ? `Logged in as: ${user.email}`
            : "No user logged in (this is normal)",
          session: data.session ? "Active session found" : "No active session",
          projectUrl: import.meta.env.VITE_SUPABASE_URL,
          hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        });
      } catch (err) {
        console.error("❌ Unexpected error:", err);
        setStatus("error");
        setMessage(`Unexpected Error: ${err}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        🔧 Supabase Connection Test
        {status === "loading" && <span className="ml-2 animate-spin">⏳</span>}
        {status === "success" && (
          <span className="ml-2 text-green-600">✅</span>
        )}
        {status === "error" && <span className="ml-2 text-red-600">❌</span>}
      </h3>

      <div
        className={`p-3 rounded mb-4 ${
          status === "success"
            ? "bg-green-100 border border-green-300 text-green-700"
            : status === "error"
            ? "bg-red-100 border border-red-300 text-red-700"
            : "bg-gray-100 border border-gray-300 text-gray-700"
        }`}
      >
        {message || "Testing connection..."}
      </div>

      {details && (
        <div className="space-y-2 text-sm">
          <div>
            <strong>User:</strong> {details.user}
          </div>
          <div>
            <strong>Session:</strong> {details.session}
          </div>
          <div>
            <strong>Project URL:</strong> {details.projectUrl}
          </div>
          <div>
            <strong>Has Anon Key:</strong> {details.hasAnonKey ? "Yes" : "No"}
          </div>
        </div>
      )}
    </div>
  );
};
