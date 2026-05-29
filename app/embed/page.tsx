"use client";

// Embeddable widget — /embed?preset=aurora-nights&mode=nebula&controls=false&interactive=true
// Agent 8 (Recorder) will implement full embed logic
import { useEffect, useState } from "react";
import { FluidCanvas } from "@/components/canvas/FluidCanvas";
import { checkWebGL2Support } from "@/lib/webgl/extensions";

export default function EmbedPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (checkWebGL2Support()) setReady(true);
  }, []);

  if (!ready) return <div className="fixed inset-0 bg-black" />;

  return (
    <main className="fixed inset-0 overflow-hidden bg-black">
      <FluidCanvas embed />
    </main>
  );
}
