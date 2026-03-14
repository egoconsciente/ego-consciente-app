import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Home, MessageSquare, BookOpen, TrendingUp, Map, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Inicio", icon: Home },
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/reflection", label: "Hoy", icon: BookOpen },
    { href: "/journey", label: "Proceso", icon: Map },
    { href: "/progress", label: "Progreso", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/30 p-6 sticky top-0 h-screen">
        <div className="mb-12">
          <h1 className="font-display text-2xl font-semibold text-primary">Ego Consciente</h1>
          <p className="text-xs text-muted-foreground mt-1 tracking-wider uppercase">Proceso de Observación</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/10" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button 
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:text-destructive transition-colors mt-auto rounded-xl hover:bg-destructive/5"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Salir</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative pb-24 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-full min-h-screen"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border z-50 px-6 py-4 flex justify-between items-center pb-safe">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "fill-primary/20")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button 
          onClick={logout}
          className="flex flex-col items-center space-y-1 p-2 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-[10px] font-medium">Salir</span>
        </button>
      </nav>
    </div>
  );
}
