import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import { getAuthRedirectUrl } from "./auth-utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  portalComplete: boolean;
  markOnboardingComplete: () => void;
  markPortalComplete: () => void;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    name: (supabaseUser.user_metadata?.name as string) || "Caminante",
  };
}

async function checkOnboarding(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("onboarding_responses")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

async function checkPortal(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("journey_state")
    .select("portal_completed, process_started_at")
    .eq("user_id", userId)
    .maybeSingle();
  return !!data?.portal_completed && !!data?.process_started_at;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [portalComplete, setPortalComplete] = useState(false);

  const loadUserState = async (mappedUser: User | null) => {
    if (mappedUser) {
      const [onboarding, portal] = await Promise.all([
        checkOnboarding(mappedUser.id),
        checkPortal(mappedUser.id),
      ]);
      return { onboarding, portal };
    }
    return { onboarding: false, portal: false };
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      const mappedUser = session?.user ? mapUser(session.user) : null;
      setUser(mappedUser);

      const state = await loadUserState(mappedUser);
      if (mounted) {
        setOnboardingComplete(state.onboarding);
        setPortalComplete(state.portal);
        setIsReady(true);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          if (session?.user) setUser(mapUser(session.user));
          return;
        }

        setIsReady(false);
        const mappedUser = session?.user ? mapUser(session.user) : null;
        setUser(mappedUser);

        const state = await loadUserState(mappedUser);
        if (mounted) {
          setOnboardingComplete(state.onboarding);
          setPortalComplete(state.portal);
          setIsReady(true);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const markOnboardingComplete = () => {
    setOnboardingComplete(true);
  };

  const markPortalComplete = () => {
    setPortalComplete(true);
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: getAuthRedirectUrl(),
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Cargando tu proceso...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        onboardingComplete,
        portalComplete,
        markOnboardingComplete,
        markPortalComplete,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
