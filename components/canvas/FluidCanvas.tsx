"use client";

import { useEffect, useRef } from "react";
import { FluidSimulator } from "@/lib/sim/simulator";
import { useSimStore } from "@/store/useSimStore";
import { useInputStore } from "@/store/useInputStore";
import { CanvasOverlay } from "./CanvasOverlay";

interface FluidCanvasProps {
  embed?: boolean;
}

// Module-level singleton so Agent 5/6 can access it via import
export let globalSimulator: FluidSimulator | null = null;

export function FluidCanvas({ embed = false }: FluidCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<FluidSimulator | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Init canvas dimensions ─────────────────────────────────────────────
    const setSize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
    };
    setSize();

    // ── Create simulator ───────────────────────────────────────────────────
    const store = useSimStore.getState();
    let sim: FluidSimulator;
    try {
      sim = new FluidSimulator(canvas, {
        simResolution: store.simResolution,
        dyeResolution: store.dyeResolution,
        pressureIterations: store.pressureIterations,
        curl: store.curl,
        dissipation: store.dissipation,
      });
    } catch (err) {
      console.error("[FluidCanvas] Simulator init failed:", err);
      return;
    }

    simRef.current = sim;
    globalSimulator = sim;

    // ── Seed initial random splats so there's something to see ────────────
    seedSplats(sim);

    // ── RAF loop ───────────────────────────────────────────────────────────
    const loop = (time: number) => {
      const paused = useSimStore.getState().paused;
      if (!paused) {
        const dt = Math.min((time - lastTimeRef.current) / 1000, 0.017);
        lastTimeRef.current = time;

        // Sync live store values into simulator opts
        const s = useSimStore.getState();
        sim.opts.curl = s.curl;
        sim.opts.pressureIterations = s.pressureIterations;
        sim.opts.dissipation = s.dissipation;

        // Sync obstacle from input store
        const input = useInputStore.getState();
        if (input.imageObstacle !== null) {
          sim.setObstacle(input.imageObstacle);
        }

        sim.step(dt);
        sim.render();
      }
      lastTimeRef.current = time;
      rafRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);

    // ── Page visibility pause ──────────────────────────────────────────────
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        lastTimeRef.current = performance.now();
        rafRef.current = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // ── Resize ────────────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      setSize();
      sim.resize(canvas.width, canvas.height);
    });
    ro.observe(canvas);

    // ── Cleanup ────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      sim.dispose();
      simRef.current = null;
      globalSimulator = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ touchAction: "none", background: "#000" }}
        data-testid="fluid-canvas"
      />
      {!embed && <CanvasOverlay canvasRef={canvasRef} />}
    </>
  );
}

// ── Seed random splats ──────────────────────────────────────────────────────
function seedSplats(sim: FluidSimulator, count = 6): void {
  const colors: [number, number, number][] = [
    [1.0, 0.3, 0.1],
    [0.1, 0.5, 1.0],
    [0.8, 0.2, 0.9],
    [0.2, 0.9, 0.5],
    [1.0, 0.8, 0.1],
    [0.1, 0.8, 0.9],
  ];

  for (let i = 0; i < count; i++) {
    const x = Math.random();
    const y = Math.random();
    const angle = Math.random() * Math.PI * 2;
    const strength = 200 + Math.random() * 400;
    const color = colors[i % colors.length] ?? ([1, 1, 1] as [number, number, number]);

    // Queue several splats along a direction to seed velocity + dye
    for (let j = 0; j < 3; j++) {
      sim.splat(
        x + (Math.random() - 0.5) * 0.05,
        y + (Math.random() - 0.5) * 0.05,
        Math.cos(angle) * strength,
        Math.sin(angle) * strength,
        color,
      );
    }
  }
}
