import { useEffect, useRef } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { CATEGORIES, LINKS, PROJECTS } from '../data/content';
import { CategoryDot, ContributorBadge, GitHubMark, ProjectMark } from './ui';

/** Render `code` spans written with backticks in content strings. */
function RichText({ text }) {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith('`') ? (
      <code key={i} className="rounded-md bg-column px-1.5 py-0.5 font-mono text-[0.85em] text-fg">
        {part.slice(1, -1)}
      </code>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function Block({ title, children }) {
  return (
    <section className="border-t border-line pt-5">
      <h3 className="eyebrow mb-2">{title}</h3>
      {children}
    </section>
  );
}

/**
 * Project details: a right-side panel on desktop and a bottom sheet on small screens.
 * Native <dialog> + showModal() gives focus containment and Escape; focus returns to the trigger.
 */
export function ProjectDialog({ projectId, returnFocus, onClose }) {
  const ref = useRef(null);
  const project = PROJECTS.find((p) => p.id === projectId);
  const category = CATEGORIES.find((c) => c.id === project?.category);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (project && !dialog.open) dialog.showModal();
    if (!project && dialog.open) dialog.close();
  }, [project]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return undefined;
    const handleClose = () => {
      onClose();
      returnFocus?.current?.focus?.();
    };
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose, returnFocus]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="project-dialog-title"
      className="project-dialog"
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      {project && (
        <div className="flex h-full flex-col">
          <header className="flex items-start gap-4 border-b border-line p-6">
            <ProjectMark project={project} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="mb-1 flex items-center gap-1.5 text-sm text-muted">
                <CategoryDot category={category?.accent} />
                {category?.title}
              </p>
              <h2 id="project-dialog-title" className="display text-3xl text-fg">
                {project.title}
              </h2>
              {project.techName && <p className="mt-1 font-mono text-sm text-muted">{project.techName}</p>}
              <p className="mt-2 text-muted">{project.tagline}</p>
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Close details"
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-surface text-fg transition-colors hover:border-primary"
            >
              <X aria-hidden className="size-5" />
            </button>
          </header>

          <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
            {project.preview ? (
              <figure className="overflow-hidden rounded-xl border border-line">
                <img src={project.preview.src} alt={`${project.title} interface`} className="block aspect-[16/10] w-full object-cover" />
                <figcaption className="border-t border-line px-3 py-1.5 font-mono text-xs text-muted">{project.preview.caption}</figcaption>
              </figure>
            ) : project.wordmark ? (
              <div className="grid h-28 place-items-center rounded-xl border border-line bg-white p-6">
                <img src={project.wordmark.src} alt={`${project.title} logo`} className="max-h-full w-auto max-w-[70%] object-contain" />
              </div>
            ) : null}
            <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
              {project.tags.map((tag) => (
                <li key={tag} className="rounded-md bg-tag px-2.5 py-1 text-xs font-medium text-muted">
                  {tag}
                </li>
              ))}
            </ul>
            <Block title="What it does">
              <p className="text-fg">{project.details.does}</p>
            </Block>
            <Block title="The problem it addresses">
              <p className="text-fg">{project.details.problem}</p>
            </Block>
            {project.details.contribution && (
              <Block title="Tyr’s contribution">
                <p className="text-fg">{project.details.contribution}</p>
                <ContributorBadge user={LINKS.githubUser} className="mt-3" />
              </Block>
            )}
            <Block title="Technical details">
              <ul className="flex flex-col gap-2 text-sm text-fg">
                {project.details.tech.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      <RichText text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            </Block>
          </div>

          <footer className="flex flex-wrap gap-3 border-t border-line p-6">
            {project.url && (
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Open live site
                <ArrowUpRight aria-hidden className="size-4" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            {project.repo && (
              <a href={project.repo} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                <GitHubMark />
                View source
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </footer>
        </div>
      )}
    </dialog>
  );
}
