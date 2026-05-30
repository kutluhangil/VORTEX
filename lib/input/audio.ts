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

    // ── Beat detection ────────────────────────────────────────────────────
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
          0.003,
        );
      }
    }

    // ── Continuous splats proportional to loudness ────────────────────────
    const count = Math.max(1, Math.floor(rms * sensitivity * 4));
    const force = rms * sensitivity * 3000;
    for (let i = 0; i < count; i++) {
      this.sim.splat(
        Math.random(),
        Math.random(),
        (Math.random() - 0.5) * force,
        (Math.random() - 0.5) * force,
        rndColor(),
        0.001 + rms * 0.004,
      );
    }
  }
}
