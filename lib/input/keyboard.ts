"use client";

import { useEffect } from "react";
import { useSimStore } from "@/store/useSimStore";
import { useRenderStore } from "@/store/useRenderStore";
import { useUIStore } from "@/store/useUIStore";
import { useInputStore } from "@/store/useInputStore";
import { useRecordStore } from "@/store/useRecordStore";

const MODES = ["smoke", "water", "lava", "plasma", "nebula", "ink"] as const;

export function useKeyboardShortcuts(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable;

      const { key, metaKey, ctrlKey, shiftKey } = e;
      const mod = metaKey || ctrlKey;

      // ── ⌘K / Ctrl+K – command palette ──────────────────────────────────
      // Handled by CommandPalette itself; skip here.

      // ── ⌘⇧R / Ctrl⇧R – recording ──────────────────────────────────────
      if (mod && shiftKey && (key === "r" || key === "R")) {
        e.preventDefault();
        const rs = useRecordStore.getState();
        rs.setRecording(!rs.recording);
        return;
      }

      // Don't capture any other shortcuts while typing
      if (typing) return;

      switch (key) {
        // Space – pause/resume
        case " ":
          e.preventDefault();
          useSimStore.getState().togglePaused();
          break;

        // R – reset
        case "r":
        case "R":
          if (!mod) useSimStore.getState().reset();
          break;

        // 1–6 – switch mode
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6": {
          const idx = parseInt(key, 10) - 1;
          const mode = MODES[idx];
          if (mode) useRenderStore.getState().setMode(mode);
          break;
        }

        // F – fullscreen
        case "f":
        case "F":
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
          break;

        // , – open settings panel
        case ",":
          if (!mod) useUIStore.getState().setPanelOpen(true);
          break;

        // A – toggle audio
        case "a":
        case "A":
          if (!mod) {
            const is = useInputStore.getState();
            is.setAudioEnabled(!is.audioEnabled);
          }
          break;

        // C – toggle camera
        case "c":
        case "C":
          if (!mod) {
            const is = useInputStore.getState();
            is.setCameraEnabled(!is.cameraEnabled);
          }
          break;

        // M – mute audio (same as toggle for now)
        case "m":
        case "M":
          if (!mod) {
            const is = useInputStore.getState();
            is.setAudioEnabled(!is.audioEnabled);
          }
          break;

        // P – open preset gallery
        case "p":
        case "P":
          if (!mod) useUIStore.getState().setPresetGalleryOpen(true);
          break;

        // Escape – close modals (cinema handled by UIOverlay)
        case "Escape": {
          const ui = useUIStore.getState();
          if (ui.cinemaMode) break; // UIOverlay owns this
          if (ui.commandPaletteOpen) { ui.setCommandPaletteOpen(false); break; }
          if (ui.presetGalleryOpen) { ui.setPresetGalleryOpen(false); break; }
          if (ui.panelOpen)         { ui.setPanelOpen(false);         break; }
          break;
        }

        default:
          break;
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
}
