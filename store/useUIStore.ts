import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface UIState {
  dockVisible: boolean;
  panelOpen: boolean;
  commandPaletteOpen: boolean;
  cinemaMode: boolean;
  presetGalleryOpen: boolean;
  exportModalOpen: boolean;
  idleTimestamp: number;

  setDockVisible: (v: boolean) => void;
  setPanelOpen: (v: boolean) => void;
  setCommandPaletteOpen: (v: boolean) => void;
  setCinemaMode: (v: boolean) => void;
  toggleCinemaMode: () => void;
  setPresetGalleryOpen: (v: boolean) => void;
  setExportModalOpen: (v: boolean) => void;
  markActivity: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      dockVisible: true,
      panelOpen: false,
      commandPaletteOpen: false,
      cinemaMode: false,
      presetGalleryOpen: false,
      exportModalOpen: false,
      idleTimestamp: Date.now(),

      setDockVisible: (v) => set({ dockVisible: v }),
      setPanelOpen: (v) => set({ panelOpen: v }),
      setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
      setCinemaMode: (v) => set({ cinemaMode: v }),
      toggleCinemaMode: () => set((s) => ({ cinemaMode: !s.cinemaMode })),
      setPresetGalleryOpen: (v) => set({ presetGalleryOpen: v }),
      setExportModalOpen: (v) => set({ exportModalOpen: v }),
      markActivity: () => set({ idleTimestamp: Date.now() }),
    }),
    { name: "ui" },
  ),
);
