import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { DEFAULT_THEME, MOTION_STORAGE_KEY, THEMES, THEME_STORAGE_KEY } from './themes';

const StudioContext = createContext(null);

const root = () => document.documentElement;

function readStored(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode) — the choice just won't persist */
  }
}

function initialTheme() {
  const current = root().dataset.theme;
  return THEMES.some((t) => t.id === current) ? current : DEFAULT_THEME;
}

function readPalette() {
  const css = getComputedStyle(root());
  const v = (name) => css.getPropertyValue(name).trim();
  return {
    mesh: [1, 2, 3, 4, 5, 6].map((i) => v(`--mesh-${i}`)),
    smoke: { background: v('--smoke-bg'), colors: [v('--smoke-1'), v('--smoke-2'), v('--smoke-3')] },
    sculpt: v('--sculpt'),
    sculptHi: v('--sculpt-hi'),
  };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/**
 * Owns the active theme (persisted, applied to <html data-theme>) and the motion state:
 * `motionPaused` is true when the visitor pressed pause OR the OS asks for reduced motion.
 */
export function StudioProvider({ children }) {
  const [theme, setThemeState] = useState(initialTheme);
  const [palette, setPalette] = useState(readPalette);
  const [userPaused, setUserPaused] = useState(() => readStored(MOTION_STORAGE_KEY) === 'paused');
  const reducedMotion = usePrefersReducedMotion();
  const motionPaused = userPaused || reducedMotion;

  useLayoutEffect(() => {
    root().dataset.theme = theme;
    setPalette(readPalette());
  }, [theme]);

  useEffect(() => {
    root().dataset.motion = motionPaused ? 'paused' : 'running';
  }, [motionPaused]);

  const setTheme = useCallback((id) => {
    if (!THEMES.some((t) => t.id === id)) return;
    writeStored(THEME_STORAGE_KEY, id);
    setThemeState(id);
  }, []);

  const toggleMotion = useCallback(() => {
    setUserPaused((paused) => {
      writeStored(MOTION_STORAGE_KEY, paused ? 'running' : 'paused');
      return !paused;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, palette, motionPaused, userPaused, reducedMotion, toggleMotion }),
    [theme, setTheme, palette, motionPaused, userPaused, reducedMotion, toggleMotion],
  );

  return (
    <StudioContext.Provider value={value}>
      <MotionConfig reducedMotion={userPaused ? 'always' : 'user'}>{children}</MotionConfig>
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used inside <StudioProvider>');
  return ctx;
}
