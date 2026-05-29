"use client";

import { LayoutGrid } from "lucide-react";
import { usePresetStore } from "@/store/usePresetStore";
import { useUIStore } from "@/store/useUIStore";
import { DockButton } from "./DockButton";

export function PresetSelector() {
  const activePresetId = usePresetStore((s) => s.activePresetId);
  const setPresetGalleryOpen = useUIStore((s) => s.setPresetGalleryOpen);

  return (
    <DockButton
      icon={<LayoutGrid size={18} />}
      label={activePresetId ? `Preset: ${activePresetId}` : "Presets"}
      kbd="P"
      onClick={() => setPresetGalleryOpen(true)}
      aria-label="Open preset gallery"
    />
  );
}
