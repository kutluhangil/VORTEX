export interface WebGL2Support {
  supported: boolean;
  colorBufferFloat: boolean;
  halfFloatBlend: boolean;
}

export function checkWebGL2Support(): boolean {
  if (typeof window === "undefined") return false;

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2");

  if (!gl) return false;

  // EXT_color_buffer_float is required for half-float FBOs
  const ext = gl.getExtension("EXT_color_buffer_float");
  if (!ext) return false;

  // Clean up
  const ext2 = gl.getExtension("WEBGL_lose_context");
  ext2?.loseContext();

  return true;
}

export function getWebGL2Capabilities(gl: WebGL2RenderingContext) {
  return {
    colorBufferFloat: Boolean(gl.getExtension("EXT_color_buffer_float")),
    halfFloatBlend: Boolean(gl.getExtension("EXT_color_buffer_half_float")),
    floatLinear: Boolean(gl.getExtension("OES_texture_float_linear")),
    halfFloatLinear: Boolean(gl.getExtension("OES_texture_half_float_linear")),
  };
}
