import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
afterEach(cleanup);
if (typeof window !== "undefined")
  Object.defineProperty(window, "matchMedia", {
    value: () => ({
      matches: true,
      addEventListener() {},
      removeEventListener() {},
    }),
  });
// jsdom has no layout. Make focus-trap visibility checks behave like visible UI.
if (typeof HTMLElement !== "undefined")
  Object.defineProperty(HTMLElement.prototype, "offsetParent", {
    get() {
      return this.parentElement;
    },
  });
vi.mock("@/lib/motion", () => ({ respectsReducedMotion: () => true }));
