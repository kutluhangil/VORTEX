import type { FluidSimulator } from "@/lib/sim/simulator";
import { getRandomPaletteColor, getVividPaletteColor } from "@/lib/presets/palette";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MeydaAnalyzer = any;

interface AudioFeatures {
  rms?: number;
  energy?: number;
  loudness?: { total: number; specific: Float32Array };
}

const NOISE_GATE = 0.008;
const BEAT_THRESHOLD_MULT = 1.7;
const BEAT_COOLDOWN_MS = 280;
const ENERGY_HISTORY_LEN = 30;

function rndColor(): [number, number, number] {
  return getRandomPaletteColor();
}

export class AudioAnalyser {
  private sim: FluidSimulator;
  private audioCtx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private meyda: MeydaAnalyzer = null;

  private energyHistory: number[] = [];
  private lastBeat = 0;

  running = false;
  error: string | null = null;

  constructor(sim: FluidSimulator) {
    this.sim = sim;
  }

  async start(sensitivity = 1.0): Promise<void> {
    if (this.running) return;
    this.error = null;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

      this.audioCtx = new AudioContext();
      // iOS: context starts suspended until user gesture — resume defensively
      if (this.audioCtx.state === "suspended") await this.audioCtx.resume();

      const source = this.audioCtx.createMediaStreamSource(this.stream);

      // Dynamic import: avoids SSR crash and reduces initial bundle
      const MeydaLib = await import("meyda");
      const Meyda = "default" in MeydaLib ? MeydaLib.default : MeydaLib;

      this.meyda = (Meyda as { createMeydaAnalyzer: (opts: unknown) => MeydaAnalyzer })
        .createMeydaAnalyzer({
          audioContext: this.audioCtx,
          source,
          bufferSize: 512,
          featureExtractors: ["rms", "energy", "loudness"],
          callback: (f: AudioFeatures) => this._onFeatures(f, sensitivity),
        });

      this.meyda.start();
      this.running = true;
    } catch (err) {
      this.error = err instanceof Error ? err.message : "Microphone access denied";
      this.stop();
    }
  }

  stop(): void {
    this.meyda?.stop();
    this.meyda = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.audioCtx?.close().catch(() => {});
    this.audioCtx = null;
    this.energyHistory = [];
    this.running = false;
  }

  dispose(): void {
    this.stop();
  }

  private _onFeatures(f: AudioFeatures, sensitivity: number): void {
    const rms = f.rms ?? 0;
    const energy = f.energy ?? 0;
    if (rms < NOISE_GATE) return;

    // ── Frequency-band split (Meyda loudness.specific = 24 bark bands) ─────
    const bands = f.loudness?.specific;
    const { bass, mid, high } = splitBands(bands, rms);

    // ── Beat detection (bass-weighted energy) ─────────────────────────────
    this.energyHistory.push(energy);
    if (this.energyHistory.length > ENERGY_HISTORY_LEN) this.energyHistory.shift();
    const avg =
      this.energyHistory.reduce((a, b) => a + b, 0) / (this.energyHistory.length || 1);

    const now = Date.now();
    const isBeat =
      energy > avg * BEAT_THRESHOLD_MULT && now - this.lastBeat > BEAT_COOLDOWN_MS;

    if (isBeat) {
      this.lastBeat = now;
      const force = rms * sensitivity * 5000 * 1.5;
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.random() * 0.5;
        const r = 0.15 + Math.random() * 0.2;
        this.sim.splat(
          0.5 + Math.cos(angle) * r,
          0.5 + Math.sin(angle) * r,
          Math.cos(angle) * force,
          Math.sin(angle) * force,
          getVividPaletteColor(),
          0.004,
        );
      }
    }

    // ── BASS → big splat near centre, pushing outward ─────────────────────
    if (bass > 0.12) {
      const f0 = bass * sensitivity * 6000;
      const angle = Math.random() * Math.PI * 2;
      this.sim.splat(
        0.5 + (Math.random() - 0.5) * 0.2,
        0.4 + (Math.random() - 0.5) * 0.2,
        Math.cos(angle) * f0,
        Math.sin(angle) * f0,
        getVividPaletteColor(),
        0.005 + bass * 0.004,
      );
    }

    // ── MID → medium splats at random positions ───────────────────────────
    if (mid > 0.1) {
      const count = Math.max(1, Math.floor(mid * sensitivity * 5));
      const fm = mid * sensitivity * 3500;
      for (let i = 0; i < count; i++) {
        this.sim.splat(
          Math.random(),
          Math.random(),
          (Math.random() - 0.5) * fm,
          (Math.random() - 0.5) * fm,
          rndColor(),
          0.0018,
        );
      }
    }

    // ── HIGH → small sparkles near the edges ──────────────────────────────
    if (high > 0.08) {
      const count = Math.max(1, Math.floor(high * sensitivity * 6));
      const fh = high * sensitivity * 2200;
      for (let i = 0; i < count; i++) {
        const edge = Math.random() < 0.5 ? Math.random() * 0.2 : 0.8 + Math.random() * 0.2;
        const along = Math.random();
        const x = Math.random() < 0.5 ? edge : along;
        const y = Math.random() < 0.5 ? along : edge;
        this.sim.splat(
          x, y,
          (Math.random() - 0.5) * fh,
          (Math.random() - 0.5) * fh,
          getVividPaletteColor(),
          0.0008,
        );
      }
    }
  }
}

// Sum the 24 bark bands into bass / mid / high, normalised by overall loudness.
// Falls back to rms-driven pseudo-bands when specific loudness is unavailable.
function splitBands(
  specific: Float32Array | undefined,
  rms: number,
): { bass: number; mid: number; high: number } {
  if (!specific || specific.length < 12) {
    return { bass: rms * 1.2, mid: rms, high: rms * 0.6 };
  }
  const n = specific.length;
  let bass = 0;
  let mid = 0;
  let high = 0;
  const bassEnd = Math.floor(n * 0.18);
  const midEnd = Math.floor(n * 0.55);
  for (let i = 0; i < n; i++) {
    const v = specific[i] ?? 0;
    if (i < bassEnd) bass += v;
    else if (i < midEnd) mid += v;
    else high += v;
  }
  // Bark loudness values are roughly 0–several; scale to ~0–1 working range
  return {
    bass: Math.min(1.5, (bass / Math.max(1, bassEnd)) * 0.5),
    mid: Math.min(1.5, (mid / Math.max(1, midEnd - bassEnd)) * 0.5),
    high: Math.min(1.5, (high / Math.max(1, n - midEnd)) * 0.5),
  };
}
