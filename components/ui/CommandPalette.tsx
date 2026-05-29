"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Wind, Waves, Flame, Zap, Sparkles, Paintbrush } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useRenderStore, type ModeId } from "@/store/useRenderStore";
import { useSimStore } from "@/store/useSimStore";
import { useInputStore } from "@/store/useInputStore";
import { useRecordStore } from "@/store/useRecordStore";
import { cn } from "@/lib/utils/cn";

interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  kbd?: string;
  category: string;
  action: () => void;
}

function fuzzyMatch(query: string, text: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const setPanelOpen = useUIStore((s) => s.setPanelOpen);
  const setCinemaMode = useUIStore((s) => s.setCinemaMode);
  const setPresetGalleryOpen = useUIStore((s) => s.setPresetGalleryOpen);

  const setMode = useRenderStore((s) => s.setMode);
  const togglePaused = useSimStore((s) => s.togglePaused);
  const reset = useSimStore((s) => s.reset);
  const setAudioEnabled = useInputStore((s) => s.setAudioEnabled);
  const audioEnabled = useInputStore((s) => s.audioEnabled);
  const setCameraEnabled = useInputStore((s) => s.setCameraEnabled);
  const cameraEnabled = useInputStore((s) => s.cameraEnabled);
  const setRecording = useRecordStore((s) => s.setRecording);
  const recording = useRecordStore((s) => s.recording);

  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const modeIcon: Record<ModeId, React.ReactNode> = {
    smoke: <Wind size={14} />,
    water: <Waves size={14} />,
    lava: <Flame size={14} />,
    plasma: <Zap size={14} />,
    nebula: <Sparkles size={14} />,
    ink: <Paintbrush size={14} />,
  };

  const commands = useMemo<Command[]>(() => [
    ...([
      ["smoke", "Smoke"],
      ["water", "Water"],
      ["lava", "Lava"],
      ["plasma", "Plasma"],
      ["nebula", "Nebula"],
      ["ink", "Ink"],
    ] as [ModeId, string][]).map(([id, name]) => ({
      id: `mode-${id}`,
      title: `Switch mode: ${name}`,
      icon: modeIcon[id],
      category: "Modes",
      action: () => { setMode(id); setOpen(false); },
    })),
    {
      id: "presets",
      title: "Open presets",
      category: "Navigation",
      kbd: "P",
      action: () => { setPresetGalleryOpen(true); setOpen(false); },
    },
    {
      id: "settings",
      title: "Open settings",
      category: "Navigation",
      kbd: ",",
      action: () => { setPanelOpen(true); setOpen(false); },
    },
    {
      id: "pause",
      title: "Pause / Resume simulation",
      category: "Simulation",
      kbd: "Space",
      action: () => { togglePaused(); setOpen(false); },
    },
    {
      id: "reset",
      title: "Reset simulation",
      category: "Simulation",
      kbd: "R",
      action: () => { reset(); setOpen(false); },
    },
    {
      id: "audio",
      title: audioEnabled ? "Disable audio" : "Enable audio",
      category: "Inputs",
      kbd: "A",
      action: () => { setAudioEnabled(!audioEnabled); setOpen(false); },
    },
    {
      id: "camera",
      title: cameraEnabled ? "Disable camera" : "Enable camera",
      category: "Inputs",
      kbd: "C",
      action: () => { setCameraEnabled(!cameraEnabled); setOpen(false); },
    },
    {
      id: "record",
      title: recording ? "Stop recording" : "Start recording",
      category: "Export",
      kbd: "⌘⇧R",
      action: () => { setRecording(!recording); setOpen(false); },
    },
    {
      id: "cinema",
      title: "Cinema mode",
      subtitle: "Hide all UI",
      category: "View",
      kbd: "H",
      action: () => { setCinemaMode(true); setOpen(false); },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [audioEnabled, cameraEnabled, recording]);

  const filtered = useMemo(
    () => commands.filter((c) => fuzzyMatch(query, `${c.title} ${c.category} ${c.subtitle ?? ""}`)),
    [commands, query],
  );

  // Reset selection when query changes
  useEffect(() => setSelectedIdx(0), [query]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIdx(0);
    }
  }, [open]);

  // Keyboard: ⌘K toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape" && open) setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIdx]) {
        filtered[selectedIdx]!.action();
      }
    },
    [filtered, selectedIdx],
  );

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, Command[]>();
    for (const cmd of filtered) {
      const group = map.get(cmd.category) ?? [];
      group.push(cmd);
      map.set(cmd.category, group);
    }
    return map;
  }, [filtered]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.6)", pointerEvents: "auto" }}
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-[560px] mx-4"
            style={{ pointerEvents: "auto" }}
          >
            <div
              className="glass overflow-hidden"
              style={{
                borderRadius: 16,
                boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
              }}
            >
              {/* Search input */}
              <div
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <Search size={15} style={{ color: "#6b6b7a", flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search commands..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: "#f5f5f7", caretColor: "#fb7185" }}
                  aria-label="Command search"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="text-[10px] px-1.5 py-0.5 rounded transition-colors"
                    style={{ color: "#6b6b7a", background: "rgba(255,255,255,0.06)" }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Results */}
              <div
                ref={listRef}
                className="overflow-y-auto py-2"
                style={{ maxHeight: 360 }}
                role="listbox"
              >
                {filtered.length === 0 ? (
                  <p className="px-4 py-8 text-center text-xs" style={{ color: "#6b6b7a" }}>
                    No results for &ldquo;{query}&rdquo;
                  </p>
                ) : (
                  Array.from(grouped.entries()).map(([category, cmds]) => {
                    return (
                      <div key={category}>
                        <div
                          className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest"
                          style={{ color: "#404050" }}
                        >
                          {category}
                        </div>
                        {cmds.map((cmd) => {
                          const globalIdx = filtered.indexOf(cmd);
                          const isSelected = globalIdx === selectedIdx;
                          return (
                            <button
                              key={cmd.id}
                              role="option"
                              aria-selected={isSelected}
                              onClick={cmd.action}
                              onMouseEnter={() => setSelectedIdx(globalIdx)}
                              className={cn(
                                "flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors",
                                isSelected && "bg-[rgba(255,255,255,0.05)]",
                              )}
                            >
                              {cmd.icon && (
                                <span style={{ color: isSelected ? "#fb7185" : "#6b6b7a" }}>
                                  {cmd.icon}
                                </span>
                              )}
                              <div className="flex-1 min-w-0">
                                <span
                                  className="text-sm"
                                  style={{ color: isSelected ? "#f5f5f7" : "#a8a8b3" }}
                                >
                                  {cmd.title}
                                </span>
                                {cmd.subtitle && (
                                  <span className="block text-[10px]" style={{ color: "#6b6b7a" }}>
                                    {cmd.subtitle}
                                  </span>
                                )}
                              </div>
                              {cmd.kbd && (
                                <kbd
                                  className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
                                  style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    color: "#6b6b7a",
                                    fontFamily: "var(--font-mono)",
                                  }}
                                >
                                  {cmd.kbd}
                                </kbd>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div
                className="flex items-center gap-3 px-4 py-2"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                {[
                  { kbd: "↑↓", label: "navigate" },
                  { kbd: "↵", label: "select" },
                  { kbd: "Esc", label: "close" },
                ].map(({ kbd, label }) => (
                  <span key={kbd} className="flex items-center gap-1">
                    <kbd
                      className="text-[10px] px-1 py-0.5 rounded"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#6b6b7a",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {kbd}
                    </kbd>
                    <span className="text-[10px]" style={{ color: "#404050" }}>
                      {label}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
