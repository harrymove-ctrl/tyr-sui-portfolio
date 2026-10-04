import { useEffect, useRef, useState } from 'react';

/** True while the element is within `rootMargin` of the viewport. */
export function useInView(rootMargin = '200px') {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return [ref, inView];
}

/** Active nav item = last section whose top has crossed 35% of the viewport (bottom → last). */
export function useActiveSection(ids) {
  const [activeId, setActiveId] = useState(ids[0]);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2) {
        setActiveId(ids[ids.length - 1]);
        return;
      }
      const line = window.innerHeight * 0.35;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ids]);
  return activeId;
}

/**
 * Land on `location.hash` after the first render. The browser tries to scroll to the hash
 * before React has rendered the target, so a direct link like /#capabilities would stay at
 * the top. Re-applies once fonts have loaded (they change layout above the target) unless
 * the visitor has scrolled in the meantime.
 */
export function useHashLanding() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return undefined;
    let userScrolled = false;
    const markUser = () => {
      userScrolled = true;
    };
    const land = () => {
      if (userScrolled) return;
      document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' });
    };
    const frame = requestAnimationFrame(land);
    window.addEventListener('wheel', markUser, { passive: true, once: true });
    window.addEventListener('touchstart', markUser, { passive: true, once: true });
    window.addEventListener('keydown', markUser, { once: true });
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) requestAnimationFrame(land);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('wheel', markUser);
      window.removeEventListener('touchstart', markUser);
      window.removeEventListener('keydown', markUser);
    };
  }, []);
}
