"use client";

import { useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface TooltipProps {
  content: React.ReactNode;
  kbd?: string;
  side?: "top" | "bottom" | "left" | "right";
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  delay?: number;
}

export function Tooltip({ content, kbd, side = "top", children, delay = 400 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback(() => {
    timer.current = setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    setVisible(false);
  }, []);

  const positionClass = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }[side];

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: side === "top" ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: side === "top" ? 4 : -4 }}
            transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              "absolute z-50 pointer-events-none whitespace-nowrap",
              "flex items-center gap-1.5 px-2 py-1 rounded-md",
              positionClass,
            )}
            style={{
              background: "rgba(14,14,20,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            }}
          >
            <span className="text-xs" style={{ color: "#f5f5f7" }}>
              {content}
            </span>
            {kbd && (
              <kbd
                className="text-[10px] px-1 py-0.5 rounded"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "#a8a8b3",
                  fontFamily: "var(--font-mono)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {kbd}
              </kbd>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
