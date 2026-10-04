import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Palette } from 'lucide-react';
import { THEMES } from '../theme/themes';
import { useStudio } from '../theme/ThemeProvider';

/** Three swatches rendered inside the theme's own [data-theme] scope, so they read its tokens. */
function Swatches({ theme }) {
  return (
    <span data-theme={theme.id} className="flex -space-x-1" aria-hidden>
      {theme.swatches.map((token) => (
        <span
          key={token}
          className="size-4 rounded-full border border-line-strong"
          style={{ background: `var(${token})` }}
        />
      ))}
    </span>
  );
}

/**
 * Compact theme picker: button + menu of `menuitemradio` items.
 * `placement="right"` opens beside the rail; `"bottom"` drops below a header button.
 */
export function ThemeMenu({ placement = 'right', showLabel = false }) {
  const { theme, setTheme } = useStudio();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const itemRefs = useRef([]);
  const menuId = useId();
  const current = THEMES.find((t) => t.id === theme);

  useEffect(() => {
    if (!open) return undefined;
    const index = Math.max(0, THEMES.findIndex((t) => t.id === theme));
    itemRefs.current[index]?.focus();
    const onPointer = (e) => {
      if (!e.target.closest?.('[data-theme-menu]')) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
    // focus only when opening
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };

  const onMenuKey = (e) => {
    const items = itemRefs.current.filter(Boolean);
    const i = items.indexOf(document.activeElement);
    const go = (n) => {
      e.preventDefault();
      items[(n + items.length) % items.length]?.focus();
    };
    if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') go(i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(items.length - 1);
    else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') close(false);
  };

  const menuPosition =
    placement === 'right'
      ? 'left-[calc(100%+12px)] bottom-0 origin-bottom-left'
      : 'right-0 top-[calc(100%+8px)] origin-top-right';

  return (
    <div className="relative" data-theme-menu>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Theme: ${current?.name}. Change theme`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="group relative flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-fg"
      >
        <Palette aria-hidden className="size-5" strokeWidth={1.75} />
        {showLabel && <span className="text-sm font-medium text-fg">{current?.name}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-label="Theme"
            onKeyDown={onMenuKey}
            initial={{ opacity: 0, scale: 0.96, y: placement === 'right' ? 0 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute z-50 w-64 rounded-2xl border border-line bg-surface p-1.5 shadow-panel ${menuPosition}`}
          >
            <p className="px-3 pb-1 pt-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted">
              Theme
            </p>
            {THEMES.map((t, i) => {
              const selected = t.id === theme;
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  tabIndex={-1}
                  onClick={() => {
                    setTheme(t.id);
                    close();
                  }}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring ${
                    selected ? 'bg-soft' : 'hover:bg-surface-2'
                  }`}
                >
                  <Swatches theme={t} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-fg">{t.name}</span>
                    <span className="block text-xs text-muted">{t.note}</span>
                  </span>
                  <Check
                    aria-hidden
                    className={`size-4 text-primary transition-opacity ${selected ? 'opacity-100' : 'opacity-0'}`}
                  />
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
