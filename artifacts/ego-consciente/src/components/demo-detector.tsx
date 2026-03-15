import { getAppBase, isDemoMode } from "@/lib/demo-mode";

const DEMO_KEY = "ego_demo_replay";

export function detectDemoOnLoad(): void {
  const params = new URLSearchParams(window.location.search);
  if (params.get("demo") === "1") {
    if (!isDemoMode()) {
      console.log("[DemoMode] Activado — guardando en localStorage");
    }
    localStorage.setItem(DEMO_KEY, "true");
    console.log("[DemoMode] ?demo=1 detectado en", window.location.pathname, "— redirigiendo a /");
    window.location.replace(getAppBase());
  }
}
