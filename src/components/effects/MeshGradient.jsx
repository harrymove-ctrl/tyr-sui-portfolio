/**
 * MeshGradient
 *
 * Raw WebGL animated mesh gradient component inspired by Stripe/Paper design.
 * Features 6 color blobs drifting on slow Lissajous paths, blended with smooth
 * Gaussian inverse-distance weights, domain warped by low-frequency noise (distortion),
 * gently swirled around the center, and reactive to pointer movement.
 * Includes static/animated grain, smooth JS-lerped color cross-fading, and CSS fallback.
 *
 * Props:
 * - colors {string[]} (required): Array of 2–6 hex color strings.
 * - speed {number} (default: 0.35): Time progression rate; a full drift cycle takes ~10–20s.
 * - scale {number} (default: 1.2): UV field zoom / scale factor.
 * - distortion {number} (default: 0.4): Amplitude of low-frequency domain noise warping.
 * - swirl {number} (default: 0.2): Center vortex rotation amount.
 * - softness {number} (default: 0.7): Spread/falloff radius of the color blob weights.
 * - grain {number} (default: 0.06): Amplitude of film grain hash noise.
 * - grainMotion {boolean} (default: false): If true, grain noise animates over time.
 * - interactive {boolean} (default: true): If true, cursor softly bends the field toward pointer.
 * - transition {number} (default: 1.2): Seconds to cross-fade when colors change.
 * - paused {boolean} (default: false): Pauses motion while drawing a static frame.
 * - className {string} (default: ''): CSS classes for the container <div>.
 * - style {object} (default: {}): Inline styles for the container <div>.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useShaderCanvas } from './useShaderCanvas.js';

/** Respect positioning utilities passed via className (inline styles would override them). */
const POSITIONED = /(^|\s)(absolute|fixed|relative|sticky)(\s|$)/;

const MESH_FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vUv;

uniform vec2 uResolution;
uniform float uTime;
uniform float uSpeed;
uniform float uScale;
uniform float uDistortion;
uniform float uSwirl;
uniform float uSoftness;
uniform float uGrain;
uniform float uGrainMotion;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform vec3 uColors[6];

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

void main() {
  float aspect = uResolution.x / max(1.0, uResolution.y);
  vec2 st = (vUv - 0.5);
  st.x *= aspect;
  st *= max(0.01, uScale);

  // Time scaled by speed: full drift cycle every ~10-20s at speed 0.35
  float t = uTime * uSpeed;

  // Swirl around center
  float r = length(st);
  float swirlAngle = uSwirl * exp(-r * 1.6);
  float s = sin(swirlAngle);
  float c = cos(swirlAngle);
  st = mat2(c, -s, s, c) * st;

  // Domain warping with low-frequency noise (distortion)
  vec2 warp = vec2(
    noise2d(st * 2.2 + vec2(0.0, t * 0.15)),
    noise2d(st * 2.2 + vec2(4.3, 2.7 - t * 0.15))
  ) - 0.5;
  st += warp * uDistortion * 0.7;

  // Pointer interaction: smoothly bends field toward cursor
  if (uPointerStrength > 0.001) {
    vec2 ptr = (uPointer - 0.5);
    ptr.x *= aspect;
    ptr *= max(0.01, uScale);
    vec2 diff = ptr - st;
    float dPtr = length(diff);
    float radius = 0.55;
    float bend = smoothstep(radius, 0.0, dPtr) * uPointerStrength * 0.25;
    st += diff * bend;
  }

  // 6 Control points drifting on Lissajous curves
  vec2 p0 = vec2(0.25 + 0.18 * sin(0.9 * t + 0.2), 0.25 + 0.16 * cos(0.7 * t + 1.1));
  vec2 p1 = vec2(0.75 + 0.17 * cos(0.8 * t + 2.3), 0.25 + 0.19 * sin(1.1 * t + 0.5));
  vec2 p2 = vec2(0.25 + 0.18 * cos(1.0 * t + 4.1), 0.75 + 0.16 * sin(0.8 * t + 3.2));
  vec2 p3 = vec2(0.75 + 0.16 * sin(0.7 * t + 5.0), 0.75 + 0.18 * cos(0.9 * t + 1.8));
  vec2 p4 = vec2(0.50 + 0.20 * sin(1.2 * t + 3.7), 0.50 + 0.20 * cos(1.0 * t + 2.4));
  vec2 p5 = vec2(0.50 + 0.22 * cos(0.6 * t + 1.5), 0.82 + 0.15 * sin(1.3 * t + 4.8));

  // Transform control points to aspect-corrected centered space
  vec2 c0 = (p0 - 0.5); c0.x *= aspect;
  vec2 c1 = (p1 - 0.5); c1.x *= aspect;
  vec2 c2 = (p2 - 0.5); c2.x *= aspect;
  vec2 c3 = (p3 - 0.5); c3.x *= aspect;
  vec2 c4 = (p4 - 0.5); c4.x *= aspect;
  vec2 c5 = (p5 - 0.5); c5.x *= aspect;

  // Distances to control points
  float d0 = length(st - c0);
  float d1 = length(st - c1);
  float d2 = length(st - c2);
  float d3 = length(st - c3);
  float d4 = length(st - c4);
  float d5 = length(st - c5);

  // Softness controls Gaussian falloff radius (small enough that each color keeps its own field)
  float radius = mix(0.14, 0.42, clamp(uSoftness, 0.0, 1.0));
  float invTwoRadiusSq = 1.0 / (2.0 * radius * radius);

  float w0 = exp(-d0 * d0 * invTwoRadiusSq);
  float w1 = exp(-d1 * d1 * invTwoRadiusSq);
  float w2 = exp(-d2 * d2 * invTwoRadiusSq);
  float w3 = exp(-d3 * d3 * invTwoRadiusSq);
  float w4 = exp(-d4 * d4 * invTwoRadiusSq);
  float w5 = exp(-d5 * d5 * invTwoRadiusSq);

  float totalWeight = w0 + w1 + w2 + w3 + w4 + w5 + 1e-5;

  vec3 color = (
    w0 * uColors[0] +
    w1 * uColors[1] +
    w2 * uColors[2] +
    w3 * uColors[3] +
    w4 * uColors[4] +
    w5 * uColors[5]
  ) / totalWeight;

  // Grain noise: static hash or moving
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

function normalizeColors(colors, targetCount = 6) {
  const result = [];
  const list = Array.isArray(colors) && colors.length > 0 ? colors : ['#6366f1', '#a855f7'];
  for (let i = 0; i < targetCount; i++) {
    result.push(list[i % list.length]);
  }
  return result;
}

function populateColorArray(colors, targetArray) {
  const norm = normalizeColors(colors, 6);
  for (let i = 0; i < 6; i++) {
    const [r, g, b] = hexToRgb(norm[i]);
    targetArray[i * 3 + 0] = r;
    targetArray[i * 3 + 1] = g;
    targetArray[i * 3 + 2] = b;
  }
}

function lerpColorArrays(start, target, current, t) {
  const factor = Math.max(0, Math.min(1, t));
  const ease = factor * factor * (3.0 - 2.0 * factor);
  for (let i = 0; i < current.length; i++) {
    current[i] = start[i] + (target[i] - start[i]) * ease;
  }
}

export function MeshGradient({
  colors,
  speed = 0.35,
  scale = 1.2,
  distortion = 0.4,
  swirl = 0.2,
  softness = 0.7,
  grain = 0.06,
  grainMotion = false,
  interactive = true,
  transition = 1.2,
  paused = false,
  className = '',
  style = {},
}) {
  // Pre-allocated typed arrays to avoid any garbage collection in RAF
  const currentColorsRef = useRef(new Float32Array(18));
  const targetColorsRef = useRef(new Float32Array(18));
  const startColorsRef = useRef(new Float32Array(18));

  const transitionStartTimeRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const isMountedRef = useRef(false);

  // Initialize or update target colors on prop change
  const colorsKey = Array.isArray(colors) ? colors.join(',') : '';

  const getUniforms = useCallback(() => {
    if (isTransitioningRef.current) {
      const duration = Math.max(0.001, transition) * 1000;
      const elapsed = (performance.now() - transitionStartTimeRef.current) / duration;
      if (elapsed >= 1.0) {
        currentColorsRef.current.set(targetColorsRef.current);
        isTransitioningRef.current = false;
      } else {
        lerpColorArrays(
          startColorsRef.current,
          targetColorsRef.current,
          currentColorsRef.current,
          elapsed
        );
      }
    }

    return {
      uSpeed: speed,
      uScale: scale,
      uDistortion: distortion,
      uSwirl: swirl,
      uSoftness: softness,
      uGrain: grain,
      uGrainMotion: grainMotion ? 1.0 : 0.0,
      uColors: currentColorsRef.current,
      animating: isTransitioningRef.current,
    };
  }, [speed, scale, distortion, swirl, softness, grain, grainMotion, transition]);

  const { canvasRef, containerRef, supported, requestRender, renderStaticFrame } = useShaderCanvas({
    fragmentSource: MESH_FRAGMENT_SHADER,
    getUniforms,
    paused,
    maxDpr: 1.5,
    interactive,
  });

  // Track colors change and start lerp cross-fade
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      populateColorArray(colors, currentColorsRef.current);
      populateColorArray(colors, targetColorsRef.current);
      startColorsRef.current.set(currentColorsRef.current);
      renderStaticFrame();
      return;
    }

    startColorsRef.current.set(currentColorsRef.current);
    populateColorArray(colors, targetColorsRef.current);

    if (transition <= 0) {
      currentColorsRef.current.set(targetColorsRef.current);
      isTransitioningRef.current = false;
      renderStaticFrame();
    } else {
      transitionStartTimeRef.current = performance.now();
      isTransitioningRef.current = true;
      requestRender();
    }
  }, [colorsKey, transition, colors, requestRender, renderStaticFrame]);

  // Redraw static frame if paused and styling props change
  useEffect(() => {
    if (paused) {
      renderStaticFrame();
    }
  }, [
    paused,
    speed,
    scale,
    distortion,
    swirl,
    softness,
    grain,
    grainMotion,
    renderStaticFrame,
  ]);

  // CSS fallback if WebGL is unavailable or failed compilation
  if (!supported) {
    const fallbackColors = normalizeColors(colors, 6);
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
            inset: '-20%',
            width: '140%',
            height: '140%',
            backgroundImage: `
              radial-gradient(circle at 20% 25%, ${fallbackColors[0]} 0%, transparent 60%),
              radial-gradient(circle at 80% 20%, ${fallbackColors[1]} 0%, transparent 60%),
              radial-gradient(circle at 20% 75%, ${fallbackColors[2]} 0%, transparent 60%),
              radial-gradient(circle at 80% 80%, ${fallbackColors[3]} 0%, transparent 60%),
              radial-gradient(circle at 50% 50%, ${fallbackColors[4]} 0%, transparent 65%),
              radial-gradient(circle at 50% 85%, ${fallbackColors[5]} 0%, transparent 60%)
            `,
            backgroundColor: fallbackColors[0] || '#0f172a',
            filter: 'blur(45px)',
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

export default MeshGradient;
