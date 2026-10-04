import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, Database, Github } from 'lucide-react';
import { COMMANDOSS_PROJECTS, COMMANDOSS_OSS } from '../../data/content';

const SPRING = { type: 'spring', stiffness: 260, damping: 32, mass: 0.9 };

function useCardSize() {
  const [size, setSize] = useState({ w: 300, h: 440, gap: 56 });
  useEffect(() => {
    const update = () => {
      const narrow = window.innerWidth < 640;
      setSize(narrow ? { w: 250, h: 400, gap: 24 } : { w: 300, h: 440, gap: 56 });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
}

function Corners() {
  const c = 'absolute size-[10px] border-current';
  return (
    <div className="pointer-events-none absolute inset-0 text-black/80" aria-hidden>
      <span className={`${c} left-5 top-5 border-l border-t`} />
      <span className={`${c} right-5 top-5 border-r border-t`} />
      <span className={`${c} left-5 bottom-5 border-l border-b`} />
      <span className={`${c} right-5 bottom-5 border-r border-b`} />
    </div>
  );
}

function Logo({ project, active }) {
  // Inactive slides mute every logo to grey (dark logos → mid-grey, light marks → dark) like commandoss.com.
  const style = {
    filter: active ? 'none' : 'invert(1) grayscale(1) brightness(0.6)',
    transition: 'filter 0.35s ease',
  };
  if (!project.logo) {
    return (
      <Database
        className="size-16"
        strokeWidth={1.6}
        style={{ color: active ? '#0a0a0a' : '#8c8c8c', transition: 'color 0.35s ease' }}
      />
    );
  }
  return (
    <img
      src={project.logo}
      alt=""
      draggable={false}
      className={project.logoWide ? 'h-12 w-auto max-w-[210px] object-contain' : 'size-[76px] object-contain'}
      style={style}
    />
  );
}

function Slide({ project, active, size, onSelect, dragging }) {
  return (
    <motion.article
      className="relative shrink-0 select-none"
      style={{ width: size.w, height: size.h }}
      onClick={() => {
        if (!dragging.current && !active) onSelect();
      }}
      aria-roledescription="slide"
      aria-label={project.title}
      aria-current={active}
    >
      <motion.div
        className="absolute inset-0 flex flex-col items-center overflow-hidden rounded-[28px] px-7 pb-6 pt-14 text-center"
        initial={false}
        animate={{
          backgroundColor: active ? project.bg : 'rgba(0,0,0,0)',
          scale: active ? 1 : 0.9,
        }}
        transition={SPRING}
        style={{ cursor: active ? 'default' : 'pointer' }}
      >
        {active && <Corners />}
        <h3
          className="display-tight text-[26px] sm:text-[30px] font-extrabold uppercase"
          style={{
            color: active ? '#0a0a0a' : '#8a8580',
            transition: 'color 0.35s ease',
            letterSpacing: '-0.02em',
          }}
        >
          {project.title}
        </h3>
        <div className="flex h-[120px] items-center justify-center mt-6">
          <Logo project={project} active={active} />
        </div>
        <motion.div
          className="flex flex-1 flex-col items-center"
          initial={false}
          animate={{ opacity: active ? 1 : 0, y: active ? 0 : 10 }}
          transition={{ duration: 0.3, delay: active ? 0.12 : 0 }}
          style={{ pointerEvents: active ? 'auto' : 'none' }}
          aria-hidden={!active}
        >
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-black/50">
            {project.kicker}
          </p>
          <p className="font-mono text-[11.5px] uppercase leading-[1.55] text-black/70">
            {project.desc}
          </p>
          <div className="mt-auto flex items-center gap-5 pt-4 font-mono text-[12px] uppercase tracking-wider text-black">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={active ? 0 : -1}
              className="inline-flex items-center gap-1 hover:underline underline-offset-4"
            >
              Website <ArrowUpRight className="size-3.5" />
            </a>
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={active ? 0 : -1}
                className="inline-flex items-center gap-1 hover:underline underline-offset-4"
              >
                <Github className="size-3.5" /> Source
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.article>
  );
}

export function ShippingCarousel() {
  const projects = COMMANDOSS_PROJECTS;
  const size = useCardSize();
  const slot = size.w + size.gap;
  const viewportRef = useRef(null);
  const [viewportW, setViewportW] = useState(0);
  const [index, setIndex] = useState(0);
  const dragging = useRef(false);
  const x = useMotionValue(0);

  // "DRAG" pill that trails the pointer
  const pillX = useSpring(0, { stiffness: 500, damping: 40 });
  const pillY = useSpring(0, { stiffness: 500, damping: 40 });
  const [pillOn, setPillOn] = useState(false);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => setViewportW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const offsetFor = useCallback(
    (i) => viewportW / 2 - size.w / 2 - i * slot,
    [viewportW, size.w, slot],
  );

  useEffect(() => {
    const controls = animate(x, offsetFor(index), SPRING);
    return () => controls.stop();
  }, [index, offsetFor, x]);

  const go = useCallback(
    (i) => setIndex(Math.max(0, Math.min(projects.length - 1, i))),
    [projects.length],
  );

  const onDragEnd = (_, info) => {
    const projected = x.get() + info.velocity.x * 0.2;
    go(Math.round((viewportW / 2 - size.w / 2 - projected) / slot));
    // Let the click that ends a drag fall through without selecting a slide.
    setTimeout(() => {
      dragging.current = false;
    }, 0);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(index - 1);
    }
  };

  const onPointerMove = (e) => {
    const rect = viewportRef.current.getBoundingClientRect();
    pillX.set(e.clientX - rect.left);
    pillY.set(e.clientY - rect.top);
    setPillOn(!e.target.closest('a,button'));
  };

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-mono mb-2 text-[#c4f542]">cmdoss@sui:~$ ./projects</p>
          <h3 className="display-tight text-xl sm:text-2xl md:text-3xl text-[#e8e4d9]">
            Shipping now from CommandOSS
          </h3>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="font-mono text-[11px] text-[#8a8580] tabular-nums mr-1">
            {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            className="grid size-9 place-items-center rounded-xl border border-[#2a2926] bg-[#111110]/85 text-[#e8e4d9] transition hover:border-[#c4f542]/40 disabled:opacity-30"
            aria-label="Previous project"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === projects.length - 1}
            className="grid size-9 place-items-center rounded-xl border border-[#2a2926] bg-[#111110]/85 text-[#e8e4d9] transition hover:border-[#c4f542]/40 disabled:opacity-30"
            aria-label="Next project"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="relative overflow-hidden rounded-2xl panel py-8 outline-none focus-visible:ring-1 focus-visible:ring-[#c4f542]/50"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="CommandOSS projects"
        onKeyDown={onKeyDown}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setPillOn(false)}
        style={{ cursor: 'none' }}
      >
        <motion.div
          className="flex touch-pan-y"
          style={{ x, gap: size.gap }}
          drag="x"
          dragConstraints={{ left: offsetFor(projects.length - 1), right: offsetFor(0) }}
          dragElastic={0.12}
          onDragStart={() => {
            dragging.current = true;
          }}
          onDragEnd={onDragEnd}
        >
          {projects.map((p, i) => (
            <Slide
              key={p.id}
              project={p}
              active={i === index}
              size={size}
              onSelect={() => go(i)}
              dragging={dragging}
            />
          ))}
        </motion.div>

        <motion.div
          className="pointer-events-none absolute left-0 top-0 hidden sm:block"
          style={{ x: pillX, y: pillY }}
          aria-hidden
        >
          <motion.span
            className="block -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0a0a0a] px-5 py-2.5 font-mono text-[12px] uppercase tracking-wider text-[#e8e4d9] shadow-[0_0_0_1px_rgba(232,228,217,0.15)]"
            animate={{ scale: pillOn ? 1 : 0, opacity: pillOn ? 1 : 0 }}
            transition={{ duration: 0.18 }}
          >
            Drag
          </motion.span>
        </motion.div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <p className="label-mono mr-1 text-[#8a8580]">Open source</p>
        {COMMANDOSS_OSS.map((c) => (
          <a
            key={c.id}
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#2a2926]/85 bg-[#111110]/85 px-3 py-1.5 font-mono text-xs tracking-wide text-[#e8e4d9] transition hover:-translate-y-0.5 hover:border-[#c4f542]/40"
          >
            <Github className="size-3 opacity-60" />
            {c.title}
          </a>
        ))}
      </div>
    </div>
  );
}

export default ShippingCarousel;
