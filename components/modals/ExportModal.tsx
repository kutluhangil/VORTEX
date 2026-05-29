"use client";

// Agent 8 (Recorder) implements full export logic
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useRecordStore } from "@/store/useRecordStore";

export function ExportModal() {
  const open = useRecordStore((s) => s.exportModalOpen);
  const setOpen = useRecordStore((s) => s.setExportModalOpen);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.7)", pointerEvents: "auto" }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 glass rounded-2xl w-full max-w-md mx-4"
            style={{ pointerEvents: "auto" }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <h2 className="text-sm font-semibold" style={{ color: "#f5f5f7" }}>Export</h2>
              <button onClick={() => setOpen(false)} aria-label="Close export">
                <X size={15} style={{ color: "#6b6b7a" }} />
              </button>
            </div>
            <div className="p-5">
              <p className="text-xs" style={{ color: "#6b6b7a" }}>
                Export coming in Agent 8 (Recorder)
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
