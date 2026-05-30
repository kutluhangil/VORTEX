"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Github } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useSimStore } from "@/store/useSimStore";
import { useRenderStore } from "@/store/useRenderStore";
import { useInputStore } from "@/store/useInputStore";
import { Slider } from "./primitives/Slider";
import { Toggle } from "./primitives/Toggle";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: "#6b6b7a" }}
      >
        {title}
      </h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

export function SidePanel() {
  const panelOpen = useUIStore((s) => s.panelOpen);
  const setPanelOpen = useUIStore((s) => s.setPanelOpen);
  const setCinemaMode = useUIStore((s) => s.setCinemaMode);

  const curl = useSimStore((s) => s.curl);
  const setCurl = useSimStore((s) => s.setCurl);
  const viscosity = useSimStore((s) => s.viscosity);
  const setViscosity = useSimStore((s) => s.setViscosity);
  const dissipation = useSimStore((s) => s.dissipation);
  const setDissipation = useSimStore((s) => s.setDissipation);
  const pressureIterations = useSimStore((s) => s.pressureIterations);
  const setPressureIterations = useSimStore((s) => s.setPressureIterations);
  const autoQuality = useSimStore((s) => s.autoQuality);
  const setAutoQuality = useSimStore((s) => s.setAutoQuality);
  const fps = useSimStore((s) => s.fps);
  const simResolution = useSimStore((s) => s.simResolution);

  const bloomEnabled = useRenderStore((s) => s.bloomEnabled);
  const bloomIntensity = useRenderStore((s) => s.bloomIntensity);
  const setBloom = useRenderStore((s) => s.setBloom);
  const sunraysEnabled = useRenderStore((s) => s.sunraysEnabled);
  const sunraysIntensity = useRenderStore((s) => s.sunraysIntensity);
  const setSunrays = useRenderStore((s) => s.setSunrays);
  const vignetteEnabled = useRenderStore((s) => s.vignetteEnabled);
  const vignetteIntensity = useRenderStore((s) => s.vignetteIntensity);
  const setVignette = useRenderStore((s) => s.setVignette);

  const audioSensitivity = useInputStore((s) => s.audioSensitivity);
  const setAudioSensitivity = useInputStore((s) => s.setAudioSensitivity);
  const webcamFlowStrength = useInputStore((s) => s.webcamFlowStrength);
  const setWebcamFlowStrength = useInputStore((s) => s.setWebcamFlowStrength);
  const obstacleThreshold = useInputStore((s) => s.obstacleThreshold);
  const setObstacleThreshold = useInputStore((s) => s.setObstacleThreshold);

  return (
    <AnimatePresence>
      {panelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30"
            style={{ background: "rgba(0,0,0,0.3)", pointerEvents: "auto" }}
            onClick={() => setPanelOpen(false)}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 h-full z-40 flex flex-col"
            style={{
              width: 360,
              background: "rgba(10,10,13,0.92)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              pointerEvents: "auto",
            }}
            aria-label="Settings panel"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <h2 className="text-sm font-semibold" style={{ color: "#f5f5f7" }}>
                Settings
              </h2>
              <button
                onClick={() => setPanelOpen(false)}
                aria-label="Close settings"
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

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">

              <Section title="Simulation">
                <Slider
                  label="Curl"
                  value={curl}
                  min={0}
                  max={50}
                  step={1}
                  onChange={setCurl}
                  format={(v) => v.toFixed(0)}
                />
                <Slider
                  label="Viscosity"
                  value={viscosity}
                  min={0}
                  max={0.005}
                  step={0.0001}
                  onChange={setViscosity}
                  format={(v) => v.toFixed(4)}
                />
                <Slider
                  label="Dissipation"
                  value={dissipation}
                  min={0.9}
                  max={1.0}
                  step={0.001}
                  onChange={setDissipation}
                  format={(v) => v.toFixed(3)}
                />
                <Slider
                  label="Pressure Iters"
                  value={pressureIterations}
                  min={10}
                  max={50}
                  step={1}
                  onChange={setPressureIterations}
                  format={(v) => v.toFixed(0)}
                />
              </Section>

              <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

              <Section title="Visuals">
                <Toggle
                  label="Bloom"
                  checked={bloomEnabled}
                  onChange={(v) => setBloom(v, bloomIntensity)}
                />
                {bloomEnabled && (
                  <Slider
                    label="Bloom Intensity"
                    value={bloomIntensity}
                    min={0}
                    max={2}
                    step={0.05}
                    onChange={(v) => setBloom(bloomEnabled, v)}
                  />
                )}
                <Toggle
                  label="Sunrays"
                  checked={sunraysEnabled}
                  onChange={(v) => setSunrays(v, sunraysIntensity)}
                />
                {sunraysEnabled && (
                  <Slider
                    label="Sunrays Intensity"
                    value={sunraysIntensity}
                    min={0}
                    max={2}
                    step={0.05}
                    onChange={(v) => setSunrays(sunraysEnabled, v)}
                  />
                )}
                <Toggle
                  label="Vignette"
                  checked={vignetteEnabled}
                  onChange={(v) => setVignette(v, vignetteIntensity)}
                />
                {vignetteEnabled && (
                  <Slider
                    label="Vignette Intensity"
                    value={vignetteIntensity}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(v) => setVignette(vignetteEnabled, v)}
                  />
                )}
              </Section>

              <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

              <Section title="Inputs">
                <Slider
                  label="Audio Sensitivity"
                  value={audioSensitivity}
                  min={0.1}
                  max={3}
                  step={0.05}
                  onChange={setAudioSensitivity}
                />
                <Slider
                  label="Webcam Flow Strength"
                  value={webcamFlowStrength}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={setWebcamFlowStrength}
                />
                <Slider
                  label="Obstacle Threshold"
                  value={obstacleThreshold}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={setObstacleThreshold}
                />
              </Section>

              <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

              <Section title="Performance">
                <Toggle
                  label="Auto-quality"
                  checked={autoQuality}
                  onChange={setAutoQuality}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: "#a8a8b3" }}>
                    FPS
                  </span>
                  <span
                    className="text-xs tabular-nums"
                    style={{
                      color: fps >= 50 ? "#4ade80" : fps >= 30 ? "#fbbf24" : "#f87171",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {fps}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: "#a8a8b3" }}>
                    Sim resolution
                  </span>
                  <span
                    className="text-xs tabular-nums"
                    style={{ color: "#6b6b7a", fontFamily: "var(--font-mono)" }}
                  >
                    {simResolution}²
                  </span>
                </div>
              </Section>

              <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

              <Section title="Cinema Mode">
                <button
                  onClick={() => {
                    setPanelOpen(false);
                    setCinemaMode(true);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#a8a8b3",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "#f5f5f7";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = "#a8a8b3";
                  }}
                >
                  Hide UI <kbd
                    className="text-[10px] px-1 py-0.5 rounded ml-1"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >H</kbd>
                </button>
              </Section>

              <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

              <Section title="About">
                <a
                  href="https://github.com/kutluhangil/flow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs transition-colors"
                  style={{ color: "#6b6b7a" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f5f5f7")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b7a")}
                >
                  <Github size={13} />
                  github.com/kutluhangil/flow
                </a>
                <p className="text-[10px]" style={{ color: "#404050" }}>
                  FLOW v1.0 · WebGL2 fluid simulation
                </p>
              </Section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
