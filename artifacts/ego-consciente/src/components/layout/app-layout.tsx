import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import {
  Home,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Map,
  LogOut,
  MoreHorizontal,
} from "lucide-react";
import { EgoGuideButton } from "@/components/ego-guide";
import { EcSigil } from "@/components/ec";
import { motion, AnimatePresence } from "framer-motion";
import { respectsReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/reflection", label: "Hoy", icon: BookOpen },
  { href: "/journey", label: "Proceso", icon: Map },
  { href: "/progress", label: "Progreso", icon: TrendingUp },
];

function isPathActive(location: string, href: string): boolean {
  if (location === href) return true;
  if (href === "/journey" && location.startsWith("/journey/")) return true;
  return false;
}

function parseStageFromLocation(location: string): number | null {
  const match = location.match(/^\/journey\/(\d+)/);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout } = useAuth();
  const currentStage = parseStageFromLocation(location);
  const isChatRoute = location === "/chat";
  const reduced = respectsReducedMotion();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <DesktopSidebar
        location={location}
        currentStage={currentStage}
        onLogout={logout}
      />

      <main
        className={cn(
          "flex-1 relative",
          isChatRoute ? "pb-24 md:pb-0" : "pb-28 md:pb-0",
        )}
      >
        <MobileTopBar
          isChatRoute={isChatRoute}
          currentStage={currentStage}
          onLogout={logout}
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{
              duration: reduced ? 0 : 0.4,
              ease: [0.22, 0.61, 0.36, 1],
            }}
            className={cn(
              "h-full min-h-screen",
              isChatRoute && "md:max-w-5xl md:mx-auto",
            )}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <MobileBottomNav location={location} />

      <EgoGuideButton />
    </div>
  );
}

/* ---------- Desktop Sidebar ---------- */

function DesktopSidebar({
  location,
  currentStage,
  onLogout,
}: {
  location: string;
  currentStage: number | null;
  onLogout: () => void;
}) {
  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-64 lg:w-72 sticky top-0 h-screen",
        "living-glass border-r border-l-0 border-t-0 border-b-0 rounded-none",
        "px-6 lg:px-7 py-8",
      )}
    >
      <Link href="/dashboard" className="block group mb-12">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "w-9 h-9 inline-flex items-center justify-center rounded-full",
              "warm-border bg-[hsl(var(--paper))]",
              "text-[hsl(var(--tierra-deep))]",
              "transition-transform duration-300 group-hover:-rotate-3",
            )}
          >
            <EcSigil variant="hairline" size={22} />
          </span>
          <div>
            <h1 className="ec-serif text-2xl font-semibold text-[hsl(var(--tierra-deep))] leading-none">
              Ego Consciente
            </h1>
          </div>
        </div>
        <p className="ec-meta italic mt-3 ml-12 text-[hsl(var(--ink-soft))]">
          Observa. Integra. Elige.
        </p>
      </Link>

      {currentStage !== null && (
        <div className="mb-6 ml-1">
          <span className="ec-eyebrow text-[hsl(var(--terracota))]">
            Etapa en curso
          </span>
          <p className="ec-stage-numeral text-2xl text-[hsl(var(--tierra-deep))] mt-1">
            {String(currentStage).padStart(2, "0")}
          </p>
        </div>
      )}

      <nav className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isPathActive(location, item.href);
          return (
            <SidebarLink key={item.href} item={item} active={active} />
          );
        })}
      </nav>

      <div className="pt-6 mt-6 border-t border-[hsl(var(--warm-line-soft))]">
        <button
          onClick={onLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2 w-full rounded-xl",
            "text-[hsl(var(--ink-soft))] text-sm font-sans",
            "transition-colors duration-200",
            "hover:text-[hsl(var(--tierra-deep))] hover:bg-[hsl(var(--paper-veil))]",
          )}
          aria-label="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex items-center gap-3 px-3 py-2.5 rounded-xl",
        "text-sm font-sans transition-all duration-300",
        active
          ? "text-[hsl(var(--tierra-deep))] bg-[hsl(var(--paper-veil))]"
          : "text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--tierra-deep))] hover:bg-[hsl(var(--paper-soft))]",
      )}
    >
      {active && (
        <motion.span
          layoutId="ec-sidebar-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-[hsl(var(--tierra-deep))]"
          transition={
            respectsReducedMotion()
              ? { duration: 0 }
              : { type: "spring", stiffness: 380, damping: 32 }
          }
        />
      )}
      <Icon
        className={cn("w-[18px] h-[18px]")}
        strokeWidth={active ? 1.8 : 1.5}
      />
      <span className={cn(active ? "font-medium" : "font-normal")}>
        {item.label}
      </span>
    </Link>
  );
}

/* ---------- Mobile Top Bar ---------- */

function MobileTopBar({
  isChatRoute,
  currentStage,
  onLogout,
}: {
  isChatRoute: boolean;
  currentStage: number | null;
  onLogout: () => void;
}) {
  if (isChatRoute) {
    return null;
  }
  return (
    <header
      className={cn(
        "md:hidden sticky top-0 z-30",
        "living-glass border-x-0 border-t-0 rounded-none",
        "px-5 py-3 flex items-center justify-between",
      )}
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      <Link href="/dashboard" className="flex items-center gap-2.5">
        <span className="w-8 h-8 inline-flex items-center justify-center rounded-full warm-border bg-[hsl(var(--paper))] text-[hsl(var(--tierra-deep))]">
          <EcSigil variant="hairline" size={18} />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="ec-serif text-base font-semibold text-[hsl(var(--tierra-deep))]">
            Ego Consciente
          </span>
          {currentStage !== null && (
            <span className="ec-meta text-[11px] text-[hsl(var(--terracota))]">
              Etapa {String(currentStage).padStart(2, "0")}
            </span>
          )}
        </div>
      </Link>

      <ProfileMenu onLogout={onLogout} />
    </header>
  );
}

function ProfileMenu({ onLogout }: { onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const reduced = respectsReducedMotion();

  useEffect(() => {
    if (!open) return;
    firstItemRef.current?.focus();
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="Menú de cuenta"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "w-9 h-9 rounded-full warm-border bg-[hsl(var(--paper))]",
          "inline-flex items-center justify-center",
          "text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--tierra-deep))]",
          "transition-colors",
        )}
      >
        <MoreHorizontal className="w-4 h-4" strokeWidth={1.6} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Cuenta"
            initial={reduced ? false : { opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: -4, scale: 0.98 }}
            transition={{
              duration: reduced ? 0 : 0.18,
              ease: [0.32, 0.72, 0.36, 1],
            }}
            className={cn(
              "absolute right-0 mt-2 w-52 z-40",
              "paper-surface shadow-lg shadow-[hsl(var(--tierra-deep)/0.08)]",
              "p-1.5",
            )}
          >
            <button
              ref={firstItemRef}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className={cn(
                "w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg",
                "text-sm text-[hsl(var(--ink))]",
                "hover:bg-[hsl(var(--paper-veil))] transition-colors",
                "focus:outline-none focus:bg-[hsl(var(--paper-veil))]",
              )}
            >
              <LogOut className="w-4 h-4 text-[hsl(var(--ink-soft))]" strokeWidth={1.5} />
              <span>Cerrar sesión</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Mobile Bottom Nav ---------- */

function MobileBottomNav({ location }: { location: string }) {
  return (
    <nav
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-40",
        "living-glass border-x-0 border-b-0 rounded-none",
        "px-2 pt-2",
      )}
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      aria-label="Navegación principal"
    >
      <div className="flex items-stretch justify-around">
        {NAV_ITEMS.map((item) => {
          const active = isPathActive(location, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl",
                "transition-colors duration-200",
                active
                  ? "text-[hsl(var(--tierra-deep))]"
                  : "text-[hsl(var(--ink-soft))]",
              )}
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <motion.span
                  layoutId="ec-bottomnav-active"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-[hsl(var(--tierra-deep))]"
                  transition={
                    respectsReducedMotion()
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 32 }
                  }
                />
              )}
              <Icon
                className="w-[22px] h-[22px]"
                strokeWidth={active ? 1.9 : 1.5}
              />
              <span
                className={cn(
                  "text-[11px] tracking-wide",
                  active ? "font-medium" : "font-normal",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
