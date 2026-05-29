# 🌊 FLOW

> **A premium fluid playground.** Pavel Dobryakov'un fluid sim'i 2015'te dünyayı şaşırttı. FLOW 2026'da onu yeniden yorumluyor — sese tepki veren, görüntülerin etrafından akan, küratörlü presetlere sahip, kayıt edilip paylaşılabilen bir fluid deneyimi.

```
version:   v1.0.0-blueprint
target:    Claude Code (VS Code)
stack:     Next.js 14 · WebGL2 · custom GLSL · Tone.js
deploy:    Vercel
aesthetic: deep dark · warm coral accent (#fb7185)
build:     9 specialized agents
duration:  ~2-3 hafta solo dev
```

---

## 📌 TL;DR

Mevcut fluid simulation'lar (Pavel Dobryakov, çeşitli ShaderToy demoları) görsel olarak inanılmaz, ama **statik bir deneyim**: sadece fareyle oyna, presetler güzel ama jenerik bir UI.

**FLOW** farklı:

- **Audio-Reactive:** Mikrofon veya müzik → FFT verisi fluid'e kuvvet uygular. Müzik fluid'i dans ettirir.
- **Webcam Optical Flow:** Kameraya elini sallarsan fluid hareketine takip eder
- **Image as Obstacle:** Bir görüntü sürükle bırak — fluid karanlık piksellerin etrafından akar (logo, metin, silüet)
- **Text Obstacle:** Yaz, fluid metnin etrafından akar — typography meets fluid
- **6 Mode:** Smoke · Water · Lava · Plasma · Nebula · Ink — her biri farklı viskozite, renk, post-fx
- **Curated Presets:** 12+ küratörlü görsel preset (Aurora Nights, Volcanic, Ocean Depths, Cyber Plasma...)
- **Record & Export:** 4K PNG, MP4 loop, GIF, live wallpaper
- **Cinema Mode:** UI yok olur, sadece fluid, perfect for screen recording
- **Embed:** `<iframe>` ile portfolyona arka plan olarak göm
- **Premium Dark UI:** Linear/Spotify quality, floating dock, glassmorphism

Bu dosya Claude Code için yazıldı. **9 ajan halinde organize edildi.**

İsim alternatifleri: `FLOW` (önerilen), `VORTEX`, `TIDE`, `OSMO`, `CURRENT`.

---

## 📋 İÇİNDEKİLER

1. [Vizyon & Farklılaştırıcılar](#-vizyon--farklılaştırıcılar)
2. [Tasarım Felsefesi](#-tasarım-felsefesi)
3. [Görsel Sistem](#-görsel-sistem)
4. [Teknoloji Yığını](#-teknoloji-yığını)
5. [Simülasyon Pipeline'ı](#-simülasyon-pipelineı)
6. [UI Layout](#-ui-layout)
7. [Klasör Yapısı](#-klasör-yapısı)
8. [Ajan Sistemi](#-ajan-sistemi)
9. [Mode & Preset Listesi](#-mode--preset-listesi)
10. [Performans Hedefleri](#-performans-hedefleri)
11. [Vercel Deploy](#-vercel-deploy)
12. [README Şablonu](#-readme-şablonu)

---

## 🎯 VİZYON & FARKLILAŞTIRICILAR

**Hedef:** Açtığın anda "vay" dedirten, dakikalarca oynanan, ekran kaydını kaydedip paylaşmak istediğin bir deneyim. Hem teknik bir kas hem görsel sanat.

### Mevcut Çözümler vs FLOW

| Özellik | Pavel Dobryakov | ShaderToy demos | **FLOW** |
|---|---|---|---|
| Görsel kalite | Mükemmel | Değişken | Mükemmel |
| Audio reactive | ❌ | ⚠️ (manuel) | ✅ built-in |
| Webcam input | ❌ | ❌ | ✅ optical flow |
| Image obstacle | ❌ | ❌ | ✅ drag & drop |
| Text obstacle | ❌ | ❌ | ✅ canlı |
| Curated presets | ⚠️ basic | ❌ | ✅ 12+ premium |
| Mode switching | ⚠️ tek mod | ❌ | ✅ 6 mod |
| Record/Export | ❌ | ❌ | ✅ MP4/GIF/4K |
| Embeddable | ❌ | ⚠️ | ✅ iframe + config |
| Premium UI | ❌ (basic menu) | ❌ | ✅ Linear quality |
| Cinema mode | ❌ | ❌ | ✅ UI gizle |
| Mobile | ⚠️ | ⚠️ | ✅ touch optimize |

### Hedef Etki

- ✅ Sadece açıp izlenen, hipnotize edici bir deneyim
- ✅ LinkedIn'de "müzik açıp fluid'i izle" demo'su yüksek etkileşim
- ✅ Hacker News'te Pavel'in projesi gibi viral olabilir
- ✅ Portfolyo arkaplanı olarak da çalışır (embed)
- ✅ GitHub'da open source, eğitici (Navier-Stokes WebGL'de)
- ✅ ~2-3 haftalık solo dev (en kısa proje, ama en görsel olan)

---

## 🎨 TASARIM FELSEFESİ

**Fluid is the only thing.** UI yok gibi davran. Floating dock, glassmorphism, idle'da fade out. Tek aksan: sıcak coral, fluid'in alev gibi rengini destekler ama yarışmaz.

### Prensipler

1. **The simulation is the entire stage.** Hiçbir UI elementi fluid'in görünmesini engellememeli.
2. **UI disappears when not needed.** 3 saniye etkileşim yoksa kontroller fade out.
3. **Floating, never anchored.** Hiçbir panel ekrana sabitlenmez; hep havada, gerektiğinde belirir.
4. **Glassmorphism is the language.** Backdrop blur + ince border + subtle shadow.
5. **One accent, warm.** Sıcak coral — fluid'in canlılığını destekler.
6. **Sound completes the picture.** Açıldığında müzik veya mic ile gerçek bir enstrüman gibi hissetmeli.
7. **Touch is first-class.** Mobile/tablet'te tam destek; pinch, multi-touch.

### Mood Board

- Spotify'ın "Now Playing" tam ekran modu
- Apple Music'in lyrics ekranı
- Linear app'in karanlık paneli (ama bizimki daha minimalist)
- Teenage Engineering'in OP-1 enstrümanının arayüzü
- Adobe Aero'nun floating tool dock'u
- Spline editor (3D, ama UI yaklaşımı)

---

## 🌈 GÖRSEL SİSTEM

### Renk Paleti

```css
/* Backgrounds */
--bg-void:      #000000;   /* canvas arkaplanı */
--bg-panel:     #0a0a0d;   /* floating panel */
--bg-elevated:  #14141a;   /* hover */
--bg-active:    #1c1c25;   /* active */

/* Glass (floating UI) */
--glass-bg:     rgba(10, 10, 13, 0.6);
--glass-border: rgba(255, 255, 255, 0.08);
--glass-blur:   24px;

/* Borders */
--border-faint: rgba(255, 255, 255, 0.06);
--border-soft:  rgba(255, 255, 255, 0.10);
--border-focus: var(--accent);

/* Text */
--text-primary:   #f5f5f7;
--text-secondary: #a8a8b3;
--text-muted:     #6b6b7a;
--text-faint:     #404050;

/* Accent (warm coral) */
--accent:         #fb7185;
--accent-bright:  #fda4af;
--accent-dim:     #fb718520;
--accent-glow:    #fb718540;

/* Status */
--success:  #4ade80;
--warning:  #fbbf24;
--error:    #f87171;
--recording: #ef4444;  /* kayıt sırasında pulse */
```

### Mode Renk Paletleri (her mode kendi paleti)

```css
/* Smoke */
--mode-smoke:   ['#1e1e2e', '#cdd6f4', '#74c7ec', '#cba6f7']

/* Water */
--mode-water:   ['#000d1a', '#003566', '#0077b6', '#90e0ef']

/* Lava */
--mode-lava:    ['#1a0000', '#660000', '#cc0033', '#ff6600', '#ffcc00']

/* Plasma */
--mode-plasma:  ['#1a0033', '#660066', '#ff00ff', '#00ffff', '#ffff00']

/* Nebula */
--mode-nebula:  ['#0a001a', '#3b0a4a', '#7e22ce', '#ec4899', '#fde047']

/* Ink */
--mode-ink:     ['#0a0a0a', '#262626', '#737373', '#e5e5e5', '#fafafa']
```

### Tipografi

```css
--font-display: "Inter", system-ui, sans-serif;
--font-mono:    "JetBrains Mono", monospace;

/* font-feature-settings: "calt", "liga"; */

--text-xs:   11px;  /* dock labels */
--text-sm:   12px;  /* metadata */
--text-base: 13px;  /* default UI */
--text-md:   14px;
--text-lg:   16px;  /* başlıklar */
--text-xl:   20px;
--text-2xl:  28px;  /* preset name big */
--text-stat: 32px;  /* FPS, particle count */
```

### Animasyon

- **UI fade in/out:** 240ms cubic-bezier(0.4, 0, 0.2, 1)
- **Dock buttons hover:** scale 1.08 + accent glow, 160ms
- **Panel slide-in (right):** 280ms ease-out + 16px translateX
- **Mode switch:** fluid colors crossfade 800ms (uniform interpolation)
- **Preset apply:** parameters tween 400ms
- **Recording pulse:** 1.6s sinüs scale 1.0 → 1.1
- **Idle fade:** UI 3s idle → 600ms fade to opacity 0.15 → hover restore

### Glassmorphism Recipe

```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(180%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
```

---

## 🛠️ TEKNOLOJİ YIĞINI

### Core

| Katman | Teknoloji | Sebep |
|---|---|---|
| Framework | **Next.js 14** (App Router) | Static export uyumlu, edge deploy |
| Dil | **TypeScript** (strict) | Uniform tip güvenliği |
| Sim Layer | **Raw WebGL2** (Three.js wrapper'sız) | Maximum performans, framebuffer kontrolü |
| UI | **React + Tailwind** | Floating dock + panels |
| State | **Zustand** | Sim state + UI state ayrı store |
| Audio | **Web Audio API** + **Meyda** | FFT + audio features |
| Animation | **Framer Motion** | UI transitions |
| Icons | **Lucide React** | Minimalist ikonlar |
| Video Export | **MediaRecorder API** | Canvas → MP4/WebM |
| GIF Export | **gif.js** (worker) | Loop GIF |
| AI (opsiyonel) | **Anthropic API** | Preset üretimi |
| Deploy | **Vercel** | Edge runtime |

### WebGL Tercihinin Açıklaması

Three.js'i fluid sim için **kullanmıyoruz**. Sebep:
- Fluid sim çok özel framebuffer pipeline gerektiriyor (ping-pong, half-float textures)
- Three.js bu pipeline'a fazladan abstraction katmanı koyar
- Raw WebGL2 ile daha hızlı, daha optimize, daha az dependency
- Sadece sim katmanı raw WebGL; UI tarafı normal React

### Bağımlılıklar

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "typescript": "^5.5.0",
    "tailwindcss": "^3.4.0",
    "zustand": "^4.5.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0",
    "meyda": "^5.6.0",
    "gif.js": "^0.2.0",
    "@anthropic-ai/sdk": "^0.27.0",
    "clsx": "^2.1.0",
    "nanoid": "^5.0.0"
  }
}
```

---

## 🌀 SİMÜLASYON PIPELINE'I

Fluid sim'in kalbi. Bu bölüm Agent 3'ün referans dokümanı.

### Navier-Stokes — Bilgi Lazım Olan Kadarı

İncompressible fluid hareketi şu denklemle yönetilir:

```
∂u/∂t = -(u · ∇)u + ν∇²u + F − ∇p
∇ · u = 0
```

Pratikte bunu **Jos Stam'in "Stable Fluids" yöntemiyle** GPU'da yaparız:

### Render Pipeline (her frame)

```
1. SPLAT           → Add user input forces & dye to velocity/density
                     (mouse, audio, webcam events)

2. ADVECTION       → Move velocity along itself
                     velocity_new = sample(velocity, pos - velocity * dt)

3. DIVERGENCE      → Compute ∇ · u for pressure solve

4. PRESSURE        → Jacobi iterations (20-40 step) to solve ∇²p = ∇ · u

5. GRADIENT SUB    → Subtract pressure gradient from velocity
                     velocity_clean = velocity - ∇p
                     (this makes it divergence-free)

6. DENSITY ADVECT  → Move dye/density along the clean velocity

7. RENDER          → Sample density + apply color palette → screen

8. POST-FX         → Bloom, sunrays, vignette, color grading
```

Her adım bir **fragment shader pass**. Her shader bir **framebuffer'a** yazar, sonraki shader oradan okur. **Ping-pong:** velocity ve density için iki framebuffer, sırayla yazılır.

### Framebuffer Konfigürasyonu

```ts
// Yüksek hassasiyet için half-float
const velocityFBO = createDoubleFBO({
  internalFormat: gl.RG16F,
  format: gl.RG,
  type: gl.HALF_FLOAT,
  width: simResolution,
  height: simResolution,
});

const densityFBO = createDoubleFBO({
  internalFormat: gl.RGBA16F,
  format: gl.RGBA,
  type: gl.HALF_FLOAT,
  width: dyeResolution,    // density genelde daha yüksek res
  height: dyeResolution,
});

const pressureFBO = createDoubleFBO(...);  // R16F
const divergenceFBO = createFBO(...);       // R16F (single)
const obstacleFBO = createFBO(...);          // R8 (image obstacle için)
```

### Resolution Stratejisi

- **Sim resolution:** 256 (mobile), 512 (desktop), 1024 (high-end) — fluid hesabı bu res'te
- **Dye resolution:** 1024 (mobile), 1024 (desktop), 2048 (high-end) — renk daha yüksek res'te
- **Display resolution:** native (devicePixelRatio'ya göre)
- **Dynamic:** FPS düşerse otomatik düşür (Agent 9 polisher monitor eder)

### Performance Notları

- Pressure iterations: 20 (mobile), 30 (desktop), 40 (high-end)
- Half-float (16-bit) yeterli, full-float yavaş
- `gl.FLOAT` blending bazı GPU'larda desteklenmez → `HALF_FLOAT`
- WebGL2 zorunlu (WebGL1'de half-float ekstra extension gerekir)

---

## 🖼️ UI LAYOUT

### Minimalist Yaklaşım

Ekranın **%95'i fluid canvas.** UI sadece iki şey:
- **Floating Dock** (alt orta, Mac-style) — birincil aksiyonlar
- **Side Panel** (sağ slide-in) — detaylı ayarlar, gerektiğinde

### Floating Dock (alt orta, sabit)

```
       ┌──────────────────────────────────────────────────────┐
       │  [Preset ▾] [Mode ▾] [🎤] [📷] [🖼️] [⌘K] [⚙] [● Rec]│
       └──────────────────────────────────────────────────────┘
```

- **Preset selector** — Aktif preset adı + arrow → modal aç
- **Mode selector** — Smoke/Water/Lava/Plasma/Nebula/Ink
- **🎤 Audio** — Toggle mic input
- **📷 Camera** — Toggle webcam
- **🖼️ Image** — Drag-drop area + clear button
- **⌘K** — Command palette
- **⚙ Settings** — Side panel aç
- **● Rec** — Recording mode toggle

Glassmorphism, 56px height, ortalanmış, 24px bottom offset.

### Side Panel (sağ, slide-in, 360px)

Ayrı bölümler:

- **Simulation** — Curl, viscosity, dissipation slider'ları
- **Visuals** — Bloom intensity, sunrays, vignette, color saturation
- **Inputs** — Audio sensitivity, webcam flow strength, obstacle threshold
- **Cinema Mode** — UI tamamen gizle (Esc ile geri)
- **About** — Github, credits

### Command Palette (⌘K)

Linear/Raycast tarzı. Hızlı aksiyonlar:
- "Apply preset: Aurora Nights"
- "Switch mode: Lava"
- "Start recording"
- "Toggle webcam"
- "Save current as preset"
- "Reset"

Fuzzy search.

### Recording Mode

- Top: pulsing red dot + timer (`00:14`)
- Bottom: stop button
- UI başka şey yok
- ESC ile durdur

### Cinema Mode

- TÜM UI gone
- Sadece fluid + cursor
- F11 fullscreen
- ESC ile çık

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Space` | Pause/resume sim |
| `⌘K` | Command palette |
| `M` | Mute audio |
| `C` | Toggle camera |
| `R` | Reset / clear |
| `S` | Save preset |
| `1-6` | Switch mode |
| `F` | Fullscreen |
| `H` | Hide UI (cinema) |
| `Esc` | Exit cinema / close panels |
| `,` | Open settings panel |
| `⌘+Shift+R` | Start/stop recording |

---

## 📁 KLASÖR YAPISI

```
flow/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # ana sim sayfası
│   ├── embed/page.tsx                # embeddable widget
│   ├── globals.css
│   └── api/
│       └── ai/preset/route.ts        # AI preset üretimi (opsiyonel)
│
├── components/
│   ├── canvas/
│   │   ├── FluidCanvas.tsx           # ana WebGL canvas + lifecycle
│   │   └── CanvasOverlay.tsx         # touch/mouse event layer
│   │
│   ├── ui/
│   │   ├── Dock.tsx                  # floating dock
│   │   ├── DockButton.tsx
│   │   ├── PresetSelector.tsx
│   │   ├── ModeSelector.tsx
│   │   ├── SidePanel.tsx
│   │   ├── CommandPalette.tsx
│   │   ├── RecordingIndicator.tsx
│   │   ├── ImageDropZone.tsx
│   │   ├── TextObstacleInput.tsx
│   │   └── primitives/
│   │       ├── Slider.tsx
│   │       ├── Toggle.tsx
│   │       ├── Tooltip.tsx
│   │       └── Glass.tsx             # glassmorphism wrapper
│   │
│   └── modals/
│       ├── PresetGallery.tsx
│       ├── ExportModal.tsx
│       └── ShareModal.tsx
│
├── lib/
│   ├── webgl/
│   │   ├── context.ts                # WebGL2 context setup
│   │   ├── shader.ts                 # shader compilation utils
│   │   ├── program.ts                # program linking
│   │   ├── fbo.ts                    # framebuffer + double FBO
│   │   ├── texture.ts                # texture utils
│   │   └── extensions.ts             # required extensions check
│   │
│   ├── sim/
│   │   ├── simulator.ts              # ana sim class (lifecycle)
│   │   ├── pipeline.ts               # render passes orchestration
│   │   ├── splat.ts                  # input → splat
│   │   ├── advection.ts              # advection pass
│   │   ├── pressure.ts               # pressure solve (Jacobi)
│   │   ├── divergence.ts             # divergence pass
│   │   ├── gradient.ts               # gradient subtract pass
│   │   ├── curl.ts                   # vorticity confinement
│   │   ├── obstacles.ts              # obstacle texture handling
│   │   └── shaders/
│   │       ├── splat.frag.glsl
│   │       ├── advection.frag.glsl
│   │       ├── pressure.frag.glsl
│   │       ├── divergence.frag.glsl
│   │       ├── gradient.frag.glsl
│   │       ├── curl.frag.glsl
│   │       ├── vorticity.frag.glsl
│   │       ├── clear.frag.glsl
│   │       ├── copy.frag.glsl
│   │       └── base.vert.glsl
│   │
│   ├── render/
│   │   ├── renderer.ts               # final render + post-fx
│   │   ├── bloom.ts                  # bloom passes
│   │   ├── sunrays.ts                # sunrays effect
│   │   └── shaders/
│   │       ├── display.frag.glsl     # density → screen
│   │       ├── bloom-prefilter.frag.glsl
│   │       ├── bloom-blur.frag.glsl
│   │       ├── bloom-final.frag.glsl
│   │       ├── sunrays.frag.glsl
│   │       └── vignette.frag.glsl
│   │
│   ├── input/
│   │   ├── pointer.ts                # mouse + touch unified
│   │   ├── audio.ts                  # mic + file FFT
│   │   ├── webcam.ts                 # webcam + optical flow
│   │   ├── obstacle-image.ts         # image → obstacle texture
│   │   └── obstacle-text.ts          # text → canvas → texture
│   │
│   ├── presets/
│   │   ├── definitions.ts            # 12+ preset config
│   │   ├── modes.ts                  # 6 mode config
│   │   └── apply.ts                  # preset → sim params
│   │
│   ├── export/
│   │   ├── snapshot.ts               # PNG export
│   │   ├── recorder.ts               # MediaRecorder wrapper
│   │   ├── gif.ts                    # gif.js worker
│   │   └── share.ts                  # share link / URL config
│   │
│   ├── ai/
│   │   └── generate-preset.ts        # AI preset generation
│   │
│   └── utils/
│       ├── cn.ts
│       ├── debounce.ts
│       └── format.ts
│
├── store/
│   ├── useSimStore.ts                # sim params (curl, viscosity, ...)
│   ├── usePresetStore.ts             # active preset, custom presets
│   ├── useInputStore.ts              # audio, camera, image, text on/off
│   ├── useUIStore.ts                 # dock visible, panel open, cinema
│   └── useRecordStore.ts             # recording state
│
├── public/
│   ├── presets/
│   │   └── thumbnails/               # preset preview images
│   ├── og.png
│   └── favicon.svg
│
├── tests/
│   └── sim/
│       └── pipeline.test.ts
│
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── vercel.json
├── package.json
├── README.md
└── .env.local.example
```

---

## 🤖 AJAN SİSTEMİ

**9 specialized agent.** Sırayla çalışacak. Her ajan kendi alanına sahip.

### Ajanlar Genel Görünüm

```
[1] ARCHITECT       →  Proje iskeleti, store'lar, layout, canvas mount
[2] AESTHETICIAN    →  Design system, glassmorphism, dock, side panel
[3] SIM ENGINEER    →  WebGL2 fluid pipeline (THE CORE — en büyük ajan)
[4] PAINTER         →  Final render + bloom + sunrays + post-fx
[5] INTERACTOR      →  Mouse/touch/keyboard input → splats
[6] SENSOR          →  Audio reactive + webcam + image/text obstacles
[7] CURATOR         →  12+ preset + 6 mode + AI preset generation
[8] RECORDER        →  PNG/MP4/GIF export + cinema mode + embed
[9] POLISHER        →  Vercel deploy + SEO + adaptive resolution + README
```

### Bağımlılık Grafiği

```
[1] ──┬──> [2]
      ├──> [3] ──> [4] ──┬──> [5]
      │                  ├──> [6]
      │                  └──> [7]
      │                       └──> [8]
      └──> [9] (son adım)
```

---

### 🟢 AJAN 1 — THE ARCHITECT

**Rol:** Proje temeli. Next.js + TypeScript + Tailwind + Zustand + canvas mount.

**Sahip Olduğu Dosyalar:**
- `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `vercel.json`
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- `store/useSimStore.ts`, `usePresetStore.ts`, `useInputStore.ts`, `useUIStore.ts`, `useRecordStore.ts` (iskelet)
- `components/canvas/FluidCanvas.tsx`, `CanvasOverlay.tsx` (boş iskelet)
- `lib/utils/cn.ts`, `debounce.ts`
- `lib/webgl/extensions.ts` (browser support check)
- `.env.local.example`, `.gitignore`

**Görevler:**

1. Next.js 14 App Router + TypeScript strict kur
2. Tailwind config: CSS variables, custom theme
3. Tüm klasör yapısını oluştur (boş dosyalar veya `// TODO` ile)
4. Fontlar: Inter + JetBrains Mono (`next/font`)
5. **Root layout:** pure black bg, viewport fit, no scroll, no margins
6. **app/page.tsx:**
   - Fullscreen canvas wrapper
   - WebGL2 support check (yoksa fallback mesaj)
   - Loading state placeholder
7. **FluidCanvas component:**
   ```tsx
   const FluidCanvas = () => {
     const canvasRef = useRef<HTMLCanvasElement>(null);
     useEffect(() => {
       // Agent 3 burayı dolduracak
     }, []);
     return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" />;
   };
   ```
8. **Zustand store iskeletleri:**
   ```ts
   // useSimStore
   interface SimState {
     curl: number;
     viscosity: number;
     dissipation: number;
     pressureIterations: number;
     simResolution: number;
     dyeResolution: number;
     paused: boolean;
     // actions
   }
   ```
9. **WebGL2 Support Check** (`lib/webgl/extensions.ts`):
   - WebGL2 context dene
   - Required extensions: EXT_color_buffer_float
   - Yoksa: friendly fallback page
10. ESLint + Prettier + Husky

**Acceptance Criteria:**
- `pnpm dev` çalışıyor, siyah ekranda placeholder canvas
- `pnpm build` başarılı, 0 type error
- WebGL2 destekleyen tarayıcıda: "Ready"
- Desteklemeyende: friendly error page
- Stores devtools'ta görünüyor
- Mobile responsive (viewport ayarları doğru)

---

### 🎨 AJAN 2 — THE AESTHETICIAN

**Rol:** Floating UI sistemi. Dock, side panel, command palette, glassmorphism.

**Sahip Olduğu Dosyalar:**
- `app/globals.css` (CSS variables)
- `components/ui/primitives/*.tsx` (Glass, Slider, Toggle, Tooltip)
- `components/ui/Dock.tsx`, `DockButton.tsx`
- `components/ui/PresetSelector.tsx`, `ModeSelector.tsx`
- `components/ui/SidePanel.tsx`
- `components/ui/CommandPalette.tsx`
- `components/ui/RecordingIndicator.tsx`
- `components/modals/PresetGallery.tsx`, `ExportModal.tsx`, `ShareModal.tsx` (UI iskeleti)

**Görevler:**

1. **CSS Variables:** Tüm renk, glass, animasyon değerleri `globals.css`'e
2. **Glass primitive** — glassmorphism wrapper component
3. **Dock:**
   - Floating, bottom-center, 24px offset
   - Glass styling (blur + border + shadow)
   - 8 button: Preset, Mode, Audio, Camera, Image, ⌘K, Settings, Rec
   - Her button 40x40, hover scale 1.08, accent glow
   - Tooltips (kbd shortcuts gösteriliyor)
   - Active state (mic/camera açıkken accent renkte)
4. **Idle Fade Logic:**
   - 3 saniye mouse hareketi yoksa UI opacity 0.15'e fade
   - Mouse hareketi → 600ms fade in
   - Recording sırasında idle fade DEVRE DIŞI
5. **Side Panel:**
   - Slide-in from right, 360px
   - Sections: Simulation, Visuals, Inputs, Cinema Mode, About
   - Her section: title + sliders/toggles
   - Slider component (accent colored, custom thumb)
   - Glass background
6. **Preset Selector:**
   - Dock'tan tıklanınca: tam ekran modal (PresetGallery)
   - Grid view, her preset: thumbnail + name + mode badge
   - Hover: live preview (mini animasyon)
   - Click: apply (Agent 7 logic'i bağlayacak)
7. **Mode Selector:**
   - Dock'tan tıklanınca: küçük popover
   - 6 mode: ikon + isim + renk dot
8. **Command Palette:**
   - ⌘K ile aç, fuzzy search
   - Glass full-width modal, üstte input, altında results
   - Linear/Raycast quality
9. **Recording Indicator:**
   - Top-center, glass pill
   - Pulsing red dot + `00:14` timer
   - Sadece recording sırasında görünür
10. **Toggle, Tooltip, primitives** — accent renk, smooth transitions
11. **Cinema Mode:**
    - Tüm UI elements `data-cinema-mode="true"` ile gizlenir
    - Cursor görünür kalır
    - ESC ile çık

**Acceptance Criteria:**
- Dock floating, glassmorphism net
- Idle fade çalışıyor (3s sonra solar, hareket edince geri gelir)
- Side panel slide-in smooth
- Command palette ⌘K ile açılıyor, fuzzy search
- Tüm tooltip'lerde kbd shortcuts var
- Mobile'da dock alt'ta, tappable
- Accessibility 100 (aria-labels, keyboard nav)

---

### ⚙️ AJAN 3 — THE SIM ENGINEER

**Rol:** WebGL2 fluid pipeline. **Bu projenin kalbi. En büyük ajan, en kritik.**

**Sahip Olduğu Dosyalar:**
- `lib/webgl/context.ts`, `shader.ts`, `program.ts`, `fbo.ts`, `texture.ts`
- `lib/sim/simulator.ts`, `pipeline.ts`
- `lib/sim/splat.ts`, `advection.ts`, `pressure.ts`, `divergence.ts`, `gradient.ts`, `curl.ts`, `obstacles.ts`
- `lib/sim/shaders/*.glsl`
- `components/canvas/FluidCanvas.tsx` (sim mount logic)

**Görevler:**

1. **WebGL2 Context Setup** (`context.ts`):
   - `canvas.getContext('webgl2', { alpha: false, antialias: false, preserveDrawingBuffer: false })`
   - Enable EXT_color_buffer_float
   - DPR handling
   - Resize observer → canvas resize + FBO recreate

2. **Shader Utils** (`shader.ts`, `program.ts`):
   - Compile vertex/fragment shader
   - Link program
   - Cache uniform locations
   - Error reporting (compile log)

3. **FBO Utils** (`fbo.ts`):
   - `createFBO({ width, height, internalFormat, format, type, param })`
   - `createDoubleFBO(...)` → `{ read, write, swap() }` (ping-pong)
   - Texture binding helpers

4. **Vertex Shader** (`base.vert.glsl`) — Tüm sim shader'ları için:
   ```glsl
   #version 300 es
   precision highp float;
   in vec2 aPosition;
   out vec2 vUv;
   out vec2 vL, vR, vT, vB;
   uniform vec2 texelSize;
   void main () {
     vUv = aPosition * 0.5 + 0.5;
     vL = vUv - vec2(texelSize.x, 0.0);
     vR = vUv + vec2(texelSize.x, 0.0);
     vT = vUv + vec2(0.0, texelSize.y);
     vB = vUv - vec2(0.0, texelSize.y);
     gl_Position = vec4(aPosition, 0.0, 1.0);
   }
   ```

5. **Fragment Shaders:**

   **`splat.frag.glsl`** — input force ve dye eklemesi:
   ```glsl
   uniform sampler2D uTarget;
   uniform float aspectRatio;
   uniform vec3 color;
   uniform vec2 point;
   uniform float radius;
   in vec2 vUv;
   out vec4 outColor;
   void main () {
     vec2 p = vUv - point.xy;
     p.x *= aspectRatio;
     vec3 splat = exp(-dot(p, p) / radius) * color;
     vec3 base = texture(uTarget, vUv).xyz;
     outColor = vec4(base + splat, 1.0);
   }
   ```

   **`advection.frag.glsl`** — semi-Lagrangian advection:
   ```glsl
   uniform sampler2D uVelocity;
   uniform sampler2D uSource;
   uniform vec2 texelSize;
   uniform float dt;
   uniform float dissipation;
   in vec2 vUv;
   out vec4 outColor;
   void main () {
     vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
     vec4 result = texture(uSource, coord);
     float decay = 1.0 + dissipation * dt;
     outColor = result / decay;
   }
   ```

   **`divergence.frag.glsl`:**
   ```glsl
   uniform sampler2D uVelocity;
   in vec2 vUv, vL, vR, vT, vB;
   out vec4 outColor;
   void main () {
     float L = texture(uVelocity, vL).x;
     float R = texture(uVelocity, vR).x;
     float T = texture(uVelocity, vT).y;
     float B = texture(uVelocity, vB).y;
     outColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
   }
   ```

   **`pressure.frag.glsl`** — Jacobi iteration:
   ```glsl
   uniform sampler2D uPressure;
   uniform sampler2D uDivergence;
   in vec2 vUv, vL, vR, vT, vB;
   out vec4 outColor;
   void main () {
     float L = texture(uPressure, vL).x;
     float R = texture(uPressure, vR).x;
     float T = texture(uPressure, vT).x;
     float B = texture(uPressure, vB).x;
     float C = texture(uPressure, vUv).x;
     float divergence = texture(uDivergence, vUv).x;
     float pressure = (L + R + B + T - divergence) * 0.25;
     outColor = vec4(pressure, 0.0, 0.0, 1.0);
   }
   ```

   **`gradient.frag.glsl`** — pressure gradient subtract:
   ```glsl
   uniform sampler2D uPressure;
   uniform sampler2D uVelocity;
   in vec2 vUv, vL, vR, vT, vB;
   out vec4 outColor;
   void main () {
     float L = texture(uPressure, vL).x;
     float R = texture(uPressure, vR).x;
     float T = texture(uPressure, vT).x;
     float B = texture(uPressure, vB).x;
     vec2 velocity = texture(uVelocity, vUv).xy;
     velocity.xy -= vec2(R - L, T - B);
     outColor = vec4(velocity, 0.0, 1.0);
   }
   ```

   **`curl.frag.glsl`** ve **`vorticity.frag.glsl`** — vorticity confinement (turbulent look için).

6. **Simulator Class** (`simulator.ts`):
   ```ts
   class FluidSimulator {
     constructor(canvas, options);
     start(): void;
     stop(): void;
     resize(): void;
     step(dt: number): void;  // bir frame
     splat(x, y, dx, dy, color): void;  // dış input
     setObstacle(texture): void;
     reset(): void;
     getDensityTexture(): WebGLTexture;  // Agent 4 render edecek
   }
   ```

7. **Pipeline Orchestration** (`pipeline.ts`):
   - Her frame:
     1. Apply splats (queued from Agent 5 & 6)
     2. Curl + vorticity (turbulence)
     3. Diffuse velocity (Jacobi N iter)
     4. Apply obstacles (mask velocity)
     5. Divergence
     6. Clear pressure
     7. Pressure solve (Jacobi N iter)
     8. Gradient subtract
     9. Advect velocity
     10. Advect density
   - Tüm passes RAF içinde

8. **Obstacle Texture:**
   - `obstacles.ts`: image/text → grayscale → R8 texture
   - Sim'de: obstacle mask uygula (advection sırasında black pixel'lerde velocity = 0)

9. **Adaptive Resolution:**
   - FPS monitor (1s sliding average)
   - FPS < 45 → resolution düşür (Agent 9 polish edecek)
   - useSimStore'a hook

**Acceptance Criteria:**
- Fluid sim çalışıyor, mouse drag → splat
- 60fps desktop, 30fps+ mobile
- Half-float textures (RG16F, RGBA16F) doğru kullanılıyor
- Pressure iterations parametrik (20-40)
- Reset çalışıyor
- No memory leaks (FBO cleanup on unmount)
- WebGL hataları console'da temiz

---

### 🎨 AJAN 4 — THE PAINTER

**Rol:** Final render + post-processing. Bloom, sunrays, vignette. Fluid'i sanat eserine çevirir.

**Sahip Olduğu Dosyalar:**
- `lib/render/renderer.ts`
- `lib/render/bloom.ts`
- `lib/render/sunrays.ts`
- `lib/render/shaders/*.glsl`

**Görevler:**

1. **Display Shader** (`display.frag.glsl`):
   - Density texture'ı sample et
   - Color palette uygula (mode'a göre, gradient mapping)
   - Output: ekran

2. **Bloom Pipeline:**
   - **Prefilter pass:** threshold uygula, parlak pikseller geçer
   - **Downsample 3-4 mip:** progressive blur (her seviyede half resolution)
   - **Upsample + combine:** mip seviyeleri toplanır
   - **Final combine:** original + bloom

   Bu, fluid'in çok parlak bölgelerinde "glow" yaratır — büyüleyici görüntü.

3. **Sunrays Effect:**
   - Center'dan radial blur
   - Density texture'ı kaynak alır
   - 32 sample, varying weights
   - Pavel Dobryakov sim'inde meşhur efekt
   - Toggleable (Plasma/Nebula mode'ta açık, Smoke'ta kapalı)

4. **Vignette:**
   - Köşeleri karartır
   - Premium feel
   - Toggleable

5. **Color Palette Mapping:**
   - Density value (grayscale veya RGB) → palette color
   - Her mode kendi palette'i (smoke gri, lava kırmızı-turuncu vs)
   - Smooth gradient interpolation
   - LUT (lookup texture) yaklaşımı veya inline GLSL gradient

6. **Renderer Class:**
   ```ts
   class Renderer {
     constructor(gl, simulator);
     render(): void;  // RAF callback
     setMode(mode: ModeType): void;
     setBloomEnabled(b: boolean): void;
     setSunraysEnabled(b: boolean): void;
     setVignetteEnabled(b: boolean): void;
   }
   ```

7. **RAF Loop:**
   ```ts
   function loop(time) {
     const dt = (time - lastTime) / 1000;
     simulator.step(dt);
     renderer.render();
     lastTime = time;
     raf = requestAnimationFrame(loop);
   }
   ```

8. **Hidden Tab Pause:**
   - Page Visibility API → tab gizliyse RAF pause
   - GPU/battery save

9. **Performance:**
   - Bloom passes performans tüketir → mobile'da daha az pass
   - Adaptive bloom quality

**Acceptance Criteria:**
- Fluid ekranda görünüyor (Sim Engineer'ın density'sini render ediyor)
- Bloom efekti net (parlak fluid bölgeleri glow yapıyor)
- Sunrays açıkken radial ışık huzmesi var
- Vignette köşeleri karartıyor
- Mode değişimi → renkler smooth crossfade (800ms)
- 60fps korunuyor

---

### 🖱️ AJAN 5 — THE INTERACTOR

**Rol:** Kullanıcı input'larını fluid'e bağla. Mouse, touch, keyboard.

**Sahip Olduğu Dosyalar:**
- `lib/input/pointer.ts`
- `components/canvas/CanvasOverlay.tsx`
- Hooks: `useKeyboardShortcuts.ts`

**Görevler:**

1. **Unified Pointer System:**
   - Mouse + touch + pen → tek API
   - Pointer events (modern, hepsini destekler)
   - Multi-touch desteği (mobile için zorunlu)
   - Pinch ignore (zoom değil, sim için)

2. **Pointer → Splat:**
   - PointerMove: position değişimi
   - Delta vector: önceki pos - şimdiki pos → velocity vector
   - Splat call:
     ```ts
     simulator.splat(x, y, dx * splatForce, dy * splatForce, color);
     ```
   - Color: aktif mode palette'ten random veya position-based

3. **Click vs Drag:**
   - Click: tek splat, küçük
   - Drag: continuous splats, hareket boyunca

4. **Random Splats (Idle):**
   - 3 saniye etkileşim yoksa, otomatik random splats
   - Yumuşak, decoration purpose
   - Kullanıcı tekrar etkileşim verince durur

5. **Splat Properties:**
   - `splatForce` — kullanıcı slider'ı (sim store'da)
   - `splatRadius` — slider
   - `splatColor` — mode'a göre random palette renk

6. **Touch Optimizations:**
   - touch-action: none (browser scroll engelle)
   - Tap delay yok
   - Multi-touch: her parmak ayrı splat trail

7. **Keyboard Shortcuts** (`useKeyboardShortcuts.ts`):
   - Space: pause/resume
   - R: reset
   - 1-6: mode değiştir
   - F: fullscreen
   - H: cinema mode
   - Esc: exit cinema / close panels
   - ⌘+R: recording start/stop
   - Tüm shortcuts Tooltip'lerde gösteriliyor (Agent 2 zaten yaptı)

8. **Mobile Considerations:**
   - Tap on dock buttons → expand to larger touch target
   - Pull-to-refresh disable
   - iOS Safari address bar handle

**Acceptance Criteria:**
- Mouse drag → fluid trail bırakıyor (smooth)
- Touch drag mobile'da çalışıyor
- Multi-touch ile 2 parmak 2 trail
- Idle 3s → random splats başlıyor
- Keyboard shortcuts tümü çalışıyor
- Tap delay yok, responsive

---

### 📡 AJAN 6 — THE SENSOR

**Rol:** Dış dünyayı fluid'e bağla. Audio, webcam, image/text obstacles. **Killer differentiator.**

**Sahip Olduğu Dosyalar:**
- `lib/input/audio.ts`
- `lib/input/webcam.ts`
- `lib/input/obstacle-image.ts`
- `lib/input/obstacle-text.ts`
- `components/ui/ImageDropZone.tsx`
- `components/ui/TextObstacleInput.tsx`

**Görevler:**

1. **Audio Input (Mic + File):**

   **Mic:**
   - `getUserMedia({ audio: true })`
   - AudioContext + AnalyserNode + Meyda
   - FFT size: 2048, smoothing 0.8
   - Features: `loudness`, `spectralCentroid`, `energy`, fft bands

   **File:**
   - Drag-drop MP3/WAV → AudioBuffer
   - Play controls

   **Audio → Splat Mapping:**
   - Bass enerji yüksek → büyük splat, merkezde
   - Mid enerji → orta splat, random pozisyonda
   - High enerji → küçük splat, kenarlarda
   - Beat detection → güçlü splat burst
   - Toggle on/off + sensitivity slider

2. **Webcam Optical Flow:**

   - `getUserMedia({ video: true })`
   - VideoTexture'a render
   - **Optical flow algorithm:**
     - Previous frame'i sakla
     - Current vs previous → block matching veya Lucas-Kanade (basit versiyon)
     - Velocity field çıkar
     - Bu velocity field'i fluid'in velocity texture'ına ekle
   - Sonuç: kameraya elini sallarsan fluid o yönde akar
   - Toggle + flow strength slider
   - Mirror option

3. **Image Obstacle:**

   **`obstacle-image.ts`:**
   - Drag-drop image → canvas → grayscale → R8 texture
   - Threshold slider: pikseller hangi koyuluktan sonra obstacle
   - Sim'de: obstacle mask uygulanır, fluid karanlık piksellerin etrafından akar
   - Use case: logo, silüet, sanat eseri → fluid o şeklin etrafından akıyor (büyüleyici)
   - Clear button

   **`components/ui/ImageDropZone.tsx`:**
   - Dock'taki 🖼️ butonuna tıklayınca drop zone aç
   - Drag-drop area, hover'da accent border
   - Preview thumbnail
   - Threshold slider
   - Clear button

4. **Text Obstacle:**

   **`obstacle-text.ts`:**
   - Text input → canvas'a render (large font, white text on black) → R8 texture
   - Fluid metnin pikselleri etrafından akar
   - Effekt: yazı yazıyormuş gibi, fluid otomatik şekillenir
   - Font: çok büyük (canvas size'a göre), Inter Bold

   **`components/ui/TextObstacleInput.tsx`:**
   - Floating input area (dock'tan açılır)
   - Live: yazdıkça texture güncellenir
   - Clear button
   - Font size slider

5. **Sensor Settings (Side Panel):**
   - Audio: sensitivity, beat threshold, frequency bands
   - Webcam: flow strength, mirror
   - Obstacle: threshold, opacity in render

**Acceptance Criteria:**
- Mic açıkken konuşunca fluid pulse atıyor, müzikle dans ediyor
- Webcam açıkken el sallayınca fluid hareketi takip ediyor
- Image yükleyince fluid o image'in karanlık piksellerinden geçmiyor (etrafından akıyor)
- Text yazınca fluid harflerin etrafından akıyor
- Tüm sensor'lar toggle edilebiliyor
- Permission denied → friendly mesaj

---

### 🎭 AJAN 7 — THE CURATOR

**Rol:** Görsel preset koleksiyonu. 12+ küratörlü preset, 6 mode, AI preset generation.

**Sahip Olduğu Dosyalar:**
- `lib/presets/definitions.ts`
- `lib/presets/modes.ts`
- `lib/presets/apply.ts`
- `lib/ai/generate-preset.ts`
- `app/api/ai/preset/route.ts`
- `public/presets/thumbnails/*.png`

**Görevler:**

1. **6 Mode (görsel + fiziksel karakter):**

   ```ts
   const modes: Mode[] = [
     {
       id: 'smoke',
       name: 'Smoke',
       palette: ['#1e1e2e', '#cdd6f4', '#74c7ec', '#cba6f7'],
       params: { curl: 18, viscosity: 0.0001, dissipation: 0.3, splatRadius: 0.4 },
       bloom: 0.6, sunrays: 0.4, vignette: 0.5,
     },
     {
       id: 'water',
       name: 'Water',
       palette: ['#000d1a', '#003566', '#0077b6', '#90e0ef'],
       params: { curl: 8, viscosity: 0.001, dissipation: 0.5, splatRadius: 0.3 },
       bloom: 0.3, sunrays: 0.2, vignette: 0.3,
     },
     {
       id: 'lava',
       name: 'Lava',
       palette: ['#1a0000', '#660000', '#cc0033', '#ff6600', '#ffcc00'],
       params: { curl: 35, viscosity: 0.003, dissipation: 0.1, splatRadius: 0.5 },
       bloom: 1.0, sunrays: 0.8, vignette: 0.4,
     },
     {
       id: 'plasma',
       name: 'Plasma',
       palette: ['#1a0033', '#660066', '#ff00ff', '#00ffff', '#ffff00'],
       params: { curl: 50, viscosity: 0.0, dissipation: 0.2, splatRadius: 0.35 },
       bloom: 1.2, sunrays: 1.0, vignette: 0.2,
     },
     {
       id: 'nebula',
       name: 'Nebula',
       palette: ['#0a001a', '#3b0a4a', '#7e22ce', '#ec4899', '#fde047'],
       params: { curl: 25, viscosity: 0.0, dissipation: 0.05, splatRadius: 0.6 },
       bloom: 1.5, sunrays: 1.2, vignette: 0.6,
     },
     {
       id: 'ink',
       name: 'Ink',
       palette: ['#0a0a0a', '#262626', '#737373', '#e5e5e5', '#fafafa'],
       params: { curl: 12, viscosity: 0.0005, dissipation: 0.4, splatRadius: 0.4 },
       bloom: 0.2, sunrays: 0.0, vignette: 0.3,
     },
   ];
   ```

2. **12+ Curated Presets:**

   Her preset bir mode + tweaked params + isim + thumbnail. Örnekler:

   - **Aurora Nights** (nebula base, soft greens & purples)
   - **Volcanic** (lava base, intense)
   - **Ocean Depths** (water base, dark blue)
   - **Cyber Plasma** (plasma base, neon)
   - **Galactic** (nebula base, cosmic)
   - **Midnight Ink** (ink base, brush stroke feel)
   - **Sunrise** (lava base softened)
   - **Arctic Mist** (smoke base, cold)
   - **Cherry Blossom** (smoke base, pink palette)
   - **Burning Wire** (plasma base, electric)
   - **Forest Spirit** (water base, green-teal)
   - **Holographic** (plasma base, iridescent)

3. **Apply Logic** (`apply.ts`):
   - `applyPreset(presetId)` → useSimStore + useRendererStore params update
   - Smooth tween: parameters 400ms cubic over current → target
   - Renderer mode change → palette crossfade

4. **PresetGallery Modal:**
   - Full-screen grid
   - Her preset: thumbnail (2-3s loop GIF veya PNG) + name + mode badge
   - Hover: zoom preview
   - Click: apply, modal kapanır

5. **User Custom Presets:**
   - "Save current as preset" — settings'ten
   - localStorage'da
   - User preset'lerin gallery'de "My Presets" bölümü

6. **AI Preset Generation** (opsiyonel ama killer):

   `/api/ai/preset` Edge Function:
   - User prompt: "make it feel like a thunderstorm"
   - Anthropic Claude Haiku
   - System prompt:
     ```
     You are a fluid simulation visual designer. Given a user's mood/theme prompt,
     generate a preset config as JSON with: mode, palette (5 hex colors),
     params (curl 0-50, viscosity 0-0.005, dissipation 0-1, splatRadius 0.1-1),
     bloom (0-2), sunrays (0-2), vignette (0-1).
     ```
   - Output: JSON → parse → apply
   - "Generate with AI" button presetgallery'de

**Acceptance Criteria:**
- 6 mode çalışıyor, görsel karakter belirgin farklı
- 12+ preset gallery'de, thumbnail'ler hazır
- Preset apply → params smooth tween
- AI preset üretimi çalışıyor (bir prompt → yeni preset)
- User custom preset save/load çalışıyor
- Mode değişimi color crossfade 800ms

---

### 🎬 AJAN 8 — THE RECORDER

**Rol:** Export & sharing. PNG, MP4, GIF, embed, cinema mode.

**Sahip Olduğu Dosyalar:**
- `lib/export/snapshot.ts`, `recorder.ts`, `gif.ts`, `share.ts`
- `components/modals/ExportModal.tsx`, `ShareModal.tsx` (logic bağlama)
- `components/ui/RecordingIndicator.tsx` (logic bağlama)
- `app/embed/page.tsx`

**Görevler:**

1. **PNG Snapshot:**
   - `canvas.toBlob('image/png')` → download
   - Resolution: native veya 2x/4x upscale
   - 4K mode: canvas geçici olarak 3840x2160'a resize, render, capture, restore

2. **Video Recording (MediaRecorder):**
   - `canvas.captureStream(60)` → MediaRecorder
   - Format: WebM (VP9) veya MP4 (H.264 mobile destekli yerlerde)
   - Bit rate: yüksek (10 Mbps for quality)
   - Start/stop API
   - Limits: max 60s recording (memory)
   - Cinema mode otomatik aktif (recording sırasında UI gizli)
   - Recording sırasında pulsing red dot + timer

3. **GIF Export:**
   - gif.js worker
   - Frame capture every ~33ms (30fps)
   - Duration: 2s / 3s / 5s seçenekleri
   - Quality: 10 (1-30, lower = better)
   - Optimize: palette quantization
   - Download

4. **Live Wallpaper Export:**
   - Seamless loop oluştur (start frame = end frame)
   - 1080p veya 4K seçenekleri
   - 30s veya 60s loop
   - Mobile wallpaper (1080x1920) veya desktop (3840x2160)

5. **Share / URL Config:**
   - Current preset + mode → URL params
   - `flow.dev/?preset=aurora-nights&mode=nebula`
   - Open: URL'den preset apply
   - Share button: copy link, Twitter, LinkedIn

6. **Embed Widget** (`/embed`):
   - URL params: preset, mode, controls (true/false), interactive (true/false)
   - Sadece canvas, UI yok (veya minimal)
   - `<iframe>` ile portfolyolara gömme
   - Embed code copy: `<iframe src="https://flow.dev/embed?preset=...">`

7. **Cinema Mode:**
   - H tuşu veya ⌘+Shift+H
   - Tüm UI gizlenir
   - Cursor görünür (opsiyonel: cursor da gizle, 3s sonra)
   - ESC ile çık
   - Recording başlatınca otomatik cinema mode

8. **Export Modal UI:**
   - Format tabs: PNG / MP4 / GIF / Wallpaper
   - Quality settings
   - Duration (video/gif)
   - Preview thumbnail
   - "Start Export" button → progress bar → download

**Acceptance Criteria:**
- PNG snapshot çalışıyor, 4K modunda 3840x2160 doğru
- MP4 recording çalışıyor, 60s'e kadar
- GIF export ~3s'lik loop oluşturuyor
- Embed widget iframe içinde çalışıyor
- Cinema mode UI'ı tamamen gizliyor
- Share URL preset'i taşıyor

---

### ✨ AJAN 9 — THE POLISHER

**Rol:** Son rötuş. Vercel deploy, SEO, adaptive performance, README.

**Sahip Olduğu Dosyalar:**
- `vercel.json`, `next.config.js` (production)
- `app/layout.tsx` (metadata)
- `app/sitemap.ts`, `app/robots.ts`
- `app/api/og/route.tsx` (dynamic OG)
- `public/og.png`, `favicon.svg`
- `README.md`, `LICENSE`, `CONTRIBUTING.md`
- `.github/workflows/ci.yml`

**Görevler:**

1. **SEO Meta:**
   - Title: "FLOW — Premium Fluid Playground"
   - Description: "Real-time WebGL fluid simulation with audio-reactive inputs, image obstacles, 12+ curated presets. The fluid playground for 2026."
   - OG image: fluid screenshot
   - Twitter card: summary_large_image
   - JSON-LD WebApplication

2. **Dynamic OG Image:**
   - `/api/og?preset=...` — preset'in thumbnail'ini render
   - Edge cache
   - LinkedIn/Twitter preview için

3. **Adaptive Resolution System:**
   - FPS monitor (Agent 3'te placeholder vardı, burada complete)
   - 1s sliding window
   - FPS < 45 (3s boyunca) → simResolution düşür (512 → 256)
   - FPS > 58 (5s boyunca) → simResolution arttır (256 → 512)
   - Dye resolution ayrı, daha hassas
   - User override (settings'te "auto-quality" toggle)

4. **Mobile Optimizations:**
   - Reduced default resolution
   - Fewer bloom passes
   - Touch-action: none
   - Address bar handle
   - Battery API: low battery → quality düşür (opsiyonel)

5. **Vercel Config:**
   ```json
   {
     "framework": "nextjs",
     "regions": ["fra1"],
     "functions": {
       "app/api/ai/preset/route.ts": { "runtime": "edge" },
       "app/api/og/route.tsx": { "runtime": "edge" }
     },
     "headers": [
       { "source": "/(.*)", "headers": [
         { "key": "Permissions-Policy", "value": "camera=*, microphone=*" }
       ]}
     ]
   }
   ```

6. **Environment Variables:**
   ```
   ANTHROPIC_API_KEY=          (AI preset için)
   NEXT_PUBLIC_SITE_URL=       https://flow.dev
   ```

7. **Performance:**
   - Lighthouse hedefi: 90+ (canvas ağır olsa da)
   - First Load JS < 200KB (gif.js dynamic import)
   - Texture optimizasyon: preset thumbnails AVIF
   - Service Worker: opsiyonel offline support

8. **README** (LinkedIn-ready):
   - Banner GIF (best preset auto-tour demo)
   - Features
   - Tech stack badges
   - Quick start
   - Self-host guide
   - Embed instructions
   - License (MIT)

9. **Browser Compatibility:**
   - WebGL2 zorunlu → fallback page
   - Safari quirks: getUserMedia HTTPS
   - iOS audio: user gesture required

10. **Launch Checklist:**
    - [ ] Custom domain SSL
    - [ ] Env vars Vercel'de
    - [ ] OG preview test
    - [ ] AI preset production
    - [ ] Mobile (iOS Safari + Android Chrome) test
    - [ ] WebGL2 fallback test
    - [ ] Lighthouse 90+
    - [ ] GitHub public + README
    - [ ] LinkedIn post (30s ekran kaydı)
    - [ ] HN Show HN draft

**Acceptance Criteria:**
- Vercel deploy başarılı, custom domain aktif
- Adaptive resolution çalışıyor (mobile'da auto-düşürüyor)
- AI preset generation production'da
- OG image LinkedIn'de doğru görünüyor
- Lighthouse 90+ (landing), 80+ (interactive — canvas ağır)
- Mobile responsive ve smooth

---

## 🎭 MODE & PRESET LİSTESİ

### 6 Mode

| Mode | Karakter | Curl | Viscosity | Bloom |
|---|---|---|---|---|
| **Smoke** | Yumuşak, dağılan | 18 | 0.0001 | 0.6 |
| **Water** | Akışkan, mavi | 8 | 0.001 | 0.3 |
| **Lava** | Sıcak, parlak | 35 | 0.003 | 1.0 |
| **Plasma** | Elektrik, parlak | 50 | 0 | 1.2 |
| **Nebula** | Uzaysal, derin | 25 | 0 | 1.5 |
| **Ink** | Boya, sanatsal | 12 | 0.0005 | 0.2 |

### 12+ Curated Presets

| Preset | Mode | Açıklama |
|---|---|---|
| Aurora Nights | Nebula | Soft greens, dancing slowly |
| Volcanic | Lava | Intense reds, fast flow |
| Ocean Depths | Water | Dark blue, calm |
| Cyber Plasma | Plasma | Neon magenta + cyan |
| Galactic | Nebula | Cosmic purples + golds |
| Midnight Ink | Ink | Black brush strokes |
| Sunrise | Lava | Soft orange + yellow |
| Arctic Mist | Smoke | Cold blue-white |
| Cherry Blossom | Smoke | Pink + white |
| Burning Wire | Plasma | Electric blue |
| Forest Spirit | Water | Green-teal mystical |
| Holographic | Plasma | Iridescent rainbow |

---

## ⚡ PERFORMANS HEDEFLERİ

| Metrik | Hedef |
|---|---|
| Landing Lighthouse | ≥ 90 |
| First Contentful Paint | < 1.2s |
| Time to Interactive | < 2.0s |
| Sim FPS (desktop) | 60 |
| Sim FPS (mobile mid) | 45+ |
| Sim FPS (mobile low) | 30+ |
| Memory | < 200MB |
| First Load JS | < 200KB |
| Texture downloads | < 1MB toplam |

### Adaptive Quality Algorithm

```
if avg_fps < 45 for 3s:
  if simResolution > 256: simResolution /= 2
  else if pressureIterations > 20: pressureIterations -= 5
  else if bloomPasses > 3: bloomPasses -= 1

if avg_fps > 58 for 5s and quality below target:
  reverse upgrade path
```

---

## 🚀 VERCEL DEPLOY

### Step-by-Step

1. **Repo + Vercel Import** (standard Next.js)
2. **Environment Variables:**
   ```
   ANTHROPIC_API_KEY     (AI preset generation)
   NEXT_PUBLIC_SITE_URL  https://flow.dev
   ```
3. **Edge Functions:**
   - AI route edge runtime
4. **Custom Domain:**
   - Önerilen: `flow.dev`, `flow.live`, `getflow.app`, `osmo.dev`
5. **Analytics:** Vercel Analytics + Speed Insights

### Domain Önerileri

- **flow.dev** — temiz, premium
- **flow.live** — canlı vurgusu
- **osmo.dev** — daha unique
- **getflow.app** — geleneksel SaaS hissi

### Maliyet

- Vercel Hobby: $0
- Anthropic API: pay-per-use (preset üretimi ucuz)
- Domain: ~$15/yıl

---

## 📝 README ŞABLONU

```markdown
# 🌊 FLOW

> A premium fluid playground. Audio-reactive WebGL fluid simulation with image obstacles, 12+ curated presets, and one-tap export.

[![Live Demo](https://img.shields.io/badge/demo-flow.dev-fb7185)](https://flow.dev)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

![FLOW Banner](public/banner.gif)

## ✨ Features

- 🎵 **Audio Reactive** — mic or music drives the fluid
- 📷 **Webcam Optical Flow** — wave at the camera, fluid follows
- 🖼️ **Image Obstacles** — drop a logo, fluid flows around it
- ✍️ **Text Obstacles** — type, fluid carves around your words
- 🎨 **12+ Curated Presets** — Aurora Nights, Volcanic, Cyber Plasma...
- 🌀 **6 Modes** — Smoke · Water · Lava · Plasma · Nebula · Ink
- 🎬 **One-Tap Export** — PNG · 4K · MP4 · GIF · Live Wallpaper
- 🎭 **Cinema Mode** — UI disappears, perfect for screen recording
- 📦 **Embeddable** — iframe with config params
- 🌑 **Premium Dark UI** — Linear-quality glassmorphism

## 🚀 Quick Start

\`\`\`bash
git clone https://github.com/kutluhangil/flow
cd flow
pnpm install
pnpm dev
\`\`\`

## 🛠️ Tech Stack

Next.js 14 · TypeScript · Raw WebGL2 · custom GLSL · Tone.js · Meyda · Vercel

## 🙏 Inspiration

Pavel Dobryakov's WebGL Fluid Simulation, Jos Stam's "Stable Fluids", Spotify's Now Playing, Linear, Teenage Engineering.

## 📄 License

MIT — fork it, learn from it, build your own.

---

Made with care by [@kutluhangil](https://github.com/kutluhangil) · [LinkedIn](https://linkedin.com/in/kutluhangil)
```

---

## 🗓️ İMPLEMENTASYON SIRASI (Claude Code İçin)

Her ajan ayrı Claude Code session. Session sonu commit.

```
Day 1:     Agent 1 (Architect)      → "feat: scaffold + canvas mount + stores"
Day 2:     Agent 2 (Aesthetician)   → "feat: design system + dock + side panel"
Day 3-6:   Agent 3 (Sim Engineer)   → "feat: webgl fluid pipeline" (EN BÜYÜK)
Day 7:     Agent 4 (Painter)        → "feat: final render + bloom + sunrays"
Day 8:     Agent 5 (Interactor)     → "feat: pointer + keyboard input"
Day 9-10:  Agent 6 (Sensor)         → "feat: audio + webcam + obstacles"
Day 11:    Agent 7 (Curator)        → "feat: modes + presets + AI gen"
Day 12:    Agent 8 (Recorder)       → "feat: export + cinema + embed"
Day 13-14: Agent 9 (Polisher)       → "chore: deploy + SEO + adaptive quality"
Day 15:    Launch (LinkedIn + HN)
```

**~2-3 hafta solo dev.** Agent 3 (Sim Engineer) en kritik ve en uzun — fluid pipeline'ın temeli. Burada acele etme, shader matematiği titiz olmalı. Geri kalan ajanlar onun üzerine kolayca otururlar.

---

## 🎬 SON SÖZ

Bu proje bittiğinde elinde:

- 🟢 Pavel Dobryakov'unkinden bir adım ötede, modernize edilmiş fluid sim
- 🟢 Audio + webcam + image obstacle ile farklılaştırılmış unique özellikler
- 🟢 Premium UI (Linear quality, glassmorphism)
- 🟢 12+ küratörlü preset koleksiyonu
- 🟢 Portfolyo arkaplanı olarak embed edilebilir
- 🟢 LinkedIn'de "müzik açıp fluid'i izle" demo'su yüksek etkileşim
- 🟢 Show HN potansiyeli (Pavel'inki orijinalinde 1000+ point almıştı)
- 🟢 9 farklı teknik alanda derinleşmiş kas:
  - Raw WebGL2 + custom GLSL shaders
  - Navier-Stokes denklemleri pratik uygulamada
  - Framebuffer ping-pong pipeline'ı
  - Bloom, sunrays, post-processing
  - Web Audio API + FFT analysis (Meyda)
  - Optical flow (basit implementation)
  - Adaptive performance system
  - MediaRecorder + GIF export
  - Premium UI/UX engineering

**Şimdi başla. Agent 1'i Claude Code'a hand off et.**

```
~/flow ➜  pnpm create next-app flow --typescript --tailwind --app
[+] scaffolding...
[+] beginning Agent 1: The Architect
[+] target acquired: liquid art 🌊
```

---

`end of blueprint` · `v1.0.0` · `built with ❤️ for kutluhan.gil`
