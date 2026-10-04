/**
 * SmokeGradient
 *
 * Raw WebGL animated smoke gradient component.
 * Renders multiple soft smoke columns (plumes) rising from the bottom edge at spread
 * x-positions, each tinted with colors cycling from the colors array, advected upward
 * over time via layered FBM turbulence, curled sideways, fading out smoothly toward height,
 * blended over background, and softly responsive to pointer interaction.
 *
 * Props:
 * - colors {string[]} (default: ['#6366f1', '#38bdf8', '#ec4899']): Array of hex plume colors.
 * - background {string} (default: '#060814'): Hex background color under the smoke.
 * - density {number} (default: 0.45): Opacity and thickness multiplier for smoke columns.
 * - plumes {number} (default: 3): Number of smoke columns (1–5).
 * - height {number} (default: 0.8): Max vertical reach of plumes before fading out (0..1).
 * - rise {number} (default: 0.4): Upward drift speed.
 * - curl {number} (default: 0.6): Lateral FBM turbulence and displacement amount.
 * - softness {number} (default: 0.7): Width and horizontal falloff spread of plumes.
 * - grain {number} (default: 0.05): Film grain hash noise amplitude.
 * - grainMotion {boolean} (default: false): If true, film grain animates with time.
 * - interactive {boolean} (default: true): If true, cursor softly pushes smoke away.
 * - transition {number} (default: 1.2): Seconds to cross-fade when colors or background change.
 * - paused {boolean} (default: false): Pauses motion while drawing a static frame.
 * - className {string} (default: ''): CSS classes for the container <div>.
 * - style {object} (default: {}): Inline styles for the container <div>.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useShaderCanvas } from './useShaderCanvas.js';

/** Respect positioning utilities passed via className (inline styles would override them). */
const POSITIONED = /(^|\s)(absolute|fixed|relative|sticky)(\s|$)/;

const SMOKE_FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vUv;

uniform vec2 uResolution;
uniform float uTime;
uniform float uDensity;
uniform float uPlumes;
uniform float uHeight;
uniform float uRise;
uniform float uCurl;
uniform float uSoftness;
uniform float uGrain;
uniform float uGrainMotion;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform vec3 uBackground;
uniform vec3 uColors[5];

// Fast pseudo-random hash
float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// 2D smooth value noise
float noise2d(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i + vec2(0.0, 0.0)), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// 4 octaves of FBM (well within max 5 octaves)
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  v += a * noise2d(p); p = p * 2.02 + vec2(1.7, 9.2); a *= 0.5;
  v += a * noise2d(p); p = p * 2.03 + vec2(8.3, 2.8); a *= 0.5;
  v += a * noise2d(p); p = p * 2.01 + vec2(4.1, 5.7); a *= 0.5;
  v += a * noise2d(p);
  return v;
}

void main() {
  // Upward motion: sample coordinates advance downwards as time flows
  float t = uTime * uRise;
  vec2 flow = vec2(vUv.x * 2.4, vUv.y * 1.6 - t);

  // Curl turbulence sideways
  vec2 curl = vec2(
    (fbm(flow) - 0.5) * uCurl * 0.45,
    (fbm(flow + vec2(5.2, 1.3)) - 0.5) * uCurl * 0.25
  );
  vec2 warpedUv = vUv + curl;

  // Pointer interaction: softly pushes smoke away from cursor
  if (uPointerStrength > 0.001) {
    vec2 pDiff = warpedUv - uPointer;
    float aspect = uResolution.x / max(1.0, uResolution.y);
    vec2 aspectDiff = pDiff;
    aspectDiff.x *= aspect;
    float pDist = length(aspectDiff);
    float pushRadius = 0.38;
    if (pDist < pushRadius && pDist > 0.0001) {
      float pushForce = smoothstep(pushRadius, 0.0, pDist) * uPointerStrength * 0.18;
      vec2 pushDir = normalize(aspectDiff);
      pushDir.x /= aspect;
      warpedUv += pushDir * pushForce;
    }
  }

  vec3 color = uBackground;
  float numPlumes = max(1.0, uPlumes);

  for (int i = 0; i < 5; i++) {
    if (float(i) >= uPlumes) break;

    // Plumes evenly spread across bottom edge with subtle organic drift
    float wobble = sin(t * 0.8 + float(i) * 2.1) * 0.04 * uCurl;
    float xCenter = (float(i) + 1.0) / (numPlumes + 1.0) + wobble;

    // Plume column width expands as it ascends
    float width = (0.09 + 0.22 * max(0.0, warpedUv.y)) * (uSoftness * 0.8 + 0.5);
    float dx = abs(warpedUv.x - xCenter);
    float plumeProfile = exp(-(dx * dx) / (2.0 * width * width));

    // Vertical fade: rises from bottom edge, fades out toward uHeight
    float bottomFade = smoothstep(0.0, 0.07, warpedUv.y);
    float topFade = smoothstep(uHeight, max(0.01, uHeight * 0.3), warpedUv.y);
    float verticalEnvelope = bottomFade * topFade;

    // Fine smoke turbulence detail inside plume
    float smokeDetail = fbm(vec2(warpedUv.x * 3.6 + float(i) * 3.7, warpedUv.y * 2.2 - t * 1.3));
    float plumeAlpha = plumeProfile * verticalEnvelope * (0.35 + 0.65 * smokeDetail) * (uDensity * 2.4);
    plumeAlpha = clamp(plumeAlpha, 0.0, 1.0);

    color = mix(color, uColors[i], plumeAlpha);
  }

  // Grain noise: static or animated
  float grainSeed = (uGrainMotion > 0.5) ? fract(uTime * 11.23) : 0.0;
  float grainNoise = (hash21(gl_FragCoord.xy + grainSeed * 100.0) - 0.5) * uGrain;
  color = clamp(color + vec3(grainNoise), 0.0, 1.0);

  gl_FragColor = vec4(color, 1.0);
}
`;

function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return [0, 0, 0];
  let h = hex.trim();
  if (h.startsWith('#')) h = h.slice(1);
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const num = parseInt(h, 16);
  if (Number.isNaN(num)) return [0, 0, 0];
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255,
  ];
}

function populateSmokeColorArray(colors, targetArray) {
  const list = Array.isArray(colors) && colors.length > 0
    ? colors
    : ['#6366f1', '#38bdf8', '#ec4899'];
  for (let i = 0; i < 5; i++) {
    const hex = list[i % list.length];
    const [r, g, b] = hexToRgb(hex);
    targetArray[i * 3 + 0] = r;
    targetArray[i * 3 + 1] = g;
    targetArray[i * 3 + 2] = b;
  }
}

function populateBgArray(bgHex, targetArray) {
  const [r, g, b] = hexToRgb(bgHex || '#060814');
  targetArray[0] = r;
  targetArray[1] = g;
  targetArray[2] = b;
}

function lerpColorArrays(start, target, current, t) {
  const factor = Math.max(0, Math.min(1, t));
  const ease = factor * factor * (3.0 - 2.0 * factor);
  for (let i = 0; i < current.length; i++) {
    current[i] = start[i] + (target[i] - start[i]) * ease;
  }
}

export function SmokeGradient({
  colors = ['#6366f1', '#38bdf8', '#ec4899'],
  background = '#060814',
  density = 0.45,
  plumes = 3,
  height = 0.8,
  rise = 0.4,
  curl = 0.6,
  softness = 0.7,
  grain = 0.05,
  grainMotion = false,
  interactive = true,
  transition = 1.2,
  paused = false,
  className = '',
  style = {},
}) {
  // Pre-allocated typed arrays to eliminate garbage collection inside RAF
  const currentColorsRef = useRef(new Float32Array(15));
  const targetColorsRef = useRef(new Float32Array(15));
  const startColorsRef = useRef(new Float32Array(15));

  const currentBgRef = useRef(new Float32Array(3));
  const targetBgRef = useRef(new Float32Array(3));
  const startBgRef = useRef(new Float32Array(3));

  const transitionStartTimeRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const isMountedRef = useRef(false);

  const colorsKey = Array.isArray(colors) ? colors.join(',') : '';

  const getUniforms = useCallback(() => {
    if (isTransitioningRef.current) {
      const duration = Math.max(0.001, transition) * 1000;
      const elapsed = (performance.now() - transitionStartTimeRef.current) / duration;
      if (elapsed >= 1.0) {
        currentColorsRef.current.set(targetColorsRef.current);
        currentBgRef.current.set(targetBgRef.current);
        isTransitioningRef.current = false;
      } else {
        lerpColorArrays(
          startColorsRef.current,
          targetColorsRef.current,
          currentColorsRef.current,
          elapsed
        );
        lerpColorArrays(
          startBgRef.current,
          targetBgRef.current,
          currentBgRef.current,
          elapsed
        );
      }
    }

    return {
      uDensity: density,
      uPlumes: Math.max(1, Math.min(5, Math.round(plumes || 3))),
      uHeight: Math.max(0.01, Math.min(1.0, height)),
      uRise: rise,
      uCurl: curl,
      uSoftness: softness,
      uGrain: grain,
      uGrainMotion: grainMotion ? 1.0 : 0.0,
      uBackground: currentBgRef.current,
      uColors: currentColorsRef.current,
      animating: isTransitioningRef.current,
    };
  }, [density, plumes, height, rise, curl, softness, grain, grainMotion, transition]);

  const { canvasRef, containerRef, supported, requestRender, renderStaticFrame } = useShaderCanvas({
    fragmentSource: SMOKE_FRAGMENT_SHADER,
    getUniforms,
    paused,
    maxDpr: 1.5,
    interactive,
  });

  // Track colors and background changes for smooth cross-fading
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      populateSmokeColorArray(colors, currentColorsRef.current);
      populateSmokeColorArray(colors, targetColorsRef.current);
      startColorsRef.current.set(currentColorsRef.current);

      populateBgArray(background, currentBgRef.current);
      populateBgArray(background, targetBgRef.current);
      startBgRef.current.set(currentBgRef.current);

      renderStaticFrame();
      return;
    }

    startColorsRef.current.set(currentColorsRef.current);
    startBgRef.current.set(currentBgRef.current);

    populateSmokeColorArray(colors, targetColorsRef.current);
    populateBgArray(background, targetBgRef.current);

    if (transition <= 0) {
      currentColorsRef.current.set(targetColorsRef.current);
      currentBgRef.current.set(targetBgRef.current);
      isTransitioningRef.current = false;
      renderStaticFrame();
    } else {
      transitionStartTimeRef.current = performance.now();
      isTransitioningRef.current = true;
      requestRender();
    }
  }, [colorsKey, background, transition, colors, requestRender, renderStaticFrame]);

  // Redraw static frame when paused and styling props change
  useEffect(() => {
    if (paused) {
      renderStaticFrame();
    }
  }, [
    paused,
    density,
    plumes,
    height,
    rise,
    curl,
    softness,
    grain,
    grainMotion,
    renderStaticFrame,
  ]);

  // CSS fallback if WebGL is unavailable or failed compilation
  if (!supported) {
    const plumeColors = Array.isArray(colors) && colors.length > 0
      ? colors
      : ['#6366f1', '#38bdf8', '#ec4899'];
    const bg = background || '#060814';
    return (
      <div
        className={className}
        style={{
          ...(POSITIONED.test(className) ? null : { position: 'relative' }),
          overflow: 'hidden',
          ...style,
        }}
        aria-hidden="true"
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            backgroundColor: bg,
            backgroundImage: `
              radial-gradient(ellipse 35% 65% at 25% 100%, ${plumeColors[0] || '#6366f1'} 0%, transparent 70%),
              radial-gradient(ellipse 40% 75% at 50% 100%, ${plumeColors[1 % plumeColors.length] || '#38bdf8'} 0%, transparent 75%),
              radial-gradient(ellipse 35% 65% at 75% 100%, ${plumeColors[2 % plumeColors.length] || '#ec4899'} 0%, transparent 70%)
            `,
            filter: 'blur(32px)',
            pointerEvents: 'none',
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        ...(POSITIONED.test(className) ? null : { position: 'relative' }),
        overflow: 'hidden',
        ...style,
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

export default SmokeGradient;
