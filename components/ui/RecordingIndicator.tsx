"use client";

import { useEffect, useRef } from "react";
import { Square } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRecordStore } from "@/store/useRecordStore";
import { formatDuration } from "@/lib/utils/format";

export function RecordingIndicator() {
  const recording = useRecordStore((s) => s.recording);
  const duration = useRecordStore((s) => s.recordingDuration);
  const setRecording = useRecordStore((s) => s.setRecording);
  const setDuration = useRecordStore((s) => s.setRecordingDuration);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!recording) {
      cancelAnimationFrame(rafRef.current);
      setDuration(0);
      return;
    }
    startRef.current = performance.now() - duration * 1000;
    const tick = () => {
      setDuration((performance.now() - startRef.current) / 1000);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [recording]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {recording && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5"
          style={{
            pointerEvents: "auto",
          }}
        >
          <div
            className="glass flex items-center gap-2.5 px-4 py-2 rounded-full"
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}
          >
            {/* Pulsing dot */}
            <span
              className="record-pulse w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: "#ef4444" }}
            />

            {/* Timer */}
            <span
              className="text-sm font-semibold tabular-nums"
              style={{ color: "#f5f5f7", fontFamily: "var(--font-mono)" }}
            >
              {formatDuration(duration)}
            </span>

            {/* Stop button */}
            <button
              onClick={() => setRecording(false)}
              aria-label="Stop recording"
              className="flex items-center justify-center w-6 h-6 rounded-full transition-colors"
              style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(239,68,68,0.25)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(239,68,68,0.15)")
              }
            >
              <Square size={10} fill="currentColor" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
