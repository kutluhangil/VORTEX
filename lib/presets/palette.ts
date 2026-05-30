// Module-level "active palette" — the single source of truth for splat colours.
// applyMode / applyPreset update it; pointer / audio / webcam read from it.

export type RGB = [number, number, number];

function hexToRgb01(hex: string): RGB {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  return [
    Number.isFinite(r) ? r : 1,
    Number.isFinite(g) ? g : 0.4,
    Number.isFinite(b) ? b : 0.1,
  ];
}

// Default = smoke palette (skips the darkest base colour, which is near-black)
let activePalette: RGB[] = [
  [0.8, 0.84, 0.96],
  [0.45, 0.78, 0.93],
  [0.8, 0.65, 0.97],
];

/** Set the active palette from an array of hex strings. By convention the
 *  first entry is the near-black background, so it is always dropped — the
 *  remaining entries are the dye colours. (Brightness-thresholding was
 *  unreliable: smoke's #1e1e2e passed and muddied the fluid grey.) */
export function setActivePalette(hexColors: string[]): void {
  if (!hexColors.length) return;
  const rgb = hexColors.map(hexToRgb01);
  activePalette = rgb.length > 1 ? rgb.slice(1) : rgb;
}

export function getActivePalette(): RGB[] {
  return activePalette;
}

export function getRandomPaletteColor(): RGB {
  const c = activePalette[Math.floor(Math.random() * activePalette.length)];
  return c ?? [1, 0.4, 0.1];
}

/** Brighter weighting toward the last (usually most vivid) palette colours. */
export function getVividPaletteColor(): RGB {
  // Bias selection toward the end of the array
  const t = Math.random() ** 0.5;
  const idx = Math.min(activePalette.length - 1, Math.floor(t * activePalette.length));
  return activePalette[idx] ?? [1, 0.4, 0.1];
}

export { hexToRgb01 };
