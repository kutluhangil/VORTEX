import { Program } from "@/lib/webgl/program";
import { createDoubleFBO, deleteDoubleFBO, type DoubleFBO, type FBO } from "@/lib/webgl/fbo";
import baseVert from "@/lib/sim/shaders/base.vert.glsl";
import sunraysFrag from "./shaders/sunrays.frag.glsl";
import blurFrag from "./shaders/bloom-blur.frag.glsl";

const SUNRAYS_RES = 196;

export class SunraysPass {
  private gl: WebGL2RenderingContext;
  private sunraysProg: Program;
  private blurProg: Program;
  private fbo: DoubleFBO;

  weight = 1.0;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.sunraysProg = new Program(gl, baseVert, sunraysFrag);
    this.blurProg = new Program(gl, baseVert, blurFrag);
    this.fbo = createDoubleFBO(
      gl,
      SUNRAYS_RES,
      SUNRAYS_RES,
      gl.R16F,
      gl.RED,
      gl.HALF_FLOAT,
      gl.LINEAR,
    );
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
    gl.viewport(0, 0, SUNRAYS_RES, SUNRAYS_RES);
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
    gl.viewport(0, 0, SUNRAYS_RES, SUNRAYS_RES);
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
