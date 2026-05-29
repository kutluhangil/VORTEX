import type { FluidSimulator } from "@/lib/sim/simulator";

interface PointerState {
  x: number;
  y: number;
  color: [number, number, number];
}

export interface PointerOpts {
  splatForce: number;
  splatRadius: number; // user 0–1 → shader radius via mapping below
}

// splatRadius=0.25 → shaderRadius=0.0015 (the hardcoded default)
function toShaderRadius(r: number): number {
  return Math.max(0.0003, r * 0.006);
}

const SPLAT_COLORS: [number, number, number][] = [
  [1.0, 0.28, 0.1],
  [0.1, 0.45, 1.0],
  [0.85, 0.18, 0.9],
  [0.15, 0.9, 0.4],
  [1.0, 0.75, 0.08],
  [0.08, 0.88, 0.92],
  [0.95, 0.5, 0.15],
  [0.55, 0.15, 0.95],
];

function rndColor(): [number, number, number] {
  return SPLAT_COLORS[Math.floor(Math.random() * SPLAT_COLORS.length)] ?? [1, 0.4, 0.1];
}

const IDLE_TIMEOUT = 3000;
const IDLE_INTERVAL = 900;

export class PointerHandler {
  private sim: FluidSimulator;
  private canvas: HTMLCanvasElement;
  private opts: PointerOpts;

  private pointers = new Map<number, PointerState>();
  private idleTimer: ReturnType<typeof setTimeout> | undefined;
  private idleInterval: ReturnType<typeof setInterval> | undefined;

  constructor(canvas: HTMLCanvasElement, sim: FluidSimulator, opts: PointerOpts) {
    this.canvas = canvas;
    this.sim = sim;
    this.opts = { ...opts };
    this._arm();
  }

  updateOpts(opts: Partial<PointerOpts>): void {
    Object.assign(this.opts, opts);
  }

  // ── Event handlers (attached by CanvasOverlay) ────────────────────────────

  onPointerDown(e: PointerEvent): void {
    this._wake();
    const uv = this._uv(e);
    const color = rndColor();
    this.pointers.set(e.pointerId, { ...uv, color });
    this.sim.splat(uv.x, uv.y, 0, 0, color, toShaderRadius(this.opts.splatRadius));
  }

  onPointerMove(e: PointerEvent): void {
    this._wake();
    const ptr = this.pointers.get(e.pointerId);
    if (!ptr) return;

    const { x, y } = this._uv(e);
    const dx = (x - ptr.x) * this.opts.splatForce;
    const dy = (y - ptr.y) * this.opts.splatForce;

    ptr.x = x;
    ptr.y = y;

    if (Math.abs(dx) > 0.0001 || Math.abs(dy) > 0.0001) {
      this.sim.splat(x, y, dx, dy, ptr.color, toShaderRadius(this.opts.splatRadius));
    }
  }

  onPointerUp(e: PointerEvent): void {
    this.pointers.delete(e.pointerId);
    this._wake();
  }

  onPointerCancel(e: PointerEvent): void {
    this.pointers.delete(e.pointerId);
  }

  dispose(): void {
    clearTimeout(this.idleTimer);
    clearInterval(this.idleInterval);
    this.pointers.clear();
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private _uv(e: PointerEvent): { x: number; y: number } {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / r.width,
      y: 1.0 - (e.clientY - r.top) / r.height,
    };
  }

  // Arm (or re-arm) the idle timer
  private _arm(): void {
    clearTimeout(this.idleTimer);
    clearInterval(this.idleInterval);
    this.idleTimer = setTimeout(() => {
      this._idleSplat();
      this.idleInterval = setInterval(() => this._idleSplat(), IDLE_INTERVAL);
    }, IDLE_TIMEOUT);
  }

  private _wake(): void {
    this._arm(); // resets to fresh 3s countdown
  }

  private _idleSplat(): void {
    const x = Math.random();
    const y = Math.random();
    const a = Math.random() * Math.PI * 2;
    const f = this.opts.splatForce * 0.25;
    const base = rndColor();
    // Softer, decorative — 60 % brightness
    const color: [number, number, number] = [base[0] * 0.6, base[1] * 0.6, base[2] * 0.6];
    this.sim.splat(x, y, Math.cos(a) * f, Math.sin(a) * f, color,
      toShaderRadius(this.opts.splatRadius * 1.6));
  }
}
