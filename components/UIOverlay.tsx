"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";
import { useRecordStore } from "@/store/useRecordStore";
import { Dock } from "./ui/Dock";
import { SidePanel } from "./ui/SidePanel";
import { CommandPalette } from "./ui/CommandPalette";
import { RecordingIndicator } from "./ui/RecordingIndicator";
import { Toaster } from "./ui/Toaster";
import { PresetGallery } from "./modals/PresetGallery";
import { ExportModal } from "./modals/ExportModal";
import { RecorderController } from "./RecorderController";

const IDLE_TIMEOUT = 3000;
const FADE_OPACITY = 0.15;

export function UIOverlay() {
  const cinemaMode = useUIStore((s) => s.cinemaMode);
  const setCinemaMode = useUIStore((s) => s.setCinemaMode);
  const markActivity = useUIStore((s) => s.markActivity);
  const panelOpen = useUIStore((s) => s.panelOpen);
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen);
  const presetGalleryOpen = useUIStore((s) => s.presetGalleryOpen);
  const recording = useRecordStore((s) => s.recording);

  const [idle, setIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Idle fade is suppressed when recording, or when a modal is open
  const anyModalOpen = panelOpen || commandPaletteOpen || presetGalleryOpen;
  const idleActive = idle && !recording && !anyModalOpen;

  const resetIdle = useCallback(() => {
    clearTimeout(timerRef.current);
    setIdle(false);
    markActivity();
    if (!recording) {
      timerRef.current = setTimeout(() => setIdle(true), IDLE_TIMEOUT);
    }
  }, [recording, markActivity]);

  useEffect(() => {
    resetIdle();
    return () => clearTimeout(timerRef.current);
  }, [resetIdle]);

  // ESC exits cinema / H enters cinema
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && cinemaMode) setCinemaMode(false);
      // H key — Agent 5 will own the full keyboard handler
      if ((e.key === "h" || e.key === "H") && !cinemaMode && !(e.target instanceof HTMLInputElement)) {
        setCinemaMode(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [cinemaMode, setCinemaMode]);

  // Cinema mode: only RecordingIndicator visible (RecorderController still runs)
  if (cinemaMode) {
    return (
      <div className="fixed inset-0 z-40" style={{ pointerEvents: "none" }}>
        <RecorderController />
        <RecordingIndicator />
        <Toaster />
        <CinemaHint />
      </div>
    );
  }

  return (
    // Outer wrapper catches pointer events for idle reset
    <div
      className="fixed inset-0 z-30"
      style={{ pointerEvents: "none" }}
      onPointerMove={resetIdle}
      onPointerDown={resetIdle}
    >
      {/* Headless: drives MediaRecorder from the recording store flag */}
      <RecorderController />

      {/* RecordingIndicator + Toaster: always full opacity, outside the fade wrapper */}
      <RecordingIndicator />
      <Toaster />

      {/* Dock: idle-fading */}
      <div
        style={{
          opacity: idleActive ? FADE_OPACITY : 1,
          transition: "opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)",
          pointerEvents: "none",
        }}
      >
        <Dock />
      </div>

      {/* Panels / modals: never idle-fade (user is actively interacting) */}
      <SidePanel />
      <CommandPalette />
      <PresetGallery />
      <ExportModal />
    </div>
  );
}

function CinemaHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          style={{ pointerEvents: "none" }}
        >
          <div className="glass flex items-center gap-2 px-3 py-1.5 rounded-full">
            <span className="text-xs" style={{ color: "#a8a8b3" }}>Cinema mode</span>
            <kbd
              className="text-[10px] px-1 py-0.5 rounded"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#6b6b7a",
                fontFamily: "var(--font-mono)",
              }}
            >
              Esc
            </kbd>
            <span className="text-xs" style={{ color: "#6b6b7a" }}>to exit</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
