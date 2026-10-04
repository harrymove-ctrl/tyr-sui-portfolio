import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ArrowUpRight, Columns3, List, PanelRightOpen, RotateCcw } from 'lucide-react';
import { CATEGORIES, PROJECTS } from '../../data/content';
import { ListKanban } from '../ui/ListKanban';
import { CategoryDot, ProjectMark, Reveal, SectionHeader } from '../ui';

const EASE = [0.22, 1, 0.36, 1];

const initialOrder = () =>
  Object.fromEntries(CATEGORIES.map((c) => [c.id, PROJECTS.filter((p) => p.category === c.id)]));

function LinkChip({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center gap-1 rounded-lg px-1.5 text-sm text-muted underline-offset-4 transition-colors hover:text-primary hover:underline"
    >
      {children}
      <ArrowUpRight aria-hidden className="size-3.5" strokeWidth={2} />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** Compact text button; the 44px hit area comes from min-height, not a big outlined pill. */
function DetailsButton({ project, onOpen, className = '' }) {
  return (
    <button
      type="button"
      onClick={(e) => onOpen(project.id, e.currentTarget)}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1.5 text-sm font-semibold text-fg transition-colors hover:text-primary active:scale-[0.97] ${className}`}
    >
      <PanelRightOpen aria-hidden className="size-4" strokeWidth={1.75} />
      Details
      <span className="sr-only"> about {project.title}</span>
    </button>
  );
}

/** Featured preview: a real interface crop from the live product, 16:10, labelled as a screenshot. */
function FeaturedPreview({ project }) {
  const { preview } = project;
  return (
    <figure className="relative mb-4 overflow-hidden rounded-xl border border-line bg-column">
      <img
        src={preview.src}
        alt={`${project.title} interface`}
        loading="lazy"
        width={960}
        height={600}
        className="block aspect-[16/10] w-full object-cover"
      />
      <figcaption className="absolute bottom-2 left-2 rounded-md px-2 py-0.5 font-mono text-[0.6875rem] text-fg backdrop-blur-sm" style={{ background: 'var(--scrim)' }}>
        {preview.caption}
      </figcaption>
    </figure>
  );
}

function ProjectFooter({ project, onOpen }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 border-t border-line pt-1">
      <DetailsButton project={project} onOpen={onOpen} className="-ml-1.5" />
      <span className="ml-auto flex items-center gap-1">
        {project.url && <LinkChip href={project.url}>Live</LinkChip>}
        {project.repo && <LinkChip href={project.repo}>Source</LinkChip>}
      </span>
    </div>
  );
}

function Tags({ tags }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tags">
      {tags.slice(0, 3).map((tag) => (
        <li key={tag} className="rounded-md bg-tag px-2 py-0.5 text-xs font-medium text-muted">
          {tag}
        </li>
      ))}
    </ul>
  );
}

function BoardCard({ project, onOpen, isDragging, handle }) {
  return (
    <article aria-label={project.title} className={isDragging ? 'select-none' : ''}>
      {project.preview && <FeaturedPreview project={project} />}
      <div className="flex items-center gap-3">
        <motion.span layoutId={`mark-${project.id}`} className="shrink-0">
          <ProjectMark project={project} />
        </motion.span>
        <div className="min-w-0">
          <h4 className="font-display text-[1.0625rem] font-semibold leading-snug text-fg">{project.title}</h4>
          {project.techName && <p className="truncate font-mono text-xs text-muted">{project.techName}</p>}
        </div>
        <span className="ml-auto self-start">{handle}</span>
      </div>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{project.tagline}</p>
      <Tags tags={project.tags} />
      <ProjectFooter project={project} onOpen={onOpen} />
    </article>
  );
}

function ListView({ order, onOpen }) {
  return (
    <div className="flex flex-col gap-10">
      {CATEGORIES.map((category) => (
        <section key={category.id} aria-labelledby={`list-${category.id}`}>
          <h3 id={`list-${category.id}`} className="mb-3 flex items-center gap-2 font-display text-xl font-semibold text-fg">
            <CategoryDot category={category.accent} className="size-2.5" />
            {category.title}
            <span className="font-mono text-sm font-normal text-muted">{order[category.id].length}</span>
          </h3>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {order[category.id].map((project) => (
              <li key={project.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <motion.span layoutId={`mark-${project.id}`} className="shrink-0">
                    <ProjectMark project={project} />
                  </motion.span>
                  <div className="min-w-0">
                    <p className="font-semibold text-fg">{project.title}</p>
                    {project.techName && <p className="font-mono text-xs text-muted">{project.techName}</p>}
                    <p className="mt-0.5 text-[0.9375rem] text-muted">{project.tagline}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1 pl-[56px] sm:pl-0">
                  <DetailsButton project={project} onOpen={onOpen} />
                  {project.url && <LinkChip href={project.url}>Live</LinkChip>}
                  {project.repo && <LinkChip href={project.repo}>Source</LinkChip>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ViewSwitch({ view, onChange }) {
  const options = [
    { id: 'board', label: 'Board', Icon: Columns3 },
    { id: 'list', label: 'List', Icon: List },
  ];
  return (
    <div role="group" aria-label="Project view" className="relative flex rounded-full border border-line bg-surface p-1 shadow-card">
      {options.map(({ id, label, Icon }) => {
        const active = view === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(id)}
            className={`relative flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
              active ? 'text-primary-fg' : 'text-muted hover:text-fg'
            }`}
          >
            {active && (
              <motion.span
                layoutId="view-switch-pill"
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
  );
}

export function Work({ onOpenProject }) {
  const [view, setView] = useState(() => (window.matchMedia('(min-width: 1024px)').matches ? 'board' : 'list'));
  const [order, setOrder] = useState(initialOrder);
  const dirty = useMemo(
    () => CATEGORIES.some((c) => order[c.id].some((p, i) => p !== initialOrder()[c.id][i])),
    [order],
  );

  const onReorder = useCallback((columnId, next) => {
    setOrder((prev) => ({ ...prev, [columnId]: next }));
  }, []);

  const columns = CATEGORIES.map((c) => ({ ...c, items: order[c.id] }));

  return (
    <section id="work" aria-labelledby="work-title" className="py-16 sm:py-24">
      <SectionHeader
        id="work-title"
        eyebrow="Work"
        title="Things I’m building"
        intro="A collection of tools, experiments, and infrastructure across Sui, Walrus, and agent workflows."
      >
        <ViewSwitch view={view} onChange={setView} />
      </SectionHeader>

      <Reveal className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {view === 'board'
            ? 'Drag a card by its handle, or focus the handle and use the arrow keys, to reorder within a column. This only changes your view on this page; nothing is saved.'
            : 'Every project, grouped by category. Open Details for the full story and links.'}
        </p>
        {view === 'board' && (
          <button
            type="button"
            onClick={() => setOrder(initialOrder())}
            disabled={!dirty}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold text-fg transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            <RotateCcw aria-hidden className="size-4" />
            Reset layout
          </button>
        )}
      </Reveal>

      <LayoutGroup id="work-views">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            {view === 'board' ? (
              <ListKanban
                columns={columns}
                onReorder={onReorder}
                itemLabel={(p) => p.title}
                className="grid items-start gap-4 lg:grid-cols-3"
                renderCard={(project, { isDragging, handle }) => (
                  <BoardCard project={project} onOpen={onOpenProject} isDragging={isDragging} handle={handle} />
                )}
              />
            ) : (
              <ListView order={order} onOpen={onOpenProject} />
            )}
          </motion.div>
        </AnimatePresence>
      </LayoutGroup>
    </section>
  );
}
