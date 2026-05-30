import type { Preset } from "@/store/usePresetStore";
import { MODES } from "./modes";

// 12 curated presets. Each starts from a base mode and tweaks palette/params.
// Palettes lead with a near-black background colour (dropped for splat dye).

export const PRESETS: Preset[] = [
  {
    id: "aurora-nights",
    name: "Aurora Nights",
    mode: "nebula",
    palette: ["#020617", "#0d9488", "#22d3ee", "#a3e635", "#86efac"],
    params: { curl: 22, viscosity: 0, dissipation: 0.35, splatRadius: 0.5 },
    bloom: 1.4,
    sunrays: 1.1,
    vignette: 0.6,
  },
  {
    id: "volcanic",
    name: "Volcanic",
    mode: "lava",
    palette: ["#1a0000", "#7f1d1d", "#dc2626", "#f97316", "#fde047"],
    params: { curl: 42, viscosity: 0.003, dissipation: 0.45, splatRadius: 0.46 },
    bloom: 1.2,
    sunrays: 0.9,
    vignette: 0.45,
  },
  {
    id: "ocean-depths",
    name: "Ocean Depths",
    mode: "water",
    palette: ["#000814", "#001d3d", "#003566", "#0466c8", "#48cae4"],
    params: { curl: 6, viscosity: 0.001, dissipation: 1.6, splatRadius: 0.28 },
    bloom: 0.35,
    sunrays: 0.3,
    vignette: 0.45,
  },
  {
    id: "cyber-plasma",
    name: "Cyber Plasma",
    mode: "plasma",
    palette: ["#0a0a1a", "#ff006e", "#fb5607", "#8338ec", "#3a86ff"],
    params: { curl: 50, viscosity: 0, dissipation: 0.7, splatRadius: 0.3 },
    bloom: 1.3,
    sunrays: 1.0,
    vignette: 0.25,
  },
  {
    id: "galactic",
    name: "Galactic",
    mode: "nebula",
    palette: ["#0a001a", "#4c1d95", "#7e22ce", "#c026d3", "#fbbf24"],
    params: { curl: 28, viscosity: 0, dissipation: 0.32, splatRadius: 0.55 },
    bloom: 1.6,
    sunrays: 1.3,
    vignette: 0.65,
  },
  {
    id: "midnight-ink",
    name: "Midnight Ink",
    mode: "ink",
    palette: ["#000000", "#1c1c1c", "#404040", "#a3a3a3", "#f5f5f5"],
    params: { curl: 10, viscosity: 0.0005, dissipation: 1.0, splatRadius: 0.36 },
    bloom: 0.15,
    sunrays: 0.0,
    vignette: 0.35,
  },
  {
    id: "sunrise",
    name: "Sunrise",
    mode: "lava",
    palette: ["#1a0a00", "#7c2d12", "#ea580c", "#fbbf24", "#fef08a"],
    params: { curl: 26, viscosity: 0.002, dissipation: 0.7, splatRadius: 0.4 },
    bloom: 0.9,
    sunrays: 0.7,
    vignette: 0.4,
  },
  {
    id: "arctic-mist",
    name: "Arctic Mist",
    mode: "smoke",
    palette: ["#0f172a", "#334155", "#94a3b8", "#cbd5e1", "#f0f9ff"],
    params: { curl: 15, viscosity: 0.0001, dissipation: 1.5, splatRadius: 0.34 },
    bloom: 0.5,
    sunrays: 0.4,
    vignette: 0.5,
  },
  {
    id: "cherry-blossom",
    name: "Cherry Blossom",
    mode: "smoke",
    palette: ["#1a0a14", "#831843", "#db2777", "#f9a8d4", "#fce7f3"],
    params: { curl: 16, viscosity: 0.0001, dissipation: 1.3, splatRadius: 0.36 },
    bloom: 0.7,
    sunrays: 0.5,
    vignette: 0.5,
  },
  {
    id: "burning-wire",
    name: "Burning Wire",
    mode: "plasma",
    palette: ["#020617", "#1e3a8a", "#2563eb", "#22d3ee", "#e0f2fe"],
    params: { curl: 48, viscosity: 0, dissipation: 0.65, splatRadius: 0.28 },
    bloom: 1.4,
    sunrays: 1.1,
    vignette: 0.3,
  },
  {
    id: "forest-spirit",
    name: "Forest Spirit",
    mode: "water",
    palette: ["#021410", "#064e3b", "#059669", "#34d399", "#a7f3d0"],
    params: { curl: 14, viscosity: 0.001, dissipation: 1.0, splatRadius: 0.32 },
    bloom: 0.6,
    sunrays: 0.5,
    vignette: 0.5,
  },
  {
    id: "holographic",
    name: "Holographic",
    mode: "plasma",
    palette: ["#0a0a14", "#a855f7", "#ec4899", "#22d3ee", "#fde047"],
    params: { curl: 44, viscosity: 0, dissipation: 0.6, splatRadius: 0.34 },
    bloom: 1.3,
    sunrays: 1.0,
    vignette: 0.3,
  },
];

export const PRESET_MAP: Record<string, Preset> = Object.fromEntries(
  PRESETS.map((p) => [p.id, p]),
);

/** Build a Preset-shaped object from the current mode (used for "reset to mode"). */
export function presetFromMode(modeId: keyof typeof MODES): Preset {
  const m = MODES[modeId];
  return {
    id: `mode-${m.id}`,
    name: m.name,
    mode: m.id,
    palette: m.palette,
    params: m.params,
    bloom: m.bloom,
    sunrays: m.sunrays,
    vignette: m.vignette,
  };
}
