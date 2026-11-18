/**
 * Draws a video frame through WebGL with its black background keyed to transparency
 * (for clips shot on black). The frame is "cover"-fitted to the canvas, like object-fit.
 */
const VERT = `attribute vec2 p; varying vec2 v; uniform vec2 s; uniform vec2 o;
void main(){ v = (p * 0.5 + 0.5) * s + o; v.y = 1.0 - v.y; gl_Position = vec4(p, 0.0, 1.0); }`;

// Premultiplied output: on black, the clip's colour already is "colour × alpha".
// u.x: fade in from the top over this share of the height; u.y: hide everything below this height (1 = off);
// u.z: overall opacity; u.w: hide everything above this height (0 = off).
const FRAG = `precision mediump float; varying vec2 v; uniform sampler2D t; uniform vec4 u;
void main(){
  if (v.x < 0.0 || v.x > 1.0 || v.y < 0.0 || v.y > 1.0) { gl_FragColor = vec4(0.0); return; }
  vec3 c = texture2D(t, v).rgb;
  float m = max(c.r, max(c.g, c.b));
  vec3 rgb = c * smoothstep(0.025, 0.09, m);
  float a = max(smoothstep(0.03, 0.26, m), max(rgb.r, max(rgb.g, rgb.b)));
  float k = u.z;
  if (u.x > 0.0) k *= smoothstep(0.0, u.x, v.y);
  k *= 1.0 - smoothstep(u.y - 0.06, u.y, v.y);
  if (u.w > 0.0) k *= smoothstep(u.w - 0.015, u.w + 0.03, v.y);
  gl_FragColor = vec4(rgb, a) * k;
}`;

export interface KeyOptions {
  topFade?: number;
  cutBelow?: number;
  opacity?: number;
  cutAbove?: number;
}

export type Keyer = (video: HTMLVideoElement, options?: KeyOptions) => void;

export const createKeyer = (canvas: HTMLCanvasElement): Keyer | null => {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;
  const shader = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const uS = gl.getUniformLocation(prog, 's');
  const uO = gl.getUniformLocation(prog, 'o');
  const uU = gl.getUniformLocation(prog, 'u');

  return (video, { topFade = 0, cutBelow = 1.06, opacity = 1, cutAbove = 0 } = {}) => {
    if (video.readyState < 2 || !video.videoWidth) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (!w || !h) return;
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const scale = Math.max(w / video.videoWidth, h / video.videoHeight);
    const sx = w / (video.videoWidth * scale);
    const sy = h / (video.videoHeight * scale);
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uS, sx, sy);
    gl.uniform2f(uO, (1 - sx) / 2, (1 - sy) / 2);
    gl.uniform4f(uU, topFade, cutBelow, opacity, cutAbove);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
};
