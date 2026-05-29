import { createGLContext } from "@/lib/webgl/context";
import { Program } from "@/lib/webgl/program";
import {
  createDoubleFBO,
  createFBO,
  deleteDoubleFBO,
  deleteFBO,
  type DoubleFBO,
  type FBO,
} from "@/lib/webgl/fbo";
import { createR8Texture } from "@/lib/webgl/texture";

// GLSL shader sources — imported as strings by webpack asset/source
import baseVert from "@/lib/sim/shaders/base.vert.glsl";
import splatFrag from "@/lib/sim/shaders/splat.frag.glsl";
import advectionFrag from "@/lib/sim/shaders/advection.frag.glsl";
import divergenceFrag from "@/lib/sim/shaders/divergence.frag.glsl";
import pressureFrag from "@/lib/sim/shaders/pressure.frag.glsl";
import gradientFrag from "@/lib/sim/shaders/gradient.frag.glsl";
import curlFrag from "@/lib/sim/shaders/curl.frag.glsl";
import vorticityFrag from "@/lib/sim/shaders/vorticity.frag.glsl";
import clearFrag from "@/lib/sim/shaders/clear.frag.glsl";
import displayFrag from "@/lib/render/shaders/display.frag.glsl";

export interface SplatData {
  x: number;                         // UV [0,1]
  y: number;                         // UV [0,1]
  dx: number;                        // velocity delta
  dy: number;
  color: [number, number, number];
  radius?: number;                   // shader radius, default 0.0015
}

export interface SimOptions {
  simResolution: number;
  dyeResolution: number;
  pressureIterations: number;
  curl: number;
  dissipation: number;
}

export class FluidSimulator {
  readonly gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;

  // Programs
  private splatProg!: Program;
  private advectionProg!: Program;
  private divergenceProg!: Program;
  private pressureProg!: Program;
  private gradientProg!: Program;
  private curlProg!: Program;
  private vorticityProg!: Program;
  private clearProg!: Program;
  private displayProg!: Program;

  // FBOs
  velocity!: DoubleFBO;
  density!: DoubleFBO;
  pressure!: DoubleFBO;
  divergence!: FBO;
  curl!: FBO;
  obstacle!: FBO;

  // Quad VAO/VBO
  private quadVAO!: WebGLVertexArrayObject;
  private quadVBO!: WebGLBuffer;

  // Splat queue — fed by Agent 5 & 6
  private _splatQueue: SplatData[] = [];

  // FPS tracking
  private _fpsFrames = 0;
  private _fpsTime = 0;
  private _fps = 60;

  // Options (live-updated from stores)
  opts: SimOptions;

  constructor(canvas: HTMLCanvasElement, opts: SimOptions) {
    this.canvas = canvas;

    const result = createGLContext(canvas);
    if (!result) throw new Error("WebGL2 context creation failed");
    this.gl = result.gl;

    this.opts = opts;
    this._initQuad();
    this._initPrograms();
    this._initFBOs(opts.simResolution, opts.dyeResolution);
  }

  // ─── Quad ───────────────────────────────────────────────────────────────────

  private _initQuad(): void {
    const { gl } = this;
    const vao = gl.createVertexArray();
    if (!vao) throw new Error("Failed to create VAO");
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    if (!vbo) throw new Error("Failed to create VBO");
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    this.quadVAO = vao;
    this.quadVBO = vbo;
  }

  private _drawQuad(): void {
    const { gl } = this;
    gl.bindVertexArray(this.quadVAO);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // ─── Programs ────────────────────────────────────────────────────────────────

  private _initPrograms(): void {
    const { gl } = this;
    this.splatProg = new Program(gl, baseVert, splatFrag);
    this.advectionProg = new Program(gl, baseVert, advectionFrag);
    this.divergenceProg = new Program(gl, baseVert, divergenceFrag);
    this.pressureProg = new Program(gl, baseVert, pressureFrag);
    this.gradientProg = new Program(gl, baseVert, gradientFrag);
    this.curlProg = new Program(gl, baseVert, curlFrag);
    this.vorticityProg = new Program(gl, baseVert, vorticityFrag);
    this.clearProg = new Program(gl, baseVert, clearFrag);
    this.displayProg = new Program(gl, baseVert, displayFrag);
  }

  // ─── FBOs ────────────────────────────────────────────────────────────────────

  private _initFBOs(simRes: number, dyeRes: number): void {
    const { gl } = this;

    // Half-float formats
    const HALF_FLOAT = gl.HALF_FLOAT;
    const NEAREST = gl.NEAREST;

    // Velocity: RG16F
    this.velocity = createDoubleFBO(gl, simRes, simRes, gl.RG16F, gl.RG, HALF_FLOAT, NEAREST);
    // Density: RGBA16F
    this.density = createDoubleFBO(gl, dyeRes, dyeRes, gl.RGBA16F, gl.RGBA, HALF_FLOAT, NEAREST);
    // Pressure: R16F
    this.pressure = createDoubleFBO(gl, simRes, simRes, gl.R16F, gl.RED, HALF_FLOAT, NEAREST);
    // Divergence: R16F (single)
    this.divergence = createFBO(gl, simRes, simRes, gl.R16F, gl.RED, HALF_FLOAT, NEAREST);
    // Curl: R16F (single)
    this.curl = createFBO(gl, simRes, simRes, gl.R16F, gl.RED, HALF_FLOAT, NEAREST);
    // Obstacle: R8 (single, white = obstacle, black = fluid)
    this.obstacle = createFBO(gl, simRes, simRes, gl.R8, gl.RED, gl.UNSIGNED_BYTE, gl.LINEAR);

    // Clear obstacle to black (no obstacles)
    this._clearObstacle();
  }

  private _clearObstacle(): void {
    const { gl } = this;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.obstacle.fbo);
    gl.viewport(0, 0, this.obstacle.width, this.obstacle.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  private _deleteFBOs(): void {
    const { gl } = this;
    deleteDoubleFBO(gl, this.velocity);
    deleteDoubleFBO(gl, this.density);
    deleteDoubleFBO(gl, this.pressure);
    deleteFBO(gl, this.divergence);
    deleteFBO(gl, this.curl);
    deleteFBO(gl, this.obstacle);
  }

  // ─── Bind FBO to render target ────────────────────────────────────────────

  private _bindFBO(fbo: FBO): void {
    const { gl } = this;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
    gl.viewport(0, 0, fbo.width, fbo.height);
  }

  private _bindScreen(): void {
    const { gl } = this;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  // ─── Pipeline passes ──────────────────────────────────────────────────────

  private _stepCurl(dt: number): void {
    const { gl } = this;
    this.curlProg.bind();
    const u = this.curlProg.uniforms;
    if (u["texelSize"])
      gl.uniform2f(u["texelSize"], this.velocity.texelSizeX, this.velocity.texelSizeY);
    if (u["uVelocity"])
      gl.uniform1i(u["uVelocity"], this.velocity.read.attach(0));
    this._bindFBO(this.curl);
    this._drawQuad();
  }

  private _stepVorticity(dt: number): void {
    const { gl } = this;
    this.vorticityProg.bind();
    const u = this.vorticityProg.uniforms;
    if (u["texelSize"])
      gl.uniform2f(u["texelSize"], this.velocity.texelSizeX, this.velocity.texelSizeY);
    if (u["uVelocity"])
      gl.uniform1i(u["uVelocity"], this.velocity.read.attach(0));
    if (u["uCurl"])
      gl.uniform1i(u["uCurl"], this.curl.attach(1));
    if (u["curl"])
      gl.uniform1f(u["curl"], this.opts.curl);
    if (u["dt"])
      gl.uniform1f(u["dt"], dt);
    this._bindFBO(this.velocity.write);
    this._drawQuad();
    this.velocity.swap();
  }

  private _stepSplats(): void {
    const { gl } = this;
    const q = this._splatQueue;
    if (q.length === 0) return;

    const aspectRatio = this.canvas.width / this.canvas.height;

    for (const s of q) {
      // Splat velocity
      this.splatProg.bind();
      const u = this.splatProg.uniforms;
      if (u["texelSize"])
        gl.uniform2f(u["texelSize"], this.velocity.texelSizeX, this.velocity.texelSizeY);
      if (u["uTarget"])
        gl.uniform1i(u["uTarget"], this.velocity.read.attach(0));
      if (u["aspectRatio"])
        gl.uniform1f(u["aspectRatio"], aspectRatio);
      if (u["color"])
        gl.uniform3f(u["color"], s.dx, s.dy, 0);
      if (u["point"])
        gl.uniform2f(u["point"], s.x, s.y);
      if (u["radius"])
        gl.uniform1f(u["radius"], this._correctRadius(s.radius ?? 0.0015));
      this._bindFBO(this.velocity.write);
      this._drawQuad();
      this.velocity.swap();

      // Splat density/dye
      this.splatProg.bind();
      const ud = this.splatProg.uniforms;
      if (ud["texelSize"])
        gl.uniform2f(ud["texelSize"], this.density.texelSizeX, this.density.texelSizeY);
      if (ud["uTarget"])
        gl.uniform1i(ud["uTarget"], this.density.read.attach(0));
      if (ud["aspectRatio"])
        gl.uniform1f(ud["aspectRatio"], aspectRatio);
      if (ud["color"])
        gl.uniform3f(ud["color"], s.color[0], s.color[1], s.color[2]);
      if (ud["point"])
        gl.uniform2f(ud["point"], s.x, s.y);
      if (ud["radius"])
        gl.uniform1f(ud["radius"], this._correctRadius(s.radius ?? 0.0015));
      this._bindFBO(this.density.write);
      this._drawQuad();
      this.density.swap();
    }

    this._splatQueue = [];
  }

  private _correctRadius(radius: number): number {
    const { canvas } = this;
    const aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1) return radius * aspectRatio;
    return radius;
  }

  private _stepDivergence(): void {
    const { gl } = this;
    this.divergenceProg.bind();
    const u = this.divergenceProg.uniforms;
    if (u["texelSize"])
      gl.uniform2f(u["texelSize"], this.velocity.texelSizeX, this.velocity.texelSizeY);
    if (u["uVelocity"])
      gl.uniform1i(u["uVelocity"], this.velocity.read.attach(0));
    this._bindFBO(this.divergence);
    this._drawQuad();
  }

  private _stepClearPressure(): void {
    const { gl } = this;
    this.clearProg.bind();
    const u = this.clearProg.uniforms;
    if (u["texelSize"])
      gl.uniform2f(u["texelSize"], this.pressure.texelSizeX, this.pressure.texelSizeY);
    if (u["uTexture"])
      gl.uniform1i(u["uTexture"], this.pressure.read.attach(0));
    if (u["value"])
      gl.uniform1f(u["value"], 0.8); // warm start: keep 80% of previous frame
    this._bindFBO(this.pressure.write);
    this._drawQuad();
    this.pressure.swap();
  }

  private _stepPressure(): void {
    const { gl } = this;
    this.pressureProg.bind();
    const u = this.pressureProg.uniforms;
    if (u["texelSize"])
      gl.uniform2f(u["texelSize"], this.pressure.texelSizeX, this.pressure.texelSizeY);
    if (u["uDivergence"])
      gl.uniform1i(u["uDivergence"], this.divergence.attach(0));

    for (let i = 0; i < this.opts.pressureIterations; i++) {
      if (u["uPressure"])
        gl.uniform1i(u["uPressure"], this.pressure.read.attach(1));
      this._bindFBO(this.pressure.write);
      this._drawQuad();
      this.pressure.swap();
    }
  }

  private _stepGradient(): void {
    const { gl } = this;
    this.gradientProg.bind();
    const u = this.gradientProg.uniforms;
    if (u["texelSize"])
      gl.uniform2f(u["texelSize"], this.velocity.texelSizeX, this.velocity.texelSizeY);
    if (u["uPressure"])
      gl.uniform1i(u["uPressure"], this.pressure.read.attach(0));
    if (u["uVelocity"])
      gl.uniform1i(u["uVelocity"], this.velocity.read.attach(1));
    this._bindFBO(this.velocity.write);
    this._drawQuad();
    this.velocity.swap();
  }

  private _stepAdvectVelocity(dt: number): void {
    const { gl } = this;
    this.advectionProg.bind();
    const u = this.advectionProg.uniforms;
    if (u["texelSize"])
      gl.uniform2f(u["texelSize"], this.velocity.texelSizeX, this.velocity.texelSizeY);
    if (u["dyeTexelSize"])
      gl.uniform2f(u["dyeTexelSize"], this.velocity.texelSizeX, this.velocity.texelSizeY);
    if (u["uVelocity"])
      gl.uniform1i(u["uVelocity"], this.velocity.read.attach(0));
    if (u["uSource"])
      gl.uniform1i(u["uSource"], this.velocity.read.attach(0));
    if (u["dt"])
      gl.uniform1f(u["dt"], dt);
    if (u["dissipation"])
      gl.uniform1f(u["dissipation"], 0.0); // velocity almost no dissipation
    this._bindFBO(this.velocity.write);
    this._drawQuad();
    this.velocity.swap();
  }

  private _stepAdvectDensity(dt: number): void {
    const { gl } = this;
    this.advectionProg.bind();
    const u = this.advectionProg.uniforms;
    if (u["texelSize"])
      gl.uniform2f(u["texelSize"], this.velocity.texelSizeX, this.velocity.texelSizeY);
    if (u["dyeTexelSize"])
      gl.uniform2f(u["dyeTexelSize"], this.density.texelSizeX, this.density.texelSizeY);
    if (u["uVelocity"])
      gl.uniform1i(u["uVelocity"], this.velocity.read.attach(0));
    if (u["uSource"])
      gl.uniform1i(u["uSource"], this.density.read.attach(1));
    if (u["dt"])
      gl.uniform1f(u["dt"], dt);
    if (u["dissipation"])
      gl.uniform1f(u["dissipation"], this.opts.dissipation);
    this._bindFBO(this.density.write);
    this._drawQuad();
    this.density.swap();
  }

  // ─── Render to screen ─────────────────────────────────────────────────────

  render(): void {
    const { gl } = this;
    this.displayProg.bind();
    const u = this.displayProg.uniforms;
    if (u["texelSize"])
      gl.uniform2f(u["texelSize"], this.density.texelSizeX, this.density.texelSizeY);
    if (u["uTexture"])
      gl.uniform1i(u["uTexture"], this.density.read.attach(0));
    this._bindScreen();
    this._drawQuad();
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  step(dt: number): void {
    if (dt <= 0) return;

    this._stepCurl(dt);
    this._stepVorticity(dt);
    this._stepSplats();
    this._stepDivergence();
    this._stepClearPressure();
    this._stepPressure();
    this._stepGradient();
    this._stepAdvectVelocity(dt);
    this._stepAdvectDensity(dt);

    // FPS tracking
    this._fpsFrames++;
    this._fpsTime += dt;
    if (this._fpsTime >= 1.0) {
      this._fps = this._fpsFrames / this._fpsTime;
      this._fpsFrames = 0;
      this._fpsTime = 0;
    }
  }

  splat(x: number, y: number, dx: number, dy: number, color: [number, number, number], radius?: number): void {
    this._splatQueue.push({ x, y, dx, dy, color, radius });
  }

  setObstacle(imageData: ImageData | null): void {
    const { gl } = this;
    if (!imageData) {
      this._clearObstacle();
      return;
    }

    // Convert RGBA ImageData to R8 grayscale
    const size = imageData.width * imageData.height;
    const r8 = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      const idx = i * 4;
      // Grayscale: obstacle where pixel is dark (image inverted)
      const gray =
        0.299 * (imageData.data[idx] ?? 0) +
        0.587 * (imageData.data[idx + 1] ?? 0) +
        0.114 * (imageData.data[idx + 2] ?? 0);
      r8[i] = 255 - gray; // invert: dark pixels become obstacles
    }

    // Delete old obstacle FBO, create new one at image size
    deleteFBO(gl, this.obstacle);
    const tex = createR8Texture(gl, imageData.width, imageData.height, r8);

    // Rebuild obstacle FBO wrapping the new texture
    const fbo = gl.createFramebuffer();
    if (!fbo) return;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.obstacle = {
      texture: tex,
      fbo,
      width: imageData.width,
      height: imageData.height,
      texelSizeX: 1 / imageData.width,
      texelSizeY: 1 / imageData.height,
      attach(unit: number) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        return unit;
      },
    };
  }

  reset(): void {
    const { gl } = this;
    const clear = (fbo: FBO) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };
    clear(this.velocity.read);
    clear(this.velocity.write);
    clear(this.density.read);
    clear(this.density.write);
    clear(this.pressure.read);
    clear(this.pressure.write);
  }

  resize(width: number, height: number): void {
    const { opts } = this;
    this._deleteFBOs();
    this._initFBOs(opts.simResolution, opts.dyeResolution);
    this.canvas.width = width;
    this.canvas.height = height;
  }

  getFPS(): number {
    return this._fps;
  }

  dispose(): void {
    this._deleteFBOs();
    this.splatProg.dispose();
    this.advectionProg.dispose();
    this.divergenceProg.dispose();
    this.pressureProg.dispose();
    this.gradientProg.dispose();
    this.curlProg.dispose();
    this.vorticityProg.dispose();
    this.clearProg.dispose();
    this.displayProg.dispose();
    this.gl.deleteVertexArray(this.quadVAO);
    this.gl.deleteBuffer(this.quadVBO);
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
