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

const TWEEN_MS = 500;
let tweenRaf = 0;

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Smoothly tween the numeric sim/render params to the target config over
 *  ~500ms. Palette + mode id snap immediately (existing dye flows out as new
 *  colours come in — reads as a natural crossfade without a LUT remap). */
function applyConfig(c: ApplyConfig): void {
  cancelAnimationFrame(tweenRaf);

  const sim = useSimStore.getState();
  const render = useRenderStore.getState();
  const input = useInputStore.getState();

  // Snapshot start values
  const from = {
    curl: sim.curl,
    viscosity: sim.viscosity,
    dissipation: sim.dissipation,
    splatRadius: input.splatRadius,
    bloom: render.bloomEnabled ? render.bloomIntensity : 0,
    sunrays: render.sunraysEnabled ? render.sunraysIntensity : 0,
    vignette: render.vignetteEnabled ? render.vignetteIntensity : 0,
  };
  const to = {
    curl: c.params.curl,
    viscosity: c.params.viscosity,
    dissipation: c.params.dissipation,
    splatRadius: c.params.splatRadius,
    bloom: c.bloom,
    sunrays: c.sunrays,
    vignette: c.vignette,
  };

  // Palette swaps immediately
  setActivePalette(c.palette);

  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / TWEEN_MS);
    const e = easeInOut(t);
    const s = useSimStore.getState();
    const r = useRenderStore.getState();
    s.setCurl(lerp(from.curl, to.curl, e));
    s.setViscosity(lerp(from.viscosity, to.viscosity, e));
    s.setDissipation(lerp(from.dissipation, to.dissipation, e));
    useInputStore.getState().setSplatRadius(lerp(from.splatRadius, to.splatRadius, e));
    r.setBloom(to.bloom > 0, lerp(from.bloom, to.bloom, e));
    r.setSunrays(to.sunrays > 0, lerp(from.sunrays, to.sunrays, e));
    r.setVignette(to.vignette > 0, lerp(from.vignette, to.vignette, e));
    if (t < 1) tweenRaf = requestAnimationFrame(tick);
  };

  if (typeof requestAnimationFrame === "undefined") {
    // SSR / non-browser fallback: set instantly
    sim.setCurl(to.curl);
    sim.setViscosity(to.viscosity);
    sim.setDissipation(to.dissipation);
    input.setSplatRadius(to.splatRadius);
    render.setBloom(to.bloom > 0, to.bloom);
    render.setSunrays(to.sunrays > 0, to.sunrays);
    render.setVignette(to.vignette > 0, to.vignette);
    return;
  }
  tweenRaf = requestAnimationFrame(tick);
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
