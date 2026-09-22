# Tyr · Sui Ecosystem Portfolio

Sparse, tactile portfolio for **Tyr** — CommandOSS builder shipping Sui + agent-skills tooling.

Built with **Vite + React 19 + Tailwind CSS 4**, using **React Bits Pro** with a viewport WebGL budget.

## Stack

- React 19 + Vite 7
- Tailwind CSS 4 (`@tailwindcss/vite`)
- Three.js + `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing`
- framer-motion / motion, gsap, lucide-react
- **React Bits Pro**

## Visual direction

Near-black ink (`#0a0a0a`), warm paper (`#e8e4d9`), muted stone (`#8a8580`), sparingly used acid lime (`#c4f542`), deep forest (`#1f2e28`), soft Sui cyan accents.

Typography: **Syne** (tight display) + **IBM Plex Mono** (labels).

## Information architecture (3 blocks)

1. **Hero** — LEFT Tyr copy + short about blurb / RIGHT PixelSculpt
2. **Projects** — DiagonalCardStack only (STREAM / STACK DECK) + quiet CommandOSS link chips
3. **Skills** — one BendingMarquee + three hub chips (CommandOSS · docs.sui.io · Mysten)
4. **Contact** — quiet links; optional Portal when in view

Nav: Home · Projects · Agent Skills · Contact. No About / Tools sections.

## WebGL budget (`useWebGLBudget`)

| Mode | Active canvases |
|------|-----------------|
| Hero in view | `PixelSculpt` + `AsciiCursor` (Silk paused) |
| Content | `SilkWaves` + optional Contact `Portal` |

Skills marquee is DOM-only (no GlassTiles).

## Run locally

```bash
cd /workspace/tyr-sui-portfolio
npm install
# REACTBITS_LICENSE_KEY in .env.local for shadcn registry installs
npm run dev
```

Dev server: **port 5174**, `host: true`.

## Build

```bash
npm run build
npm run preview
```
