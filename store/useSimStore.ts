import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface SimState {
  curl: number;
  viscosity: number;
  dissipation: number;
  pressureIterations: number;
  simResolution: number;
  dyeResolution: number;
  paused: boolean;
  autoQuality: boolean;
  fps: number;

  setCurl: (v: number) => void;
  setViscosity: (v: number) => void;
  setDissipation: (v: number) => void;
  setPressureIterations: (v: number) => void;
  setSimResolution: (v: number) => void;
  setDyeResolution: (v: number) => void;
  setPaused: (v: boolean) => void;
  togglePaused: () => void;
  setAutoQuality: (v: boolean) => void;
  setFps: (v: number) => void;
  reset: () => void;
}

const isMobile =
  typeof window !== "undefined" && /Mobi|Android/i.test(navigator.userAgent);

const defaults = {
  curl: 30,
  viscosity: 0.0,
  dissipation: 0.98,
  pressureIterations: isMobile ? 20 : 30,
  simResolution: isMobile ? 256 : 512,
  dyeResolution: isMobile ? 1024 : 1024,
  paused: false,
  autoQuality: true,
  fps: 60,
};

export const useSimStore = create<SimState>()(
  devtools(
    (set) => ({
      ...defaults,
      setCurl: (v) => set({ curl: v }),
      setViscosity: (v) => set({ viscosity: v }),
      setDissipation: (v) => set({ dissipation: v }),
      setPressureIterations: (v) => set({ pressureIterations: v }),
      setSimResolution: (v) => set({ simResolution: v }),
      setDyeResolution: (v) => set({ dyeResolution: v }),
      setPaused: (v) => set({ paused: v }),
      togglePaused: () => set((s) => ({ paused: !s.paused })),
      setAutoQuality: (v) => set({ autoQuality: v }),
      setFps: (v) => set({ fps: v }),
      // Preserve user-facing autoQuality preference across reset
      reset: () => set((s) => ({ ...defaults, autoQuality: s.autoQuality })),
    }),
    { name: "sim" },
  ),
);
