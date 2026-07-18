import {
  Pass,
  type RenderTarget,
  createRenderTarget,
  deleteRenderTarget,
} from './pass';
import { fullscreenVert } from './shaders';
import { thresholdFrag } from './shaders';
import { blurFrag } from './shaders';
import { compositeFrag } from './shaders';
import { colorResponseFrag } from './shaders';
import { grainFrag } from './shaders';
import {
  CINESTILL_800T,
  paramsFromStock,
  type FilmStock,
  type LatentParams,
} from './stocks';

export type { FilmStock, LatentParams };

// halation is wide + soft scatter, no high-frequency content — quarter res
// costs nothing visually and makes the blur chain ~16× cheaper
const DOWNSAMPLE = 4;
// hard ceiling on blur iterations (each is one H + one V pass at quarter res)
const MAX_BLUR_ITERATIONS = 24;

export class LatentRenderer {
  readonly params: LatentParams = paramsFromStock(CINESTILL_800T);

  /** stock identity (matrices, tints, pivots) — swap/import at runtime */
  stock: FilmStock = CINESTILL_800T;

  private gl: WebGL2RenderingContext;
  readonly canvas: HTMLCanvasElement;
  /** seconds of film time per rendered frame — 1/60 for the realtime rAF
   *  loop; the exporter sets 1/fps so weave follows frame number, not clock */
  timeStep = 1 / 60;
  private video: HTMLVideoElement | null = null;
  private hasSource = false;
  private srcTex: WebGLTexture;
  private videoGeneration = 0;
  private frameDirty = false;

  // the pass chain, in execution order: threshold(+downsample) → blur ×N →
  // composite (halation = optical scatter during exposure) → colorResponse
  // (film chemistry responds to TOTAL exposure incl. the glow) → grain
  // (crystal structure of the developed film itself — physically last;
  // placing it earlier would let shoulder/tints re-model exposure dependence
  // we already model explicitly).
  private thresholdPass: Pass;
  private blurPass: Pass;
  private compositePass: Pass;
  private colorResponsePass: Pass;
  private grainPass: Pass;

  private ping: RenderTarget | null = null;
  private pong: RenderTarget | null = null;
  /** quarter-res irradiation field (short-range neutral scatter) */
  private irr: RenderTarget | null = null;
  /** full-res halation-composited scene, sRGB-encoded (linear in RGBA8 would
   *  band in the shadows — exactly where the toe lift amplifies errors) */
  private scene: RenderTarget | null = null;
  /** full-res color-graded frame, input to grain */
  private graded: RenderTarget | null = null;
  private raf = 0;
  /** frame counter seeding the grain noise (fresh field every frame) */
  private frame = 0;

  // gate weave: damped oscillators driven by white noise → band-limited
  // random walk centered near weaveSpeed Hz (docs item 7 forbids white
  // jitter). State x/y/angle is normalized to RMS ≈ 1; weaveAmount scales it
  // at apply time.
  private weave = { x: 0, vx: 0, y: 0, vy: 0, a: 0, va: 0 };
  /** last applied weave transform (uv offset + radians) — exposed for tests */
  lastWeave = { ox: 0, oy: 0, angle: 0 };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', {
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error('WebGL2 not available');
    this.gl = gl;

    // fullscreen triangle needs no attributes, just a bound VAO
    gl.bindVertexArray(gl.createVertexArray());

    this.thresholdPass = new Pass(gl, fullscreenVert, thresholdFrag);
    this.blurPass = new Pass(gl, fullscreenVert, blurFrag);
    this.compositePass = new Pass(gl, fullscreenVert, compositeFrag);
    this.colorResponsePass = new Pass(gl, fullscreenVert, colorResponseFrag);
    this.grainPass = new Pass(gl, fullscreenVert, grainFrag);

    this.srcTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.srcTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  private allocateTargets(w: number, h: number): void {
    const gl = this.gl;
    this.canvas.width = w;
    this.canvas.height = h;
    if (this.ping) deleteRenderTarget(gl, this.ping);
    if (this.pong) deleteRenderTarget(gl, this.pong);
    if (this.irr) deleteRenderTarget(gl, this.irr);
    if (this.scene) deleteRenderTarget(gl, this.scene);
    if (this.graded) deleteRenderTarget(gl, this.graded);
    const bw = Math.max(1, Math.round(w / DOWNSAMPLE));
    const bh = Math.max(1, Math.round(h / DOWNSAMPLE));
    this.ping = createRenderTarget(gl, bw, bh);
    this.pong = createRenderTarget(gl, bw, bh);
    this.irr = createRenderTarget(gl, bw, bh);
    this.scene = createRenderTarget(gl, w, h);
    this.graded = createRenderTarget(gl, w, h);
  }

  setVideo(video: HTMLVideoElement): void {
    this.video = video;
    const generation = ++this.videoGeneration;
    this.allocateTargets(video.videoWidth, video.videoHeight);

    // only re-upload the texture when the video actually produced a new
    // frame — for 24/30fps sources this halves+ the per-frame upload cost
    const onFrame = () => {
      if (generation !== this.videoGeneration) return;
      this.frameDirty = true;
      video.requestVideoFrameCallback(onFrame);
    };
    video.requestVideoFrameCallback(onFrame);
    this.frameDirty = true;
    this.hasSource = true;
  }

  /** static image source: uploaded once, rendered every frame (params live) */
  setImage(image: HTMLImageElement): void {
    this.video = null;
    this.videoGeneration++; // invalidate pending video frame callbacks
    this.allocateTargets(image.naturalWidth, image.naturalHeight);
    const gl = this.gl;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, this.srcTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    this.frameDirty = false;
    this.hasSource = true;
  }

  start(): void {
    const loop = () => {
      this.render();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  /** pause the realtime loop (the exporter drives frames itself) */
  stop(): void {
    cancelAnimationFrame(this.raf);
  }

  /** render one frame on demand with a forced source re-upload (export path) */
  renderExportFrame(): void {
    this.frameDirty = true;
    this.render();
  }

  private stepWeave(): void {
    const p = this.params;
    const S = p.engineStrength;
    if (!p.enableWeave || p.weaveAmount * S <= 0) {
      // exact zeros → weaveUV degenerates to identity, byte-exact when off
      this.lastWeave = { ox: 0, oy: 0, angle: 0 };
      return;
    }
    const dt = this.timeStep;
    const w0 = 2 * Math.PI * p.weaveSpeed;
    const zeta = 0.6;
    // drive amplitude chosen so the stationary RMS of x is ≈ 1:
    // Var(x) ≈ drive²·dt / (12·ζ·ω³) for uniform noise of amplitude `drive`
    const drive = Math.sqrt((12 * zeta) / dt) * Math.pow(w0, 1.5);
    const s = this.weave;
    const step = (x: number, v: number): [number, number] => {
      const acc =
        -w0 * w0 * x - 2 * zeta * w0 * v + drive * (Math.random() * 2 - 1);
      v += acc * dt;
      x = Math.max(-3, Math.min(3, x + v * dt));
      return [x, v];
    };
    [s.x, s.vx] = step(s.x, s.vx);
    [s.y, s.vy] = step(s.y, s.vy);
    [s.a, s.va] = step(s.a, s.va);
    const amp = p.weaveAmount * S;
    this.lastWeave = {
      // x offset scaled by h/w so displacement is the same PHYSICAL pixel
      // count in both axes (weaveAmount is a fraction of frame height)
      ox: s.x * amp * (this.canvas.height / this.canvas.width),
      oy: s.y * amp,
      angle: s.a * amp * 2.0, // tiny rotation, RMS ≈ 0.11° at default amount
    };
  }

  /**
   * Re-render synchronously and read one output pixel (canvas coords,
   * y-down). Returns sRGB bytes — directly comparable to a Photoshop probe.
   * Must render in the same task: with preserveDrawingBuffer=false the
   * rAF-drawn buffer is invalid after compositing.
   */
  probe(x: number, y: number): [number, number, number] | null {
    if (!this.hasSource) return null;
    this.render();
    const gl = this.gl;
    const px = new Uint8Array(4);
    gl.readPixels(
      Math.min(Math.max(x, 0), this.canvas.width - 1),
      Math.min(Math.max(this.canvas.height - 1 - y, 0), this.canvas.height - 1),
      1,
      1,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      px,
    );
    return [px[0], px[1], px[2]];
  }

  private render(): void {
    const gl = this.gl;
    const { video, ping, pong, irr, scene, graded } = this;
    if (
      !this.hasSource ||
      !ping ||
      !pong ||
      !irr ||
      !scene ||
      !graded ||
      (video !== null && video.readyState < 2)
    ) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }

    if (this.frameDirty && video) {
      this.frameDirty = false;
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.bindTexture(gl.TEXTURE_2D, this.srcTex);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA8,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        video,
      );
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    }

    const p = this.params;
    const { threshold, radius } = p;
    const stock = this.stock;
    // engineStrength: the "de-AI amount" master. Every strength field lerps
    // identity→value; since every identity value is exactly 0, the lerp is a
    // multiply. S=0 leaves the chain byte-exact (zero-strength steps are
    // float-exact no-ops), S=1 is the calibrated stock, >1 exaggerates.
    const S = p.engineStrength;
    const intensity = p.intensity * S;

    // 0. gate weave transform for this frame (applied wherever the source
    // texture is sampled — threshold and composite must agree)
    this.stepWeave();
    const wv = this.lastWeave;

    // 1. highlight extraction, downsampling to quarter res in the same pass
    gl.bindFramebuffer(gl.FRAMEBUFFER, ping.fbo);
    gl.viewport(0, 0, ping.width, ping.height);
    this.thresholdPass.use();
    this.thresholdPass.setTexture('u_src', this.srcTex, 0);
    this.thresholdPass.setFloat('u_threshold', threshold);
    this.thresholdPass.setVec2('u_weaveOffset', wv.ox, wv.oy);
    this.thresholdPass.setFloat('u_weaveAngle', wv.angle);
    this.thresholdPass.draw();

    // 1b. irradiation: one small-step H+V blur pair off the SHARED threshold
    // extraction (both phenomena trigger on the same overexposed regions; the
    // difference is scatter geometry, so the expensive full-res extraction is
    // done once). Reads ping before the halation chain consumes it.
    const irrOn = p.enableIrradiation && p.irradiationIntensity * S > 0;
    if (irrOn) {
      const step = Math.min(p.irradiationRadius, 2);
      this.blurPass.use();
      gl.bindFramebuffer(gl.FRAMEBUFFER, pong.fbo);
      this.blurPass.setTexture('u_src', ping.tex, 0);
      this.blurPass.setVec2('u_dir', step / ping.width, 0);
      this.blurPass.draw();
      gl.bindFramebuffer(gl.FRAMEBUFFER, irr.fbo);
      this.blurPass.setTexture('u_src', pong.tex, 0);
      this.blurPass.setVec2('u_dir', 0, step / ping.height);
      this.blurPass.draw();
    }

    // 2. separable gaussian, ping-pong H/V per iteration. Scaling the kernel
    // step by radius directly leaves comb artifacts (sparse taps on hard
    // highlights), so radius maps to ITERATION COUNT instead: one σ≈1.63·s
    // pass per iteration, identical kernels convolved N times converge to a
    // true gaussian with σ ≈ 1.63·step·√N. First pass at step ≤ 1 band-limits
    // the source; the rest run at step 2, dense enough to stay comb-free.
    // N = radius²/4 makes the slider ≈ linear in final σ (quarter-res texels).
    const iterations = Math.min(
      MAX_BLUR_ITERATIONS,
      Math.max(1, Math.round((radius * radius) / 4)),
    );
    this.blurPass.use();
    for (let i = 0; i < iterations; i++) {
      const step = i === 0 ? Math.min(1, radius) : 2;
      gl.bindFramebuffer(gl.FRAMEBUFFER, pong.fbo);
      this.blurPass.setTexture('u_src', ping.tex, 0);
      this.blurPass.setVec2('u_dir', step / ping.width, 0);
      this.blurPass.draw();

      gl.bindFramebuffer(gl.FRAMEBUFFER, ping.fbo);
      this.blurPass.setTexture('u_src', pong.tex, 0);
      this.blurPass.setVec2('u_dir', 0, step / ping.height);
      this.blurPass.draw();
    }

    // 3. tint + screen blend over the untouched base → full-res scene buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, scene.fbo);
    gl.viewport(0, 0, scene.width, scene.height);
    this.compositePass.use();
    this.compositePass.setTexture('u_base', this.srcTex, 0);
    this.compositePass.setTexture('u_halation', ping.tex, 1);
    this.compositePass.setFloat('u_intensity', intensity);
    this.compositePass.setVec3('u_halationTint', stock.halationTint);
    this.compositePass.setTexture('u_irradiation', irr.tex, 2);
    this.compositePass.setFloat(
      'u_irradiationIntensity',
      irrOn ? p.irradiationIntensity * S : 0, // CPU-gated: off = exact zero
    );
    this.compositePass.setVec2('u_weaveOffset', wv.ox, wv.oy);
    this.compositePass.setFloat('u_weaveAngle', wv.angle);
    this.compositePass.draw();

    // 4. film color response (crosstalk → characteristic curve → zonal tint)
    // → full-res graded buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, graded.fbo);
    gl.viewport(0, 0, graded.width, graded.height);
    const cr = this.colorResponsePass;
    cr.use();
    cr.setTexture('u_src', scene.tex, 0);
    cr.setBool('u_enableCrosstalk', p.enableCrosstalk);
    cr.setMat3('u_crosstalk', stock.crosstalk);
    cr.setFloat('u_crosstalkAmount', p.crosstalk * S);
    cr.setBool('u_enableCurve', p.enableCurve);
    cr.setFloat('u_toeStrength', p.toe * S);
    cr.setFloat('u_toePoint', stock.toePoint);
    cr.setFloat('u_shoulderStrength', p.shoulder * S);
    cr.setFloat('u_shoulderPoint', stock.shoulderPoint);
    cr.setBool('u_enableTints', p.enableTints);
    cr.setVec3('u_shadowTint', stock.shadowTint);
    cr.setVec3('u_highlightTint', stock.highlightTint);
    cr.setFloat('u_shadowTintAmount', p.shadowTintAmount * S);
    cr.setFloat('u_highlightTintAmount', p.highlightTintAmount * S);
    cr.setVec3('u_midTint', stock.midTint);
    cr.setFloat('u_midTintAmount', p.midTintAmount * S);
    cr.setFloat('u_tintCenter', stock.tintCenter);
    cr.setFloat('u_tintWidth', stock.tintWidth);
    cr.setBool('u_enableDesat', p.enableDesat);
    cr.setFloat('u_desatStart', p.desatStart);
    cr.setFloat('u_desatStrength', p.desatStrength * S);
    cr.setBool('u_enableFog', p.enableFog);
    cr.setFloat('u_fogAmount', p.fogAmount * S);
    cr.setVec3('u_fogTint', stock.fogTint);
    cr.draw();

    // 5. grain (developed crystal structure), out to the canvas. The frame
    // counter reseeds the field every render — film has no fixed-pattern
    // noise, so static sources boil by design.
    this.frame = (this.frame + 1) % 0x100000; // stay well inside float-exact ints
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    const gp = this.grainPass;
    gp.use();
    gp.setTexture('u_src', graded.tex, 0);
    gp.setVec2('u_resolution', this.canvas.width, this.canvas.height);
    gp.setFloat('u_frame', this.frame);
    gp.setBool('u_enableGrain', p.enableGrain);
    gp.setFloat('u_grainIntensity', p.grainIntensity * S);
    gp.setFloat('u_grainSize', p.grainSize);
    gp.setFloat('u_grainExposureBias', p.grainExposureBias);
    gp.setFloat('u_grainExposureWidth', p.grainExposureWidth);
    gp.setFloat('u_grainChromaRatio', p.grainChromaRatio);
    gp.setFloat('u_grainShadowSizeBoost', p.grainShadowSizeBoost);
    gp.setVec3('u_grainChannelBalance', stock.grainChannelBalance);
    gp.setBool('u_grainNarrowband', p.grainNarrowband);
    gp.draw();
  }

  dispose(): void {
    cancelAnimationFrame(this.raf);
    this.videoGeneration++;
    const gl = this.gl;
    this.thresholdPass.dispose();
    this.blurPass.dispose();
    this.compositePass.dispose();
    this.colorResponsePass.dispose();
    this.grainPass.dispose();
    gl.deleteTexture(this.srcTex);
    if (this.ping) deleteRenderTarget(gl, this.ping);
    if (this.pong) deleteRenderTarget(gl, this.pong);
    if (this.irr) deleteRenderTarget(gl, this.irr);
    if (this.scene) deleteRenderTarget(gl, this.scene);
    if (this.graded) deleteRenderTarget(gl, this.graded);
    this.ping = this.pong = this.irr = this.scene = this.graded = null;
  }
}
