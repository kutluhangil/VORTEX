"use client";

import { useCallback, useId } from "react";
import { cn } from "@/lib/utils/cn";

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  className?: string;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  disabled?: boolean;
}

export function Slider({
  value,
  min,
  max,
  step = 0.01,
  label,
  className,
  onChange,
  format,
  disabled = false,
}: SliderProps) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(parseFloat(e.target.value)),
    [onChange],
  );

  const displayValue = format ? format(value) : value.toFixed(2).replace(/\.?0+$/, "") || "0";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-xs font-medium"
          style={{ color: "#a8a8b3" }}
        >
          {label}
        </label>
        <span
          className="text-xs tabular-nums"
          style={{ color: "#6b6b7a", fontFamily: "var(--font-mono)" }}
        >
          {displayValue}
        </span>
      </div>
      <input
        id={id}
        type="range"
        className="flow-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        aria-label={label}
        style={{ "--slider-pct": `${pct}%` } as React.CSSProperties}
      />
    </div>
  );
}
