import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { SITE } from '../../data/content';
import { useStudio } from '../../theme/ThemeProvider';
import { useInView } from '../../hooks/useStudioHooks';
import { MeshGradient } from '../effects/MeshGradient';

const PixelSculpt = lazy(() => import('../react-bits/pixel-sculpt'));

const EASE = [0.22, 1, 0.36, 1];
const copy = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const line = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};


/** Static, theme-colored Sui drop used before the relief loads and when WebGL is unavailable. */
function DropFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div
        className="size-[58%]"
        style={{
          background: 'var(--sculpt)',
          WebkitMask: 'url(/sui-drop.svg) center / contain no-repeat',
          mask: 'url(/sui-drop.svg) center / contain no-repeat',
          opacity: 0.85,
        }}
      />
    </div>
  );
}

/** CommandOSS symbol (cropped from the official horizontal logo), tinted to the text color. */
function CommandOssMark({ className = '' }) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 bg-fg ${className}`}
      style={{
        WebkitMask: 'url(/brand-commandoss-mark.svg) center / contain no-repeat',
        mask: 'url(/brand-commandoss-mark.svg) center / contain no-repeat',
      }}
    />
  );
}

function Stage() {
  const { palette, motionPaused } = useStudio();
  const [ref, inView] = useInView('300px');
  const tiltRef = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (inView) setSeen(true);
  }, [inView]);

  // Restrained pointer tilt on the relief layer only; labels stay anchored.
  const onPointerMove = useCallback(
    (e) => {
      const el = tiltRef.current;
      if (!el || motionPaused || e.pointerType !== 'mouse') return;
      const r = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(1200px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateZ(0)`;
    },
    [motionPaused],
  );
  const onPointerLeave = useCallback(() => {
    if (tiltRef.current) tiltRef.current.style.transform = '';
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative aspect-[5/4] w-full overflow-hidden rounded-[28px] border border-line shadow-lift sm:aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[480px]"
    >
      <MeshGradient
        colors={palette.mesh}
        speed={0.35}
        scale={1.2}
        distortion={0.4}
        swirl={0.2}
        softness={0.7}
        grain={0.02}
        grainMotion={false}
        interactive
        transition={1.2}
        paused={motionPaused}
        className="absolute inset-0"
      />
      <div aria-hidden className="grid-faint pointer-events-none absolute inset-0 opacity-40" />

      <div
        ref={tiltRef}
        className="absolute inset-[2%] transition-transform duration-200 ease-out will-change-transform"
      >
        {seen ? (
          <Suspense fallback={<DropFallback />}>
            <PixelSculpt
              src="/sui-relief.png"
              resolution={72}
              depth={4.2}
              gap={0.16}
              tileShape="square"
              hoverEffect="raise"
              clickEffect="pulse"
              colorMode="luminance"
              baseColor={palette.sculpt}
              accentColor={palette.sculptHi}
              removeBackground
              backgroundTolerance={0.22}
              tilt={30}
              scale={2.1}
              interactionRadius={6}
              interactionStrength={1}
              dpr={1.5}
              fallback={<DropFallback />}
              className="absolute inset-0 h-full w-full"
            />
          </Suspense>
        ) : (
          <DropFallback />
        )}
      </div>

      {/* One deliberate legend strip instead of pills in every corner. */}
      <ul
        aria-label="Focus areas"
        className="pointer-events-none absolute inset-x-4 bottom-4 z-10 flex flex-wrap justify-center gap-1.5 sm:inset-x-6 sm:bottom-6"
      >
        {SITE.stageLabels.map((label) => (
          <li
            key={label}
            className="rounded-full border border-line px-3 py-1 text-xs font-medium text-fg backdrop-blur-sm sm:text-[0.8125rem]"
            style={{ background: 'var(--scrim)' }}
          >
            {label}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section id="home" aria-labelledby="home-title" className="pb-16 pt-6 sm:pb-20 lg:pt-14">
      <div className="grid gap-10 lg:min-h-[min(640px,calc(100svh-12rem))] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-12">
        <motion.div variants={copy} initial="hidden" animate="show" className="flex flex-col justify-center">
          <motion.h1 variants={line} id="home-title" className="display flex items-center gap-4 sm:gap-6 text-7xl text-fg sm:text-8xl xl:text-9xl">
            <img
              src="/tyr.webp"
              alt="Tyr"
              width={600}
              height={600}
              className="size-[0.8em] rounded-[0.18em] border border-line-strong/45 object-cover shadow-card"
            />
            {SITE.name}
          </motion.h1>
          <motion.p
            variants={line}
            className="mt-6 max-w-xl font-display text-3xl font-semibold leading-[1.1] tracking-tight text-fg sm:text-4xl"
          >
            {SITE.headline}
          </motion.p>
          <motion.p variants={line} className="mt-5 max-w-lg text-lg text-muted">
            {SITE.description}
          </motion.p>
          <motion.p variants={line} className="mt-4 flex max-w-lg items-start gap-2.5 text-[0.9375rem] text-fg">
            <CommandOssMark className="mt-[0.3em] h-[1.05em] w-[0.99em]" />
            <span>{SITE.affiliation}</span>
          </motion.p>
          <motion.div variants={line} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#stories" className="btn btn-primary">
              Explore my work
              <ArrowDown aria-hidden className="size-4" />
            </a>
            <a href="#contact" className="btn btn-secondary">
              Let’s build
              <ArrowRight aria-hidden className="size-4" />
            </a>
          </motion.div>
        </motion.div>

        <Stage />
      </div>

    </section>
  );
}
