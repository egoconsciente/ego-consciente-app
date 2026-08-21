import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { isDemoMode, exitDemoMode, resetDemoReplay, getAppBase } from "@/lib/demo-mode";
import { reportClientEvent } from "@/lib/client-observability";

export function DemoBanner() {
  const { logout } = useAuth();

  useEffect(() => {
    if (isDemoMode()) {
      reportClientEvent("demo_banner_mounted");
    }
  }, []);

  if (!isDemoMode()) return null;

  const handleReset = async () => {
    reportClientEvent("demo_replay_requested");
    resetDemoReplay();
    await logout();
    window.location.replace(getAppBase());
  };

  const handleExit = () => {
    reportClientEvent("demo_exit_requested");
    exitDemoMode();
    window.location.replace(getAppBase());
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-primary/90 text-primary-foreground px-4 py-2 flex items-center justify-between text-xs backdrop-blur-sm">
      <span className="font-semibold tracking-wide uppercase">
        Modo Demo Activo
      </span>
      <div className="flex items-center gap-3">
        <button
          onClick={handleReset}
          className="px-3 py-1 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-md font-medium transition-colors"
        >
          Reiniciar demo
        </button>
        <button
          onClick={handleExit}
          className="px-3 py-1 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-md font-medium transition-colors"
        >
          Salir del modo demo
        </button>
      </div>
    </div>
  );
}
