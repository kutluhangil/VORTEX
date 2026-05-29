"use client";

import type { RefObject } from "react";

interface CanvasOverlayProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

// Agent 5 (Interactor) will attach pointer/touch/keyboard handlers here
export function CanvasOverlay({ canvasRef: _canvasRef }: CanvasOverlayProps) {
  return (
    <div
      className="fixed inset-0"
      style={{ touchAction: "none", pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}
