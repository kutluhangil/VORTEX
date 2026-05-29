"use client";

// Agent 6 (Sensor) implements canvas-to-texture pipeline
import { X } from "lucide-react";
import { useInputStore } from "@/store/useInputStore";

export function TextObstacleInput({ onClose }: { onClose: () => void }) {
  const textObstacle = useInputStore((s) => s.textObstacle);
  const setTextObstacle = useInputStore((s) => s.setTextObstacle);

  return (
    <div
      className="glass rounded-xl p-4 w-64 flex flex-col gap-3"
      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: "#f5f5f7" }}>
          Text Obstacle
        </span>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/5 transition-colors">
          <X size={12} style={{ color: "#6b6b7a" }} />
        </button>
      </div>

      <input
        type="text"
        value={textObstacle}
        onChange={(e) => setTextObstacle(e.target.value)}
        placeholder="Type something..."
        maxLength={20}
        className="w-full bg-transparent border rounded-lg px-3 py-2 text-sm outline-none transition-colors"
        style={{
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#f5f5f7",
          caretColor: "#fb7185",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(251,113,133,0.5)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
        autoFocus
      />

      <p className="text-[10px]" style={{ color: "#6b6b7a" }}>
        Fluid flows around your text in real-time.
      </p>

      {textObstacle && (
        <button
          onClick={() => setTextObstacle("")}
          className="flex items-center gap-1.5 text-[10px] transition-colors"
          style={{ color: "#6b6b7a" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fb7185")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b7a")}
        >
          <X size={10} /> Clear text
        </button>
      )}
    </div>
  );
}
