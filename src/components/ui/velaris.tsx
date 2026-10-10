import { useEffect, useRef } from "react";

// Adapted from the supplied Velaris simplex-noise animation.
const vertex = `
attribute vec2 position;
varying vec2 vUv;
void main() { vUv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }
`;
const fragment = `
precision highp float;
varying vec2 vUv;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_brand;
uniform vec3 u_shade;
uniform vec3 u_light;
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 a0 = x - floor(x + 0.5);
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
void main() {
  vec2 p = vUv - 0.5;
  p.x *= u_resolution.x / max(u_resolution.y, 1.0);
  float t = u_time * 0.1;
  float n1 = snoise(p * 1.4 + vec2(t * 0.3, -t * 0.4));
  float n2 = snoise(p * 2.1 + vec2(-t * 0.2, t * 0.3) + n1 * 0.4);
  float flow = smoothstep(-0.6, 0.7, n1 + n2 * 0.35);
  vec3 col = mix(u_shade, u_brand, 0.42 + flow * 0.5);
  float silk = smoothstep(0.1, 0.8, n2) * 0.045;
  col = mix(col, u_light, silk);
  float grain = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * 0.012;
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function Velaris() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const panel = canvas?.parentElement;
    if (!canvas || !panel) return;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;
    function compile(type: number, source: string) {
      if (!gl) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }
    const vs = compile(gl.VERTEX_SHADER, vertex);
    const fs = compile(gl.FRAGMENT_SHADER, fragment);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      if (program) gl.deleteProgram(program);
      return;
    }
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    const buffer = gl.createBuffer();
    const dispose = () => { gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vs); gl.deleteShader(fs); };
    if (!gl.getProgramParameter(program, gl.LINK_STATUS) || !buffer) { dispose(); return; }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const styles = getComputedStyle(panel);
    for (const name of ["brand", "shade", "light"]) {
      const hex = styles.getPropertyValue(`--auth-motion-${name}`).trim().replace("#", "");
      const rgb = [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255);
      gl.uniform3fv(gl.getUniformLocation(program, `u_${name}`), rgb);
    }
    const resolution = gl.getUniformLocation(program, "u_resolution");
    const time = gl.getUniformLocation(program, "u_time");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let elapsed = 0;
    let previous = 0;
    const draw = () => {
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform1f(time, elapsed);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(panel.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(panel.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height); draw();
    };
    const animate = (now: number) => {
      if (previous) elapsed += Math.min(now - previous, 100) * 0.001;
      previous = now; draw(); frame = requestAnimationFrame(animate);
    };
    const resume = () => {
      cancelAnimationFrame(frame); previous = 0;
      if (!reduced.matches && !document.hidden) frame = requestAnimationFrame(animate);
      else draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(panel); resize(); resume();
    reduced.addEventListener("change", resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      reduced.removeEventListener("change", resume);
      document.removeEventListener("visibilitychange", resume); dispose();
    };
  }, []);
  return <canvas ref={ref} className="velaris-canvas" aria-hidden="true" />;
}