import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";

/**
 * /auth/callback — landing page for Supabase email-confirmation links.
 *
 * How it works:
 *   1. The user clicks the confirmation link in their email.
 *   2. Supabase redirects to this URL with ?code=... appended.
 *   3. The Supabase JS client (detectSessionInUrl: true) automatically exchanges
 *      the code for a session during AuthProvider's getSession() call.
 *   4. AuthProvider sets isReady = true with isAuthenticated = true.
 *   5. This page renders, reads auth state from context, and redirects.
 *
 * Fallback:
 *   If isAuthenticated is still false after a short grace period,
 *   the link was invalid or expired — show a clear Spanish error.
 */
export default function AuthCallback() {
  const { isAuthenticated, onboardingComplete } = useAuth();
  const [, setLocation] = useLocation();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setLocation(onboardingComplete ? "/dashboard" : "/onboarding");
      return;
    }

    // Brief grace period before declaring the link invalid
    const timeout = setTimeout(() => setShowError(true), 600);
    return () => clearTimeout(timeout);
  }, [isAuthenticated, onboardingComplete, setLocation]);

  if (showError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm text-center bg-card border border-border rounded-3xl p-10 shadow-sm"
        >
          <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-6 h-6 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">
            Enlace no válido
          </h2>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            El enlace de confirmación ha expirado o ya fue utilizado. Si ya
            confirmaste tu cuenta, puedes iniciar sesión directamente.
          </p>
          <button
            onClick={() => setLocation("/login")}
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Ir a iniciar sesión
          </button>
        </motion.div>
      </div>
    );
  }

  // Default: loading spinner while session is being established
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm">Verificando tu cuenta...</p>
      </div>
    </div>
  );
}
