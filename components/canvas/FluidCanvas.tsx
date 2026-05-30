"use client";

import { useEffect, useRef } from "react";
import { FluidSimulator } from "@/lib/sim/simulator";
import { AdaptiveQuality } from "@/lib/sim/adaptive";
import { Renderer } from "@/lib/render/renderer";
import { AudioAnalyser } from "@/lib/input/audio";
import { WebcamFlow } from "@/lib/input/webcam";
import { textToObstacleData } from "@/lib/input/obstacle-text";
import { applyMode } from "@/lib/presets/apply";
import { applyFromURL } from "@/lib/export/share";
import { getRandomPaletteColor } from "@/lib/presets/palette";
import { useSimStore } from "@/store/useSimStore";
import { useRenderStore } from "@/store/useRenderStore";
import { useInputStore } from "@/store/useInputStore";
import { CanvasOverlay } from "./CanvasOverlay";

interface FluidCanvasProps {
  embed?: boolean;
}

export let globalSimulator: FluidSimulator | null = null;
export let globalRenderer: Renderer | null = null;

export function FluidCanvas({ embed = false }: FluidCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setSize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
    };
    setSize();

    // ── Create sim + renderer ──────────────────────────────────────────────
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

    globalSimulator = sim;
    globalRenderer = renderer;

    // Apply the active mode so palette + params + fx are initialised,
    // then override from URL params (?preset= / ?mode=) if present
    applyMode(useRenderStore.getState().activeMode);
    applyFromURL();
    syncRenderStore(renderer);
    seedSplats(sim);

    // ── Sensors ────────────────────────────────────────────────────────────
    const audio = new AudioAnalyser(sim);
    const webcam = new WebcamFlow(sim);

    // ── Adaptive quality ───────────────────────────────────────────────────
    const adaptive = new AdaptiveQuality(sim);
    let lastFpsReport = 0;

    // Obstacle change tracking — only call sim.setObstacle on actual change
    let prevImageObstacle: ImageData | null = null;
    let prevTextObstacle = "";

    // ── RAF loop ───────────────────────────────────────────────────────────
    const loop = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.017);
      lastTimeRef.current = time;

      const paused = useSimStore.getState().paused;
      if (!paused) {
        const ss = useSimStore.getState();
        sim.opts.curl = ss.curl;
        sim.opts.pressureIterations = ss.pressureIterations;
        sim.opts.dissipation = ss.dissipation;

        syncRenderStore(renderer);

        const input = useInputStore.getState();

        // ── Audio ──────────────────────────────────────────────────────────
        if (input.audioEnabled && !audio.running) {
          audio.start(input.audioSensitivity).catch(() => {});
        } else if (!input.audioEnabled && audio.running) {
          audio.stop();
        }

        // ── Webcam ─────────────────────────────────────────────────────────
        if (input.cameraEnabled && !webcam.running) {
          webcam.start().catch(() => {});
        } else if (!input.cameraEnabled && webcam.running) {
          webcam.stop();
        }
        if (webcam.running) {
          webcam.tick(input.webcamFlowStrength, input.splatForce);
        }

        // ── Text obstacle → ImageData (on change, debounced by RAF) ───────
        if (input.textObstacle !== prevTextObstacle) {
          prevTextObstacle = input.textObstacle;
          if (input.textObstacle) {
            const td = textToObstacleData(input.textObstacle, 512, 256);
            if (td) useInputStore.getState().setImageObstacle(td);
          } else if (!input.imageObstacle) {
            // Text cleared and no image → clear obstacle
            sim.setObstacle(null);
            prevImageObstacle = null;
          }
        }

        // ── Image obstacle → sim (only on reference change) ────────────────
        if (input.imageObstacle !== prevImageObstacle) {
          prevImageObstacle = input.imageObstacle;
          sim.setObstacle(input.imageObstacle);
        }

        sim.step(dt);
        renderer.render();

        // ── Adaptive quality + FPS reporting ───────────────────────────────
        adaptive.enabled = ss.autoQuality;
        adaptive.tick(time);
        if (time - lastFpsReport > 500) {
          lastFpsReport = time;
          useSimStore.getState().setFps(Math.round(sim.getFPS()));
        }
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

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      audio.dispose();
      webcam.dispose();
      renderer.dispose();
      sim.dispose();
      globalSimulator = null;
      globalRenderer = null;
    };
  }, []);

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

// ── Helpers ──────────────────────────────────────────────────────────────────

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
  for (let i = 0; i < count; i++) {
    const x = Math.random();
    const y = Math.random();
    const angle = Math.random() * Math.PI * 2;
    const strength = 200 + Math.random() * 400;
    const color = getRandomPaletteColor();
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
