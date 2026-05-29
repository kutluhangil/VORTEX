"use client";

import { useEffect, useRef } from "react";
import { CanvasOverlay } from "./CanvasOverlay";

interface FluidCanvasProps {
  embed?: boolean;
}

export function FluidCanvas({ embed = false }: FluidCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Agent 3 (Sim Engineer) will initialize the FluidSimulator here
    // Agent 4 (Painter) will attach the Renderer
    // For now, render a placeholder gradient to confirm canvas is mounted
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });

    if (!gl) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // Placeholder: clear to deep black so we know it's alive
    gl.clearColor(0.0, 0.0, 0.04, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return () => {
      ro.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ touchAction: "none" }}
        data-testid="fluid-canvas"
      />
      {!embed && <CanvasOverlay canvasRef={canvasRef} />}
    </>
  );
}
