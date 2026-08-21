import { activateDemoMode, resetDemoReplay, getAppBase } from "@/lib/demo-mode";
import { supabase } from "@/lib/supabase";
import { reportClientEvent } from "@/lib/client-observability";

export function detectDemoOnLoad(): void {
  const params = new URLSearchParams(window.location.search);
  const base = getAppBase().replace(/\/$/, "");
  const pathname = window.location.pathname;
  const normalizedPath = base ? pathname.replace(base, "") || "/" : pathname;

  if (params.get("demo") === "1") {
    reportClientEvent("demo_mode_activated", { source: "query_parameter" });
    activateDemoMode();
    resetDemoReplay();
    supabase.auth.signOut().finally(() => {
      window.location.replace(getAppBase());
    });
    return;
  }

  if (normalizedPath === "/demo" || normalizedPath === "/demo/") {
    reportClientEvent("demo_mode_activated", { source: "direct_route" });
    activateDemoMode();
    resetDemoReplay();
    supabase.auth.signOut().finally(() => {
      window.location.replace(getAppBase());
    });
    return;
  }
}
