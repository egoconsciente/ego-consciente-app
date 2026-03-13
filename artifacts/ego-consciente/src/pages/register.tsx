import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const { register } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setIsLoading(false);
      return;
    }

    const { error: authError } = await register(email, password, name);

    if (authError) {
      setError("No pudimos crear tu cuenta. Inténtalo de nuevo.");
      setIsLoading(false);
    } else {
      // Show brief transition screen while auth state updates.
      // AuthRoute will redirect to /onboarding automatically once session is active.
      setEmailSent(true);
      setTimeout(() => setLocation("/onboarding"), 1500);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center bg-card p-10 rounded-3xl border border-border shadow-2xl shadow-black/5"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
          <h2 className="font-display text-2xl font-semibold mb-2">
            Proceso iniciado
          </h2>
          <p className="text-muted-foreground">
            Entrando a tu espacio...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        className="w-full max-w-md bg-card p-8 md:p-10 rounded-3xl shadow-2xl shadow-black/5 border border-border relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl font-semibold text-foreground mb-2">
            Inicia el proceso
          </h2>
          <p className="text-muted-foreground">
            Un espacio libre de juicios para observarte.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">
              ¿Cómo prefieres que te llame?
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              placeholder="Tu nombre"
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              placeholder="tu@correo.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground ml-1">
              Mínimo 6 caracteres
            </p>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                <span>Creando cuenta...</span>
              </>
            ) : (
              "Comenzar proceso"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline underline-offset-4"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
