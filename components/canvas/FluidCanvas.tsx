"use client";

import { useEffect, useRef } from "react";
import { FluidSimulator } from "@/lib/sim/simulator";
import { Renderer } from "@/lib/render/renderer";
import { useSimStore } from "@/store/useSimStore";
import { useRenderStore } from "@/store/useRenderStore";
import { useInputStore } from "@/store/useInputStore";
import { CanvasOverlay } from "./CanvasOverlay";

interface FluidCanvasProps {
  embed?: boolean;
}

// Module-level singletons for Agent 5/6 access
export let globalSimulator: FluidSimulator | null = null;
export let globalRenderer: Renderer | null = null;

export function FluidCanvas({ embed = false }: FluidCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<FluidSimulator | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Canvas dimensions ──────────────────────────────────────────────────
    const setSize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
    };
    setSize();

    // ── Create simulator ───────────────────────────────────────────────────
    const s = useSimStore.getState();
    let sim: FluidSimulator;
    let renderer: Renderer;
    try {
      sim = new FluidSimulator(canvas, {
        simResolution: s.simResolution,
        dyeResolution: s.dyeResolution,
        pressureIterations: s.pressureIterations,
        curl: s.curl,
        dissipation: s.dissipation,
      });
      renderer = new Renderer(canvas, sim);
    } catch (err) {
      console.error("[FluidCanvas] Init failed:", err);
      return;
    }

    simRef.current = sim;
    rendererRef.current = renderer;
    globalSimulator = sim;
    globalRenderer = renderer;

    // Sync initial render store state
    syncRenderStore(renderer);

    // Seed splats so there's fluid on load
    seedSplats(sim);

    // ── RAF loop ───────────────────────────────────────────────────────────
    const loop = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.017);
      lastTimeRef.current = time;

      const paused = useSimStore.getState().paused;
      if (!paused) {
        // Sync sim params
        const ss = useSimStore.getState();
        sim.opts.curl = ss.curl;
        sim.opts.pressureIterations = ss.pressureIterations;
        sim.opts.dissipation = ss.dissipation;

        // Sync render params
        syncRenderStore(renderer);

        // Sync obstacle
        const input = useInputStore.getState();
        if (input.imageObstacle !== null) {
          sim.setObstacle(input.imageObstacle);
        }

        sim.step(dt);
        renderer.render();
      }

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
      renderer.dispose();
      sim.dispose();
      simRef.current = null;
      rendererRef.current = null;
      globalSimulator = null;
      globalRenderer = null;
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

// ── Helpers ─────────────────────────────────────────────────────────────────

function syncRenderStore(renderer: Renderer): void {
  const r = useRenderStore.getState();
  renderer.bloomEnabled = r.bloomEnabled;
  renderer.bloomIntensity = r.bloomIntensity;
  renderer.sunraysEnabled = r.sunraysEnabled;
  renderer.sunraysIntensity = r.sunraysIntensity;
  renderer.vignetteEnabled = r.vignetteEnabled;
  renderer.vignetteIntensity = r.vignetteIntensity;
}

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
