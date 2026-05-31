import { Program } from "@/lib/webgl/program";
import { createDoubleFBO, deleteDoubleFBO, type DoubleFBO, type FBO } from "@/lib/webgl/fbo";
import baseVert from "@/lib/sim/shaders/base.vert.glsl";
import sunraysFrag from "./shaders/sunrays.frag.glsl";
import blurFrag from "./shaders/bloom-blur.frag.glsl";

const SUNRAYS_RES = 196; // applied to the short axis; long axis scales with aspect

export class SunraysPass {
  private gl: WebGL2RenderingContext;
  private sunraysProg: Program;
  private blurProg: Program;
  private fbo: DoubleFBO;
  private aspect = 1;
  private w = SUNRAYS_RES;
  private h = SUNRAYS_RES;

  weight = 1.0;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.sunraysProg = new Program(gl, baseVert, sunraysFrag);
    this.blurProg = new Program(gl, baseVert, blurFrag);
    this.fbo = this._create();
  }

  private _create(): DoubleFBO {
    const { gl } = this;
    this.w = this.aspect >= 1 ? Math.round(SUNRAYS_RES * this.aspect) : SUNRAYS_RES;
    this.h = this.aspect >= 1 ? SUNRAYS_RES : Math.round(SUNRAYS_RES / this.aspect);
    return createDoubleFBO(gl, this.w, this.h, gl.R16F, gl.RED, gl.HALF_FLOAT, gl.LINEAR);
  }

  /** Rebuild the sunrays buffer to match the canvas aspect (no-op if same). */
  resize(aspect: number): void {
    if (Math.abs(aspect - this.aspect) < 0.001) return;
    this.aspect = aspect;
    deleteDoubleFBO(this.gl, this.fbo);
    this.fbo = this._create();
  }

  apply(densityFBO: FBO, drawQuad: () => void): void {
    const { gl } = this;

    // Radial accumulation from density
    this.sunraysProg.bind();
    const su = this.sunraysProg.uniforms;
    if (su["texelSize"])
      gl.uniform2f(su["texelSize"], densityFBO.texelSizeX, densityFBO.texelSizeY);
    if (su["uTexture"]) gl.uniform1i(su["uTexture"], densityFBO.attach(0));
    if (su["weight"]) gl.uniform1f(su["weight"], this.weight);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo.write.fbo);
    gl.viewport(0, 0, this.w, this.h);
    drawQuad();
    this.fbo.swap();

    // Single smooth-blur pass to clean up noise
    this.blurProg.bind();
    const bu = this.blurProg.uniforms;
    if (bu["texelSize"])
      gl.uniform2f(bu["texelSize"], this.fbo.read.texelSizeX, this.fbo.read.texelSizeY);
    if (bu["uTexture"]) gl.uniform1i(bu["uTexture"], this.fbo.read.attach(0));
    if (bu["offset"]) gl.uniform1f(bu["offset"], 1.0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo.write.fbo);
    gl.viewport(0, 0, this.w, this.h);
    drawQuad();
    this.fbo.swap();
  }

  getResult(): FBO {
    return this.fbo.read;
  }

  dispose(): void {
    deleteDoubleFBO(this.gl, this.fbo);
    this.sunraysProg.dispose();
    this.blurProg.dispose();
  }
}
