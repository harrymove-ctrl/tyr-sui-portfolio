import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, Maximize2, X } from 'lucide-react';
import { CATEGORIES, LINKS, PROJECTS, STORIES } from '../../data/content';
import { CategoryDot, ContributorBadge, ProjectMark } from '../ui';

const EASE = [0.22, 1, 0.36, 1];
const PROJECT = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
const CATEGORY = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

/**
 * One hand-drawn-feeling annotation: a curved arrow that draws itself toward a point on the
 * screenshot, plus a short label. The same text is in the image's accessible description.
 */
function Annotation({ note, play }) {
  const toRight = note.side === 'right';
  // Arrow runs from the label (offset ~16% sideways, ~14% up) to the tip.
  const sx = note.x + (toRight ? 16 : -16);
  const sy = note.y - 14;
  const cx = (sx + note.x) / 2 + (toRight ? 4 : -4);
  const cy = sy - 6;
  return (
    <>
      <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <motion.path
          d={`M ${sx} ${sy} Q ${cx} ${cy} ${note.x} ${note.y - 2}`}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: play ? 1 : 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
        />
      </svg>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-surface"
        style={{ left: `${note.x}%`, top: `${note.y}%` }}
        initial={{ scale: 0 }}
        animate={{ scale: play ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 26, delay: 0.95 }}
      />
      <motion.span
        aria-hidden
        className={`pointer-events-none absolute max-w-[46%] -translate-y-full rounded-lg bg-primary px-2.5 py-1 text-[0.8125rem] font-semibold leading-snug text-primary-fg shadow-card ${
          toRight ? '' : '-translate-x-full'
        }`}
        style={{ left: `${sx}%`, top: `${sy}%` }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: play ? 1 : 0, y: play ? 0 : 6 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        {note.label}
      </motion.span>
    </>
  );
}

/** Large screenshot: clip-reveal + gentle parallax on scroll; opens a full-size view. */
function StoryImage({ story, onExpand }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [seen, setSeen] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-4%', '4%']);

  return (
    <figure ref={ref} className="group">
      <motion.div
        className="relative"
        initial={reduced ? false : { clipPath: 'inset(12% 8% 12% 8% round 28px)', opacity: 0.4 }}
        whileInView={{ clipPath: 'inset(-20% -20% -20% -20% round 28px)', opacity: 1 }}
        viewport={{ once: true, margin: '0px 0px -15% 0px' }}
        onViewportEnter={() => setSeen(true)}
        transition={{ duration: 0.9, ease: EASE }}
      >
      <button
        type="button"
        onClick={(e) => onExpand(story, e.currentTarget)}
        className="relative block w-full overflow-hidden rounded-[28px] border border-line bg-column shadow-lift"
        aria-label={`View larger screenshot of ${PROJECT[story.projectId].title}. Note: ${story.note.label}`}
      >
        <motion.img
          src={story.image.src}
          alt={story.image.alt}
          width={960}
          height={600}
          loading="lazy"
          style={{ y, scale: 1.1 }}
          className="block aspect-[16/10] w-full object-cover transition-[filter] duration-300 group-hover:brightness-[1.03]"
        />
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1.5 text-xs font-semibold text-fg opacity-0 shadow-card backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Maximize2 aria-hidden className="size-3.5" strokeWidth={1.75} />
          Enlarge
        </span>
      </button>
        <Annotation note={story.note} play={seen} />
      </motion.div>
      <figcaption className="mt-3 font-mono text-xs text-muted">Screenshot · {story.image.caption}</figcaption>
    </figure>
  );
}

function Lightbox({ story, returnFocus, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (story && !d.open) d.showModal();
    if (!story && d.open) d.close();
  }, [story]);
  useEffect(() => {
    const d = ref.current;
    const handle = () => {
      onClose();
      returnFocus.current?.focus();
    };
    d.addEventListener('close', handle);
    return () => d.removeEventListener('close', handle);
  }, [onClose, returnFocus]);
  return (
    <dialog
      ref={ref}
      aria-label={story ? `${PROJECT[story.projectId].title} screenshot` : 'Screenshot'}
      className="lightbox"
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
    >
      {story && (
        <figure className="relative">
          <img src={story.image.src} alt={story.image.alt} className="block max-h-[82vh] w-auto max-w-[92vw] rounded-2xl" />
          <figcaption className="mt-3 flex items-center justify-between gap-4 text-sm text-white/85">
            <span>
              <strong className="font-semibold text-white">Note:</strong> {story.note.label} · Screenshot · {story.image.caption}
            </span>
            <button
              type="button"
              onClick={() => ref.current.close()}
              aria-label="Close screenshot"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
            >
              <X aria-hidden className="size-5" />
            </button>
          </figcaption>
        </figure>
      )}
    </dialog>
  );
}

function Story({ story, index, onExpand }) {
  const project = PROJECT[story.projectId];
  const category = CATEGORY[project.category];
  const flip = index % 2 === 1;
  return (
    <article className={`grid items-center gap-8 lg:grid-cols-12 lg:gap-12 ${index ? 'mt-24 lg:mt-36' : ''}`} aria-labelledby={`story-${story.projectId}`}>
      <div className={`lg:col-span-7 ${flip ? 'lg:order-2' : ''}`}>
        <StoryImage story={story} onExpand={onExpand} />
      </div>
      <motion.div
        className={`lg:col-span-5 ${flip ? 'lg:order-1' : ''}`}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -15% 0px' }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
      >
        <p className="flex items-center gap-3 text-sm text-muted">
          <ProjectMark project={project} />
          <span>
            <span className="block font-semibold text-fg">{project.title}</span>
            <span className="flex items-center gap-1.5">
              <CategoryDot category={category.accent} />
              {category.title}
            </span>
          </span>
        </p>
        <h3 id={`story-${story.projectId}`} className="mt-5 font-display text-[clamp(1.75rem,2.6vw,2.25rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-fg">
          {story.title}
        </h3>
        <dl className="mt-6 flex max-w-[62ch] flex-col gap-4 text-[1.0625rem] leading-relaxed">
          <div>
            <dt className="text-sm font-semibold text-muted">The problem</dt>
            <dd className="mt-1 text-fg">{story.problem}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-muted">A decision that shaped it</dt>
            <dd className="mt-1 text-fg">{story.decision}</dd>
          </div>
          <div className="border-l-2 border-primary pl-4">
            <dt className="text-sm font-semibold text-primary">Tyr’s contribution</dt>
            <dd className="mt-1 text-fg">{story.contribution}</dd>
            <dd className="mt-2"><ContributorBadge user={LINKS.githubUser} /></dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-2">
          {story.links.map((l, i) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={`btn ${i === 0 ? 'btn-primary' : 'btn-secondary'}`}>
              {l.label}
              <ArrowUpRight aria-hidden className="size-4" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
        </div>
      </motion.div>
    </article>
  );
}

export function Stories() {
  const [open, setOpen] = useState(null);
  const trigger = useRef(null);
  return (
    <section id="stories" aria-labelledby="stories-title" className="py-16 sm:py-24">
      <div className="mb-14 max-w-3xl sm:mb-20">
        <p className="eyebrow mb-3">Selected work</p>
        <h2 id="stories-title" className="display text-[clamp(2.25rem,4vw,3rem)] text-fg">
          Three projects, and the decision behind each.
        </h2>
        <p className="mt-4 max-w-[60ch] text-lg text-muted">
          Team projects at CommandOSS and Mysten, with the parts I contributed linked so you can check them.
        </p>
      </div>
      {STORIES.map((story, i) => (
        <Story
          key={story.projectId}
          story={story}
          index={i}
          onExpand={(s, el) => {
            trigger.current = el;
            setOpen(s);
          }}
        />
      ))}
      <Lightbox story={open} returnFocus={trigger} onClose={() => setOpen(null)} />
    </section>
  );
}
