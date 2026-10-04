import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  Canvas,
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "../../lib/utils";
export type PixelSculptShape = "square" | "round" | "hex";
export type PixelSculptColorMode = "image" | "mono" | "luminance";
export type PixelSculptHoverEffect = "raise" | "tilt" | "separate";
export type PixelSculptClickEffect = "pulse" | "scatter" | "rebuild" | "none";
export interface PixelSculptProps {
  src: string;
  resolution?: number;
  depth?: number;
  gap?: number;
  tileShape?: PixelSculptShape;
  interactionRadius?: number;
  interactionStrength?: number;
  hoverEffect?: PixelSculptHoverEffect;
  colorMode?: PixelSculptColorMode;
  baseColor?: string;
  /** Highlight color for `colorMode="luminance"` (pearl ramp + sheen). */
  accentColor?: string;
  backgroundColor?: string;
  invert?: boolean;
  removeBackground?: boolean;
  backgroundTolerance?: number;
  tilt?: number;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  rotation?: number;
  autoRotate?: boolean;
  rotateSpeed?: number;
  clickEffect?: PixelSculptClickEffect;
  clickStrength?: number;
  dpr?: number;
  onError?: (error: Error) => void;
  /** Rendered instead of the raw image when WebGL is unavailable or the image fails. */
  fallback?: ReactNode;
  className?: string;
  children?: ReactNode;
}
const MAX_RESOLUTION = 160;
const ALPHA_CUTOFF = 128;
const CLICK_DURATION = 2.4;
const REVEAL_DURATION = 1.4;
const MAX_CLICKS = 8;
const HOVER_INDEX: Record<PixelSculptHoverEffect, number> = {
  raise: 0,
  tilt: 1,
  separate: 2,
};
const CLICK_INDEX: Record<PixelSculptClickEffect, number> = {
  none: 0,
  pulse: 1,
  scatter: 2,
  rebuild: 3,
};
const COLOR_INDEX: Record<PixelSculptColorMode, number> = {
  image: 0,
  mono: 1,
  luminance: 2,
};
const vertexShader = `
#define TAU 6.2831853

attribute vec2 aCell;
attribute float aLum;
attribute vec3 aColor;
attribute float aSeed;

uniform float uDepth;
uniform float uGap;
uniform float uRadius;
uniform float uStrength;
uniform float uPointerActive;
uniform vec2 uPointer;
uniform int uHover;
#define MAX_CLICKS 8

uniform vec4 uClicks[MAX_CLICKS];
uniform float uClickStrength;
uniform float uReveal;
uniform float uExtent;

varying vec3 vColor;
varying vec3 vNormal;
varying float vLum;
varying float vHeight;

mat3 tiltAround(vec3 axis, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  float t = 1.0 - c;
  return mat3(
    t * axis.x * axis.x + c, t * axis.x * axis.y + s * axis.z, t * axis.x * axis.z - s * axis.y,
    t * axis.x * axis.y - s * axis.z, t * axis.y * axis.y + c, t * axis.y * axis.z + s * axis.x,
    t * axis.x * axis.z + s * axis.y, t * axis.y * axis.z - s * axis.x, t * axis.z * axis.z + c
  );
}

float bell(float x) {
  float k = clamp(x, 0.0, 1.0);
  return k * k * (3.0 - 2.0 * k);
}

void main() {
  vec2 cell = aCell;
  float height = max(aLum * uDepth, 0.08);


  float spread = length(cell) / max(uExtent, 1.0);
  float reveal = bell((uReveal - spread * 0.6) / 0.4);
  height *= reveal;


  float dist = distance(cell, uPointer);
  vec2 away = dist > 0.0001 ? (cell - uPointer) / dist : vec2(0.0);
  float wave = uPointerActive * uStrength * (1.0 - bell(dist / max(uRadius, 0.001)));

  float raise = 0.0;
  float tiltAmount = 0.0;
  vec2 push = vec2(0.0);
  vec3 offset = vec3(0.0);
  vec3 tiltAxis = vec3(away.y, 0.0, -away.x);

  if (uHover == 0) raise = wave * uDepth * 0.9;
  else if (uHover == 1) tiltAmount = wave * 0.7;
  else push = away * wave * 0.9;


  for (int i = 0; i < MAX_CLICKS; i++) {
    vec4 click = uClicks[i];
    int kind = int(click.w + 0.5);
    if (kind == 0) continue;
    float clickDist = distance(cell, click.xy);
    float age = click.z;
    if (kind == 1) {

      float front = age * 16.0;
      float envelope = exp(-pow((clickDist - front) * 0.16, 2.0)) * exp(-age * 1.3);
      float wave = 0.5 + 0.5 * cos((clickDist - front) * 0.55);
      raise += envelope * wave * uDepth * 0.35 * uClickStrength;
    } else if (kind == 2) {
      float t = age / 2.0;
      float envelope = bell(t / 0.18) * (1.0 - bell((t - 0.3) / 0.7)) * uClickStrength;
      float reachScale = 1.0 - bell(clickDist / (uExtent * 1.1));
      float angle = aSeed * TAU;
      float lift = 4.0 + 8.0 * fract(aSeed * 7.31);
      offset.xz += vec2(cos(angle), sin(angle)) * (2.0 + 6.0 * fract(aSeed * 3.17)) * envelope * reachScale;
      offset.y += lift * envelope * reachScale;
      tiltAmount += envelope * reachScale * (1.0 + 2.0 * aSeed);
      tiltAxis = normalize(vec3(cos(angle * 1.7), 0.2, sin(angle * 1.7)));
    } else if (kind == 3) {
      float t = age / 1.8;
      float local = clamp(t * 1.5 - clickDist / (uExtent * 1.2) * 0.5, 0.0, 1.0);
      float collapse = sin(local * 3.14159265) * clamp(uClickStrength, 0.0, 1.0);
      height *= 1.0 - collapse * collapse;
    }
  }

  float size = 1.0 - clamp(uGap, 0.0, 0.9);
  vec3 local = vec3(position.x * size, position.y * (height + raise), position.z * size);
  vec3 normalLocal = normal;

  if (tiltAmount != 0.0) {
    mat3 rotation = tiltAround(normalize(tiltAxis + vec3(0.0, 0.0001, 0.0)), tiltAmount);
    local = rotation * local;
    normalLocal = rotation * normalLocal;
  }

  vec3 world = local + vec3(cell.x + push.x, 0.0, cell.y + push.y) + offset;

  vColor = aColor;
  vLum = aLum;
  vHeight = (height + raise) / max(uDepth, 0.001);
  vNormal = normalize(normalMatrix * normalLocal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 1.0);
}
`;
const fragmentShader = `
precision highp float;

uniform int uColorMode;
uniform vec3 uBaseColor;
uniform vec3 uAccentColor;

varying vec3 vColor;
varying vec3 vNormal;
varying float vLum;
varying float vHeight;

void main() {
  vec3 tint = vColor;
  if (uColorMode == 1) tint = uBaseColor;
  else if (uColorMode == 2) {
    // Pearl: a smooth base→highlight ramp by relief height (not raw luminance, which
    // carries the source image's banding), so the silhouette reads as one form.
    // Curved ramp keeps mid-height tiles (the Sui inner curve) near the base tone, so the
    // negative space stays legible against the bright outer rim.
    float h = pow(smoothstep(0.05, 1.0, vHeight), 2.4);
    tint = mix(uBaseColor, uAccentColor, h * 0.8);
  }

  vec3 n = normalize(vNormal);
  vec3 key = normalize(vec3(0.35, 0.75, 0.9));
  vec3 fill = normalize(vec3(-0.6, 0.3, 0.4));
  float lit = max(dot(n, key), 0.0) * 0.5 + max(dot(n, fill), 0.0) * 0.16;
  float ambient = 0.42 + 0.1 * clamp(vHeight, 0.0, 1.0);
  vec3 color = tint * (ambient + lit);

  if (uColorMode == 2) {
    // Soft specular sheen on tile tops + cool rim on the sides: metallic, not plastic.
    vec3 view = vec3(0.0, 0.0, 1.0);
    vec3 halfway = normalize(key + view);
    float spec = pow(max(dot(n, halfway), 0.0), 28.0);
    float rim = pow(1.0 - max(dot(n, view), 0.0), 2.5);
    color += uAccentColor * (spec * 0.35 + rim * 0.12);
  }

  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}
`;
interface Field {
  id: number;
  columns: number;
  rows: number;
  cells: Float32Array;
  lums: Float32Array;
  colors: Float32Array;
  seeds: Float32Array;
  grid: Float32Array;
  count: number;
}
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const bell = (x: number) => {
  const k = clamp(x, 0, 1);
  return k * k * (3 - 2 * k);
};
const isTransparent = (value: string) =>
  value === "transparent" || value === "none" || value === "";
const setColor = (color: THREE.Color, value: string) => {
  try {
    color.setStyle(value, THREE.LinearSRGBColorSpace);
  } catch {
    return;
  }
};
const useMedia = (query: string) =>
  useSyncExternalStore(
    (notify) => {
      if (typeof window === "undefined") return () => {};
      const media = window.matchMedia(query);
      media.addEventListener("change", notify);
      return () => media.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
let webglSupport: boolean | null = null;
const readWebGL = () => {
  if (webglSupport !== null) return webglSupport;
  if (typeof document === "undefined") return true;
  const probe = document.createElement("canvas");
  webglSupport = Boolean(
    probe.getContext("webgl2") || probe.getContext("webgl"),
  );
  return webglSupport;
};
const useWebGL = () =>
  useSyncExternalStore(
    () => () => {},
    readWebGL,
    () => true,
  );
let fieldCounter = 0;
function keyBackground(
  data: Uint8ClampedArray,
  columns: number,
  rows: number,
  tolerance: number,
) {
  const total = columns * rows;
  let r = 0;
  let g = 0;
  let b = 0;
  let samples = 0;
  const sampleEdge = (index: number) => {
    r += data[index * 4];
    g += data[index * 4 + 1];
    b += data[index * 4 + 2];
    samples++;
  };
  for (let x = 0; x < columns; x++) {
    sampleEdge(x);
    sampleEdge((rows - 1) * columns + x);
  }
  for (let y = 1; y < rows - 1; y++) {
    sampleEdge(y * columns);
    sampleEdge(y * columns + columns - 1);
  }
  r /= samples;
  g /= samples;
  b /= samples;
  const limit = clamp(tolerance, 0, 1) * 255 * Math.sqrt(3);
  const near = (index: number) => {
    const i = index * 4;
    return (
      data[i + 3] < ALPHA_CUTOFF ||
      Math.hypot(data[i] - r, data[i + 1] - g, data[i + 2] - b) <= limit
    );
  };
  const seen = new Uint8Array(total);
  const stack: number[] = [];
  for (let x = 0; x < columns; x++) stack.push(x, (rows - 1) * columns + x);
  for (let y = 1; y < rows - 1; y++)
    stack.push(y * columns, y * columns + columns - 1);
  while (stack.length) {
    const index = stack.pop() as number;
    if (seen[index] || !near(index)) continue;
    seen[index] = 1;
    data[index * 4 + 3] = 0;
    const x = index % columns;
    const y = (index - x) / columns;
    if (x > 0) stack.push(index - 1);
    if (x < columns - 1) stack.push(index + 1);
    if (y > 0) stack.push(index - columns);
    if (y < rows - 1) stack.push(index + columns);
  }
}
function sampleField(
  image: HTMLImageElement,
  resolution: number,
  invert: boolean,
  removeBackground: boolean,
  backgroundTolerance: number,
): Field {
  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  if (!naturalWidth || !naturalHeight) {
    throw new Error("Image has no dimensions");
  }
  const longest = clamp(Math.round(resolution), 4, MAX_RESOLUTION);
  const aspect = naturalWidth / naturalHeight;
  const columns =
    aspect >= 1 ? longest : Math.max(2, Math.round(longest * aspect));
  const rows =
    aspect >= 1 ? Math.max(2, Math.round(longest / aspect)) : longest;
  const canvas = document.createElement("canvas");
  canvas.width = columns;
  canvas.height = rows;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("2D context unavailable");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, columns, rows);
  const data = context.getImageData(0, 0, columns, rows).data;
  if (removeBackground) keyBackground(data, columns, rows, backgroundTolerance);
  let count = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] >= ALPHA_CUTOFF) count++;
  }
  if (count === 0) throw new Error("Image has no visible pixels");
  const cells = new Float32Array(count * 2);
  const lums = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const grid = new Float32Array(rows * columns).fill(-1);
  let k = 0;
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const i = (row * columns + column) * 4;
      if (data[i + 3] < ALPHA_CUTOFF) continue;
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      const lum = r * 0.2126 + g * 0.7152 + b * 0.0722;
      cells[k * 2] = column - (columns - 1) / 2;
      cells[k * 2 + 1] = row - (rows - 1) / 2;
      lums[k] = invert ? 1 - lum : lum;
      grid[row * columns + column] = lums[k];
      colors[k * 3] = r * r;
      colors[k * 3 + 1] = g * g;
      colors[k * 3 + 2] = b * b;
      seeds[k] =
        ((((column * 73856093) ^ (row * 19349663)) >>> 0) % 1000) / 1000;
      k++;
    }
  }
  return {
    id: ++fieldCounter,
    columns,
    rows,
    cells,
    lums,
    colors,
    seeds,
    grid,
    count,
  };
}
function loadField(
  src: string,
  resolution: number,
  invert: boolean,
  removeBackground: boolean,
  backgroundTolerance: number,
): Promise<Field> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => {
      try {
        resolve(
          sampleField(
            image,
            resolution,
            invert,
            removeBackground,
            backgroundTolerance,
          ),
        );
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    };
    image.onerror = () => reject(new Error(`Failed to load ${src}`));
    image.src = src;
  });
}
const makeTileGeometry = (shape: PixelSculptShape) => {
  const geometry =
    shape === "square"
      ? new THREE.BoxGeometry(1, 1, 1)
      : new THREE.CylinderGeometry(0.5, 0.5, 1, shape === "hex" ? 6 : 20);
  geometry.translate(0, 0.5, 0);
  return geometry;
};
interface SculptureProps {
  field: Field;
  depth: number;
  gap: number;
  tileShape: PixelSculptShape;
  interactionRadius: number;
  interactionStrength: number;
  hoverEffect: PixelSculptHoverEffect;
  colorMode: PixelSculptColorMode;
  baseColor: string;
  accentColor: string;
  tilt: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  autoRotate: boolean;
  rotateSpeed: number;
  clickEffect: PixelSculptClickEffect;
  clickStrength: number;
  /** Skip the build-up reveal (reduced motion). */
  instant: boolean;
}
const Sculpture = ({
  field,
  depth,
  gap,
  tileShape,
  interactionRadius,
  interactionStrength,
  hoverEffect,
  colorMode,
  baseColor,
  accentColor,
  tilt,
  scale,
  offsetX,
  offsetY,
  rotation,
  autoRotate,
  rotateSpeed,
  clickEffect,
  clickStrength,
  instant,
}: SculptureProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { invalidate } = useThree();
  const framing = useRef("");
  const pointerTarget = useRef({ x: 0, y: 0, active: false });
  const pointer = useRef({ x: 0, y: 0, active: 0 });
  const clicks = useRef<
    {
      kind: number;
      x: number;
      y: number;
      age: number;
    }[]
  >([]);
  const reveal = useRef(0);
  const spin = useRef(0);
  const geometry = useMemo(() => makeTileGeometry(tileShape), [tileShape]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const instanced = useMemo(() => {
    const instance = new THREE.InstancedBufferGeometry();
    instance.index = geometry.index;
    instance.attributes.position = geometry.attributes.position;
    instance.attributes.normal = geometry.attributes.normal;
    instance.instanceCount = field.count;
    instance.setAttribute(
      "aCell",
      new THREE.InstancedBufferAttribute(field.cells, 2),
    );
    instance.setAttribute(
      "aLum",
      new THREE.InstancedBufferAttribute(field.lums, 1),
    );
    instance.setAttribute(
      "aColor",
      new THREE.InstancedBufferAttribute(field.colors, 3),
    );
    instance.setAttribute(
      "aSeed",
      new THREE.InstancedBufferAttribute(field.seeds, 1),
    );
    return instance;
  }, [field, geometry]);
  useEffect(() => () => instanced.dispose(), [instanced]);
  useEffect(() => {
    reveal.current = instant ? 1 : 0;
    clicks.current = [];
    invalidate();
  }, [field, instant, invalidate]);
  const uniforms = useMemo(
    () => ({
      uDepth: { value: 4 },
      uGap: { value: 0.15 },
      uRadius: { value: 6 },
      uStrength: { value: 1 },
      uPointerActive: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uHover: { value: 0 },
      uClicks: {
        value: Array.from({ length: MAX_CLICKS }, () => new THREE.Vector4()),
      },
      uClickStrength: { value: 1 },
      uReveal: { value: 0 },
      uExtent: { value: 1 },
      uColorMode: { value: 0 },
      uBaseColor: { value: new THREE.Color("#ffffff") },
      uAccentColor: { value: new THREE.Color("#ffffff") },
    }),
    [],
  );
  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    setColor(material.uniforms.uBaseColor.value, baseColor);
    setColor(material.uniforms.uAccentColor.value, accentColor);
    invalidate();
  }, [baseColor, accentColor, invalidate]);
  useEffect(() => {
    invalidate();
  }, [
    depth,
    gap,
    interactionRadius,
    interactionStrength,
    hoverEffect,
    colorMode,
    tilt,
    scale,
    offsetX,
    offsetY,
    rotation,
    invalidate,
  ]);
  const toCell = useCallback(
    (event: ThreeEvent<PointerEvent | MouseEvent>) => {
      const group = groupRef.current;
      const ground = event.point.clone();
      if (!group) return { x: ground.x, y: ground.z };
      group.updateMatrixWorld();
      const inverse = new THREE.Matrix4().copy(group.matrixWorld).invert();
      const origin = event.ray.origin.clone().applyMatrix4(inverse);
      const direction = event.ray.direction
        .clone()
        .transformDirection(inverse)
        .normalize();
      const fallback = ground.applyMatrix4(inverse);
      const relief = Math.max(depth, 0);
      const hover = pointer.current;
      const bump =
        HOVER_INDEX[hoverEffect] === 0
          ? hover.active * interactionStrength * relief * 0.9
          : 0;
      const top = relief + Math.max(bump, 0);
      if (top <= 0 || Math.abs(direction.y) < 1e-6) {
        return { x: fallback.x, y: fallback.z };
      }
      const tEnter = (top - origin.y) / direction.y;
      const tExit = (0 - origin.y) / direction.y;
      const steps = Math.max(8, Math.ceil(top * 6));
      const halfW = (field.columns - 1) / 2;
      const halfD = (field.rows - 1) / 2;
      const probe = new THREE.Vector3();
      for (let i = 0; i <= steps; i++) {
        const t = tEnter + ((tExit - tEnter) * i) / steps;
        probe.copy(direction).multiplyScalar(t).add(origin);
        const column = Math.round(probe.x + halfW);
        const row = Math.round(probe.z + halfD);
        if (
          column < 0 ||
          row < 0 ||
          column >= field.columns ||
          row >= field.rows
        ) {
          continue;
        }
        const lum = field.grid[row * field.columns + column];
        if (lum < 0) continue;
        const wave =
          1 -
          bell(
            Math.hypot(probe.x - hover.x, probe.z - hover.y) /
              Math.max(interactionRadius, 0.001),
          );
        const tileTop = Math.max(lum * relief, 0.08) + bump * wave;
        if (tileTop >= probe.y) {
          return { x: probe.x, y: probe.z };
        }
      }
      return { x: fallback.x, y: fallback.z };
    },
    [field, depth, hoverEffect, interactionStrength, interactionRadius],
  );
  const onPointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      const cell = toCell(event);
      pointerTarget.current.x = cell.x;
      pointerTarget.current.y = cell.y;
      pointerTarget.current.active = true;
      invalidate();
    },
    [toCell, invalidate],
  );
  const onPointerLeave = useCallback(() => {
    pointerTarget.current.active = false;
    invalidate();
  }, [invalidate]);
  const onClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      const kind = CLICK_INDEX[clickEffect];
      if (kind === 0) return;
      const cell = toCell(event);
      const list = clicks.current;
      if (list.length >= MAX_CLICKS) list.shift();
      list.push({ kind, x: cell.x, y: cell.y, age: 0 });
      invalidate();
    },
    [clickEffect, toCell, invalidate],
  );
  useFrame((state, delta) => {
    const material = materialRef.current;
    const group = groupRef.current;
    if (!material || !group) return;
    const step = Math.min(delta, 0.05);
    let busy = false;
    const stamp = `${field.id}|${state.size.width}|${state.size.height}|${tilt}|${depth}|${scale}`;
    if (framing.current !== stamp) {
      framing.current = stamp;
      const perspective = state.camera as THREE.PerspectiveCamera;
      const halfW = field.columns / 2 + 1;
      const halfD = field.rows / 2 + 1;
      const top = Math.max(depth, 0) * 1.2;
      const angle = THREE.MathUtils.degToRad(clamp(tilt, 0, 80));
      const corners: THREE.Vector3[] = [];
      for (const x of [-halfW, halfW])
        for (const z of [-halfD, halfD])
          for (const y of [0, top]) corners.push(new THREE.Vector3(x, y, z));
      const probe = new THREE.Vector3();
      const fits = (distance: number) => {
        perspective.position.set(
          0,
          distance * Math.cos(angle),
          distance * Math.sin(angle),
        );
        perspective.near = distance * 0.05;
        perspective.far = distance * 4;
        perspective.lookAt(0, 0, 0);
        perspective.updateMatrixWorld();
        perspective.updateProjectionMatrix();
        return corners.every((corner) => {
          probe.copy(corner).project(perspective);
          return Math.abs(probe.x) <= 0.94 && Math.abs(probe.y) <= 0.94;
        });
      };
      let low = Math.hypot(halfW, halfD);
      let high = low * 12;
      for (let i = 0; i < 18; i++) {
        const mid = (low + high) / 2;
        if (fits(mid)) high = mid;
        else low = mid;
      }
      fits(high / Math.max(scale, 0.05));
    }
    group.position.set(offsetX * field.columns, 0, -offsetY * field.rows);
    const values = material.uniforms;
    values.uDepth.value = Math.max(depth, 0);
    values.uGap.value = clamp(gap, 0, 0.9);
    values.uRadius.value = Math.max(interactionRadius, 0.01);
    values.uStrength.value = interactionStrength;
    values.uHover.value = HOVER_INDEX[hoverEffect];
    values.uColorMode.value = COLOR_INDEX[colorMode];
    values.uClickStrength.value = Math.max(clickStrength, 0);
    values.uExtent.value = Math.hypot(field.columns, field.rows) / 2;
    if (reveal.current < 1) {
      reveal.current = Math.min(1, reveal.current + step / REVEAL_DURATION);
      busy = true;
    }
    values.uReveal.value = reveal.current;
    const target = pointerTarget.current;
    const current = pointer.current;
    const ease = 1 - Math.exp(-step * 10);
    if (target.active) {
      current.x += (target.x - current.x) * ease;
      current.y += (target.y - current.y) * ease;
    }
    const activeTarget = target.active ? 1 : 0;
    current.active += (activeTarget - current.active) * ease;
    if (
      Math.abs(current.active - activeTarget) > 0.002 ||
      (target.active &&
        Math.hypot(target.x - current.x, target.y - current.y) > 0.01)
    ) {
      busy = true;
    } else {
      current.active = activeTarget;
    }
    values.uPointer.value.set(current.x, current.y);
    values.uPointerActive.value = current.active;
    if (clicks.current.length) {
      clicks.current = clicks.current
        .map((entry) => ({ ...entry, age: entry.age + step }))
        .filter((entry) => entry.age < CLICK_DURATION);
      busy = true;
    }
    const slots = values.uClicks.value as THREE.Vector4[];
    for (let i = 0; i < MAX_CLICKS; i++) {
      const entry = clicks.current[i];
      if (entry) slots[i].set(entry.x, entry.y, entry.age, entry.kind);
      else slots[i].set(0, 0, 0, 0);
    }
    if (autoRotate) {
      spin.current += (step * rotateSpeed * (Math.PI * 2)) / 60;
      busy = true;
    }
    group.rotation.y = spin.current + THREE.MathUtils.degToRad(rotation);
    if (busy) invalidate();
  });
  return (
    <group ref={groupRef}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onClick={onClick}
      >
        <planeGeometry args={[field.columns + 4, field.rows + 4]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      <mesh geometry={instanced} frustumCulled={false}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>
    </group>
  );
};
export const PixelSculpt = ({
  src,
  resolution = 72,
  depth = 4,
  gap = 0.15,
  tileShape = "square",
  interactionRadius = 6,
  interactionStrength = 1,
  hoverEffect = "raise",
  colorMode = "image",
  baseColor = "#ffffff",
  accentColor = "#ffffff",
  backgroundColor = "transparent",
  invert = false,
  removeBackground = false,
  backgroundTolerance = 0.12,
  tilt = 32,
  scale = 1,
  offsetX = 0,
  offsetY = 0,
  rotation = 0,
  autoRotate = false,
  rotateSpeed = 2,
  clickEffect = "pulse",
  clickStrength = 1,
  dpr = 2,
  onError,
  fallback,
  className,
  children,
}: PixelSculptProps) => {
  const [field, setField] = useState<Field | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === src;
  const reducedMotion = useMedia("(prefers-reduced-motion: reduce)");
  const webgl = useWebGL();
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  const useFallback = failed || !webgl;
  useEffect(() => {
    if (useFallback) return;
    let live = true;
    loadField(src, resolution, invert, removeBackground, backgroundTolerance)
      .then((next) => {
        if (live) setField(next);
      })
      .catch((error: Error) => {
        if (!live) return;
        setFailedSrc(src);
        onErrorRef.current?.(error);
      });
    return () => {
      live = false;
    };
  }, [
    src,
    resolution,
    invert,
    removeBackground,
    backgroundTolerance,
    useFallback,
  ]);
  const backdrop = isTransparent(backgroundColor) ? undefined : backgroundColor;
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ background: backdrop }}
    >
      {useFallback ? (
        (fallback ?? (
          <img
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-contain"
            draggable={false}
          />
        ))
      ) : (
        <div className="absolute inset-0 touch-pan-y">
          {!field && fallback}
          <Canvas
            dpr={[1, clamp(dpr, 1, 3)]}
            frameloop="demand"
            camera={{ fov: 36, position: [0, 60, 40] }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
            }}
          >
            {field ? (
              <Sculpture
                field={field}
                depth={depth}
                gap={gap}
                tileShape={tileShape}
                interactionRadius={interactionRadius}
                interactionStrength={interactionStrength}
                hoverEffect={hoverEffect}
                colorMode={colorMode}
                baseColor={baseColor}
                accentColor={accentColor}
                tilt={tilt}
                scale={scale}
                offsetX={offsetX}
                offsetY={offsetY}
                rotation={rotation}
                autoRotate={autoRotate}
                rotateSpeed={rotateSpeed}
                clickEffect={clickEffect}
                clickStrength={clickStrength}
                instant={reducedMotion}
              />
            ) : null}
          </Canvas>
        </div>
      )}
      {children ? (
        <div className="pointer-events-none relative z-10 h-full w-full">
          {children}
        </div>
      ) : null}
    </div>
  );
};
export default PixelSculpt;
