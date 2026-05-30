"use client";

import { useEffect, useRef, type RefObject } from "react";
import { PointerHandler } from "@/lib/input/pointer";
import { useKeyboardShortcuts } from "@/lib/input/keyboard";
import { useInputStore } from "@/store/useInputStore";
import { globalSimulator } from "./FluidCanvas";

interface CanvasOverlayProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

export function CanvasOverlay({ canvasRef }: CanvasOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Global keyboard shortcuts (document-level, safe to mount once here)
  useKeyboardShortcuts();

  useEffect(() => {
    let handler: PointerHandler | null = null;
    let unsubInput: (() => void) | null = null;
    let raf = 0;
    let disposed = false;
    let cleanupListeners: (() => void) | null = null;

    // React effects run children-before-parents, so globalSimulator may not
    // be assigned yet. Poll each animation frame until it appears.
    function tryInit() {
      if (disposed) return;

      const overlay = overlayRef.current;
      const canvas = canvasRef.current;
      const sim = globalSimulator;

      if (!overlay || !canvas || !sim) {
        raf = requestAnimationFrame(tryInit);
        return;
      }

      const input = useInputStore.getState();
      handler = new PointerHandler(canvas, sim, {
        splatForce: input.splatForce,
        splatRadius: input.splatRadius,
      });

      unsubInput = useInputStore.subscribe((state) => {
        handler?.updateOpts({
          splatForce: state.splatForce,
          splatRadius: state.splatRadius,
        });
      });

      // ── Pointer events ──────────────────────────────────────────────────
      const onDown = (e: PointerEvent) => {
        e.preventDefault();
        overlay.setPointerCapture(e.pointerId);
        handler?.onPointerDown(e);
      };
      const onMove = (e: PointerEvent) => {
        e.preventDefault();
        handler?.onPointerMove(e);
      };
      const onUp = (e: PointerEvent) => {
        handler?.onPointerUp(e);
        if (overlay.hasPointerCapture(e.pointerId)) {
          overlay.releasePointerCapture(e.pointerId);
        }
      };
      const onCancel = (e: PointerEvent) => handler?.onPointerCancel(e);

      overlay.addEventListener("pointerdown", onDown);
      overlay.addEventListener("pointermove", onMove);
      overlay.addEventListener("pointerup", onUp);
      overlay.addEventListener("pointercancel", onCancel);

      // Closure-scoped cleanup — captures this specific overlay element
      cleanupListeners = () => {
        overlay.removeEventListener("pointerdown", onDown);
        overlay.removeEventListener("pointermove", onMove);
        overlay.removeEventListener("pointerup", onUp);
        overlay.removeEventListener("pointercancel", onCancel);
        unsubInput?.();
        handler?.dispose();
        handler = null;
      };
    }

    raf = requestAnimationFrame(tryInit);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanupListeners?.();
    };
  }, [canvasRef]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0"
      style={{
        touchAction: "none",
        pointerEvents: "auto",
        zIndex: 2, // above canvas (0), below UI overlay (30)
        cursor: "crosshair",
      }}
    />
  );
}
