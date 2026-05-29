"use client";

// Agent 7 (Curator) fills this with 12+ curated presets and apply logic
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";

export function PresetGallery() {
  const open = useUIStore((s) => s.presetGalleryOpen);
  const setOpen = useUIStore((s) => s.setPresetGalleryOpen);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.8)", pointerEvents: "auto" }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-4 md:inset-8 z-50 glass rounded-2xl flex flex-col overflow-hidden"
            style={{ pointerEvents: "auto" }}
          >
            <div
              className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <h2 className="text-sm font-semibold" style={{ color: "#f5f5f7" }}>
                Presets
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close presets"
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: "#6b6b7a" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = "#f5f5f7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#6b6b7a";
                }}
              >
                <X size={15} />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-8">
              <p className="text-xs" style={{ color: "#6b6b7a" }}>
                Presets coming in Agent 7 (Curator)
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
