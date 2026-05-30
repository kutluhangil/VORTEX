# 🌊 FLOW

> A premium fluid playground. Audio-reactive WebGL2 fluid simulation with image & text obstacles, 12+ curated presets, and one-tap export.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![WebGL2](https://img.shields.io/badge/WebGL2-GLSL-fb7185)

FLOW is a real-time GPU fluid simulation built on raw WebGL2 and custom GLSL — a modern reinterpretation of the classic Navier–Stokes "Stable Fluids" demo, with audio reactivity, webcam optical flow, drag-and-drop obstacles, curated presets, and a premium glassmorphism UI.

## ✨ Features

- 🎵 **Audio reactive** — mic input drives the fluid; beat detection triggers bursts
- 📷 **Webcam optical flow** — wave at the camera, the fluid follows your motion
- 🖼️ **Image obstacles** — drop a logo or silhouette, fluid flows around dark pixels
- ✍️ **Text obstacles** — type, and the fluid carves around your words live
- 🌀 **6 modes** — Smoke · Water · Lava · Plasma · Nebula · Ink
- 🎨 **12+ curated presets** — Aurora Nights, Volcanic, Cyber Plasma, Galactic…
- 🤖 **AI preset generation** — describe a mood, get a preset (optional, needs API key)
- 🎬 **One-tap export** — PNG · 4K PNG · MP4/WebM · GIF · shareable link · iframe embed
- 🎭 **Cinema mode** — UI disappears (`H`), perfect for screen recording
- ⚡ **Adaptive quality** — auto-scales simulation resolution to hold framerate
- 🌑 **Premium dark UI** — floating dock, command palette (`⌘K`), glassmorphism

## 🚀 Quick start

```bash
git clone https://github.com/kutluhangil/flow
cd flow
pnpm install
pnpm dev
```

Open <http://localhost:3000>. A WebGL2-capable browser is required.

### Environment (optional)

Copy `.env.local.example` → `.env.local`:

```bash
ANTHROPIC_API_KEY=        # enables AI preset generation (gallery panel hidden if absent)
NEXT_PUBLIC_SITE_URL=     # canonical/OG/sitemap base URL
```

## ⌨️ Shortcuts

| Key | Action | Key | Action |
|---|---|---|---|
| `Space` | Pause / resume | `1`–`6` | Switch mode |
| `⌘K` | Command palette | `F` | Fullscreen |
| `P` | Preset gallery | `H` | Cinema mode |
| `A` | Toggle audio | `C` | Toggle camera |
| `,` | Settings | `R` | Reset |
| `⌘⇧R` | Start/stop recording | `Esc` | Close / exit |

## 🛠️ Tech stack

Next.js 15 (App Router) · TypeScript (strict) · **raw WebGL2 + custom GLSL** · Zustand · Framer Motion · Meyda (audio) · MediaRecorder + gif.js (export) · Tailwind CSS v4 · Vercel.

## 🧠 How it works

Each frame runs a Stable-Fluids pipeline of fragment-shader passes over ping-pong framebuffers:

```
curl → vorticity → splats → divergence → pressure (Jacobi ×20–40)
     → gradient subtract → advect velocity → advect density → render
```

Velocity is `RG16F`, dye is `RGBA16F`, pressure/curl/divergence are `R16F` — all half-float. The renderer adds bloom (dual-Kawase), radial sunrays, tonemapping, and vignette. Obstacles are an `R8` mask that zeroes velocity where the source image is dark.

## 📦 Embedding

```html
<iframe src="https://your-domain/embed?preset=aurora-nights&interactive=true"
        width="100%" height="600" frameborder="0"
        allow="camera; microphone"></iframe>
```

## 🌍 Deploy

Standard Next.js on Vercel. The AI preset and OG-image routes run on the edge. Add `ANTHROPIC_API_KEY` and `NEXT_PUBLIC_SITE_URL` in project env vars.

## 🙏 Inspiration

Pavel Dobryakov's WebGL Fluid Simulation · Jos Stam's "Stable Fluids" · Spotify Now Playing · Linear · Teenage Engineering.

## 📄 License

MIT — fork it, learn from it, build your own.

---

Made with care by [@kutluhangil](https://github.com/kutluhangil)
