"use client";

import { LayoutGrid } from "lucide-react";
import { usePresetStore } from "@/store/usePresetStore";
import { useUIStore } from "@/store/useUIStore";
import { PRESET_MAP } from "@/lib/presets/definitions";
import { MODES } from "@/lib/presets/modes";
import { DockButton } from "./DockButton";

function resolveName(id: string | null, custom: { id: string; name: string }[]): string {
  if (!id) return "Presets";
  if (PRESET_MAP[id]) return PRESET_MAP[id]!.name;
  if (id.startsWith("mode-")) {
    const modeId = id.slice(5) as keyof typeof MODES;
    return MODES[modeId]?.name ?? "Presets";
  }
  const c = custom.find((p) => p.id === id);
  return c?.name ?? "Presets";
}

export function PresetSelector() {
  const activePresetId = usePresetStore((s) => s.activePresetId);
  const customPresets = usePresetStore((s) => s.customPresets);
  const setPresetGalleryOpen = useUIStore((s) => s.setPresetGalleryOpen);

  const name = resolveName(activePresetId, customPresets);

  return (
    <DockButton
      icon={<LayoutGrid size={18} />}
      label={activePresetId ? `Preset: ${name}` : "Presets"}
      kbd="P"
      onClick={() => setPresetGalleryOpen(true)}
      aria-label="Open preset gallery"
    />
  );
}
