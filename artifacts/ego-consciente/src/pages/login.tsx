import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      login(email);
      setLocation("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative blur */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <motion.div 
        className="w-full max-w-md bg-card p-8 md:p-10 rounded-3xl shadow-2xl shadow-black/5 border border-border relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl font-semibold text-foreground mb-2">Bienvenido de vuelta</h2>
          <p className="text-muted-foreground">Continúa tu proceso de observación.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">Correo electrónico</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              placeholder="tu@correo.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300"
          >
            Entrar
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline underline-offset-4">
              Regístrate
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
