/**
 * useShaderCanvas
 *
 * Reusable WebGL hook managing a fullscreen-triangle fragment shader canvas.
 * Handles WebGL context creation (WebGL2 with WebGL1 fallback), buffer setup,
 * ResizeObserver (CSS size * min(dpr, maxDpr)), IntersectionObserver (rootMargin: '100px'),
 * page visibility change, prefers-reduced-motion detection, smoothed pointer tracking,
 * and an efficient RAF loop with static frame fallback.
 *
 * Options:
 * - fragmentSource {string}: GLSL fragment shader source code.
 * - vertexSource {string} (optional): Custom GLSL vertex shader. Defaults to fullscreen triangle.
 * - getUniforms {function} (optional): Called every frame. Can return uniform key-values or
 *   set uniforms directly on gl. If return value has `animating: true`, RAF continues even if paused.
 * - paused {boolean} (default: false): When true, suspends RAF and renders a static frame.
 * - maxDpr {number} (default: 1.5): Cap on devicePixelRatio for rendering performance.
 * - interactive {boolean} (default: true): Tracks mouse/pointer on window and supplies uPointer, uPointerStrength.
 *
 * Returns:
 * - canvasRef {React.RefObject}: Attach to <canvas>.
 * - containerRef {React.RefObject}: Attach to the wrapping <div>.
 * - supported {boolean}: False if WebGL failed to initialize or shaders failed compilation.
 * - requestRender {function}: Kicks off RAF (e.g. for color transitions).
 * - renderStaticFrame {function}: Renders exactly one static frame immediately.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';

const DEFAULT_VERTEX_SHADER = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(
      `WebGL ${type === gl.VERTEX_SHADER ? 'vertex' : 'fragment'} shader compilation failed:`,
      gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vsSource, fsSource) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  if (!vs) return null;
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!fs) {
    gl.deleteShader(vs);
    return null;
  }
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return null;
  }
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('WebGL program link failed:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return null;
  }
  return { program, vs, fs };
}

function getCachedUniformLocation(gl, program, cache, name) {
  let loc = cache.get(name);
  if (loc === undefined) {
    loc = gl.getUniformLocation(program, name);
    cache.set(name, loc);
  }
  return loc;
}

function applyUniformValues(gl, program, cache, uniforms) {
  if (!uniforms || typeof uniforms !== 'object') return;
  for (const key in uniforms) {
    if (key === 'animating' || key === 'continueAnimating') continue;
    const loc = getCachedUniformLocation(gl, program, cache, key);
    if (!loc) continue;

    const val = uniforms[key];
    if (typeof val === 'number') {
      gl.uniform1f(loc, val);
    } else if (typeof val === 'boolean') {
      gl.uniform1f(loc, val ? 1.0 : 0.0);
    } else if (val instanceof Float32Array || Array.isArray(val)) {
      const len = val.length;
      if (len === 2) {
        gl.uniform2fv(loc, val);
      } else if (len === 3) {
        gl.uniform3fv(loc, val);
      } else if (len === 4) {
        gl.uniform4fv(loc, val);
      } else if (len % 3 === 0) {
        gl.uniform3fv(loc, val);
      } else if (len % 2 === 0) {
        gl.uniform2fv(loc, val);
      } else {
        gl.uniform1fv(loc, val);
      }
    }
  }
}

export function useShaderCanvas({
  fragmentSource,
  vertexSource = DEFAULT_VERTEX_SHADER,
  getUniforms,
  paused = false,
  maxDpr = 1.5,
  interactive = true,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [supported, setSupported] = useState(true);

  // WebGL context and resources
  const glRef = useRef(null);
  const programInfoRef = useRef(null);
  const bufferRef = useRef(null);
  const locationsCacheRef = useRef(new Map());

  // RAF and time tracking
  const accumulatedTimeRef = useRef(0);
  const lastTimestampRef = useRef(0);
  const rafIdRef = useRef(null);
  const isLoopRunningRef = useRef(false);

  // Option references
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const maxDprRef = useRef(maxDpr);
  maxDprRef.current = maxDpr;

  const interactiveRef = useRef(interactive);
  interactiveRef.current = interactive;

  const getUniformsRef = useRef(getUniforms);
  getUniformsRef.current = getUniforms;

  const isIntersectingRef = useRef(true);
  const isVisibleRef = useRef(
    typeof document !== 'undefined' ? document.visibilityState === 'visible' : true
  );

  // Reduced motion support
  const prefersReduced = useReducedMotion();
  const isReducedMotionRef = useRef(Boolean(prefersReduced));
  isReducedMotionRef.current = Boolean(prefersReduced);

  // Pointer smoothing state
  const targetPointerRef = useRef([0.5, 0.5]);
  const targetStrengthRef = useRef(0.0);
  const currentPointerRef = useRef([0.5, 0.5]);
  const currentStrengthRef = useRef(0.0);

  // Render a single frame
  const renderFrame = useCallback((now, isStatic = false) => {
    const gl = glRef.current;
    const programInfo = programInfoRef.current;
    const canvas = canvasRef.current;
    if (!gl || !programInfo || !canvas) return false;

    let delta = 0;
    if (!isStatic) {
      if (lastTimestampRef.current === 0) {
        lastTimestampRef.current = now;
      }
      delta = Math.min((now - lastTimestampRef.current) / 1000, 0.1);
      lastTimestampRef.current = now;
      if (!pausedRef.current && !isReducedMotionRef.current) {
        accumulatedTimeRef.current += delta;
      }
    } else {
      delta = 0;
      lastTimestampRef.current = 0;
    }

    // Pointer smoothing (exponential ease)
    if (interactiveRef.current) {
      const dt = Math.max(delta > 0 ? delta : 0.016, 0.001);
      const easeFactor = 1.0 - Math.exp(-dt * 8.0);
      currentPointerRef.current[0] += (targetPointerRef.current[0] - currentPointerRef.current[0]) * easeFactor;
      currentPointerRef.current[1] += (targetPointerRef.current[1] - currentPointerRef.current[1]) * easeFactor;
      currentStrengthRef.current += (targetStrengthRef.current - currentStrengthRef.current) * easeFactor;

      if (targetStrengthRef.current === 0.0 && currentStrengthRef.current < 0.001) {
        currentStrengthRef.current = 0.0;
      }
    } else {
      currentStrengthRef.current = 0.0;
    }

    const { program } = programInfo;
    const cache = locationsCacheRef.current;

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferRef.current);

    // Standard uniforms
    const uResLoc = getCachedUniformLocation(gl, program, cache, 'uResolution');
    if (uResLoc) gl.uniform2f(uResLoc, canvas.width, canvas.height);

    const uTimeLoc = getCachedUniformLocation(gl, program, cache, 'uTime');
    if (uTimeLoc) gl.uniform1f(uTimeLoc, accumulatedTimeRef.current);

    const uPtrLoc = getCachedUniformLocation(gl, program, cache, 'uPointer');
    if (uPtrLoc) gl.uniform2f(uPtrLoc, currentPointerRef.current[0], currentPointerRef.current[1]);

    const uPtrStrLoc = getCachedUniformLocation(gl, program, cache, 'uPointerStrength');
    if (uPtrStrLoc) gl.uniform1f(uPtrStrLoc, currentStrengthRef.current);

    // Dynamic uniforms callback
    let keepAnimating = false;
    if (getUniformsRef.current) {
      const result = getUniformsRef.current({
        gl,
        program,
        locations: {
          get: (name) => getCachedUniformLocation(gl, program, cache, name),
        },
        time: accumulatedTimeRef.current,
        delta,
        width: canvas.width,
        height: canvas.height,
        dpr: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, maxDprRef.current),
        pointer: currentPointerRef.current,
        pointerStrength: currentStrengthRef.current,
        isStatic,
      });

      if (result && typeof result === 'object') {
        if (result.animating === true || result.continueAnimating === true) {
          keepAnimating = true;
        }
        applyUniformValues(gl, program, cache, result);
      }
    }

    // Single draw call per frame
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    return keepAnimating;
  }, []);

  const stopLoop = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    isLoopRunningRef.current = false;
    lastTimestampRef.current = 0;
  }, []);

  const startLoop = useCallback(() => {
    if (isLoopRunningRef.current) return;
    const canRun = isIntersectingRef.current && isVisibleRef.current;
    if (!canRun) return;

    isLoopRunningRef.current = true;
    lastTimestampRef.current = 0;

    const frame = (timestamp) => {
      rafIdRef.current = null;
      const keepAnimating = renderFrame(timestamp, false);

      const shouldContinue =
        isIntersectingRef.current &&
        isVisibleRef.current &&
        ((!pausedRef.current && !isReducedMotionRef.current) || keepAnimating);

      if (shouldContinue) {
        rafIdRef.current = requestAnimationFrame(frame);
      } else {
        isLoopRunningRef.current = false;
        lastTimestampRef.current = 0;
      }
    };

    rafIdRef.current = requestAnimationFrame(frame);
  }, [renderFrame]);

  const requestRender = useCallback(() => {
    if (!isLoopRunningRef.current) {
      startLoop();
    }
  }, [startLoop]);

  const renderStaticFrame = useCallback(() => {
    renderFrame(performance.now(), true);
  }, [renderFrame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const glOptions = {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
    };

    let gl = null;
    try {
      gl =
        canvas.getContext('webgl2', glOptions) ||
        canvas.getContext('webgl', glOptions) ||
        canvas.getContext('experimental-webgl', glOptions);
    } catch {
      gl = null;
    }

    if (!gl) {
      console.warn('WebGL is not available in this environment.');
      setSupported(false);
      return;
    }

    glRef.current = gl;

    const programInfo = createProgram(gl, vertexSource, fragmentSource);
    if (!programInfo) {
      setSupported(false);
      return;
    }
    programInfoRef.current = programInfo;
    locationsCacheRef.current.clear();

    // Fullscreen triangle covering [-1, 1] screen quad
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         3.0, -1.0,
        -1.0,  3.0,
      ]),
      gl.STATIC_DRAW
    );
    bufferRef.current = buffer;

    const posLoc = gl.getAttribLocation(programInfo.program, 'position');
    if (posLoc !== -1) {
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    }

    setSupported(true);

    const handleContextLost = (e) => {
      e.preventDefault();
      stopLoop();
      setSupported(false);
    };
    canvas.addEventListener('webglcontextlost', handleContextLost, false);

    // Resize handler
    const updateSize = (w, h) => {
      if (!canvas || !gl || !container) return;
      const rect = container.getBoundingClientRect();
      const cssW = Math.max(1, Math.round(w || rect.width || 300));
      const cssH = Math.max(1, Math.round(h || rect.height || 150));
      const dpr = Math.min(
        typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
        maxDprRef.current || 1.5
      );
      const targetW = Math.max(1, Math.floor(cssW * dpr));
      const targetH = Math.max(1, Math.floor(cssH * dpr));

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        gl.viewport(0, 0, targetW, targetH);
        renderStaticFrame();
      }
    };

    updateSize();

    // ResizeObserver
    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        if (!entries || !entries[0]) return;
        const { width, height } = entries[0].contentRect;
        updateSize(width, height);
      });
      resizeObserver.observe(container);
    }

    // IntersectionObserver (rootMargin '100px')
    let intersectionObserver = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const isIntersecting = entries[0] ? entries[0].isIntersecting : true;
          isIntersectingRef.current = isIntersecting;
          if (isIntersecting) {
            if (!pausedRef.current && !isReducedMotionRef.current) {
              startLoop();
            } else {
              renderStaticFrame();
            }
          } else {
            stopLoop();
          }
        },
        { rootMargin: '100px' }
      );
      intersectionObserver.observe(container);
    }

    // Visibility change
    const handleVisibility = () => {
      const isVisible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
      isVisibleRef.current = isVisible;
      if (isVisible) {
        if (!pausedRef.current && !isReducedMotionRef.current && isIntersectingRef.current) {
          startLoop();
        }
      } else {
        stopLoop();
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility);
    }

    // Pointer events on window
    const handlePointerMove = (e) => {
      if (!interactiveRef.current) return;
      const rect = container.getBoundingClientRect();
      if (
        rect.width > 0 &&
        rect.height > 0 &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        targetPointerRef.current[0] = (e.clientX - rect.left) / rect.width;
        targetPointerRef.current[1] = 1.0 - (e.clientY - rect.top) / rect.height;
        targetStrengthRef.current = 1.0;
      } else {
        targetStrengthRef.current = 0.0;
      }
    };

    const handlePointerLeave = () => {
      if (!interactiveRef.current) return;
      targetStrengthRef.current = 0.0;
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    }

    // System reduced motion preference change
    let mediaQuery = null;
    const handleMotionChange = (e) => {
      isReducedMotionRef.current = e.matches;
      if (e.matches) {
        stopLoop();
        renderStaticFrame();
      } else if (!pausedRef.current && isIntersectingRef.current && isVisibleRef.current) {
        startLoop();
      }
    };

    if (typeof window !== 'undefined' && window.matchMedia) {
      mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      isReducedMotionRef.current = mediaQuery.matches;
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleMotionChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleMotionChange);
      }
    }

    // Initial render
    renderStaticFrame();
    if (!pausedRef.current && !isReducedMotionRef.current) {
      startLoop();
    }

    return () => {
      stopLoop();
      if (resizeObserver) resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerleave', handlePointerLeave);
      }
      if (mediaQuery) {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleMotionChange);
        } else if (mediaQuery.removeListener) {
          mediaQuery.removeListener(handleMotionChange);
        }
      }
      canvas.removeEventListener('webglcontextlost', handleContextLost);

      // Clean up GPU buffers, programs, lose context
      if (buffer) gl.deleteBuffer(buffer);
      if (programInfo) {
        gl.deleteProgram(programInfo.program);
        gl.deleteShader(programInfo.vs);
        gl.deleteShader(programInfo.fs);
      }
      // Release the context only once the canvas has really left the DOM. Re-running this
      // effect on the same canvas (StrictMode, dependency changes) must keep the context alive,
      // because getContext() would hand back the lost one.
      const ext = gl.getExtension('WEBGL_lose_context');
      setTimeout(() => {
        if (ext && !canvas.isConnected) ext.loseContext();
      }, 0);

      glRef.current = null;
      programInfoRef.current = null;
      bufferRef.current = null;
      locationsCacheRef.current.clear();
    };
  }, [fragmentSource, vertexSource, renderFrame, startLoop, stopLoop, renderStaticFrame]);

  // Handle paused prop changes
  useEffect(() => {
    pausedRef.current = paused;
    if (paused) {
      stopLoop();
      renderStaticFrame();
    } else if (isIntersectingRef.current && isVisibleRef.current && !isReducedMotionRef.current) {
      startLoop();
    }
  }, [paused, startLoop, stopLoop, renderStaticFrame]);

  return {
    canvasRef,
    containerRef,
    supported,
    requestRender,
    renderStaticFrame,
  };
}

export default useShaderCanvas;
