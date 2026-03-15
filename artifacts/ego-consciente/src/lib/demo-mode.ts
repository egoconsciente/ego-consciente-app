const DEMO_KEY = "ego_demo_replay";
const RITUAL_KEY = "ego_ritual_seen";

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DEMO_KEY) === "true";
}

export function activateDemoMode(): void {
  console.log("[DemoMode] Activado — guardando en localStorage");
  localStorage.setItem(DEMO_KEY, "true");
}

export function exitDemoMode(): void {
  console.log("[DemoMode] Salir del modo demo");
  localStorage.removeItem(DEMO_KEY);
}

export function resetDemoReplay(): void {
  console.log("[DemoMode] Reiniciar demo — limpiando ritual localStorage");
  localStorage.removeItem(RITUAL_KEY);
}

export function shouldShowRitual(): boolean {
  if (isDemoMode()) return true;
  return localStorage.getItem(RITUAL_KEY) !== "true";
}

export function getAppBase(): string {
  return (typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) || "/";
}
