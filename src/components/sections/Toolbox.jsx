import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  BookOpen,
  Bot,
  Boxes,
  Brain,
  Check,
  Copy,
  Database,
  FileCode2,
  Globe,
  Layers3,
  Network,
  Rocket,
  Building2,
  GraduationCap,
  Workflow,
} from 'lucide-react';
import { TOOLBOX } from '../../data/content';
import { TreeView } from '../ui/TreeView';
import { SectionHeader } from '../ui';

const ICONS = {
  commandoss: Building2,
  'tb-ai-devkit': Bot,
  'tb-delivery': Workflow,
  'tb-docs': BookOpen,
  sui: Boxes,
  'tb-move': FileCode2,
  'tb-ts-sdk': Layers3,
  'tb-ptb': Network,
  'tb-ci': Rocket,
  'tb-sui-skills': GraduationCap,
  walrus: Database,
  'tb-storage': Database,
  'tb-sites': Globe,
  'tb-memory': Brain,
};

const withIcons = (nodes) =>
  nodes.map((n) => ({
    ...n,
    icon: ICONS[n.id],
    hint: n.children ? String(n.children.length) : undefined,
    children: n.children && withIcons(n.children),
  }));

function CopyCommand({ command }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-bg p-1.5 pl-3">
      <code className="min-w-0 flex-1 break-all font-mono text-sm text-fg">{command}</code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(command);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          } catch {
            setCopied(false);
          }
        }}
        className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg bg-surface px-3 text-sm font-semibold text-fg shadow-card transition-colors hover:text-primary active:scale-[0.97]"
      >
        {copied ? <Check aria-hidden className="size-4 text-primary" /> : <Copy aria-hidden className="size-4" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Command copied to clipboard' : ''}
      </span>
    </div>
  );
}

function Preview({ node, parent, onSelect }) {
  const Icon = ICONS[node.id];
  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full flex-col"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-soft text-primary">
          {Icon && <Icon aria-hidden className="size-5" />}
        </span>
        <div>
          {parent && <p className="eyebrow">{parent.label}</p>}
          <h3 className="display text-2xl text-fg sm:text-3xl">{node.label}</h3>
        </div>
      </div>

      {node.children ? (
        <>
          <p className="mt-5 text-lg text-muted">Pick an item to see what it is and where to start.</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {node.children.map((child) => {
              const ChildIcon = ICONS[child.id];
              return (
                <li key={child.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(child)}
                    className="card lift flex min-h-12 w-full items-center gap-2.5 px-3.5 py-2 text-left font-medium text-fg"
                  >
                    {ChildIcon && <ChildIcon aria-hidden className="size-4 text-primary" />}
                    {child.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <>
          <p className="mt-5 text-lg leading-relaxed text-fg">{node.summary}</p>
          {node.install && (
            <div className="mt-6">
              <p className="eyebrow mb-2">Start with</p>
              <CopyCommand command={node.install} />
            </div>
          )}
          <div className="mt-auto pt-6">
            <a
              href={node.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              {node.related}
              <ArrowUpRight aria-hidden className="size-4" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </>
      )}
    </motion.div>
  );
}

export function Toolbox() {
  const tree = useMemo(() => withIcons(TOOLBOX), []);
  const index = useMemo(() => {
    const map = new Map();
    const walk = (nodes, parent) =>
      nodes.forEach((n) => {
        map.set(n.id, { node: n, parent });
        if (n.children) walk(n.children, n);
      });
    walk(tree, null);
    return map;
  }, [tree]);
  const [selectedId, setSelectedId] = useState('tb-ai-devkit');
  const { node, parent } = index.get(selectedId);

  return (
    <section id="skills" aria-labelledby="skills-title" className="py-16 sm:py-24">
      <SectionHeader
        id="skills-title"
        eyebrow="Skills"
        title="Inside my toolbox"
        intro="A curated shelf of the tools, skills, and docs I reach for, with links you can use today."
      />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="theme-fade rounded-[20px] bg-column p-3">
          <p className="px-2 pb-2 pt-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">~/toolbox</p>
          <TreeView
            data={tree}
            selectedId={selectedId}
            onSelect={(n) => setSelectedId(n.id)}
            defaultExpanded={TOOLBOX.map((g) => g.id)}
            label="Toolbox"
          />
        </div>
        <div
          className="card relative min-h-[360px] overflow-hidden p-6 sm:p-8 lg:sticky lg:top-6"
          style={{
            backgroundImage:
              'radial-gradient(60% 50% at 100% 0%, color-mix(in srgb, var(--soft) 70%, transparent), transparent 70%), radial-gradient(50% 50% at 0% 100%, color-mix(in srgb, var(--deco-2) 35%, transparent), transparent 70%)',
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <Preview key={node.id} node={node} parent={parent} onSelect={(n) => setSelectedId(n.id)} />
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
