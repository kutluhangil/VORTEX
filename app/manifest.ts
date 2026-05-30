import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FLOW — Premium Fluid Playground",
    short_name: "FLOW",
    description:
      "Real-time WebGL fluid simulation with audio-reactive inputs, image obstacles, and curated presets.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    orientation: "any",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
