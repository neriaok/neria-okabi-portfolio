/** Tiny raw-WebGL helper: one full-screen triangle + a fragment shader. No three.js needed. */
export type UniformValue = number | [number, number] | [number, number, number];

export interface Quad {
  gl: WebGLRenderingContext;
  set: (name: string, value: UniformValue) => void;
  draw: () => void;
  dispose: () => void;
}

const compile = (gl: WebGLRenderingContext, type: number, src: string): WebGLShader => {
  const sh = gl.createShader(type) as WebGLShader;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? 'shader error');
  return sh;
};

export const createQuad = (canvas: HTMLCanvasElement, vert: string, frag: string): Quad | null => {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) return null;
  const program = gl.createProgram() as WebGLProgram;
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const cache = new Map<string, WebGLUniformLocation | null>();
  const uni = (name: string) => {
    if (!cache.has(name)) cache.set(name, gl.getUniformLocation(program, name));
    return cache.get(name) ?? null;
  };

  return {
    gl,
    set: (name, value) => {
      const u = uni(name);
      if (typeof value === 'number') gl.uniform1f(u, value);
      else if (value.length === 2) gl.uniform2f(u, value[0], value[1]);
      else gl.uniform3f(u, value[0], value[1], value[2]);
    },
    draw: () => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose: () => {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
};
