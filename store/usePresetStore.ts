import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { ModeId } from "./useRenderStore";

export interface PresetParams {
  curl: number;
  viscosity: number;
  dissipation: number;
  splatRadius: number;
}

export interface Preset {
  id: string;
  name: string;
  mode: ModeId;
  palette: string[];
  params: PresetParams;
  bloom: number;
  sunrays: number;
  vignette: number;
  thumbnail?: string;
  custom?: boolean;
}

export interface PresetState {
  activePresetId: string | null;
  customPresets: Preset[];

  setActivePreset: (id: string) => void;
  addCustomPreset: (preset: Preset) => void;
  removeCustomPreset: (id: string) => void;
}

export const usePresetStore = create<PresetState>()(
  devtools(
    persist(
      (set) => ({
        activePresetId: null,
        customPresets: [],

        setActivePreset: (id) => set({ activePresetId: id }),
        addCustomPreset: (preset) =>
          set((s) => ({ customPresets: [...s.customPresets, preset] })),
        removeCustomPreset: (id) =>
          set((s) => ({ customPresets: s.customPresets.filter((p) => p.id !== id) })),
      }),
      { name: "flow-presets" },
    ),
    { name: "presets" },
  ),
);
