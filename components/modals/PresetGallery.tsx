"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles, Trash2, Plus, Loader2 } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { usePresetStore, type Preset } from "@/store/usePresetStore";
import { PRESETS } from "@/lib/presets/definitions";
import { applyPreset, snapshotCurrentPreset } from "@/lib/presets/apply";
import { isAIEnabled, generatePreset } from "@/lib/ai/generate-preset";
import { nanoid } from "nanoid";

function PresetCard({
  preset,
  active,
  onApply,
  onDelete,
}: {
  preset: Preset;
  active: boolean;
  onApply: () => void;
  onDelete?: () => void;
}) {
  // Build a CSS gradient from the palette (skip darkest = background)
  const dyeColors = preset.palette.filter((_, i) => i > 0);
  const gradient = `linear-gradient(135deg, ${dyeColors.join(", ")})`;

  return (
    <button
      onClick={onApply}
      className="group relative flex flex-col rounded-xl overflow-hidden text-left transition-transform duration-150 hover:scale-[1.02] focus:outline-none"
      style={{
        border: active ? "1px solid #fb7185" : "1px solid rgba(255,255,255,0.08)",
        boxShadow: active ? "0 0 0 1px #fb7185, 0 4px 16px rgba(251,113,133,0.2)" : "none",
      }}
    >
      {/* Swatch */}
      <div className="relative h-24 w-full" style={{ background: preset.palette[0] ?? "#000" }}>
        <div className="absolute inset-0" style={{ background: gradient, opacity: 0.9 }} />
        {/* Palette dots */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          {preset.palette.map((c, i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: c, border: "1px solid rgba(0,0,0,0.3)" }}
            />
          ))}
        </div>
        {onDelete && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
                onDelete();
              }
            }}
            aria-label="Delete preset"
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "rgba(0,0,0,0.5)", color: "#f87171" }}
          >
            <Trash2 size={12} />
          </span>
        )}
      </div>

      {/* Meta */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ background: "rgba(10,10,13,0.8)" }}
      >
        <span className="text-xs font-medium truncate" style={{ color: "#f5f5f7" }}>
          {preset.name}
        </span>
        <span
          className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0 ml-2"
          style={{ background: "rgba(255,255,255,0.06)", color: "#6b6b7a" }}
        >
          {preset.mode}
        </span>
      </div>
    </button>
  );
}

export function PresetGallery() {
  const open = useUIStore((s) => s.presetGalleryOpen);
  const setOpen = useUIStore((s) => s.setPresetGalleryOpen);
  const activePresetId = usePresetStore((s) => s.activePresetId);
  const customPresets = usePresetStore((s) => s.customPresets);
  const addCustomPreset = usePresetStore((s) => s.addCustomPreset);
  const removeCustomPreset = usePresetStore((s) => s.removeCustomPreset);

  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (open) isAIEnabled().then(setAiEnabled);
  }, [open]);

  const handleApply = (preset: Preset) => {
    applyPreset(preset);
    setOpen(false);
  };

  const handleSaveCurrent = () => {
    const name = `My Preset ${customPresets.length + 1}`;
    addCustomPreset(snapshotCurrentPreset(name, `custom-${nanoid(6)}`));
  };

  const handleGenerate = async () => {
    if (!aiPrompt.trim() || aiLoading) return;
    setAiLoading(true);
    setAiError(null);
    const { preset, error } = await generatePreset(aiPrompt.trim());
    setAiLoading(false);
    if (error || !preset) {
      setAiError(error ?? "Generation failed.");
      return;
    }
    addCustomPreset(preset);
    applyPreset(preset);
    setAiPrompt("");
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.8)", pointerEvents: "auto" }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-4 md:inset-8 lg:inset-x-[10%] z-50 glass rounded-2xl flex flex-col overflow-hidden"
            style={{ pointerEvents: "auto" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <h2 className="text-sm font-semibold" style={{ color: "#f5f5f7" }}>
                Presets
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveCurrent}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", color: "#a8a8b3" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "#f5f5f7";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = "#a8a8b3";
                  }}
                >
                  <Plus size={13} /> Save current
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close presets"
                  className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                  style={{ color: "#6b6b7a" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.color = "#f5f5f7";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#6b6b7a";
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Scroll body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {/* AI generation */}
              {aiEnabled && (
                <div
                  className="rounded-xl p-4 flex flex-col gap-3"
                  style={{
                    background: "rgba(251,113,133,0.05)",
                    border: "1px solid rgba(251,113,133,0.15)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} style={{ color: "#fb7185" }} />
                    <span className="text-xs font-semibold" style={{ color: "#f5f5f7" }}>
                      Generate with AI
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleGenerate();
                      }}
                      placeholder="e.g. a thunderstorm at midnight"
                      maxLength={200}
                      disabled={aiLoading}
                      className="flex-1 bg-transparent border rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                      style={{
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#f5f5f7",
                        caretColor: "#fb7185",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(251,113,133,0.5)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                    <button
                      onClick={handleGenerate}
                      disabled={aiLoading || !aiPrompt.trim()}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-opacity disabled:opacity-40"
                      style={{ background: "#fb7185", color: "#1a0508" }}
                    >
                      {aiLoading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Sparkles size={13} />
                      )}
                      Generate
                    </button>
                  </div>
                  {aiError && (
                    <p className="text-[10px]" style={{ color: "#f87171" }}>
                      {aiError}
                    </p>
                  )}
                </div>
              )}

              {/* My Presets */}
              {customPresets.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3
                    className="text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: "#6b6b7a" }}
                  >
                    My Presets
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {customPresets.map((p) => (
                      <PresetCard
                        key={p.id}
                        preset={p}
                        active={p.id === activePresetId}
                        onApply={() => handleApply(p)}
                        onDelete={() => removeCustomPreset(p.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Curated */}
              <div className="flex flex-col gap-3">
                <h3
                  className="text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: "#6b6b7a" }}
                >
                  Curated
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {PRESETS.map((p) => (
                    <PresetCard
                      key={p.id}
                      preset={p}
                      active={p.id === activePresetId}
                      onApply={() => handleApply(p)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
