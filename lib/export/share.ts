import type { ModeId } from "@/store/useRenderStore";
import { PRESET_MAP } from "@/lib/presets/definitions";
import { MODES } from "@/lib/presets/modes";
import { applyPreset, applyMode } from "@/lib/presets/apply";

/** Build a shareable URL carrying the active preset / mode. */
export function buildShareURL(presetId: string | null, mode: ModeId): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.origin);
  if (presetId && PRESET_MAP[presetId]) {
    url.searchParams.set("preset", presetId);
  } else {
    url.searchParams.set("mode", mode);
  }
  return url.toString();
}

/** Build an <iframe> embed snippet. */
export function buildEmbedCode(
  presetId: string | null,
  mode: ModeId,
  interactive = true,
): string {
  if (typeof window === "undefined") return "";
  const url = new URL(`${window.location.origin}/embed`);
  if (presetId && PRESET_MAP[presetId]) url.searchParams.set("preset", presetId);
  else url.searchParams.set("mode", mode);
  if (interactive) url.searchParams.set("interactive", "true");
  return `<iframe src="${url.toString()}" width="100%" height="600" frameborder="0" allow="camera; microphone"></iframe>`;
}

/**
 * Apply preset/mode from the current URL's query params.
 * preset takes precedence over mode. Returns true if anything applied.
 */
export function applyFromURL(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);

  const presetId = params.get("preset");
  if (presetId && PRESET_MAP[presetId]) {
    applyPreset(PRESET_MAP[presetId]!);
    return true;
  }

  const mode = params.get("mode");
  if (mode && mode in MODES) {
    applyMode(mode as ModeId);
    return true;
  }

  return false;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
