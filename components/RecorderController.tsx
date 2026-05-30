"use client";

import { useEffect, useRef } from "react";
import { useRecordStore } from "@/store/useRecordStore";
import { useUIStore } from "@/store/useUIStore";
import { CanvasRecorder } from "@/lib/export/recorder";
import { globalSimulator } from "./canvas/FluidCanvas";

/**
 * Headless controller: when useRecordStore.recording flips true it starts a
 * CanvasRecorder on the live canvas and enters cinema mode; when it flips
 * false it stops + downloads and restores the previous cinema state.
 */
export function RecorderController() {
  const recording = useRecordStore((s) => s.recording);
  const recorderRef = useRef<CanvasRecorder | null>(null);
  const prevCinemaRef = useRef(false);

  useEffect(() => {
    const recorder = recorderRef.current ?? new CanvasRecorder();
    recorderRef.current = recorder;

    if (recording && !recorder.running) {
      const canvas = globalSimulator?.gl.canvas;
      if (canvas instanceof HTMLCanvasElement) {
        // Enter cinema mode for a clean capture; remember prior state
        prevCinemaRef.current = useUIStore.getState().cinemaMode;
        useUIStore.getState().setCinemaMode(true);

        recorder.start(canvas, () => {
          // Auto-stop at 60s — reflect in the store
          useRecordStore.getState().setRecording(false);
        });
      }
    } else if (!recording && recorder.running) {
      recorder.stop().finally(() => {
        if (!prevCinemaRef.current) useUIStore.getState().setCinemaMode(false);
      });
    }
  }, [recording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => recorderRef.current?.dispose();
  }, []);

  return null;
}
