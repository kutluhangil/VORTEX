"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Info, CheckCircle2, X } from "lucide-react";
import { useToastStore, type ToastKind } from "@/store/useToastStore";

const ICON: Record<ToastKind, React.ReactNode> = {
  error: <AlertCircle size={15} style={{ color: "#f87171" }} />,
  info: <Info size={15} style={{ color: "#a8a8b3" }} />,
  success: <CheckCircle2 size={15} style={{ color: "#4ade80" }} />,
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 items-center"
      style={{ pointerEvents: "none" }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="glass flex items-center gap-2.5 pl-3.5 pr-2 py-2 rounded-full max-w-sm"
            style={{ pointerEvents: "auto", boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}
          >
            {ICON[t.kind]}
            <span className="text-xs" style={{ color: "#f5f5f7" }}>
              {t.message}
            </span>
            <button
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss"
              className="w-5 h-5 flex items-center justify-center rounded-full transition-colors"
              style={{ color: "#6b6b7a" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f5f5f7")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b7a")}
            >
              <X size={11} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
