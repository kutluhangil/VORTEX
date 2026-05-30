import { globalSimulator, globalRenderer } from "@/components/canvas/FluidCanvas";
import { useSimStore } from "@/store/useSimStore";

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

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

/** Capture the canvas at its current resolution. */
export async function capturePNG(): Promise<void> {
  const canvas = getCanvas();
  if (!canvas) throw new Error("Canvas not ready");

  // Ensure the current frame is present (preserveDrawingBuffer is on, but a
  // fresh render guarantees no partial state)
  globalRenderer?.render();

  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("toBlob failed"));
      download(blob, `flow-${timestamp()}.png`);
      resolve();
    }, "image/png");
  });
}

/**
 * Capture at 4K (3840×2160) by temporarily resizing the canvas drawing buffer
 * and re-rendering the current dye/effects. Does NOT touch sim FBOs, so the
 * fluid state is preserved. RAF is paused via the store during the capture.
 */
export async function capture4K(): Promise<void> {
  const canvas = getCanvas();
  const renderer = globalRenderer;
  if (!canvas || !renderer) throw new Error("Canvas not ready");

  const sim = useSimStore.getState();
  const wasPaused = sim.paused;
  sim.setPaused(true);

  const oldW = canvas.width;
  const oldH = canvas.height;

  try {
    canvas.width = 3840;
    canvas.height = 2160;
    renderer.render();

    await new Promise<void>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("toBlob failed"));
        download(blob, `flow-4k-${timestamp()}.png`);
        resolve();
      }, "image/png");
    });
  } finally {
    // Restore display resolution and redraw
    canvas.width = oldW;
    canvas.height = oldH;
    renderer.render();
    if (!wasPaused) sim.setPaused(false);
  }
}
