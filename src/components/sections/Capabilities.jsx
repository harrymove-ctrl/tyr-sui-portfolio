import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import {
  AppWindow,
  ArrowUpRight,
  ChevronDown,
  Database,
  GitPullRequest,
  RotateCcw,
  SquareTerminal,
  Workflow,
} from 'lucide-react';
import { HELP, PROJECTS } from '../../data/content';
import { GitHubMark, ProjectMark, SectionHeader } from '../ui';

const EASE = [0.22, 1, 0.36, 1];
const ICONS = { workflows: SquareTerminal, agents: Workflow, memory: Database };
const PROJECT = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
const swap = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.16, ease: EASE } },
};

function useIsDesktop() {
  const query = '(min-width: 1024px)';
  const [desktop, setDesktop] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = () => setDesktop(m.matches);
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, []);
  return desktop;
}

function Out({ href, children, primary = false }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`btn ${primary ? 'btn-primary' : 'btn-secondary'}`}>
      {!primary && <GitHubMark />}
      {children}
      {primary && <ArrowUpRight aria-hidden className="size-4" />}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/* ── Demo 1: real screenshot with numbered annotations ─────────────────────────── */
function ScreenshotDemo({ demo }) {
  return (
    <div className="flex flex-col gap-4">
      <figure className="relative overflow-hidden rounded-2xl border border-line bg-column">
        <img src={demo.src} alt={demo.alt} width={960} height={600} className="block aspect-[16/10] w-full object-cover" />
        {demo.notes.map((n, i) => (
          <span
            key={n.label}
            aria-hidden
            className="absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-fg shadow-card ring-4 ring-primary/20"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            {i + 1}
          </span>
        ))}
        <figcaption className="absolute bottom-2 right-2 rounded-md px-2 py-0.5 font-mono text-[0.6875rem] text-fg backdrop-blur-sm" style={{ background: 'var(--scrim)' }}>
          {demo.caption}
        </figcaption>
      </figure>
      <div className="grid gap-4 md:grid-cols-[1fr_1.1fr]">
        <p className="text-[0.9375rem] text-muted">{demo.explanation}</p>
        <ol className="flex flex-col gap-2">
          {demo.notes.map((n, i) => (
            <li key={n.label} className="flex items-start gap-2.5 text-[0.9375rem] text-fg">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-soft font-mono text-[0.6875rem] font-semibold text-primary">
                {i + 1}
              </span>
              {n.label}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ── Demo 2: illustrative stage sequence + real site crop ──────────────────────── */
function WorkflowDemo({ demo }) {
  const [stageId, setStageId] = useState(demo.stages[0].id);
  const stage = demo.stages.find((s) => s.id === stageId);
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-3 inline-flex items-center gap-2 rounded-md border border-dashed border-line-strong/60 px-2 py-0.5 font-mono text-xs text-muted">
          Illustrative workflow · not a live run
        </p>
        <ol className="relative grid grid-cols-1 gap-2 sm:grid-cols-5" aria-label="Delivery stages">
          <span aria-hidden className="absolute left-[10%] right-[10%] top-[22px] hidden h-px bg-line sm:block" />
          {demo.stages.map((s, i) => {
            const active = s.id === stageId;
            return (
              <li key={s.id} className="relative">
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setStageId(s.id)}
                  className={`flex min-h-11 w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left text-sm font-medium transition-colors sm:flex-col sm:gap-1.5 sm:text-center ${
                    active ? 'text-fg' : 'text-muted hover:text-fg'
                  }`}
                >
                  <span
                    className={`relative grid size-8 shrink-0 place-items-center rounded-full border font-mono text-xs transition-colors ${
                      active ? 'border-primary bg-primary text-primary-fg' : 'border-line bg-surface text-muted'
                    }`}
                  >
                    {i + 1}
                  </span>
                  {s.label}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="grid gap-4 md:grid-cols-[1.05fr_1fr]">
        <div className="relative min-h-[196px] rounded-2xl border border-line bg-column p-5">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={stage.id} {...swap}>
              <p className="font-mono text-sm font-semibold text-primary">{stage.skill}</p>
              <p className="mt-2 text-[0.9375rem] text-fg">{stage.does}</p>
              <p className="mt-4 font-mono text-xs uppercase tracking-[0.12em] text-muted">Ask your agent</p>
              <p className="mt-1 rounded-lg bg-surface px-3 py-2 text-sm text-fg">“{stage.prompt}”</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <figure className="overflow-hidden rounded-2xl border border-line">
          <img src={demo.src} alt={demo.alt} width={960} height={600} loading="lazy" className="block aspect-[16/10] w-full object-cover" />
          <figcaption className="border-t border-line px-3 py-1.5 font-mono text-xs text-muted">{demo.caption}</figcaption>
        </figure>
      </div>
    </div>
  );
}

/* ── Demo 3: remember → relayer → Walrus, recall ← context (plays once in view; replayable) ── */
const FLOW_END = 6; // 0 idle · 1 input · 2 → relayer · 3 → Walrus · 4 stored · 5 recall query · 6 context returned

function NodeIcon({ kind }) {
  if (kind === 'relayer') return <img src="/projects/memwal-mark.svg" alt="" className="size-6" />;
  if (kind === 'storage')
    return (
      <span
        aria-hidden
        className="block h-[18px] w-[27px] bg-fg"
        style={{ WebkitMask: 'url(/brand-walrus.svg) center / contain no-repeat', mask: 'url(/brand-walrus.svg) center / contain no-repeat' }}
      />
    );
  return <AppWindow aria-hidden className="size-6 text-fg" strokeWidth={1.75} />;
}

function FlowNode({ kind, node, lit, pulse }) {
  return (
    <motion.div
      animate={pulse ? { scale: [1, 1.04, 1] } : { scale: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
      className={`relative flex items-start gap-3 rounded-2xl border bg-surface-2/70 p-4 backdrop-blur-sm transition-[border-color,box-shadow] duration-300 ${
        lit ? 'border-primary shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_18%,transparent),0_12px_32px_-12px_color-mix(in_srgb,var(--primary)_55%,transparent)]' : 'border-line'
      }`}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-tile">
        <NodeIcon kind={kind} />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-base font-semibold text-fg">{node.title}</span>
        <span className="mt-0.5 block text-sm text-muted">{node.detail}</span>
      </span>
    </motion.div>
  );
}

/** A track between nodes; while `active`, a glowing packet travels along it. */
function Track({ lit, active, reverse = false, playKey }) {
  const horizontal = window.matchMedia('(min-width: 640px)').matches;
  return (
    <div aria-hidden className="relative mx-auto h-10 w-px sm:mx-0 sm:h-auto sm:w-full">
      <span className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,var(--line-strong)_0_4px,transparent_4px_9px)] opacity-60 sm:top-1/2 sm:h-px sm:bg-[repeating-linear-gradient(to_right,var(--line-strong)_0_4px,transparent_4px_9px)]" />
      <span
        className={`absolute inset-0 bg-primary transition-transform duration-500 ease-out sm:top-1/2 sm:h-0.5 sm:-translate-y-1/2 ${
          reverse ? 'origin-bottom sm:origin-right' : 'origin-top sm:origin-left'
        } ${lit ? 'scale-100' : 'scale-0'}`}
      />
      {active && (
        <motion.span
          key={playKey}
          className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_14px_4px_color-mix(in_srgb,var(--primary)_70%,transparent)]"
          initial={horizontal ? { left: reverse ? '100%' : '0%', top: '50%' } : { top: reverse ? '100%' : '0%', left: '50%' }}
          animate={horizontal ? { left: reverse ? '0%' : '100%' } : { top: reverse ? '0%' : '100%' }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        />
      )}

    </div>
  );
}

function FlowDemo({ demo, active = true }) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [run, setRun] = useState(0);
  const timers = useRef([]);
  const rootRef = useRef(null);
  const inView = useInView(rootRef, { amount: 0.4 });
  const played = useRef(false);
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);

  const replay = useCallback(() => {
    clear();
    setRun((r) => r + 1);
    if (reduced) {
      setStep(FLOW_END);
      return;
    }
    setStep(1);
    for (let s = 2; s <= FLOW_END; s++) timers.current.push(setTimeout(() => setStep(s), 800 * (s - 1)));
  }, [reduced]);

  // Plays once when it first scrolls into view, so the diagram is never a dead picture.
  useEffect(() => {
    if (inView && active && !played.current) {
      played.current = true;
      replay();
    }
  }, [inView, active, replay]);

  const { nodes } = demo;
  const running = step > 0 && step < FLOW_END;
  return (
    <div ref={rootRef} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 rounded-md border border-dashed border-line-strong/60 px-2 py-0.5 font-mono text-xs text-muted">
          Illustrative interaction · not a live service
        </p>
        <button type="button" onClick={replay} disabled={running} className="btn btn-secondary min-h-11 disabled:opacity-60">
          <RotateCcw aria-hidden className={`size-4 ${running ? 'animate-spin [animation-direction:reverse]' : ''}`} strokeWidth={1.75} />
          {running ? 'Playing…' : 'Replay flow'}
        </button>
      </div>

      <div className="rounded-2xl border border-line bg-bg/40 p-4 sm:p-6">
        <p className="mb-3 font-mono text-xs text-muted">
          <span className="text-primary">1 ·</span> store with <code className="text-fg">remember()</code>
        </p>
        <div className="grid grid-cols-1 items-center sm:grid-cols-[minmax(0,1fr)_minmax(40px,0.3fr)_minmax(0,1fr)_minmax(40px,0.3fr)_minmax(0,1fr)]">
          <FlowNode kind="app" node={nodes.app} lit={step >= 1} pulse={step === 1} />
          <Track lit={step >= 2} active={step === 2} playKey={`a${run}`} />
          <FlowNode kind="relayer" node={nodes.relayer} lit={step >= 2} pulse={step === 2} />
          <Track lit={step >= 3} active={step === 3} playKey={`b${run}`} />
          <FlowNode kind="storage" node={nodes.storage} lit={step >= 3} pulse={step === 4} />
        </div>

        <p className="mb-3 mt-7 font-mono text-xs text-muted">
          <span className="text-primary">2 ·</span> retrieve with <code className="text-fg">recall()</code>
        </p>
        <div className="grid grid-cols-1 items-center sm:grid-cols-[minmax(0,1fr)_minmax(40px,0.3fr)_minmax(0,2.4fr)]">
          <FlowNode kind="app" node={{ title: nodes.app.title, detail: 'Receives the relevant memories as context' }} lit={step >= 6} pulse={step === 6} />
          <Track lit={step >= 6} active={step === 6} reverse playKey={`c${run}`} />
          <FlowNode kind="relayer" node={{ title: `${nodes.relayer.title} · ${nodes.storage.title}`, detail: 'Finds memories relevant to the query' }} lit={step >= 5} pulse={step === 5} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3" aria-live="polite">
        {[
          { at: 1, label: 'Sample input', body: `remember("${demo.sampleInput}")` },
          { at: 4, label: 'Stored as', body: demo.stored },
          { at: 5, label: 'Query', body: `recall("${demo.query}")` },
        ].map((c) => {
          const shown = step >= c.at;
          return (
            <div key={c.label} className={`min-h-[6.5rem] rounded-xl border p-3 transition-colors duration-300 ${shown ? 'border-primary/50 bg-surface' : 'border-line bg-surface/50'}`}>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted">{c.label}</p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={shown ? 'on' : 'off'}
                  initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.3 }}
                  className="mt-1 break-words font-mono text-[0.8125rem] text-fg"
                >
                  {shown ? c.body : 'waiting…'}
                </motion.p>
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const DEMOS = { screenshot: ScreenshotDemo, workflow: WorkflowDemo, flow: FlowDemo };

function Evidence({ item }) {
  const project = PROJECT[item.projectId];
  const { evidence } = item;
  return (
    <div className="mt-6 border-t border-line pt-5">
      <dl className="grid gap-4 md:grid-cols-[0.8fr_1.4fr_1.4fr]">
        <div>
          <dt className="eyebrow mb-2">Project</dt>
          <dd className="flex items-center gap-3">
            <ProjectMark project={project} />
            <span className="font-semibold text-fg">{project.title}</span>
          </dd>
        </div>
        <div>
          <dt className="eyebrow mb-2">Tyr’s contribution</dt>
          <dd className="text-[0.9375rem] text-fg">{evidence.contribution}</dd>
        </div>
        <div>
          <dt className="eyebrow mb-2">Inspectable artifact</dt>
          <dd>
            <ul className="flex flex-col">
              {evidence.artifacts.map((a) => (
                <li key={a.href}>
                  <a href={a.href} target="_blank" rel="noopener noreferrer" className="text-link inline-flex min-h-11 items-center gap-2 text-sm">
                    <GitPullRequest aria-hidden className="size-4 shrink-0 text-muted" strokeWidth={1.75} />
                    {a.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Out href={evidence.primary.href} primary>
          {evidence.primary.label}
        </Out>
        <Out href={evidence.source.href}>{evidence.source.label}</Out>
      </div>
    </div>
  );
}

/** The selected problem's full story: framing, demo, contextual fit line, evidence. */
function ProblemPanel({ item, active = true }) {
  const Demo = DEMOS[item.demo.kind];
  return (
    <div>
      <h3 className="display text-3xl text-fg sm:text-[2.25rem]">{item.title}</h3>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="eyebrow mb-1">Problem</dt>
          <dd className="text-[0.9375rem] text-fg">{item.problem}</dd>
        </div>
        <div>
          <dt className="eyebrow mb-1">Approach</dt>
          <dd className="text-[0.9375rem] text-fg">{item.approach}</dd>
        </div>
      </dl>
      <div className="mt-6">
        <Demo demo={item.demo} active={active} />
      </div>
      <p className="mt-6 rounded-xl bg-soft px-4 py-3 text-[0.9375rem] text-fg">{item.usefulWhen}</p>
      <Evidence item={item} />
    </div>
  );
}

function OptionLabel({ item, active }) {
  const Icon = ICONS[item.id];
  return (
    <>
      <span
        className={`relative mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border transition-colors ${
          active ? 'border-primary/30 bg-surface text-primary' : 'border-line bg-surface text-muted'
        }`}
      >
        <Icon aria-hidden className="size-[18px]" strokeWidth={1.75} />
      </span>
      <span className="relative min-w-0">
        <span className="block font-semibold text-fg">{item.tab}</span>
        <span className="mt-0.5 block text-sm text-muted">{item.tabNote}</span>
      </span>
    </>
  );
}

/* Desktop: vertical tablist (34%) with a sliding indicator + stable demo panel (66%). */
function TabsLayout({ items }) {
  const [activeId, setActiveId] = useState(items[0].id);
  const refs = useRef({});
  const active = items.find((i) => i.id === activeId);

  const onKeyDown = (e) => {
    const i = items.findIndex((x) => x.id === activeId);
    const go = (n) => {
      e.preventDefault();
      const next = items[(n + items.length) % items.length];
      setActiveId(next.id);
      refs.current[next.id]?.focus();
    };
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') go(i + 1);
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') go(i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(items.length - 1);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,34fr)_minmax(0,66fr)]">
      <div role="tablist" aria-orientation="vertical" aria-label="Problems I work on" onKeyDown={onKeyDown} className="grid grid-cols-3 gap-1.5 self-start xl:sticky xl:top-6 xl:flex xl:flex-col">
        {items.map((item) => {
          const selected = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={(el) => {
                refs.current[item.id] = el;
              }}
              id={`help-tab-${item.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls="help-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(item.id)}
              className="relative flex items-start gap-3 rounded-2xl p-4 text-left transition-colors hover:bg-surface-2/60"
            >
              {selected && (
                <motion.span
                  layoutId="help-tab-indicator"
                  className="absolute inset-0 rounded-2xl border border-line bg-surface shadow-card"
                  transition={{ type: 'spring', stiffness: 460, damping: 38 }}
                >
                  <span className="absolute inset-y-4 left-0 w-[3px] rounded-full bg-primary" />
                </motion.span>
              )}
              <OptionLabel item={item} active={selected} />
            </button>
          );
        })}
      </div>

      <div
        id="help-panel"
        role="tabpanel"
        data-theme="midnight-sui"
        aria-labelledby={`help-tab-${activeId}`}
        className="dither-stage relative rounded-[28px] border border-line p-7 text-fg shadow-panel xl:p-9"
      >
        {/* All three panels share one grid cell, so the stage is always as tall as the tallest
            state: switching never makes the page jump. Inactive panels are inert and hidden. */}
        <div className="grid grid-cols-[minmax(0,1fr)]">
          {items.map((item) => {
            const on = item.id === activeId;
            return (
              <motion.div
                key={item.id}
                className="min-w-0 [grid-area:1/1]"
                initial={false}
                animate={on ? { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE } } : { opacity: 0, y: 8, transition: { duration: 0.14 } }}
                style={{ visibility: on ? 'visible' : 'hidden', pointerEvents: on ? 'auto' : 'none' }}
                aria-hidden={!on}
                inert={!on}
              >
                <ProblemPanel item={item} active={on} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* Mobile/tablet: accordion — every problem stays visible, one open at a time. */
function AccordionLayout({ items }) {
  const [openId, setOpenId] = useState(items[0].id);
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const open = item.id === openId;
        return (
          <li key={item.id} className="overflow-hidden rounded-[22px] border border-line bg-surface shadow-card">
            <h3 className="m-0">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`help-acc-${item.id}`}
                onClick={() => setOpenId(open ? null : item.id)}
                className="flex w-full items-start gap-3 p-4 text-left"
              >
                <OptionLabel item={item} active={open} />
                <ChevronDown aria-hidden className={`ml-auto mt-2 size-5 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  id={`help-acc-${item.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.24, ease: EASE }}
                >
                  <div data-theme="midnight-sui" className="dither-stage border-t border-line p-4 text-fg sm:p-6">
                    <ProblemPanel item={item} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

export function Capabilities() {
  const desktop = useIsDesktop();
  return (
    <section id="capabilities" aria-labelledby="capabilities-title" className="py-16 sm:py-24">
      <SectionHeader id="capabilities-title" eyebrow={HELP.eyebrow} title={HELP.title} intro={HELP.intro} />
      {desktop ? <TabsLayout items={HELP.problems} /> : <AccordionLayout items={HELP.problems} />}
    </section>
  );
}
