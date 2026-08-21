import { reportClientEvent } from "./client-observability";

const DEMO_KEY = "ego_demo_replay";
const RITUAL_KEY = "ego_ritual_seen";

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DEMO_KEY) === "true";
}

export function activateDemoMode(): void {
  localStorage.setItem(DEMO_KEY, "true");
}

export function exitDemoMode(): void {
  reportClientEvent("demo_mode_exited");
  localStorage.removeItem(DEMO_KEY);
}

export function resetDemoReplay(): void {
  reportClientEvent("demo_replay_reset");
  localStorage.removeItem(RITUAL_KEY);
}

export function shouldShowRitual(): boolean {
  if (isDemoMode()) return true;
  return localStorage.getItem(RITUAL_KEY) !== "true";
}

export function getAppBase(): string {
  return (typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) || "/";
}

export function isDevEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.includes(".replit.dev") ||
    host.includes(".repl.co") ||
    import.meta.env.DEV === true
  );
}
