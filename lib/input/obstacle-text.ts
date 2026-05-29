/**
 * Renders text to a Canvas2D bitmap and returns it as ImageData.
 * White text on black background — the simulator inverts dark pixels
 * to obstacles, so this produces text-shaped fluid barriers.
 */
export function textToObstacleData(
  text: string,
  width = 512,
  height = 256,
): ImageData | null {
  if (!text.trim()) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Black background (fluid flows here)
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  // White text (becomes obstacle)
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Scale font size to fill ~70% of canvas height
  const fontSize = Math.floor(height * 0.7);
  ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;

  // If text overflows, shrink it
  const maxWidth = width * 0.9;
  let actualFontSize = fontSize;
  while (ctx.measureText(text).width > maxWidth && actualFontSize > 20) {
    actualFontSize -= 4;
    ctx.font = `bold ${actualFontSize}px Inter, system-ui, sans-serif`;
  }

  ctx.fillText(text, width / 2, height / 2);

  return ctx.getImageData(0, 0, width, height);
}
