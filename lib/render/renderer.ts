import { Program } from "@/lib/webgl/program";
import { BloomPass } from "./bloom";
import { SunraysPass } from "./sunrays";
import type { FluidSimulator } from "@/lib/sim/simulator";
import baseVert from "@/lib/sim/shaders/base.vert.glsl";
import displayFrag from "./shaders/display.frag.glsl";

export class Renderer {
  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  private sim: FluidSimulator;

  private displayProg: Program;
  private bloom: BloomPass;
  private sunrays: SunraysPass;

  private vao: WebGLVertexArrayObject;
  private vbo: WebGLBuffer;

  // Live state — sync from useRenderStore each frame
  bloomEnabled = true;
  bloomIntensity = 0.6;
  sunraysEnabled = true;
  sunraysIntensity = 0.4;
  vignetteEnabled = true;
  vignetteIntensity = 0.5;

  constructor(canvas: HTMLCanvasElement, sim: FluidSimulator) {
    this.canvas = canvas;
    this.sim = sim;
    this.gl = sim.gl;

    this.displayProg = new Program(this.gl, baseVert, displayFrag);
    this.bloom = new BloomPass(this.gl);
    this.sunrays = new SunraysPass(this.gl);

    // Own fullscreen quad — independent of simulator's VAO
    const { gl } = this;
    const vao = gl.createVertexArray();
    if (!vao) throw new Error("Renderer: failed to create VAO");
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    if (!vbo) throw new Error("Renderer: failed to create VBO");
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    this.vao = vao;
    this.vbo = vbo;
  }

  private _drawQuad(): void {
    this.gl.bindVertexArray(this.vao);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }

  render(): void {
    const { gl, canvas, sim } = this;
    const density = sim.density.read;

    // Keep post-fx buffers at the canvas aspect so glow/rays aren't stretched
    const aspect = canvas.height > 0 ? canvas.width / canvas.height : 1;

    // ── Bloom ──────────────────────────────────────────────────────────────
    if (this.bloomEnabled) {
      this.bloom.resize(aspect);
      this.bloom.apply(density, () => this._drawQuad());
    }

    // ── Sunrays ────────────────────────────────────────────────────────────
    if (this.sunraysEnabled) {
      this.sunrays.resize(aspect);
      this.sunrays.apply(density, () => this._drawQuad());
    }

    // ── Final display to screen ────────────────────────────────────────────
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);

    this.displayProg.bind();
    const u = this.displayProg.uniforms;

    if (u["texelSize"]) gl.uniform2f(u["texelSize"], density.texelSizeX, density.texelSizeY);
    if (u["uTexture"]) gl.uniform1i(u["uTexture"], density.attach(0));

    if (this.bloomEnabled) {
      const bloomFBO = this.bloom.getResult();
      if (u["uBloom"]) gl.uniform1i(u["uBloom"], bloomFBO.attach(1));
    }
    if (u["bloomEnabled"]) gl.uniform1f(u["bloomEnabled"], this.bloomEnabled ? 1.0 : 0.0);
    if (u["bloomIntensity"]) gl.uniform1f(u["bloomIntensity"], this.bloomIntensity);

    if (this.sunraysEnabled) {
      const raysFBO = this.sunrays.getResult();
      if (u["uSunrays"]) gl.uniform1i(u["uSunrays"], raysFBO.attach(2));
    }
    if (u["sunraysEnabled"]) gl.uniform1f(u["sunraysEnabled"], this.sunraysEnabled ? 1.0 : 0.0);
    if (u["sunraysIntensity"]) gl.uniform1f(u["sunraysIntensity"], this.sunraysIntensity);

    if (u["vignetteEnabled"]) gl.uniform1f(u["vignetteEnabled"], this.vignetteEnabled ? 1.0 : 0.0);
    if (u["vignetteIntensity"]) gl.uniform1f(u["vignetteIntensity"], this.vignetteIntensity);

    this._drawQuad();
  }

  dispose(): void {
    this.displayProg.dispose();
    this.bloom.dispose();
    this.sunrays.dispose();
    this.gl.deleteVertexArray(this.vao);
    this.gl.deleteBuffer(this.vbo);
  }
}
