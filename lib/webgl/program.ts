import { compileShader } from "./shader";

export type UniformMap = Record<string, WebGLUniformLocation>;

export class Program {
  readonly program: WebGLProgram;
  readonly uniforms: UniformMap;

  constructor(
    private gl: WebGL2RenderingContext,
    vertSrc: string,
    fragSrc: string,
  ) {
    const vert = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);

    const program = gl.createProgram();
    if (!program) throw new Error("Failed to create GL program");

    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.deleteShader(vert);
    gl.deleteShader(frag);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program) ?? "unknown";
      gl.deleteProgram(program);
      throw new Error(`Program link error:\n${log}`);
    }

    this.program = program;
    this.uniforms = this._cacheUniforms();
  }

  private _cacheUniforms(): UniformMap {
    const map: UniformMap = {};
    const count = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < count; i++) {
      const info = this.gl.getActiveUniform(this.program, i);
      if (!info) continue;
      const loc = this.gl.getUniformLocation(this.program, info.name);
      if (loc) map[info.name] = loc;
    }
    return map;
  }

  bind(): void {
    this.gl.useProgram(this.program);
  }

  dispose(): void {
    this.gl.deleteProgram(this.program);
  }
}
