/**
 * Converts a user-supplied ImageData into a grayscale obstacle map.
 * Dark pixels in the source → obstacle (value > 0 in result).
 * Result is stored in useInputStore.imageObstacle; the simulator
 * reads it via sim.setObstacle() in the RAF loop.
 *
 * The actual image loading lives in ImageDropZone (UI layer).
 * This module exports pre-processing helpers used by that component.
 */

/**
 * Normalises RGBA ImageData to a square obstacle canvas (512×512).
 * Returns a new ImageData where dark source pixels become white (obstacle)
 * and bright source pixels become black (fluid can flow).
 */
export function preprocessImageObstacle(
  source: ImageData,
  outputSize = 512,
  threshold = 0.3,
): ImageData {
  const offCanvas = document.createElement("canvas");
  offCanvas.width = outputSize;
  offCanvas.height = outputSize;
  const ctx = offCanvas.getContext("2d");
  if (!ctx) return source;

  // Draw source scaled to output size
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = source.width;
  srcCanvas.height = source.height;
  const srcCtx = srcCanvas.getContext("2d");
  if (!srcCtx) return source;
  srcCtx.putImageData(source, 0, 0);

  ctx.drawImage(srcCanvas, 0, 0, outputSize, outputSize);
  const out = ctx.getImageData(0, 0, outputSize, outputSize);

  const px = threshold * 255;
  for (let i = 0; i < out.data.length; i += 4) {
    const r = out.data[i] ?? 0;
    const g = out.data[i + 1] ?? 0;
    const b = out.data[i + 2] ?? 0;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    // Dark source pixel → obstacle (255 = solid obstacle after inversion in simulator)
    const v = lum < px ? 255 : 0;
    out.data[i] = v;
    out.data[i + 1] = v;
    out.data[i + 2] = v;
    out.data[i + 3] = 255;
  }

  return out;
}
