"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Tooltip } from "./primitives/Tooltip";

interface DockButtonProps {
  icon: React.ReactNode;
  label: string;
  kbd?: string;
  active?: boolean;
  danger?: boolean;
  onClick?: () => void;
  className?: string;
  "aria-label"?: string;
}

export function DockButton({
  icon,
  label,
  kbd,
  active = false,
  danger = false,
  onClick,
  className,
  "aria-label": ariaLabel,
}: DockButtonProps) {
  return (
    <Tooltip content={label} kbd={kbd} side="top">
      <motion.button
        onClick={onClick}
        aria-label={ariaLabel ?? label}
        aria-pressed={active}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "relative flex items-center justify-center w-10 h-10 rounded-xl",
          "transition-colors duration-150 focus:outline-none",
          "focus-visible:ring-2 focus-visible:ring-[#fb7185] focus-visible:ring-offset-1",
          "focus-visible:ring-offset-transparent",
          active && !danger && "bg-[rgba(251,113,133,0.15)] text-[#fb7185]",
          danger && active && "bg-[rgba(239,68,68,0.15)] text-[#ef4444]",
          !active && "text-[#a8a8b3] hover:text-[#f5f5f7] hover:bg-[rgba(255,255,255,0.06)]",
          className,
        )}
      >
        {/* Glow on active */}
        {active && (
          <span
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              boxShadow: danger
                ? "0 0 12px rgba(239,68,68,0.25)"
                : "0 0 12px rgba(251,113,133,0.25)",
            }}
          />
        )}
        <span className="relative z-10 flex items-center justify-center w-[18px] h-[18px]">
          {icon}
        </span>
      </motion.button>
    </Tooltip>
  );
}
