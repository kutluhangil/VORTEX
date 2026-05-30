function pickMimeType(): { mime: string; ext: string } {
  const candidates: { mime: string; ext: string }[] = [
    { mime: "video/mp4;codecs=avc1", ext: "mp4" },
    { mime: "video/webm;codecs=vp9", ext: "webm" },
    { mime: "video/webm;codecs=vp8", ext: "webm" },
    { mime: "video/webm", ext: "webm" },
  ];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c.mime)) {
      return c;
    }
  }
  return { mime: "video/webm", ext: "webm" };
}

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const MAX_DURATION_MS = 60_000;

export class CanvasRecorder {
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private ext = "webm";
  private stopTimer: ReturnType<typeof setTimeout> | undefined;
  private onAutoStop?: () => void;

  running = false;

  /** Begin recording the canvas. Auto-stops at 60s, calling onAutoStop. */
  start(canvas: HTMLCanvasElement, onAutoStop?: () => void): void {
    if (this.running) return;
    this.onAutoStop = onAutoStop;

    const { mime, ext } = pickMimeType();
    this.ext = ext;

    const stream = canvas.captureStream(60);
    this.recorder = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond: 10_000_000,
    });
    this.chunks = [];

    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };

    this.recorder.start(100);
    this.running = true;

    this.stopTimer = setTimeout(() => {
      this.stop().then(() => this.onAutoStop?.());
    }, MAX_DURATION_MS);
  }

  /** Stop recording, assemble and download the file. Resolves when downloaded. */
  async stop(): Promise<void> {
    if (!this.running || !this.recorder) return;
    clearTimeout(this.stopTimer);

    const recorder = this.recorder;
    await new Promise<void>((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: recorder.mimeType });
        const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        download(blob, `flow-${ts}.${this.ext}`);
        resolve();
      };
      recorder.stop();
      recorder.stream.getTracks().forEach((t) => t.stop());
    });

    this.running = false;
    this.recorder = null;
    this.chunks = [];
  }

  dispose(): void {
    clearTimeout(this.stopTimer);
    if (this.recorder && this.running) {
      this.recorder.stop();
      this.recorder.stream.getTracks().forEach((t) => t.stop());
    }
    this.recorder = null;
    this.running = false;
  }
}
