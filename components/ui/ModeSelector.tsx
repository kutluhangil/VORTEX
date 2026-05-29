"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Wind, Waves, Flame, Zap, Sparkles, Paintbrush } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useRenderStore, type ModeId } from "@/store/useRenderStore";
import { DockButton } from "./DockButton";

const MODES: { id: ModeId; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "smoke", label: "Smoke", icon: <Wind size={14} />, color: "#cba6f7" },
  { id: "water", label: "Water", icon: <Waves size={14} />, color: "#90e0ef" },
  { id: "lava", label: "Lava", icon: <Flame size={14} />, color: "#ff6600" },
  { id: "plasma", label: "Plasma", icon: <Zap size={14} />, color: "#ff00ff" },
  { id: "nebula", label: "Nebula", icon: <Sparkles size={14} />, color: "#ec4899" },
  { id: "ink", label: "Ink", icon: <Paintbrush size={14} />, color: "#e5e5e5" },
];

export function ModeSelector() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeMode = useRenderStore((s) => s.activeMode);
  const setMode = useRenderStore((s) => s.setMode);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = MODES.find((m) => m.id === activeMode) ?? MODES[0]!;

  return (
    <div ref={ref} className="relative">
      <DockButton
        icon={
          <span className="flex items-center gap-1">
            {current.icon}
          </span>
        }
        label={`Mode: ${current.label}`}
        kbd="1–6"
        active={open}
        onClick={() => setOpen((v) => !v)}
        aria-label={`Mode selector — current: ${current.label}`}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50"
          >
            <div
              className="glass rounded-xl overflow-hidden p-1 min-w-[140px]"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
            >
              {MODES.map((mode) => {
                const isActive = mode.id === activeMode;
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setMode(mode.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-left",
                      "text-xs transition-colors duration-100 focus:outline-none",
                      isActive
                        ? "bg-[rgba(251,113,133,0.15)] text-[#f5f5f7]"
                        : "text-[#a8a8b3] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f5f5f7]",
                    )}
                  >
                    <span
                      className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center"
                      style={{ color: isActive ? mode.color : undefined }}
                    >
                      {mode.icon}
                    </span>
                    <span className="font-medium">{mode.label}</span>
                    {isActive && (
                      <span
                        className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: "#fb7185" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
