export const vertex = /* glsl */ `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// A surreal "diorama" world: sky gradient, glowing horizon, drifting clouds, a mirror floor with
// ripples and floating bokeh. The palette and a camera push-in are driven from JS.
export const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uPush;
  uniform float uFade;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform float uRipple;
  uniform vec3 uDeep;
  uniform vec3 uMid;
  uniform vec3 uGlow;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 0.17; a *= 0.5; }
    return v;
  }

  vec3 sky(vec2 uv, float t) {
    float h = uv.y;
    vec3 col = mix(uMid * 0.55, uDeep, smoothstep(-0.05, 0.75, h));
    col += uGlow * 0.85 * exp(-abs(h) * 7.0);                       // horizon glow
    vec2 sp = vec2(uv.x * 0.9 + 0.12 * uMouse.x, h);
    col += uGlow * 0.55 * exp(-length((sp - vec2(0.0, 0.06)) * vec2(1.0, 2.2)) * 3.2); // sun
    float c = fbm(vec2(uv.x * 1.6 + t * 0.03, h * 4.0 - t * 0.01));
    float clouds = smoothstep(0.52, 0.85, c) * smoothstep(0.02, 0.35, h) * (1.0 - smoothstep(0.55, 0.95, h));
    col = mix(col, mix(uMid, uGlow, 0.55) * 1.05, clouds * 0.55);
    return col;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
    float t = uTime;
    float zoom = 1.0 - uPush * 0.35;
    uv *= zoom;
    uv.y += 0.05 - uPush * 0.04;

    vec3 col;
    if (uv.y > 0.0) {
      col = sky(uv, t);
    } else {
      // mirror floor with ripples
      float depth = -uv.y;
      vec2 m = uMouse;
      float d = length(uv - m);
      float wave = sin(depth * 60.0 / (depth + 0.08) - t * 1.6) * 0.004 + (noise(vec2(uv.x * 8.0, depth * 40.0 - t)) - 0.5) * 0.012 * depth;
      wave += 0.02 * uRipple * exp(-d * 5.0) * sin(d * 40.0 - t * 5.0);
      vec2 r = vec2(uv.x + wave, depth * 0.85 + wave);
      col = sky(r, t) * mix(0.55, 0.28, smoothstep(0.0, 0.6, depth));
      col += uGlow * 0.25 * exp(-depth * 18.0);
    }

    // floating bokeh
    for (int i = 0; i < 9; i++) {
      float fi = float(i);
      vec2 p = vec2(hash(vec2(fi, 1.3)) * 2.4 - 1.2, hash(vec2(fi, 7.1)) * 0.9 - 0.15);
      p.y += sin(t * 0.35 + fi * 1.7) * 0.03;
      p.x += sin(t * 0.21 + fi) * 0.02;
      p *= zoom;
      float s = 0.012 + hash(vec2(fi, 3.3)) * 0.035;
      float b = smoothstep(s, s * 0.35, length(uv - p));
      col += mix(uGlow, vec3(1.0), 0.3) * b * 0.18;
    }

    col *= 1.0 - smoothstep(0.6, 1.45, length((vUv - 0.5) * vec2(1.25, 1.0)));
    col = mix(vec3(0.03, 0.03, 0.045), col, uFade);
    gl_FragColor = vec4(col, 1.0);
  }
`;
