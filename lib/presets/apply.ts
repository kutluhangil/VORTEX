import type { ModeId } from "@/store/useRenderStore";
import type { Preset } from "@/store/usePresetStore";
import { useSimStore } from "@/store/useSimStore";
import { useRenderStore } from "@/store/useRenderStore";
import { useInputStore } from "@/store/useInputStore";
import { usePresetStore } from "@/store/usePresetStore";
import { MODES } from "./modes";
import { setActivePalette } from "./palette";

interface ApplyConfig {
  palette: string[];
  params: { curl: number; viscosity: number; dissipation: number; splatRadius: number };
  bloom: number;
  sunrays: number;
  vignette: number;
}

function applyConfig(c: ApplyConfig): void {
  const sim = useSimStore.getState();
  sim.setCurl(c.params.curl);
  sim.setViscosity(c.params.viscosity);
  sim.setDissipation(c.params.dissipation);

  useInputStore.getState().setSplatRadius(c.params.splatRadius);

  const render = useRenderStore.getState();
  render.setBloom(c.bloom > 0, c.bloom);
  render.setSunrays(c.sunrays > 0, c.sunrays);
  render.setVignette(c.vignette > 0, c.vignette);

  setActivePalette(c.palette);
}

/** Apply a base mode: sim params + render fx + palette + active mode id. */
export function applyMode(modeId: ModeId): void {
  const m = MODES[modeId];
  applyConfig(m);
  useRenderStore.getState().setMode(modeId);
  // Switching mode clears any active preset selection
  usePresetStore.getState().setActivePreset(`mode-${modeId}`);
}

/** Apply a curated/custom preset: also sets the underlying mode. */
export function applyPreset(preset: Preset): void {
  applyConfig(preset);
  useRenderStore.getState().setMode(preset.mode);
  usePresetStore.getState().setActivePreset(preset.id);
}

/** Snapshot current state into a Preset (for "Save current as preset"). */
export function snapshotCurrentPreset(name: string, id: string): Preset {
  const sim = useSimStore.getState();
  const render = useRenderStore.getState();
  const input = useInputStore.getState();
  const mode = MODES[render.activeMode];
  return {
    id,
    name,
    mode: render.activeMode,
    palette: mode.palette,
    params: {
      curl: sim.curl,
      viscosity: sim.viscosity,
      dissipation: sim.dissipation,
      splatRadius: input.splatRadius,
    },
    bloom: render.bloomEnabled ? render.bloomIntensity : 0,
    sunrays: render.sunraysEnabled ? render.sunraysIntensity : 0,
    vignette: render.vignetteEnabled ? render.vignetteIntensity : 0,
    custom: true,
  };
}
