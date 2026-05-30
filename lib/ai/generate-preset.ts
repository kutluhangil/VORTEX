import { nanoid } from "nanoid";
import type { Preset } from "@/store/usePresetStore";
import type { ModeId } from "@/store/useRenderStore";

let cachedEnabled: boolean | null = null;

/** Whether the server has an ANTHROPIC_API_KEY configured. Cached per session. */
export async function isAIEnabled(): Promise<boolean> {
  if (cachedEnabled !== null) return cachedEnabled;
  try {
    const res = await fetch("/api/ai/preset", { method: "GET" });
    const data = (await res.json()) as { enabled?: boolean };
    cachedEnabled = Boolean(data.enabled);
  } catch {
    cachedEnabled = false;
  }
  return cachedEnabled;
}

interface GenerateResult {
  preset?: Preset;
  error?: string;
}

/** Generate a preset from a natural-language prompt via the edge route. */
export async function generatePreset(prompt: string): Promise<GenerateResult> {
  try {
    const res = await fetch("/api/ai/preset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = (await res.json()) as {
      preset?: Omit<Preset, "id" | "custom">;
      error?: string;
    };

    if (!res.ok || !data.preset) {
      return { error: data.error ?? "Generation failed." };
    }

    const preset: Preset = {
      ...data.preset,
      mode: data.preset.mode as ModeId,
      id: `ai-${nanoid(6)}`,
      custom: true,
    };

    return { preset };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Network error." };
  }
}
