import { globalSimulator } from "@/components/canvas/FluidCanvas";

function getCanvas(): HTMLCanvasElement | null {
  const c = globalSimulator?.gl.canvas;
  return c instanceof HTMLCanvasElement ? c : null;
}

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const FPS = 20;
const GIF_WIDTH = 480; // downscaled for reasonable file size

/**
 * Records the canvas to an animated GIF for `durationSec` seconds.
 * onProgress receives 0–1 across capture+encode phases.
 */
export async function recordGIF(
  durationSec: number,
  onProgress?: (p: number) => void,
): Promise<void> {
  const canvas = getCanvas();
  if (!canvas) throw new Error("Canvas not ready");

  // Dynamic import keeps gif.js out of the main bundle
  const GIF = (await import("gif.js")).default;

  const aspect = canvas.height / canvas.width;
  const gifW = GIF_WIDTH;
  const gifH = Math.round(GIF_WIDTH * aspect);

  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: gifW,
    height: gifH,
    workerScript: "/gif.worker.js",
    repeat: 0,
  });

  // Scratch canvas to downscale each captured frame
  const scratch = document.createElement("canvas");
  scratch.width = gifW;
  scratch.height = gifH;
  const sctx = scratch.getContext("2d");
  if (!sctx) throw new Error("2D context unavailable");

  const totalFrames = Math.round(durationSec * FPS);
  const frameDelay = 1000 / FPS;

  // ── Capture phase ────────────────────────────────────────────────────────
  for (let i = 0; i < totalFrames; i++) {
    sctx.drawImage(canvas, 0, 0, gifW, gifH);
    gif.addFrame(sctx, { copy: true, delay: frameDelay });
    onProgress?.((i / totalFrames) * 0.5); // capture = first half
    await new Promise((r) => setTimeout(r, frameDelay));
  }

  // ── Encode phase ─────────────────────────────────────────────────────────
  await new Promise<void>((resolve, reject) => {
    gif.on("progress", (p: number) => onProgress?.(0.5 + p * 0.5));
    gif.on("finished", (blob: Blob) => {
      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      download(blob, `flow-${ts}.gif`);
      onProgress?.(1);
      resolve();
    });
    try {
      gif.render();
    } catch (err) {
      reject(err);
    }
  });
}
