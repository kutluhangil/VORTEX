"use client";

// Embeddable widget — /embed?preset=aurora-nights&interactive=true
// Preset/mode are applied inside FluidCanvas via applyFromURL().
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FluidCanvas } from "@/components/canvas/FluidCanvas";
import { checkWebGL2Support } from "@/lib/webgl/extensions";

function EmbedInner() {
  const params = useSearchParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (checkWebGL2Support()) setReady(true);
  }, []);

  if (!ready) return <div className="fixed inset-0 bg-black" />;

  const interactive = params.get("interactive") === "true";

  return (
    <main className="fixed inset-0 overflow-hidden bg-black">
      {/* embed={!interactive}: when interactive, mount the pointer overlay */}
      <FluidCanvas embed={!interactive} />
    </main>
  );
}

export default function EmbedPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
      <EmbedInner />
    </Suspense>
  );
}
