import { ImageResponse } from "next/og";

export const runtime = "edge";

const PRESET_GRADIENTS: Record<string, string[]> = {
  "aurora-nights": ["#0d9488", "#22d3ee", "#a3e635"],
  volcanic: ["#7f1d1d", "#dc2626", "#f97316"],
  "ocean-depths": ["#001d3d", "#0466c8", "#48cae4"],
  "cyber-plasma": ["#ff006e", "#8338ec", "#3a86ff"],
  galactic: ["#4c1d95", "#c026d3", "#fbbf24"],
  holographic: ["#a855f7", "#ec4899", "#22d3ee"],
};

const DEFAULT_GRADIENT = ["#fb7185", "#a855f7", "#22d3ee"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const preset = searchParams.get("preset") ?? "";
  const colors = PRESET_GRADIENTS[preset] ?? DEFAULT_GRADIENT;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          position: "relative",
        }}
      >
        {/* Fluid-like radial blobs */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors[0]}cc, transparent 70%)`,
            filter: "blur(40px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-25%",
            right: "-5%",
            width: "800px",
            height: "800px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors[1]}cc, transparent 70%)`,
            filter: "blur(50px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "40%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors[2]}aa, transparent 70%)`,
            filter: "blur(45px)",
            display: "flex",
          }}
        />

        {/* Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 140,
            fontWeight: 800,
            letterSpacing: "-0.05em",
            color: "#ffffff",
            zIndex: 10,
          }}
        >
          FLOW
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "rgba(255,255,255,0.7)",
            marginTop: 8,
            zIndex: 10,
          }}
        >
          Premium Fluid Playground
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
