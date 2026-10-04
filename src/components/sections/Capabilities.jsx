import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
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

/* ── Demo 3: remember → relayer → Walrus, recall ← context (replayable) ────────── */
const FLOW_STEPS = 5; // 0 idle · 1 input · 2 path to storage · 3 stored · 4 recall returns

function FlowNode({ node, lit }) {
  return (
    <div
      className={`rounded-2xl border bg-surface p-4 transition-[border-color,box-shadow] duration-300 ${
        lit ? 'border-primary shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_14%,transparent)]' : 'border-line'
      }`}
    >
      <p className="font-display text-base font-semibold text-fg">{node.title}</p>
      <p className="mt-1 text-sm text-muted">{node.detail}</p>
    </div>
  );
}

function Connector({ lit, reverse = false, label }) {
  return (
    <div className="relative flex min-h-10 items-center justify-center sm:min-h-0 sm:min-w-16" aria-hidden={!label}>
      <span className="absolute inset-x-1/2 inset-y-0 w-px -translate-x-1/2 bg-line sm:inset-x-0 sm:inset-y-1/2 sm:h-px sm:w-auto sm:translate-x-0 sm:-translate-y-1/2" />
      <span
        className={`absolute inset-x-1/2 inset-y-0 w-0.5 -translate-x-1/2 bg-primary transition-transform duration-500 ease-out sm:inset-x-0 sm:inset-y-1/2 sm:h-0.5 sm:w-auto sm:translate-x-0 sm:-translate-y-1/2 ${
          reverse ? 'origin-bottom sm:origin-right' : 'origin-top sm:origin-left'
        } ${lit ? 'scale-100' : 'scale-0'}`}
      />
      {label && <span className="relative rounded-md bg-surface px-1.5 font-mono text-[0.6875rem] text-muted">{label}</span>}
    </div>
  );
}

function FlowDemo({ demo }) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const timers = useRef([]);
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);

  const replay = useCallback(() => {
    clear();
    if (reduced) {
      setStep(FLOW_STEPS - 1);
      return;
    }
    setStep(1);
    [2, 3, 4].forEach((s, i) => timers.current.push(setTimeout(() => setStep(s), 750 * (i + 1))));
  }, [reduced]);

  const { nodes } = demo;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 rounded-md border border-dashed border-line-strong/60 px-2 py-0.5 font-mono text-xs text-muted">
          Illustrative interaction · not a live service
        </p>
        <button type="button" onClick={replay} className="btn btn-secondary min-h-11">
          <RotateCcw aria-hidden className="size-4" strokeWidth={1.75} />
          Replay flow
        </button>
      </div>

      <div className="rounded-2xl border border-line bg-column p-4 sm:p-6">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-muted">Store · remember()</p>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <FlowNode node={nodes.app} lit={step >= 1} />
          <Connector lit={step >= 2} />
          <FlowNode node={nodes.relayer} lit={step >= 2} />
          <Connector lit={step >= 3} />
          <FlowNode node={nodes.storage} lit={step >= 3} />
        </div>

        <p className="mb-2 mt-6 font-mono text-xs uppercase tracking-[0.12em] text-muted">Retrieve · recall()</p>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_2fr]">
          <FlowNode node={{ title: nodes.app.title, detail: 'Receives retrieved context' }} lit={step >= 4} />
          <Connector lit={step >= 4} reverse />
          <FlowNode node={{ title: `${nodes.relayer.title} → ${nodes.storage.title}`, detail: 'Finds memories relevant to the query' }} lit={step >= 4} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3" aria-live="polite">
        {[
          { at: 1, label: 'Sample input', body: `remember("${demo.sampleInput}")` },
          { at: 3, label: 'Stored as', body: demo.stored },
          { at: 4, label: 'Retrieved for', body: `recall("${demo.query}")` },
        ].map((c) => (
          <div
            key={c.label}
            className={`rounded-xl border border-line bg-surface p-3 transition-opacity duration-300 ${step >= c.at ? 'opacity-100' : 'opacity-45'}`}
          >
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted">{c.label}</p>
            <p className="mt-1 break-words font-mono text-[0.8125rem] text-fg">{step >= c.at ? c.body : '—'}</p>
          </div>
        ))}
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
                  <a href={a.href} target="_blank" rel="noopener noreferrer" className="text-link inline-flex min-h-11 items-center gap-2 text-sm sm:min-h-9">
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
function ProblemPanel({ item }) {
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
        <Demo demo={item.demo} />
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
    <div className="grid grid-cols-[minmax(0,34fr)_minmax(0,66fr)] gap-6">
      <div role="tablist" aria-orientation="vertical" aria-label="Problems I work on" onKeyDown={onKeyDown} className="flex flex-col gap-1.5 self-start lg:sticky lg:top-6">
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
        aria-labelledby={`help-tab-${activeId}`}
        className="relative min-h-[760px] rounded-[28px] border border-line bg-surface p-7 shadow-card xl:p-9"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={active.id} {...swap}>
            <ProblemPanel item={active} />
          </motion.div>
        </AnimatePresence>
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
                  <div className="border-t border-line p-4 sm:p-6">
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
