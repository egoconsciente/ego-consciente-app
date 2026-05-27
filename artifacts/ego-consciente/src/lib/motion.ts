import type { Transition, Variants } from "framer-motion";

const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const EASE_RITUAL: [number, number, number, number] = [0.22, 0.61, 0.36, 1];
const EASE_INTERFACE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const EASE_MICRO: [number, number, number, number] = [0.32, 0.72, 0.36, 1];

export const motionTokens = {
  ritual: {
    duration: 0.9,
    ease: EASE_RITUAL,
    delayStep: 0.12,
  },
  interface: {
    duration: 0.45,
    ease: EASE_INTERFACE,
    delayStep: 0.05,
  },
  micro: {
    duration: 0.2,
    ease: EASE_MICRO,
    delayStep: 0,
  },
  reduced: {
    duration: 0.001,
    ease: "linear" as const,
    delayStep: 0,
  },
} as const;

export type MotionRegister = keyof typeof motionTokens;

export const useMotionRegister = (register: MotionRegister = "interface") => {
  const token = prefersReducedMotion() ? motionTokens.reduced : motionTokens[register];
  return token;
};

export const ritualTransition: Transition = {
  duration: motionTokens.ritual.duration,
  ease: motionTokens.ritual.ease,
};

export const interfaceTransition: Transition = {
  duration: motionTokens.interface.duration,
  ease: motionTokens.interface.ease,
};

export const microTransition: Transition = {
  duration: motionTokens.micro.duration,
  ease: motionTokens.micro.ease,
};

export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: interfaceTransition },
};

export const ritualReveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: ritualTransition },
};

export const softFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: interfaceTransition },
};

export const respectsReducedMotion = prefersReducedMotion;
