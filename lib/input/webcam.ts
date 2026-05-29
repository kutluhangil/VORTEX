import type { FluidSimulator } from "@/lib/sim/simulator";

const W = 128;
const H = 128;
const BLOCK_SIZE = 16;
const BX = W / BLOCK_SIZE; // 8 blocks per row
const BY = H / BLOCK_SIZE; // 8 blocks per column
const MOTION_THRESHOLD = 10; // mean diff to consider block as moving

const FLOW_COLOR: [number, number, number] = [0.3, 0.7, 1.0];

export class WebcamFlow {
  private sim: FluidSimulator;
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private prevGray: Uint8ClampedArray | null = null;
  private frameCount = 0;

  running = false;
  error: string | null = null;

  constructor(sim: FluidSimulator) {
    this.sim = sim;
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.error = null;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
        audio: false,
      });

      this.video = document.createElement("video");
      this.video.srcObject = this.stream;
      this.video.muted = true;
      this.video.playsInline = true;
      await this.video.play();

      this.canvas = document.createElement("canvas");
      this.canvas.width = W;
      this.canvas.height = H;
      this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });

      this.running = true;
    } catch (err) {
      this.error = err instanceof Error ? err.message : "Camera access denied";
      this.stop();
    }
  }

  stop(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.video?.pause();
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.prevGray = null;
    this.running = false;
  }

  // Call from RAF loop every frame
  tick(flowStrength: number, splatForce: number): void {
    if (!this.running || !this.video || !this.ctx || !this.canvas) return;
    if (this.video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

    // Run optical flow every 2 frames (~30fps)
    this.frameCount++;
    if (this.frameCount % 2 !== 0) return;

    // Draw mirrored video frame
    this.ctx.save();
    this.ctx.scale(-1, 1);
    this.ctx.drawImage(this.video, -W, 0, W, H);
    this.ctx.restore();

    const raw = this.ctx.getImageData(0, 0, W, H).data;
    const gray = _toGray(raw);

    if (this.prevGray) {
      _computeFlow(gray, this.prevGray, flowStrength, splatForce, this.sim);
    }

    this.prevGray = gray;
  }

  dispose(): void {
    this.stop();
  }
}

// ── Optical flow helpers ──────────────────────────────────────────────────────

function _toGray(rgba: Uint8ClampedArray): Uint8ClampedArray {
  const g = new Uint8ClampedArray(W * H);
  for (let i = 0; i < W * H; i++) {
    g[i] = Math.round(
      0.299 * (rgba[i * 4] ?? 0) +
        0.587 * (rgba[i * 4 + 1] ?? 0) +
        0.114 * (rgba[i * 4 + 2] ?? 0),
    );
  }
  return g;
}

function _computeFlow(
  curr: Uint8ClampedArray,
  prev: Uint8ClampedArray,
  flowStrength: number,
  splatForce: number,
  sim: FluidSimulator,
): void {
  for (let by = 0; by < BY; by++) {
    for (let bx = 0; bx < BX; bx++) {
      let totalDiff = 0;
      let gx = 0;
      let gy = 0;

      for (let py = 0; py < BLOCK_SIZE; py++) {
        for (let px = 0; px < BLOCK_SIZE; px++) {
          const x = bx * BLOCK_SIZE + px;
          const y = by * BLOCK_SIZE + py;
          const idx = y * W + x;
          const diff = Math.abs((curr[idx] ?? 0) - (prev[idx] ?? 0));
          totalDiff += diff;

          // Weighted gradient for motion direction
          const wx = (px - BLOCK_SIZE / 2) / (BLOCK_SIZE / 2);
          const wy = (py - BLOCK_SIZE / 2) / (BLOCK_SIZE / 2);
          gx += diff * wx;
          gy += diff * wy;
        }
      }

      const mean = totalDiff / (BLOCK_SIZE * BLOCK_SIZE);
      if (mean < MOTION_THRESHOLD) continue;

      const len = Math.sqrt(gx * gx + gy * gy) + 0.001;
      const nx = gx / len;
      const ny = -gy / len; // flip Y for WebGL

      const uvX = (bx + 0.5) / BX;
      const uvY = 1.0 - (by + 0.5) / BY;
      const force = mean * flowStrength * splatForce * 0.04;

      sim.splat(uvX, uvY, nx * force, ny * force, FLOW_COLOR, 0.002);
    }
  }
}
