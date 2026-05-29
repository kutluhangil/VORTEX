"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mic, MicOff, Camera, CameraOff, ImageIcon, Command,
  Settings, Circle, Type,
} from "lucide-react";
import { useInputStore } from "@/store/useInputStore";
import { useUIStore } from "@/store/useUIStore";
import { useRecordStore } from "@/store/useRecordStore";
import { DockButton } from "./DockButton";
import { ModeSelector } from "./ModeSelector";
import { PresetSelector } from "./PresetSelector";
import { ImageDropZone } from "./ImageDropZone";
import { TextObstacleInput } from "./TextObstacleInput";

export function Dock() {
  const audioEnabled = useInputStore((s) => s.audioEnabled);
  const cameraEnabled = useInputStore((s) => s.cameraEnabled);
  const setAudioEnabled = useInputStore((s) => s.setAudioEnabled);
  const setCameraEnabled = useInputStore((s) => s.setCameraEnabled);

  const setPanelOpen = useUIStore((s) => s.setPanelOpen);
  const panelOpen = useUIStore((s) => s.panelOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);

  const recording = useRecordStore((s) => s.recording);
  const setRecording = useRecordStore((s) => s.setRecording);

  const [imageZoneOpen, setImageZoneOpen] = useState(false);
  const [textInputOpen, setTextInputOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40" style={{ pointerEvents: "auto" }}>
      {/* Image drop zone popover */}
      <AnimatePresence>
        {imageZoneOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3"
          >
            <ImageDropZone onClose={() => setImageZoneOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text obstacle popover */}
      <AnimatePresence>
        {textInputOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3"
          >
            <TextObstacleInput onClose={() => setTextInputOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dock pill */}
      <div
        className="glass flex items-center gap-1 px-2"
        style={{ height: 56, borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
      >
        {/* Divider helper */}
        {[
          <PresetSelector key="preset" />,
          <ModeSelector key="mode" />,

          <span key="d1" className="w-px h-5 flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />,

          <DockButton
            key="audio"
            icon={audioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
            label="Audio"
            kbd="A"
            active={audioEnabled}
            onClick={() => setAudioEnabled(!audioEnabled)}
          />,

          <DockButton
            key="camera"
            icon={cameraEnabled ? <Camera size={18} /> : <CameraOff size={18} />}
            label="Camera"
            kbd="C"
            active={cameraEnabled}
            onClick={() => setCameraEnabled(!cameraEnabled)}
          />,

          <DockButton
            key="image"
            icon={<ImageIcon size={18} />}
            label="Image obstacle"
            active={imageZoneOpen}
            onClick={() => {
              setImageZoneOpen((v) => !v);
              setTextInputOpen(false);
            }}
          />,

          <DockButton
            key="text"
            icon={<Type size={18} />}
            label="Text obstacle"
            active={textInputOpen}
            onClick={() => {
              setTextInputOpen((v) => !v);
              setImageZoneOpen(false);
            }}
          />,

          <span key="d2" className="w-px h-5 flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />,

          <DockButton
            key="cmd"
            icon={<Command size={18} />}
            label="Command palette"
            kbd="⌘K"
            onClick={() => setCommandPaletteOpen(true)}
          />,

          <DockButton
            key="settings"
            icon={<Settings size={18} />}
            label="Settings"
            kbd=","
            active={panelOpen}
            onClick={() => setPanelOpen(!panelOpen)}
          />,

          <span key="d3" className="w-px h-5 flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />,

          <DockButton
            key="rec"
            icon={
              <span className="flex items-center gap-1 text-[11px] font-semibold">
                <Circle size={8} fill={recording ? "#ef4444" : "currentColor"} />
                {recording ? "Stop" : "Rec"}
              </span>
            }
            label={recording ? "Stop recording" : "Start recording"}
            kbd="⌘⇧R"
            active={recording}
            danger={recording}
            onClick={() => setRecording(!recording)}
          />,
        ]}
      </div>
    </div>
  );
}
