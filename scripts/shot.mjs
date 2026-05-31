// Visual smoke test — captures rendered frames at given viewport sizes.
// Usage: node scripts/shot.mjs <url> <out.png> <width> <height>
import { chromium } from "playwright";

const URL = process.argv[2] || "http://localhost:3000";
const OUT = process.argv[3] || "/tmp/flow.png";
const W = parseInt(process.argv[4] || "1280", 10);
const H = parseInt(process.argv[5] || "800", 10);

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--use-gl=angle", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: W, height: H } });
const logs = [];
page.on("console", (m) => { if (m.type() === "error") logs.push(m.text().slice(0, 100)); });
page.on("pageerror", (e) => logs.push("ERR " + e.message.slice(0, 100)));

await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(2500);

// Draw a roughly circular loop so any horizontal stretch is obvious
const cx = W / 2;
const cy = H / 2;
const L = Math.min(W, H) * 0.32; // equal screen-pixel arm length
const mv = page.mouse;

async function stroke(x0, y0, x1, y1, steps) {
  await mv.move(x0, y0);
  await mv.down();
  for (let i = 1; i <= steps; i++) {
    await mv.move(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps);
    await page.waitForTimeout(9);
  }
  await mv.up();
  await page.waitForTimeout(60);
}

// A "+" of equal screen length on both axes. Correct aspect ⇒ both arms
// equal length & thickness; horizontal stretch ⇒ the horizontal arm distorts.
await stroke(cx - L, cy, cx + L, cy, 30); // horizontal
await stroke(cx, cy - L, cx, cy + L, 30); // vertical
await page.waitForTimeout(120);

const ok = await page.evaluate(() => !document.body.innerText.includes("WebGL2 Required"));
await page.screenshot({ path: OUT });
console.log(JSON.stringify({ webglOk: ok, size: `${W}x${H}`, errors: logs }));
await browser.close();
