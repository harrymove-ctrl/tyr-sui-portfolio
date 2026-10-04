import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Layers, List, Waves } from 'lucide-react';
import { SUI_CONCEPTS } from '../../data/content';
import { useStudio } from '../../theme/ThemeProvider';
import { useInView } from '../../hooks/useStudioHooks';
import { DiagonalCardStack } from '../DiagonalCardStack';
import { ExternalLink, Reveal } from '../ui';

const MODES = [
  { id: 'stream', label: 'Stream', Icon: Waves },
  { id: 'stack', label: 'Stack', Icon: Layers },
  { id: 'list', label: 'List', Icon: List },
];

/**
 * "Explore Sui" playground — the original diagonal stream / stack deck of Sui concepts,
 * restored on a dark studio table, with a readable List alternative.
 */
export function ExploreSui() {
  const { motionPaused } = useStudio();
  // Phones are too narrow for the diagonal stream to show whole cards; start them on the
  // stacked deck (one readable card, tap to fan out). Stream stays one tap away.
  const [mode, setMode] = useState(() => (window.matchMedia('(max-width: 639px)').matches ? 'stack' : 'stream'));
  const [ref, inView] = useInView('100px');

  return (
    <div ref={ref} className="mt-20">
      <Reveal className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="eyebrow mb-2">Playground</p>
          <h3 className="display text-3xl text-fg sm:text-4xl">Explore Sui</h3>
          <p className="mt-3 text-muted">
            The building blocks I work with most. Drag along the stream, tap a card to stack the deck, or switch to List to
            read them.
          </p>
        </div>
        <div role="group" aria-label="Playground view" className="flex rounded-full border border-line bg-surface p-1 shadow-card">
          {MODES.map(({ id, label, Icon }) => {
            const active = mode === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => setMode(id)}
                className={`relative flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors ${
                  active ? 'text-primary-fg' : 'text-muted hover:text-fg'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="explore-mode-pill"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon aria-hidden className="relative size-4" />
                <span className="relative">{label}</span>
              </button>
            );
          })}
        </div>
      </Reveal>

      <AnimatePresence mode="wait" initial={false}>
        {mode === 'list' ? (
          <motion.ul
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.26 }}
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            {SUI_CONCEPTS.map((c) => (
              <li key={c.id} className="card flex flex-col overflow-hidden">
                <span aria-hidden className="h-2" style={{ background: c.gradient }} />
                <div className="flex flex-1 flex-col p-5">
                  <p className="font-mono text-xs uppercase tracking-wider text-muted">{c.brand}</p>
                  <h4 className="mt-1 font-display text-xl font-bold text-fg">{c.title}</h4>
                  <p className="mt-2 flex-1 text-sm text-muted">{c.description}</p>
                  <ExternalLink href={c.href} className="mt-2 self-start">
                    Learn more
                  </ExternalLink>
                </div>
              </li>
            ))}
          </motion.ul>
        ) : (
          <motion.div
            key="deck"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="grain grid-faint relative overflow-hidden rounded-[28px] border border-line bg-stage"
          >
            <p className="sr-only">
              Visual card deck of Sui concepts. Switch the playground view to List for a readable version with links.
            </p>
            <div aria-hidden>
              <DiagonalCardStack
                cards={SUI_CONCEPTS}
                isStacked={mode === 'stack'}
                autoPlay={!motionPaused && inView}
                paused={motionPaused}
                speed={1}
                cardWidth={240}
                cardHeight={280}
                stepX={138}
                stepY={90}
                onCardClick={() => setMode((m) => (m === 'stack' ? 'stream' : 'stack'))}
                className="w-full"
              />
            </div>
            <p className="pointer-events-none absolute bottom-4 left-5 font-mono text-xs text-stage-muted">
              {mode === 'stack' ? 'Tap a card to fan the stream back out' : 'Drag along the diagonal · tap a card to stack'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
