import { srgbInclude } from './shaders';

/** minimal include preprocessor — one shared snippet, no mixed transfer fns */
function preprocess(src: string): string {
  return src.replace('#include <srgb>', srgbInclude);
}

/**
 * One shader pass: a program drawing a fullscreen triangle into whatever
 * framebuffer is currently bound. Passes know nothing about their position
 * in the chain — the renderer owns pass ordering and target routing, so
 * future passes (grain, tone curves) just slot into the sequence.
 */
export class Pass {
  private gl: WebGL2RenderingContext;
  readonly program: WebGLProgram;
  private uniforms = new Map<string, WebGLUniformLocation | null>();

  constructor(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string) {
    this.gl = gl;
    const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, preprocess(fragSrc));
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Program link failed: ${log}`);
    }
    this.program = program;
  }

  use(): void {
    this.gl.useProgram(this.program);
  }

  private loc(name: string): WebGLUniformLocation | null {
    let loc = this.uniforms.get(name);
    if (loc === undefined) {
      loc = this.gl.getUniformLocation(this.program, name);
      this.uniforms.set(name, loc);
    }
    return loc;
  }

  setFloat(name: string, v: number): void {
    this.gl.uniform1f(this.loc(name), v);
  }

  setVec2(name: string, x: number, y: number): void {
    this.gl.uniform2f(this.loc(name), x, y);
  }

  setVec3(name: string, v: readonly [number, number, number]): void {
    this.gl.uniform3f(this.loc(name), v[0], v[1], v[2]);
  }

  /** m is row-major (as written in stocks.ts); WebGL2 transposes on upload */
  setMat3(name: string, m: ArrayLike<number>): void {
    this.gl.uniformMatrix3fv(this.loc(name), true, m as Float32List);
  }

  setBool(name: string, v: boolean): void {
    this.gl.uniform1i(this.loc(name), v ? 1 : 0);
  }

  setTexture(name: string, tex: WebGLTexture, unit: number): void {
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
    this.gl.uniform1i(this.loc(name), unit);
  }

  draw(): void {
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
  }

  dispose(): void {
    this.gl.deleteProgram(this.program);
  }
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  src: string,
): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${log}\n${src}`);
  }
  return shader;
}

export interface RenderTarget {
  fbo: WebGLFramebuffer;
  tex: WebGLTexture;
  width: number;
  height: number;
}

export function createRenderTarget(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
): RenderTarget {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  // RGBA8 is enough while halation energy stays ≤ 1; swap to RGBA16F
  // (EXT_color_buffer_float) when HDR thresholding lands
  gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, width, height);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    tex,
    0,
  );
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { fbo, tex, width, height };
}

export function deleteRenderTarget(
  gl: WebGL2RenderingContext,
  target: RenderTarget,
): void {
  gl.deleteFramebuffer(target.fbo);
  gl.deleteTexture(target.tex);
}
