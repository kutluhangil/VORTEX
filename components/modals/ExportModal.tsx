"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Image as ImageIcon, Film, Loader2, Link2, Code2, Check } from "lucide-react";
import { useRecordStore } from "@/store/useRecordStore";
import { useRenderStore } from "@/store/useRenderStore";
import { usePresetStore } from "@/store/usePresetStore";
import { capturePNG, capture4K } from "@/lib/export/snapshot";
import { recordGIF } from "@/lib/export/gif";
import { buildShareURL, buildEmbedCode, copyToClipboard } from "@/lib/export/share";
import { cn } from "@/lib/utils/cn";

type Tab = "image" | "video" | "gif" | "share";

const GIF_DURATIONS = [2, 3, 5];

export function ExportModal() {
  const open = useRecordStore((s) => s.exportModalOpen);
  const setOpen = useRecordStore((s) => s.setExportModalOpen);
  const setRecording = useRecordStore((s) => s.setRecording);
  const activeMode = useRenderStore((s) => s.activeMode);
  const activePresetId = usePresetStore((s) => s.activePresetId);

  const [tab, setTab] = useState<Tab>("image");
  const [busy, setBusy] = useState(false);
  const [gifDuration, setGifDuration] = useState(3);
  const [gifProgress, setGifProgress] = useState(0);
  const [copied, setCopied] = useState<"link" | "embed" | null>(null);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      console.error("[Export]", err);
    } finally {
      setBusy(false);
    }
  };

  const handleGIF = async () => {
    setBusy(true);
    setGifProgress(0);
    try {
      await recordGIF(gifDuration, setGifProgress);
    } catch (err) {
      console.error("[Export GIF]", err);
    } finally {
      setBusy(false);
      setGifProgress(0);
    }
  };

  const handleCopy = async (kind: "link" | "embed") => {
    const text =
      kind === "link"
        ? buildShareURL(activePresetId, activeMode)
        : buildEmbedCode(activePresetId, activeMode);
    if (await copyToClipboard(text)) {
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "image", label: "Image", icon: <ImageIcon size={13} /> },
    { id: "video", label: "Video", icon: <Film size={13} /> },
    { id: "gif", label: "GIF", icon: <Film size={13} /> },
    { id: "share", label: "Share", icon: <Link2 size={13} /> },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.7)", pointerEvents: "auto" }}
            onClick={() => !busy && setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 glass rounded-2xl w-full max-w-md mx-4"
            style={{ pointerEvents: "auto" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <h2 className="text-sm font-semibold" style={{ color: "#f5f5f7" }}>
                Export
              </h2>
              <button
                onClick={() => !busy && setOpen(false)}
                aria-label="Close export"
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: "#6b6b7a" }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-4 pt-3">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  disabled={busy}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  )}
                  style={{
                    background: tab === t.id ? "rgba(251,113,133,0.15)" : "transparent",
                    color: tab === t.id ? "#fb7185" : "#a8a8b3",
                  }}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col gap-3">
              {tab === "image" && (
                <>
                  <ExportButton
                    label="PNG snapshot"
                    sub="Current resolution"
                    busy={busy}
                    onClick={() => run(capturePNG)}
                  />
                  <ExportButton
                    label="4K PNG"
                    sub="3840 × 2160"
                    busy={busy}
                    onClick={() => run(capture4K)}
                  />
                </>
              )}

              {tab === "video" && (
                <>
                  <p className="text-[11px] leading-relaxed" style={{ color: "#6b6b7a" }}>
                    Records the live canvas (max 60s). UI hides automatically;
                    press ⌘⇧R or the stop button to finish.
                  </p>
                  <ExportButton
                    label="Start recording"
                    sub="MP4 / WebM · 60fps"
                    busy={busy}
                    onClick={() => {
                      setOpen(false);
                      setRecording(true);
                    }}
                  />
                </>
              )}

              {tab === "gif" && (
                <>
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px]" style={{ color: "#a8a8b3" }}>
                      Duration
                    </span>
                    <div className="flex gap-2">
                      {GIF_DURATIONS.map((d) => (
                        <button
                          key={d}
                          disabled={busy}
                          onClick={() => setGifDuration(d)}
                          className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors"
                          style={{
                            background:
                              gifDuration === d
                                ? "rgba(251,113,133,0.15)"
                                : "rgba(255,255,255,0.05)",
                            color: gifDuration === d ? "#fb7185" : "#a8a8b3",
                            border:
                              gifDuration === d
                                ? "1px solid rgba(251,113,133,0.4)"
                                : "1px solid transparent",
                          }}
                        >
                          {d}s
                        </button>
                      ))}
                    </div>
                  </div>

                  {busy && (
                    <div className="flex flex-col gap-1.5">
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-150"
                          style={{ width: `${gifProgress * 100}%`, background: "#fb7185" }}
                        />
                      </div>
                      <span className="text-[10px]" style={{ color: "#6b6b7a" }}>
                        {gifProgress < 0.5 ? "Capturing frames…" : "Encoding GIF…"}
                      </span>
                    </div>
                  )}

                  <ExportButton
                    label="Export GIF"
                    sub={`${gifDuration}s loop · 480px`}
                    busy={busy}
                    onClick={handleGIF}
                  />
                </>
              )}

              {tab === "share" && (
                <>
                  <button
                    onClick={() => handleCopy("link")}
                    className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <span className="flex items-center gap-2 text-sm" style={{ color: "#f5f5f7" }}>
                      <Link2 size={14} style={{ color: "#6b6b7a" }} />
                      Copy share link
                    </span>
                    {copied === "link" ? (
                      <Check size={14} style={{ color: "#4ade80" }} />
                    ) : null}
                  </button>
                  <button
                    onClick={() => handleCopy("embed")}
                    className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <span className="flex items-center gap-2 text-sm" style={{ color: "#f5f5f7" }}>
                      <Code2 size={14} style={{ color: "#6b6b7a" }} />
                      Copy embed code
                    </span>
                    {copied === "embed" ? (
                      <Check size={14} style={{ color: "#4ade80" }} />
                    ) : null}
                  </button>
                  <p className="text-[10px] leading-relaxed" style={{ color: "#404050" }}>
                    Links carry the active preset/mode. Embed renders FLOW as a
                    background iframe for your site or portfolio.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ExportButton({
  label,
  sub,
  busy,
  onClick,
}: {
  label: string;
  sub: string;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors disabled:opacity-50"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
      onMouseEnter={(e) => {
        if (!busy) e.currentTarget.style.background = "rgba(255,255,255,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
      }}
    >
      <div className="flex flex-col items-start">
        <span className="text-sm font-medium" style={{ color: "#f5f5f7" }}>
          {label}
        </span>
        <span className="text-[10px]" style={{ color: "#6b6b7a" }}>
          {sub}
        </span>
      </div>
      {busy ? (
        <Loader2 size={15} className="animate-spin" style={{ color: "#fb7185" }} />
      ) : null}
    </button>
  );
}
