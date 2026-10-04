import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, Layers, List, Waves } from 'lucide-react';
import { PROJECTS, SUI_CONCEPTS } from '../../data/content';
import { useStudio } from '../../theme/ThemeProvider';
import { useInView } from '../../hooks/useStudioHooks';
import { DiagonalCardStack } from '../DiagonalCardStack';
import { ExternalLink, ProjectMark, Reveal } from '../ui';

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
  const [pickedId, setPickedId] = useState(SUI_CONCEPTS[0].id);
  const pickedIndex = SUI_CONCEPTS.findIndex((c) => c.id === pickedId);
  const picked = SUI_CONCEPTS[pickedIndex];
  const step = (d) => setPickedId(SUI_CONCEPTS[(pickedIndex + d + SUI_CONCEPTS.length) % SUI_CONCEPTS.length].id);

  return (
    <div ref={ref} className="mt-20">
      <Reveal className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="eyebrow mb-2">Playground</p>
          <h3 className="display text-3xl text-fg sm:text-4xl">Sui in eight building blocks</h3>
          <p className="mt-3 max-w-[60ch] text-muted">
            The Sui concepts behind the projects above. Pick a card in the stream — or step through with the arrows — to
            see what it is and which projects use it.
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
                className={`relative flex min-h-11 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors ${
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
                  {c.usedIn.length > 0 && (
                    <p className="mt-3 text-xs text-muted">
                      <span className="font-semibold text-fg">Used in:</span>{' '}
                      {c.usedIn.map((u) => PROJECTS.find((p) => p.id === u.id).title).join(', ')}
                    </p>
                  )}
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
            className="grain grid-faint relative grid overflow-hidden rounded-[28px] border border-line bg-stage lg:grid-cols-[minmax(0,1fr)_380px]"
          >
            <p className="sr-only">
              Visual card deck of Sui concepts. Switch the playground view to List for a readable version with links.
            </p>
            <div aria-hidden className="min-w-0 overflow-hidden">
              <DiagonalCardStack
                cards={SUI_CONCEPTS}
                isStacked={mode === 'stack'}
                autoPlay={!motionPaused && inView}
                paused={motionPaused}
                selectedId={pickedId}
                speed={1}
                cardWidth={240}
                cardHeight={280}
                stepX={138}
                stepY={90}
                onCardClick={(card) => {
                  setPickedId(card.id);
                  if (mode === 'stack') setMode('stream');
                }}
                className="w-full"
              />
            </div>
            {/* Readout: the stream is the visual, this panel is the meaning. */}
            <div className="relative flex flex-col justify-start border-t border-white/10 bg-black/40 p-5 lg:border-l lg:border-t-0 lg:p-7">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-xs text-stage-muted">
                  {String(pickedIndex + 1).padStart(2, '0')} / {String(SUI_CONCEPTS.length).padStart(2, '0')}
                </span>
                <span className="flex gap-1">
                  {[
                    { d: -1, label: 'Previous concept', Icon: ChevronLeft },
                    { d: 1, label: 'Next concept', Icon: ChevronRight },
                  ].map(({ d, label, Icon }) => (
                    <button
                      key={label}
                      type="button"
                      aria-label={label}
                      onClick={() => step(d)}
                      className="grid size-11 place-items-center rounded-xl border border-white/15 text-stage-fg transition-colors hover:bg-white/10"
                    >
                      <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                    </button>
                  ))}
                </span>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={picked.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  aria-live="polite"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: picked.accent }}>
                    {picked.brand}
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold text-stage-fg">{picked.title}</p>
                  <p className="mt-2 text-[0.9375rem] text-stage-muted">{picked.description}</p>

                  <p className="mt-5 text-sm font-semibold text-stage-fg">Where it shows up in this work</p>
                  {picked.usedIn.length ? (
                    <ul className="mt-2 flex flex-col gap-2">
                      {picked.usedIn.map((u) => {
                        const project = PROJECTS.find((p) => p.id === u.id);
                        return (
                          <li key={u.id}>
                            <a
                              href={project.url || project.repo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex min-h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2 pr-3 transition-colors hover:border-white/25 hover:bg-white/10"
                            >
                              <ProjectMark project={project} />
                              <span className="min-w-0">
                                <span className="block text-sm font-semibold text-stage-fg">{project.title}</span>
                                <span className="block text-xs text-stage-muted">{u.note}</span>
                              </span>
                              <ArrowUpRight aria-hidden className="ml-auto size-4 shrink-0 text-stage-muted" />
                              <span className="sr-only"> (opens in a new tab)</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-stage-muted">Not part of a listed project yet — worth knowing when building on Sui.</p>
                  )}

                  <a
                    href={picked.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-stage-fg underline decoration-white/40 underline-offset-4 hover:decoration-white"
                  >
                    Learn {picked.title}
                    <ArrowUpRight aria-hidden className="size-4" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
