import { useState, useEffect } from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Ottieni sessione corrente
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
        error,
      });
    };

    getSession();

    // Ascolta cambiamenti autenticazione
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);

      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
        error: null,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🚀 Login con Email e Password
  const signInWithEmail = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthState((prev) => ({ ...prev, loading: false, error }));
    }

    return { data, error };
  };

  // 📝 Registrazione con Email e Password
  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setAuthState((prev) => ({ ...prev, loading: false, error }));
    }

    return { data, error };
  };

  // 🔍 Login con Google
  const signInWithGoogle = async () => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
        queryParams: {
          prompt: "select_account",
          access_type: "offline",
        },
      },
    });

    if (error) {
      setAuthState((prev) => ({ ...prev, loading: false, error }));
    }

    return { data, error };
  };

  // 🍎 Login con Apple (se configurato)
  const signInWithApple = async () => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
      },
    });

    if (error) {
      setAuthState((prev) => ({ ...prev, loading: false, error }));
    }

    return { data, error };
  };

  // 🚪 Logout
  const signOut = async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    const { error } = await supabase.auth.signOut();

    if (error) {
      setAuthState((prev) => ({ ...prev, loading: false, error }));
    }

    return { error };
  };

  // 🔄 Sign in with Google - Force Account Selection
  const signInWithGoogleForceSelection = async () => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
        queryParams: {
          prompt: "select_account consent",
          access_type: "offline",
          include_granted_scopes: "true",
        },
      },
    });

    if (error) {
      setAuthState((prev) => ({ ...prev, loading: false, error }));
    }

    return { data, error };
  };

  return {
    ...authState,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithGoogleForceSelection,
    signInWithApple,
    signOut,
  };
}
