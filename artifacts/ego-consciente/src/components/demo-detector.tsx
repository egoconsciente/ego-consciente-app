import { activateDemoMode, resetDemoReplay, getAppBase } from "@/lib/demo-mode";
import { supabase } from "@/lib/supabase";

export function detectDemoOnLoad(): void {
  const params = new URLSearchParams(window.location.search);
  const base = getAppBase().replace(/\/$/, "");
  const pathname = window.location.pathname;
  const normalizedPath = base ? pathname.replace(base, "") || "/" : pathname;

  if (params.get("demo") === "1") {
    console.log("[DemoMode] Activated from ?demo=1 on", pathname);
    activateDemoMode();
    resetDemoReplay();
    supabase.auth.signOut().finally(() => {
      window.location.replace(getAppBase());
    });
    return;
  }

  if (normalizedPath === "/demo" || normalizedPath === "/demo/") {
    console.log("[DemoMode] Activated from /demo");
    activateDemoMode();
    resetDemoReplay();
    supabase.auth.signOut().finally(() => {
      window.location.replace(getAppBase());
    });
    return;
  }
}
