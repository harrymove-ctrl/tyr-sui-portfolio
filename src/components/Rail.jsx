import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FolderTree, House, Mail, Menu, PanelsTopLeft, Pause, Play, Wrench, X } from 'lucide-react';
import { NAV_ITEMS, SITE } from '../data/content';
import { useStudio } from '../theme/ThemeProvider';
import { ThemeMenu } from './ThemeMenu';
import { Tip } from './ui';

const ICONS = {
  home: House,
  stories: PanelsTopLeft,
  capabilities: Wrench,
  explore: FolderTree,
  contact: Mail,
};

/** Tyr "T": optically centred, set in the display face with a hairline inner ring. */
function Monogram({ className = '' }) {
  return (
    <span
      aria-hidden
      className={`relative grid place-items-center rounded-[13px] bg-fg font-display font-bold tracking-[-0.04em] text-bg shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)] ${className}`}
    >
      <span className="translate-y-[-0.03em] leading-none">T</span>
    </span>
  );
}

/** Hover/focus label shown to the right of a rail control (decorative; the control has its own name). */
function RailTip({ children }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 z-50 -translate-x-1 -translate-y-1/2 whitespace-nowrap rounded-lg bg-fg px-2.5 py-1 text-xs font-medium text-bg opacity-0 shadow-card transition duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
    >
      {children}
    </span>
  );
}

export function MotionToggle({ withTip = false }) {
  const { motionPaused, reducedMotion, toggleMotion } = useStudio();
  const label = reducedMotion
    ? 'Motion reduced by your system setting'
    : motionPaused
      ? 'Play background motion'
      : 'Pause background motion';
  const button = (
    <button
      type="button"
      onClick={toggleMotion}
      aria-pressed={motionPaused}
      aria-label={label}
      disabled={reducedMotion}
      className="group relative grid size-11 place-items-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-50"
    >
      {motionPaused ? <Play aria-hidden className="size-5" strokeWidth={1.75} /> : <Pause aria-hidden className="size-5" strokeWidth={1.75} />}
      {withTip && <RailTip>{motionPaused ? 'Play motion' : 'Pause motion'}</RailTip>}
    </button>
  );
  return withTip ? button : <Tip label={motionPaused ? 'Play motion' : 'Pause motion'}>{button}</Tip>;
}

/** Desktop: slim fixed rail with icon links, theme menu, and motion toggle. */
export function NavRail({ activeId }) {
  return (
    <aside className="theme-fade fixed inset-y-0 left-0 z-40 hidden w-[84px] flex-col items-center border-r border-line bg-surface/80 py-5 backdrop-blur-md lg:flex">
      <a href="#home" aria-label={`${SITE.name} — back to top`} className="group relative rounded-xl">
        <Monogram className="size-11 text-lg" />
        <RailTip>Back to top</RailTip>
      </a>

      <nav aria-label="Primary" className="mt-10">
        <ul className="flex flex-col items-center gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.id];
            const active = item.id === activeId;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-label={item.label}
                  aria-current={active ? 'location' : undefined}
                  className={`group relative grid size-12 place-items-center rounded-2xl transition-colors ${
                    active ? 'text-primary-fg' : 'text-muted hover:bg-surface-2 hover:text-fg'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="rail-active"
                      className="absolute inset-0 rounded-2xl bg-primary"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  )}
                  <Icon aria-hidden className="relative size-5" strokeWidth={1.75} />
                  <RailTip>{item.label}</RailTip>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto flex flex-col items-center gap-2 border-t border-line pt-4">
        <MotionToggle withTip />
        <Tip label="Theme" side="right">
          <ThemeMenu placement="right" />
        </Tip>
      </div>
    </aside>
  );
}

/** Mobile/tablet: compact sticky header with theme, motion, and a disclosure menu. */
export function MobileHeader({ activeId }) {
  const [open, setOpen] = useState(false);
  const pendingTarget = useRef(null);

  const scrollToPending = () => {
    const id = pendingTarget.current;
    pendingTarget.current = null;
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="theme-fade sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md lg:hidden">
      <div className="flex h-16 items-center gap-2 px-4">
        <a href="#home" className="mr-auto flex min-h-11 items-center gap-2.5" aria-label={`${SITE.name} — back to top`}>
          <Monogram className="size-9 text-base" />
          <span className="leading-tight">
            <span className="block font-display text-base font-bold text-fg">{SITE.name}</span>
            <span className="block text-xs text-muted">{SITE.role}</span>
          </span>
        </a>
        <MotionToggle />
        <Tip label="Theme">
          <ThemeMenu placement="bottom" />
        </Tip>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="grid size-11 place-items-center rounded-xl border border-line bg-surface text-fg"
        >
          {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
        </button>
      </div>
      <AnimatePresence initial={false} onExitComplete={scrollToPending}>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Primary"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="theme-fade absolute inset-x-0 top-full overflow-hidden border-b border-line bg-bg/95 shadow-card backdrop-blur-md"
          >
            <ul className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-5">
              {NAV_ITEMS.map((item) => {
                const Icon = ICONS[item.id];
                const active = item.id === activeId;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => {
                        // Navigate after the menu has finished closing; scrolling while it
                        // animates out gets cancelled.
                        e.preventDefault();
                        pendingTarget.current = item.id;
                        setOpen(false);
                      }}
                      aria-current={active ? 'location' : undefined}
                      className={`flex min-h-12 items-center gap-2.5 rounded-xl px-3 text-sm font-medium ${
                        active ? 'bg-primary text-primary-fg' : 'bg-surface text-fg'
                      }`}
                    >
                      <Icon aria-hidden className="size-4" />
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
