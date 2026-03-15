const DEMO_KEY = "ego_demo_replay";
const RITUAL_KEY = "ego_ritual_seen";

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get("demo") === "1") {
    localStorage.setItem(DEMO_KEY, "true");
    return true;
  }
  return localStorage.getItem(DEMO_KEY) === "true";
}

export function exitDemoMode(): void {
  localStorage.removeItem(DEMO_KEY);
}

export function resetDemoReplay(): void {
  localStorage.removeItem(RITUAL_KEY);
}

export function shouldShowRitual(): boolean {
  if (isDemoMode()) return true;
  return localStorage.getItem(RITUAL_KEY) !== "true";
}
