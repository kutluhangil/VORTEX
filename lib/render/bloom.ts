import { Program } from "@/lib/webgl/program";
import { createDoubleFBO, deleteDoubleFBO, type DoubleFBO, type FBO } from "@/lib/webgl/fbo";
import baseVert from "@/lib/sim/shaders/base.vert.glsl";
import prefilterFrag from "./shaders/bloom-prefilter.frag.glsl";
import blurFrag from "./shaders/bloom-blur.frag.glsl";
import finalFrag from "./shaders/bloom-final.frag.glsl";

const BLOOM_LEVELS = 3;
const BLOOM_RES = 256; // applied to the short axis; long axis scales with aspect

export class BloomPass {
  private gl: WebGL2RenderingContext;
  private prefilterProg: Program;
  private blurProg: Program;
  private finalProg: Program;
  private fbos: DoubleFBO[];
  private aspect = 1;

  threshold = 0.6;
  knee = 0.35;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.prefilterProg = new Program(gl, baseVert, prefilterFrag);
    this.blurProg = new Program(gl, baseVert, blurFrag);
    this.finalProg = new Program(gl, baseVert, finalFrag);
    this.fbos = this._createFBOs();
  }

  /** Rebuild bloom mips to match the canvas aspect (no-op if unchanged). */
  resize(aspect: number): void {
    if (Math.abs(aspect - this.aspect) < 0.001) return;
    this.aspect = aspect;
    for (const fbo of this.fbos) deleteDoubleFBO(this.gl, fbo);
    this.fbos = this._createFBOs();
  }

  private _createFBOs(): DoubleFBO[] {
    const { gl } = this;
    const arr: DoubleFBO[] = [];
    // Short axis = BLOOM_RES, long axis scaled by aspect → square pixels
    let w = this.aspect >= 1 ? Math.round(BLOOM_RES * this.aspect) : BLOOM_RES;
    let h = this.aspect >= 1 ? BLOOM_RES : Math.round(BLOOM_RES / this.aspect);
    for (let i = 0; i < BLOOM_LEVELS; i++) {
      arr.push(createDoubleFBO(gl, w, h, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, gl.LINEAR));
      w = Math.max(1, w >> 1);
      h = Math.max(1, h >> 1);
    }
    return arr;
  }

  private _bind(fbo: FBO, quad: () => void): void {
    const { gl } = this;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
    gl.viewport(0, 0, fbo.width, fbo.height);
    quad();
  }

  apply(densityFBO: FBO, drawQuad: () => void): void {
    const { gl } = this;

    // Step 1: Prefilter from density → bloom mip 0
    this.prefilterProg.bind();
    const pu = this.prefilterProg.uniforms;
    if (pu["texelSize"])
      gl.uniform2f(pu["texelSize"], densityFBO.texelSizeX, densityFBO.texelSizeY);
    if (pu["uTexture"]) gl.uniform1i(pu["uTexture"], densityFBO.attach(0));
    if (pu["threshold"]) gl.uniform1f(pu["threshold"], this.threshold);
    if (pu["knee"]) gl.uniform1f(pu["knee"], this.knee);
    this._bind(this.fbos[0]!.write, drawQuad);
    this.fbos[0]!.swap();

    // Step 2: Downsample — mip[0] → mip[1] → mip[2]
    for (let i = 1; i < BLOOM_LEVELS; i++) {
      const src = this.fbos[i - 1]!.read;
      const dst = this.fbos[i]!;
      this.blurProg.bind();
      const bu = this.blurProg.uniforms;
      if (bu["texelSize"]) gl.uniform2f(bu["texelSize"], src.texelSizeX, src.texelSizeY);
      if (bu["uTexture"]) gl.uniform1i(bu["uTexture"], src.attach(0));
      if (bu["offset"]) gl.uniform1f(bu["offset"], 1.0);
      this._bind(dst.write, drawQuad);
      dst.swap();
    }

    // Step 3: Upsample + accumulate — mip[2] → mip[1] → mip[0]
    for (let i = BLOOM_LEVELS - 2; i >= 0; i--) {
      const lo = this.fbos[i]!;
      const hi = this.fbos[i + 1]!.read;
      this.finalProg.bind();
      const fu = this.finalProg.uniforms;
      if (fu["texelSize"]) gl.uniform2f(fu["texelSize"], lo.read.texelSizeX, lo.read.texelSizeY);
      if (fu["uBase"]) gl.uniform1i(fu["uBase"], lo.read.attach(0));
      if (fu["uBloom"]) gl.uniform1i(fu["uBloom"], hi.attach(1));
      if (fu["intensity"]) gl.uniform1f(fu["intensity"], 1.0);
      this._bind(lo.write, drawQuad);
      lo.swap();
    }
  }

  /** Returns the accumulated bloom ready to be sampled. */
  getResult(): FBO {
    return this.fbos[0]!.read;
  }

  dispose(): void {
    for (const fbo of this.fbos) deleteDoubleFBO(this.gl, fbo);
    this.prefilterProg.dispose();
    this.blurProg.dispose();
    this.finalProg.dispose();
  }
}
