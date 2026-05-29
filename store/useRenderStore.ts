import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type ModeId = "smoke" | "water" | "lava" | "plasma" | "nebula" | "ink";

export interface RenderState {
  activeMode: ModeId;
  bloomEnabled: boolean;
  bloomIntensity: number;
  sunraysEnabled: boolean;
  sunraysIntensity: number;
  vignetteEnabled: boolean;
  vignetteIntensity: number;

  setMode: (mode: ModeId) => void;
  setBloom: (enabled: boolean, intensity?: number) => void;
  setSunrays: (enabled: boolean, intensity?: number) => void;
  setVignette: (enabled: boolean, intensity?: number) => void;
}

export const useRenderStore = create<RenderState>()(
  devtools(
    (set) => ({
      activeMode: "smoke",
      bloomEnabled: true,
      bloomIntensity: 0.6,
      sunraysEnabled: true,
      sunraysIntensity: 0.4,
      vignetteEnabled: true,
      vignetteIntensity: 0.5,

      setMode: (mode) => set({ activeMode: mode }),
      setBloom: (enabled, intensity) =>
        set((s) => ({ bloomEnabled: enabled, bloomIntensity: intensity ?? s.bloomIntensity })),
      setSunrays: (enabled, intensity) =>
        set((s) => ({
          sunraysEnabled: enabled,
          sunraysIntensity: intensity ?? s.sunraysIntensity,
        })),
      setVignette: (enabled, intensity) =>
        set((s) => ({
          vignetteEnabled: enabled,
          vignetteIntensity: intensity ?? s.vignetteIntensity,
        })),
    }),
    { name: "render" },
  ),
);
