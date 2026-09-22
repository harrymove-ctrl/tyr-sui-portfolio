# Staging → main review

## Scope
Tyr CommandOSS × Sui portfolio — 3-block IA.

## Checklist
- [ ] Hero: Tyr left / Sui PixelSculpt balanced (not clipped, not too far right)
- [ ] Projects: Diagonal STREAM / STACK DECK only (no orbit)
- [ ] Skills: slim (marquee + hub chips)
- [ ] Contact: quiet, works
- [ ] Flower sidebar: Home · Projects · Agent Skills · Contact only
- [ ] No `.env.local` / React Bits license in the tree
- [ ] `npm install && npm run build` passes
- [ ] Preview on `http://127.0.0.1:5175/` looks correct after hard refresh

## Notes
License key stays in `.env.local` (gitignored). After clone: copy example env if present, or create `.env.local` with `REACTBITS_LICENSE_KEY=…`.
