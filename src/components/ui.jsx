import { motion } from 'framer-motion';
import { ArrowUpRight, Database, SquareTerminal, Workflow } from 'lucide-react';
import { useStudio } from '../theme/ThemeProvider';

const EASE = [0.22, 1, 0.36, 1];

/** Fade-up on first view. Under reduced motion MotionConfig drops the transform. */
export function Reveal({ children, className = '', delay = 0, as = 'div' }) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

export function SectionHeader({ id, eyebrow, title, intro, children, className = '' }) {
  return (
    <Reveal className={`mb-10 flex flex-col gap-6 sm:mb-12 lg:flex-row lg:items-end lg:justify-between ${className}`}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 id={id} className="display text-4xl text-fg sm:text-5xl">
          {title}
        </h2>
        {intro && <p className="mt-4 text-lg text-muted">{intro}</p>}
      </div>
      {children}
    </Reveal>
  );
}

/** Small external link with an arrow. */
export function ExternalLink({ href, children, className = '' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-link inline-flex min-h-11 items-center gap-1 text-sm font-medium ${className}`}
    >
      {children}
      <ArrowUpRight aria-hidden className="size-3.5" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** Category accent classes (indicator + quiet fill). Always rendered next to the category name. */
export const CATEGORY_STYLE = {
  agent: { dot: 'bg-cat-agent', text: 'text-cat-agent', soft: 'bg-cat-agent-soft', Icon: Workflow },
  sui: { dot: 'bg-cat-sui', text: 'text-cat-sui', soft: 'bg-cat-sui-soft', Icon: SquareTerminal },
  walrus: { dot: 'bg-cat-walrus', text: 'text-cat-walrus', soft: 'bg-cat-walrus-soft', Icon: Database },
};

export function CategoryDot({ category, className = '' }) {
  return <span aria-hidden className={`inline-block size-2 shrink-0 rounded-full ${CATEGORY_STYLE[category]?.dot} ${className}`} />;
}

const MARK_SIZES = {
  md: { box: 44, radius: 12, icon: 'size-5' },
  lg: { box: 56, radius: 14, icon: 'size-6' },
};

/**
 * Project mark: a fixed-geometry tile (same size and radius everywhere) holding the project's
 * verified symbol with its own optical padding. Projects without a verified symbol get the
 * neutral category symbol — never invented initials or a made-up logo.
 */
export function ProjectMark({ project, size = 'md' }) {
  const { theme } = useStudio();
  const { box, radius, icon } = MARK_SIZES[size];
  const scale = box / 44;
  const mark = project.mark;
  const frame = { width: box, height: box, borderRadius: radius };

  if (!mark) {
    const style = CATEGORY_STYLE[project.category];
    const Icon = style?.Icon ?? Database;
    return (
      <span
        aria-hidden
        style={frame}
        className={`grid shrink-0 place-items-center border border-line-strong/45 ${style?.soft} ${style?.text}`}
      >
        <Icon className={icon} strokeWidth={1.75} />
      </span>
    );
  }

  const src = theme === 'midnight-sui' && mark.dark ? mark.dark : mark.src;
  return (
    <span
      aria-hidden
      style={{ ...frame, ...(mark.bg ? { background: mark.bg } : null) }}
      className="grid shrink-0 place-items-center overflow-hidden border border-line-strong/45 bg-tile shadow-[0_1px_2px_rgb(var(--shadow-rgb)/0.08)]"
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        draggable={false}
        className="block h-full w-full object-contain"
        style={{
          padding: mark.bleed ? 0 : Math.round((mark.pad ?? 8) * scale),
          filter: mark.invertDark && theme === 'midnight-sui' ? 'invert(1)' : undefined,
        }}
      />
    </span>
  );
}

/**
 * Visible tooltip for icon-only controls: shows on hover and on keyboard focus.
 * The control keeps its own accessible name; the tip is decorative.
 */
export function Tip({ label, side = 'bottom', children }) {
  const pos =
    side === 'right'
      ? 'left-[calc(100%+12px)] top-1/2 -translate-y-1/2'
      : 'top-[calc(100%+8px)] left-1/2 -translate-x-1/2';
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        aria-hidden
        className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-fg px-2.5 py-1 text-xs font-medium text-bg opacity-0 shadow-card transition-opacity duration-150 group-hover/tip:opacity-100 group-has-[:focus-visible]/tip:opacity-100 ${pos}`}
      >
        {label}
      </span>
    </span>
  );
}

/** Official GitHub mark (Octicons `mark-github`, per GitHub's logo guidelines), inherits text color. */
export function GitHubMark({ className = 'size-4' }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

/** "by @user" chip: avatar + handle, linking to the user's GitHub profile. Shown with Tyr's contributions. */
export function ContributorBadge({ user, className = '' }) {
  return (
    <a
      href={`https://github.com/${user}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-2.5 pr-3.5 text-sm font-medium text-fg transition-colors hover:border-primary hover:text-primary ${className}`}
    >
      <img src={`https://github.com/${user}.png?size=48`} alt="" width="24" height="24" className="size-6 rounded-full border border-line" loading="lazy" />
      <GitHubMark className="size-3.5 opacity-70" />
      @{user}
      <span className="sr-only"> on GitHub (opens in a new tab)</span>
    </a>
  );
}
