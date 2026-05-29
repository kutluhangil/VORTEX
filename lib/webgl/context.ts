export interface GLCapabilities {
  colorBufferFloat: EXT_color_buffer_float;
  linearHalfFloat: OES_texture_half_float_linear | null;
}

export function createGLContext(canvas: HTMLCanvasElement): {
  gl: WebGL2RenderingContext;
  caps: GLCapabilities;
} | null {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
  }) as WebGL2RenderingContext | null;

  if (!gl) return null;

  const colorBufferFloat = gl.getExtension("EXT_color_buffer_float");
  if (!colorBufferFloat) return null;

  const linearHalfFloat = gl.getExtension("OES_texture_half_float_linear");

  gl.disable(gl.BLEND);
  gl.disable(gl.DEPTH_TEST);

  return { gl, caps: { colorBufferFloat, linearHalfFloat } };
}
