import type { FluidSimulator } from "./simulator";

const LOW_FPS = 45;
const HIGH_FPS = 58;
const DOWN_SUSTAIN_MS = 3000; // low fps must persist this long before downgrade
const UP_SUSTAIN_MS = 5000; // high fps must persist this long before upgrade

const MIN_RES = 128;
const RES_STEPS = [128, 256, 512, 1024];

function clampStep(res: number): number {
  // Snap to the nearest defined step
  let best = RES_STEPS[0]!;
  for (const s of RES_STEPS) if (Math.abs(s - res) < Math.abs(best - res)) best = s;
  return best;
}

/**
 * Watches the simulator's FPS and steps simResolution down (when sustained
 * below 45) or up (when sustained above 58, capped at the original target).
 * Call tick() once per frame; it self-throttles via timestamps.
 */
export class AdaptiveQuality {
  private sim: FluidSimulator;
  private targetRes: number; // the original/desired ceiling
  private lowSince = 0;
  private highSince = 0;
  private lastFps = 60;

  enabled = true;

  constructor(sim: FluidSimulator) {
    this.sim = sim;
    this.targetRes = sim.simResolution;
  }

  setTarget(res: number): void {
    this.targetRes = res;
  }

  getFps(): number {
    return this.lastFps;
  }

  tick(now: number): void {
    const fps = this.sim.getFPS();
    this.lastFps = fps;
    if (!this.enabled) {
      this.lowSince = 0;
      this.highSince = 0;
      return;
    }

    const current = this.sim.simResolution;

    // ── Downgrade path ──────────────────────────────────────────────────────
    if (fps < LOW_FPS && fps > 0) {
      if (this.lowSince === 0) this.lowSince = now;
      this.highSince = 0;
      if (now - this.lowSince >= DOWN_SUSTAIN_MS && current > MIN_RES) {
        const idx = RES_STEPS.indexOf(clampStep(current));
        const next = RES_STEPS[Math.max(0, idx - 1)]!;
        if (next < current) this.sim.setResolution(next);
        this.lowSince = now;
      }
      return;
    }

    // ── Upgrade path ────────────────────────────────────────────────────────
    if (fps > HIGH_FPS && current < this.targetRes) {
      if (this.highSince === 0) this.highSince = now;
      this.lowSince = 0;
      if (now - this.highSince >= UP_SUSTAIN_MS) {
        const idx = RES_STEPS.indexOf(clampStep(current));
        const next = RES_STEPS[Math.min(RES_STEPS.length - 1, idx + 1)]!;
        if (next > current && next <= this.targetRes) this.sim.setResolution(next);
        this.highSince = now;
      }
      return;
    }

    // Stable — reset timers
    this.lowSince = 0;
    this.highSince = 0;
  }
}
