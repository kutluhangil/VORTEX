export interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach(unit: number): number;
}

export interface DoubleFBO {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap(): void;
}

export function createFBO(
  gl: WebGL2RenderingContext,
  w: number,
  h: number,
  internalFormat: GLenum,
  format: GLenum,
  type: GLenum,
  filter: GLenum,
): FBO {
  gl.activeTexture(gl.TEXTURE0);

  const texture = gl.createTexture();
  if (!texture) throw new Error("Failed to create texture");
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

  const fbo = gl.createFramebuffer();
  if (!fbo) throw new Error("Failed to create framebuffer");
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const texelSizeX = 1 / w;
  const texelSizeY = 1 / h;

  return {
    texture,
    fbo,
    width: w,
    height: h,
    texelSizeX,
    texelSizeY,
    attach(unit: number): number {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      return unit;
    },
  };
}

export function createDoubleFBO(
  gl: WebGL2RenderingContext,
  w: number,
  h: number,
  internalFormat: GLenum,
  format: GLenum,
  type: GLenum,
  filter: GLenum,
): DoubleFBO {
  let fbo1 = createFBO(gl, w, h, internalFormat, format, type, filter);
  let fbo2 = createFBO(gl, w, h, internalFormat, format, type, filter);

  return {
    width: w,
    height: h,
    texelSizeX: fbo1.texelSizeX,
    texelSizeY: fbo1.texelSizeY,
    get read() {
      return fbo1;
    },
    get write() {
      return fbo2;
    },
    swap() {
      const temp = fbo1;
      fbo1 = fbo2;
      fbo2 = temp;
    },
  };
}

export function resizeFBO(
  gl: WebGL2RenderingContext,
  target: FBO,
  w: number,
  h: number,
  internalFormat: GLenum,
  format: GLenum,
  type: GLenum,
  filter: GLenum,
): FBO {
  const newFBO = createFBO(gl, w, h, internalFormat, format, type, filter);
  // Copy contents from old FBO (handled by pipeline copy pass)
  gl.deleteTexture(target.texture);
  gl.deleteFramebuffer(target.fbo);
  return newFBO;
}

export function deleteFBO(gl: WebGL2RenderingContext, fbo: FBO): void {
  gl.deleteTexture(fbo.texture);
  gl.deleteFramebuffer(fbo.fbo);
}

export function deleteDoubleFBO(gl: WebGL2RenderingContext, fbo: DoubleFBO): void {
  deleteFBO(gl, fbo.read);
  deleteFBO(gl, fbo.write);
}
