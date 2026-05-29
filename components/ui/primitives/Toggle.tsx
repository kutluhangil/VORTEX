"use client";

import { cn } from "@/lib/utils/cn";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, className, disabled = false }: ToggleProps) {
  return (
    <label
      className={cn(
        "flex items-center justify-between gap-3 cursor-pointer select-none",
        disabled && "opacity-40 cursor-not-allowed",
        className,
      )}
    >
      {label && (
        <span className="text-xs font-medium" style={{ color: "#a8a8b3" }}>
          {label}
        </span>
      )}
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="relative flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fb7185] focus-visible:ring-offset-1 focus-visible:ring-offset-black"
        style={{
          background: checked ? "#fb7185" : "rgba(255,255,255,0.1)",
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm"
          style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }}
        />
      </button>
    </label>
  );
}
