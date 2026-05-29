"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { useInputStore } from "@/store/useInputStore";
import { preprocessImageObstacle } from "@/lib/input/obstacle-image";
import { cn } from "@/lib/utils/cn";

export function ImageDropZone({ onClose }: { onClose: () => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageObstacle = useInputStore((s) => s.imageObstacle);
  const setImageObstacle = useInputStore((s) => s.setImageObstacle);

  const obstacleThreshold = useInputStore((s) => s.obstacleThreshold);

  const handleFile = (file: File) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const raw = ctx.getImageData(0, 0, c.width, c.height);
      // Pre-process: threshold + normalise to 512×512
      const processed = preprocessImageObstacle(raw, 512, obstacleThreshold);
      setImageObstacle(processed);
      // Also clear any text obstacle so they don't conflict
      useInputStore.getState().setTextObstacle("");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div
      className="glass rounded-xl p-4 w-64 flex flex-col gap-3"
      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: "#f5f5f7" }}>
          Image Obstacle
        </span>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/5 transition-colors">
          <X size={12} style={{ color: "#6b6b7a" }} />
        </button>
      </div>

      <button
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file?.type.startsWith("image/")) handleFile(file);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 w-full h-20 rounded-lg",
          "border border-dashed transition-colors duration-150",
          dragging
            ? "border-[#fb7185] bg-[rgba(251,113,133,0.08)]"
            : "border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.2)]",
        )}
      >
        <Upload size={16} style={{ color: "#6b6b7a" }} />
        <span className="text-[10px]" style={{ color: "#6b6b7a" }}>
          Drop or click to upload
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {imageObstacle && (
        <button
          onClick={() => setImageObstacle(null)}
          className="flex items-center gap-1.5 text-[10px] transition-colors"
          style={{ color: "#6b6b7a" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fb7185")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b7a")}
        >
          <X size={10} /> Clear image
        </button>
      )}
    </div>
  );
}
