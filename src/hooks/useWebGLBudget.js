import { useEffect, useState } from 'react';

/** Remaining content sections after 3-block IA cleanup */
const CONTENT_SECTIONS = ['projects', 'skills', 'contact'];

/**
 * Keeps at most ~2 heavy WebGL canvases mounted:
 * - Hero in view  → PixelSculpt + AsciiCursor (Silk off)
 * - Content       → Silk + optional Contact Portal
 * Skills uses DOM-only BendingMarquee (no WebGL atmosphere).
 */
export function useWebGLBudget({ isMobile = false } = {}) {
  const [heroVisible, setHeroVisible] = useState(true);
  const [accent, setAccent] = useState(null);

  useEffect(() => {
    const hero = document.getElementById('hero');
    if (!hero) return undefined;

    const io = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting && entry.intersectionRatio > 0.12),
      { threshold: [0, 0.12, 0.25, 0.5], rootMargin: '0px 0px -35% 0px' },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const ratios = Object.fromEntries(CONTENT_SECTIONS.map((id) => [id, 0]));

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
        }
        let best = null;
        let bestRatio = 0.08;
        for (const id of CONTENT_SECTIONS) {
          if (ratios[id] > bestRatio) {
            bestRatio = ratios[id];
            best = id;
          }
        }
        setAccent(best);
      },
      { threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.7], rootMargin: '-10% 0px -25% 0px' },
    );

    CONTENT_SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const inContent = !heroVisible;
  const showSilk = inContent;
  const showCursor = !isMobile && heroVisible;
  const showSculpt = heroVisible;

  return {
    heroVisible,
    accent: inContent ? accent : null,
    showSilk,
    showCursor,
    showSculpt,
    // Contact portal optional — quiet by default on mobile; desktop when in view
    showContactPortal: inContent && accent === 'contact' && !isMobile,
  };
}
