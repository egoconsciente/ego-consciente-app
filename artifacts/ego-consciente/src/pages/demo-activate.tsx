import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { activateDemoMode, resetDemoReplay, getAppBase } from "@/lib/demo-mode";

export default function DemoActivate() {
  const { logout } = useAuth();

  useEffect(() => {
    (async () => {
      console.log("[DemoMode] Activated from /demo route (SPA navigation)");
      activateDemoMode();
      resetDemoReplay();
      await logout();
      window.location.replace(getAppBase());
    })();
  }, [logout]);

  return null;
}
