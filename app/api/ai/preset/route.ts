import Anthropic from "@anthropic-ai/sdk";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are a fluid simulation visual designer. Given a user's mood, theme, or scene description, design a preset for a real-time WebGL fluid simulation.

Respond with ONLY a single JSON object, no markdown, no prose. Schema:
{
  "name": string,                    // short evocative name, max 24 chars
  "mode": "smoke"|"water"|"lava"|"plasma"|"nebula"|"ink",
  "palette": [string, string, string, string, string],  // 5 hex colours, first is a near-black background, rest are vivid dye colours, dark→bright
  "params": {
    "curl": number,                  // 0-50, turbulence (low=calm, high=chaotic)
    "viscosity": number,             // 0-0.005
    "dissipation": number,           // 0.3 (dye lingers) to 2.0 (dye clears fast)
    "splatRadius": number            // 0.2-0.6, blob size
  },
  "bloom": number,                   // 0-2, glow intensity
  "sunrays": number,                 // 0-2, light shaft intensity
  "vignette": number                 // 0-1, edge darkening
}

Match the mood: storms→plasma high curl; calm→water low curl; cosmic→nebula; fire→lava; minimal→ink; soft→smoke.`;

interface GeneratedPreset {
  name: string;
  mode: string;
  palette: string[];
  params: { curl: number; viscosity: number; dissipation: number; splatRadius: number };
  bloom: number;
  sunrays: number;
  vignette: number;
}

const VALID_MODES = ["smoke", "water", "lava", "plasma", "nebula", "ink"];
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function clamp(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === "number" && Number.isFinite(v) ? v : fallback;
  return Math.min(max, Math.max(min, n));
}

function sanitize(raw: unknown): GeneratedPreset | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const mode = VALID_MODES.includes(r["mode"] as string) ? (r["mode"] as string) : "nebula";

  const paletteRaw = Array.isArray(r["palette"]) ? (r["palette"] as unknown[]) : [];
  const palette = paletteRaw
    .filter((c): c is string => typeof c === "string" && HEX_RE.test(c))
    .slice(0, 5);
  if (palette.length < 3) return null; // not enough usable colours

  const p = (r["params"] ?? {}) as Record<string, unknown>;

  return {
    name: typeof r["name"] === "string" ? (r["name"] as string).slice(0, 24) : "AI Preset",
    mode,
    palette,
    params: {
      curl: clamp(p["curl"], 0, 50, 25),
      viscosity: clamp(p["viscosity"], 0, 0.005, 0),
      dissipation: clamp(p["dissipation"], 0.3, 2.0, 0.8),
      splatRadius: clamp(p["splatRadius"], 0.2, 0.6, 0.4),
    },
    bloom: clamp(r["bloom"], 0, 2, 1),
    sunrays: clamp(r["sunrays"], 0, 2, 0.8),
    vignette: clamp(r["vignette"], 0, 1, 0.5),
  };
}

export async function GET() {
  return Response.json({ enabled: Boolean(process.env.ANTHROPIC_API_KEY) });
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "AI preset generation is not configured." }, { status: 503 });
  }

  let prompt: string;
  try {
    const body = (await req.json()) as { prompt?: unknown };
    prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!prompt || prompt.length > 200) {
    return Response.json({ error: "Prompt must be 1–200 characters." }, { status: 400 });
  }

  try {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    // Extract the JSON object (model may wrap in stray text despite instructions)
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return Response.json({ error: "Could not parse AI response." }, { status: 502 });
    }

    const parsed = sanitize(JSON.parse(match[0]));
    if (!parsed) {
      return Response.json({ error: "AI returned an invalid preset." }, { status: 502 });
    }

    return Response.json({ preset: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
