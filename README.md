<div align="center">

<br />

<img src="https://img.shields.io/badge/FLOW-v1.0-fb7185?style=for-the-badge&logoColor=white" alt="version" />
<img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="nextjs" />
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="react" />
<img src="https://img.shields.io/badge/WebGL2-Custom_GLSL-990000?style=for-the-badge&logo=webgl&logoColor=white" alt="webgl" />
<img src="https://img.shields.io/badge/TailwindCSS-v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="tailwind" />
<img src="https://img.shields.io/badge/Claude_AI-API-D97757?style=for-the-badge&logo=anthropic&logoColor=white" alt="anthropic" />
<img src="https://img.shields.io/badge/Vercel-Edge-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="vercel" />

<br /><br />

```text
 ███████╗██╗      ██████╗ ██╗    ██╗
 ██╔════╝██║     ██╔═══██╗██║    ██║
 █████╗  ██║     ██║   ██║██║ █╗ ██║
 ██╔══╝  ██║     ██║   ██║██║███╗██║
 ██║     ███████╗╚██████╔╝╚███╔███╔╝
 ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝
```

### **The fluid is the only thing.** — A premium audio-reactive WebGL2 fluid playground.

[**◆ Live Demo**](https://flow-sandy-five.vercel.app) · [Report Bug](https://github.com/kutluhangil/VORTEX/issues) · [Embed Guide](#-embedding)

</div>

---

## ✦ What is FLOW?

**FLOW** is a real-time GPU fluid simulation built on **raw WebGL2 and custom GLSL** — a modern reinterpretation of the classic Navier–Stokes "Stable Fluids" demo. But where most fluid demos are static toys, FLOW responds to the world: your **microphone** drives the fluid and beats trigger bursts, your **webcam** pushes it through optical flow, and **images or text** become obstacles the fluid carves around.

Pick from 6 physical modes and 12+ curated presets, or describe a mood and let **Claude** design a preset for you. Then capture it — PNG, 4K, MP4, GIF, a shareable link, or an embeddable iframe. All wrapped in a premium glassmorphism UI that disappears when you don't need it.

---

<details>
<summary><strong>🇹🇷 Türkçe Açıklama</strong></summary>

<br />

**FLOW**, ham WebGL2 ve özel GLSL shader'ları üzerine kurulmuş gerçek zamanlı bir GPU akışkan simülasyonudur — klasik Navier–Stokes "Stable Fluids" demosunun modern bir yorumu. Çoğu akışkan demosu statik bir oyuncakken, FLOW dünyaya tepki verir: **mikrofonunuz** akışkanı yönetir ve ritimler patlamalar tetikler, **kameranız** optik akışla onu iter, **görseller veya metin** ise akışkanın etrafından aktığı engellere dönüşür.

6 fiziksel mod ve 12+ küratörlü preset arasından seçin ya da bir ruh hali tarif edip **Claude**'un sizin için preset tasarlamasına izin verin. Sonra kaydedin — PNG, 4K, MP4, GIF, paylaşılabilir link veya gömülebilir iframe. Hepsi, ihtiyaç duymadığınızda kaybolan premium bir glassmorphism arayüzle.

</details>

---

## ⚡ Features

| Feature | Description |
|---------|-------------|
| 🎵 **Audio Reactive** | Microphone FFT (Meyda) splits into bass/mid/high bands — bass bursts the centre, highs sparkle the edges. Beat detection triggers radial bursts |
| 📷 **Webcam Optical Flow** | Block-matching optical flow turns hand motion into fluid velocity — wave at the camera and the fluid follows |
| 🖼️ **Image Obstacles** | Drop a logo or silhouette; an R8 mask makes the fluid flow around dark pixels |
| ✍️ **Text Obstacles** | Type and the fluid carves around your words live — typography meets fluid |
| 🌀 **6 Physical Modes** | Smoke · Water · Lava · Plasma · Nebula · Ink — each with its own curl, viscosity, dissipation & post-fx |
| 🎨 **12+ Curated Presets** | Aurora Nights, Volcanic, Cyber Plasma, Galactic, Holographic… palette-graded gallery |
| 🤖 **AI Preset Generation** | Describe a mood → Claude Haiku returns a sanitized JSON preset (optional, edge runtime) |
| 🎬 **One-Tap Export** | PNG · 4K PNG · MP4/WebM · animated GIF · share link · iframe embed |
| 🎭 **Cinema Mode** | UI vanishes (`H`), idle-fades after 3s — perfect for screen recording |
| ⚡ **Adaptive Quality** | FPS monitor auto-scales simulation resolution (128→1024) to hold framerate |

---

## 🛠️ Tech Stack

```text
Framework       →  Next.js 15 (App Router) · React 19 · TypeScript (strict)
Simulation      →  Raw WebGL2 · custom GLSL · half-float ping-pong FBOs
Rendering       →  Bloom (dual-Kawase) · radial sunrays · exposure tonemap
State           →  Zustand v5 (sim · render · preset · input · ui · record)
UI              →  Tailwind CSS v4 · Framer Motion · Lucide React
Audio           →  Web Audio API · Meyda (FFT / bark-band loudness)
Export          →  MediaRecorder · gif.js (worker) · canvas.toBlob
AI              →  @anthropic-ai/sdk (Claude Haiku, edge function)
Deploy          →  Vercel · Analytics · Speed Insights
```

---

## 📐 Project Structure

```text
VORTEX/
├── app/
│   ├── page.tsx               # main sim page + WebGL2 support gate
│   ├── embed/page.tsx         # embeddable widget (?preset= &interactive=)
│   ├── api/ai/preset/route.ts # Claude preset generation (edge)
│   └── api/og/route.tsx        # dynamic OG image (edge)
├── components/
│   ├── canvas/FluidCanvas.tsx # simulator + renderer lifecycle & RAF loop
│   ├── UIOverlay.tsx          # dock, panels, idle-fade, cinema mode
│   └── ui/ · modals/          # dock, command palette, preset gallery, export
├── lib/
│   ├── webgl/                 # context · shader · program · FBO utils
│   ├── sim/                   # FluidSimulator · GLSL pipeline · adaptive quality
│   ├── render/                # renderer · bloom · sunrays · display shaders
│   ├── input/                 # pointer · keyboard · audio · webcam · obstacles
│   ├── presets/               # 6 modes · 12 presets · palette · apply
│   └── export/                # snapshot · recorder · gif · share
├── store/                     # 6 Zustand stores
└── vercel.json                # headers (camera/mic perms, embed framing)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 18` · pnpm
- A WebGL2-capable browser
- *(optional)* an Anthropic API key for AI preset generation

### Local Development

```bash
# Clone the repository
git clone https://github.com/kutluhangil/VORTEX.git
cd VORTEX

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

App runs at `http://localhost:3000`.

### Environment (optional)

```bash
# .env.local
ANTHROPIC_API_KEY=        # enables AI preset generation (panel hidden if absent)
NEXT_PUBLIC_SITE_URL=     # canonical / OG / sitemap base URL
```

---

## ⌨️ Shortcuts

| Key | Action | Key | Action |
|---|---|---|---|
| `Space` | Pause / resume | `1`–`6` | Switch mode |
| `⌘K` | Command palette | `F` | Fullscreen |
| `P` | Preset gallery | `H` | Cinema mode |
| `A` | Toggle audio | `C` | Toggle camera |
| `,` | Settings | `R` | Reset |
| `⌘⇧R` | Start / stop recording | `Esc` | Close / exit |

---

## 🧠 How It Works

Each frame runs a Stable-Fluids pipeline of fragment-shader passes over ping-pong framebuffers:

```text
curl → vorticity → splats → divergence → pressure (Jacobi ×20–40)
     → gradient subtract → advect velocity → advect density → render
```

Velocity is `RG16F`, dye is `RGBA16F`, pressure/curl/divergence are `R16F` — all half-float. The renderer adds bloom, radial sunrays, an exposure tonemap, and vignette. Obstacles are an `R8` mask that zeroes velocity where the source image is dark.

---

## 📦 Embedding

```html
<iframe src="https://flow-sandy-five.vercel.app/embed?preset=aurora-nights&interactive=true"
        width="100%" height="600" frameborder="0"
        allow="camera; microphone"></iframe>
```

---

## 🔒 Security & Performance

| Category | Implementation |
|----------|----------------|
| **AI Safety** | Server-side JSON sanitization — mode/hex/range clamping on every Claude response |
| **GPU Optimization** | Half-float FBOs, cached uniform locations, fixed-res bloom/sunrays passes for 60FPS |
| **Adaptive Quality** | 1s sliding FPS window scales sim resolution down at <45fps, back up at >58fps |
| **Export Integrity** | `preserveDrawingBuffer` enabled; 4K capture resizes the buffer without nuking sim state |
| **Permissions** | Mic/camera requested on demand with a single guarded attempt + toast on denial |

---

## 🗺️ Roadmap

- [x] WebGL2 Navier–Stokes fluid pipeline (half-float ping-pong FBOs)
- [x] Bloom · sunrays · exposure tonemap post-processing
- [x] Pointer / keyboard input · idle splats · multi-touch
- [x] Audio-reactive (frequency bands) · webcam optical flow
- [x] Image & text obstacles
- [x] 6 modes · 12 curated presets · AI preset generation
- [x] Export (PNG · 4K · MP4 · GIF) · cinema mode · embed
- [x] Adaptive quality · SEO · Vercel deploy
- [ ] LUT-based mode colour crossfade
- [ ] Velocity-diffusion viscosity pass (true thickness)
- [ ] Live-wallpaper seamless-loop export

---

## 🙏 Inspiration

Pavel Dobryakov's WebGL Fluid Simulation · Jos Stam's *Stable Fluids* · Spotify Now Playing · Linear · Teenage Engineering.

---

## 📄 License

MIT — fork it, learn from it, build your own. See [LICENSE](LICENSE).

---

<div align="center">

Built with precision and imagination by [**@kutluhangil**](https://github.com/kutluhangil).

<br />

*If you find this useful, consider giving it a ⭐*

</div>
