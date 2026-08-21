import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { activateDemoMode, resetDemoReplay, getAppBase } from "@/lib/demo-mode";
import { reportClientEvent } from "@/lib/client-observability";

export default function DemoActivate() {
  const { logout } = useAuth();

  useEffect(() => {
    (async () => {
      reportClientEvent("demo_mode_activated", { source: "spa_route" });
      activateDemoMode();
      resetDemoReplay();
      await logout();
      window.location.replace(getAppBase());
    })();
  }, [logout]);

  return null;
}
