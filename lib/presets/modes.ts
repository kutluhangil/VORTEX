import type { ModeId } from "@/store/useRenderStore";

export interface ModeParams {
  curl: number;
  viscosity: number;
  dissipation: number; // density dissipation, simulator scale (~0.3 slow … 2.0 fast)
  splatRadius: number; // user scale 0–1
}

export interface ModeConfig {
  id: ModeId;
  name: string;
  palette: string[]; // first colour = near-black background, rest = dye colours
  params: ModeParams;
  bloom: number; // 0–2
  sunrays: number; // 0–2
  vignette: number; // 0–1
}

export const MODES: Record<ModeId, ModeConfig> = {
  smoke: {
    id: "smoke",
    name: "Smoke",
    palette: ["#1e1e2e", "#cdd6f4", "#74c7ec", "#cba6f7"],
    params: { curl: 18, viscosity: 0.0001, dissipation: 1.4, splatRadius: 0.32 },
    bloom: 0.6,
    sunrays: 0.4,
    vignette: 0.5,
  },
  water: {
    id: "water",
    name: "Water",
    palette: ["#000d1a", "#003566", "#0077b6", "#90e0ef"],
    params: { curl: 8, viscosity: 0.001, dissipation: 1.7, splatRadius: 0.26 },
    bloom: 0.3,
    sunrays: 0.2,
    vignette: 0.35,
  },
  lava: {
    id: "lava",
    name: "Lava",
    palette: ["#1a0000", "#660000", "#cc0033", "#ff6600", "#ffcc00"],
    params: { curl: 35, viscosity: 0.003, dissipation: 0.5, splatRadius: 0.42 },
    bloom: 1.0,
    sunrays: 0.8,
    vignette: 0.4,
  },
  plasma: {
    id: "plasma",
    name: "Plasma",
    palette: ["#1a0033", "#660066", "#ff00ff", "#00ffff", "#ffff00"],
    params: { curl: 50, viscosity: 0.0, dissipation: 0.7, splatRadius: 0.3 },
    bloom: 1.2,
    sunrays: 1.0,
    vignette: 0.25,
  },
  nebula: {
    id: "nebula",
    name: "Nebula",
    palette: ["#0a001a", "#3b0a4a", "#7e22ce", "#ec4899", "#fde047"],
    params: { curl: 25, viscosity: 0.0, dissipation: 0.35, splatRadius: 0.5 },
    bloom: 1.5,
    sunrays: 1.2,
    vignette: 0.6,
  },
  ink: {
    id: "ink",
    name: "Ink",
    palette: ["#0a0a0a", "#262626", "#737373", "#e5e5e5", "#fafafa"],
    params: { curl: 12, viscosity: 0.0005, dissipation: 1.1, splatRadius: 0.34 },
    bloom: 0.2,
    sunrays: 0.0,
    vignette: 0.3,
  },
};

export const MODE_LIST: ModeConfig[] = Object.values(MODES);
