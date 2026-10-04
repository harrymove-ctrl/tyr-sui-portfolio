/**
 * Auralis — full-page animated aura background (adapted from ForgeUI "Auralis":
 * layered simplex noise, glowing light bands, vignette, film grain).
 *
 * Adapted for the portfolio:
 * - Colors come from the active theme; on light themes the aura tints the page color
 *   instead of glowing out of black, so text stays readable.
 * - Runs through useShaderCanvas: pauses offscreen, in background tabs, with the motion
 *   toggle and prefers-reduced-motion (a static frame stays). Rendered at low resolution —
 *   the field is soft, so 0.6× DPR is invisible but cheap.
 *
 * Props: colors (3 hex), base (hex), light (bool), speed=0.3, grain=0.35, paused, className.
 */
import { useCallback, useRef } from 'react';
import { useShaderCanvas } from './useShaderCanvas.js';

const FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform vec2 uResolution;
uniform float uTime;
uniform float uSpeed;
uniform float uGrain;
uniform float uLight;
uniform vec3 uBase;
uniform vec3 uColors[3];

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  float ratio = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = uv * vec2(ratio, 1.0);
  float t = uTime * uSpeed * 0.2;

  float n1 = snoise(p * 0.5 + t);
  float n2 = snoise(p * 0.9 - t * 0.5 + n1);
  float n3 = snoise(p * 0.35 + vec2(t * 0.3, -t * 0.2));
  float light = pow(abs(n2), 2.5) * 0.5;
  float a1 = smoothstep(0.1, 1.0, n1) * 0.5;
  float a3 = smoothstep(0.2, 1.0, n3) * 0.35;

  vec3 col;
  if (uLight > 0.5) {
    // Tint the page color: soft color fields, never darker than needed for contrast.
    col = uBase;
    col = mix(col, uColors[0], a1 * 1.3);
    col = mix(col, uColors[1], light * 1.4);
    col = mix(col, uColors[2], a3);
  } else {
    // Original Auralis: glow out of the dark base.
    col = uBase + uColors[0] * a1 + uColors[1] * light + uColors[2] * a3 * 0.6;
  }

  float grain = fract(sin(dot(uv * uResolution, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * uGrain * 0.08;

  // Vignette back toward the base color so edges stay calm.
  float dist = length(uv - 0.5);
  col = mix(uBase, col, smoothstep(1.0, 0.25, dist));
  gl_FragColor = vec4(col, 1.0);
}
`;

const hexToRgb = (hex) => {
  const h = (hex || '#000000').trim().replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
};

export function Auralis({ colors, base, light = true, speed = 0.3, grain = 0.35, paused = false, className = '' }) {
  const colorBuf = useRef(new Float32Array(9));
  const baseBuf = useRef(new Float32Array(3));
  colors.slice(0, 3).forEach((c, i) => colorBuf.current.set(hexToRgb(c), i * 3));
  baseBuf.current.set(hexToRgb(base));

  const getUniforms = useCallback(
    () => ({
      uSpeed: speed,
      uGrain: grain,
      uLight: light ? 1 : 0,
      uBase: baseBuf.current,
      uColors: colorBuf.current,
    }),
    [speed, grain, light],
  );

  const { canvasRef, containerRef, supported, renderStaticFrame } = useShaderCanvas({
    fragmentSource: FRAGMENT,
    getUniforms,
    paused,
    maxDpr: 0.6,
    interactive: false,
  });

  // Redraw when the theme palette changes while paused.
  const key = `${colors.join()}|${base}|${light}`;
  const lastKey = useRef(key);
  if (lastKey.current !== key) {
    lastKey.current = key;
    queueMicrotask(renderStaticFrame);
  }

  if (!supported) {
    return (
      <div
        aria-hidden
        className={className}
        style={{
          background: `radial-gradient(60% 50% at 20% 20%, ${colors[0]}55, transparent 70%), radial-gradient(50% 45% at 80% 60%, ${colors[1]}55, transparent 70%), ${base}`,
        }}
      />
    );
  }

  return (
    <div ref={containerRef} aria-hidden className={className}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}
      />
    </div>
  );
}

export default Auralis;
