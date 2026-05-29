"use client";

import { useEffect, useState } from "react";
import { FluidCanvas } from "@/components/canvas/FluidCanvas";
import { checkWebGL2Support } from "@/lib/webgl/extensions";

export default function Home() {
  const [support, setSupport] = useState<"loading" | "ok" | "unsupported">("loading");

  useEffect(() => {
    setSupport(checkWebGL2Support() ? "ok" : "unsupported");
  }, []);

  if (support === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="w-6 h-6 rounded-full border-2 border-[#fb7185] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (support === "unsupported") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black p-8">
        <div className="max-w-md text-center space-y-4">
          <div className="text-4xl">🌊</div>
          <h1 className="text-xl font-semibold text-white">WebGL2 Required</h1>
          <p className="text-[#a8a8b3] text-sm leading-relaxed">
            FLOW requires WebGL2, which your browser doesn&apos;t support. Try the latest version of
            Chrome, Firefox, or Safari.
          </p>
          <a
            href="https://get.webgl.org/webgl2/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs text-[#fb7185] hover:text-[#fda4af] transition-colors"
          >
            Check browser support →
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="fixed inset-0 overflow-hidden bg-black">
      <FluidCanvas />
    </main>
  );
}
