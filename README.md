# Tyr · Builder Studio

Interactive portfolio for **Tyr**, a CommandOSS builder making developer tooling, agent skills, and infrastructure for Sui.

Built with **Vite 7, React 19, Tailwind CSS 4, framer-motion, and three.js / react-three-fiber**. The three.js relief is lazy-loaded.

## Where to edit

| What | File |
|------|------|
| Copy, projects, categories, capabilities, toolbox tree, Sui concepts, links | `src/data/content.js` |
| Theme colors, including shader palettes (one `[data-theme]` block per theme) | `src/theme/themes.css` |
| Theme names and menu swatches | `src/theme/themes.js` (keep ids in sync with the inline script in `index.html`) |
| Theme and motion state (`useStudio()`) | `src/theme/ThemeProvider.jsx` |
| Sections | `src/components/sections/` (`Hero`, `Work`, `ExploreSui`, `Capabilities`, `Toolbox`, `Contact`) |
| Rail, mobile header, theme menu, project dialog | `src/components/` |
| Effects and interactive components | `src/components/effects/` (`MeshGradient`, `SmokeGradient`), `src/components/ui/` (`ListKanban`, `TreeView`) |
| Restored originals | `src/components/react-bits/pixel-sculpt.tsx` (hero relief), `src/components/DiagonalCardStack.jsx` (Explore Sui deck) |

Content rules:
- Use real, checked links only.
- No invented metrics, roles, or availability.
- A project's `details.contribution` renders only when Tyr's part is verified.
- The "How I can help" demo (`HELP` in `content.js`) cites merged PRs by `harrymove-ctrl` as Tyr's contribution; diagrams and stage sequences are labelled illustrative.
- Project marks (`mark`) are sourced files only; each records its `source`. Projects without a verified symbol use the neutral category symbol. Featured `preview` images are real screenshots of the live sites (`public/previews/`).
- `LINKS.email` stays empty until a real address exists; the **Send a message** button appears once it is set.

## Themes

- **Porcelain** (default): neutral surfaces, Sui-blue primary
- **Studio Sage**: warmer, softly green
- **Midnight Sui**: layered charcoal with blue, teal, and a little lime

Category accents (`--cat-agent` violet, `--cat-sui` blue, `--cat-walrus` teal) mark small indicators only and always sit next to the category name.

The choice is saved in `localStorage` (`tyr-theme`) and applied before first paint by the inline script in `index.html`. All colors come from CSS variables, including the aura, mesh, and relief palettes, which `ThemeProvider` reads at runtime.

## Motion

- The page background is Auralis (adapted from ForgeUI: simplex-noise aura, grain, vignette) at 0.6× resolution; the hero stage uses the mesh gradient. Both are raw WebGL.
- Both effects pause when offscreen, when the tab is hidden, when the rail's pause button is pressed, and under `prefers-reduced-motion`. A static frame stays visible when paused.
- The relief renders on demand: it redraws only when the pointer moves over it or a reveal is playing.
- The Explore Sui deck and its ASCII-ripple thumbnails stop when offscreen, in a hidden tab, or when motion is paused.

## Run locally

```bash
npm install
npm run dev     # port 5174
npm run build
npm run preview
```

## Deploy

Railway project `tyr-sui-portfolio` (service `tyr-sui-portfolio`, `production`), built by Railpack from the working directory:

```bash
railway up --detach -m "<release summary>"
```

Live: https://tyr-sui-portfolio-production.up.railway.app
