import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  lazy,
  Suspense,
} from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Github,
  MessageCircle,
  Sparkles,
  Twitter,
} from 'lucide-react';
import { FlowerSidebar, MobileNavBar } from './components/FlowerSidebar';
import { NAV_GROUPS, SKILL_COUNT } from './data/content';
import { ProjectsShowcase } from './components/sections/ProjectsShowcase';
import { SkillsShowcase } from './components/sections/SkillsShowcase';
import { useWebGLBudget } from './hooks/useWebGLBudget';

const PixelSculpt = lazy(() => import('./components/react-bits/pixel-sculpt'));
const SilkWaves = lazy(() => import('./components/react-bits/silk-waves'));
const AsciiCursor = lazy(() => import('./components/react-bits/ascii-cursor'));
const Portal = lazy(() => import('./components/react-bits/portal'));

const SECTION_IDS = ['hero', 'projects', 'skills', 'contact'];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

function useIsMobile(breakpoint = 640) {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => setMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [breakpoint]);
  return mobile;
}

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <motion.div className="mb-8 sm:mb-10" variants={fadeUp}>
      <p className="label-mono mb-2 text-[#c4f542]">{eyebrow}</p>
      <h2 className="display-tight text-2xl sm:text-3xl md:text-4xl text-[#e8e4d9]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-sm sm:text-base text-[#8a8580] max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

function Reveal({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-12% 0px -8% 0px' }}
    >
      {children}
    </motion.div>
  );
}

/** Dual-brand motif chips — fills voids without a giant logo watermark */
function MotifChips({ className = '' }) {
  const chips = ['CommandOSS', 'Sui', 'cmk:sui-sdk', 'Agent Skills'];
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`} aria-hidden>
      {chips.map((c, i) => (
        <span
          key={`${c}-${i}`}
          className="text-[9px] font-mono uppercase tracking-wider px-2 py-1 rounded-lg"
          style={{
            color: i % 2 === 0 ? '#c4f542' : '#4da2ff',
            background:
              i % 2 === 0 ? 'rgba(31,46,40,0.75)' : 'rgba(12,28,48,0.75)',
            border: '1px solid rgba(42,41,38,0.7)',
          }}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

function Hero({ showSculpt }) {
  const handleSculptError = useCallback((error) => {
    console.warn('[PixelSculpt] failed to load relief:', error);
  }, []);

  return (
    <section
      id="hero"
      className="relative w-full min-h-[100svh] overflow-hidden bg-[#000000]"
    >
      <div className="relative z-10 grid min-h-[100svh] w-full grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:pl-[280px] xl:pl-[300px] lg:pr-6 xl:pr-10">
        {/* LEFT — Tyr + short about blurb */}
        <div className="relative z-20 flex flex-col justify-center gap-4 sm:gap-5 px-5 py-14 sm:px-8 sm:py-16 md:px-10 lg:pl-8 lg:pr-4 xl:pl-10 xl:pr-6 pointer-events-none">
          <div
            className="pointer-events-none absolute inset-y-0 -right-4 w-12 sm:w-16 lg:w-20 hidden lg:block"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0) 100%)',
            }}
            aria-hidden
          />

          <motion.p
            className="label-mono text-[#c4f542]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            CommandOSS · Sui builder
          </motion.p>

          <motion.h1
            className="display-tight text-5xl sm:text-6xl md:text-7xl xl:text-8xl text-[#e8e4d9]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
          >
            Tyr
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg text-[#e8e4d9]/90 font-medium leading-relaxed max-w-md"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.26 }}
          >
            CommandOSS builder shipping Sui + agent-skills tooling — AI DevKit,
            cmk:sui-sdk, and delivery pipelines for teams that ship.
          </motion.p>

          <motion.p
            className="text-sm text-[#8a8580] leading-relaxed max-w-md"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.32 }}
          >
            Move · Objects · PTBs · Walrus — curated for newbies, crafted with
            tactility.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-3 pt-1 pointer-events-auto"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4 }}
          >
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition hover:brightness-110 hover:-translate-y-0.5"
              style={{ background: '#c4f542', color: '#0a0a0a' }}
            >
              Explore projects
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <a
              href="https://skills.commandoss.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition hover:border-[#c4f542]/40 hover:-translate-y-0.5"
              style={{
                background: 'rgba(17,17,16,0.55)',
                border: '1px solid rgba(42,41,38,0.85)',
                color: '#e8e4d9',
                backdropFilter: 'blur(8px)',
              }}
            >
              Skills hub
            </a>
          </motion.div>

          <motion.div
            className="pt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
          >
            <MotifChips />
            <p className="label-mono text-[10px] text-[#8a8580]/80 mt-2">
              Drag · click the relief · CommandOSS × Sui
            </p>
          </motion.div>
        </div>

        {/* RIGHT — PixelSculpt (centered in column, not pinned to far edge) */}
        <div className="relative z-0 min-h-[48svh] lg:min-h-[100svh] w-full flex items-center justify-center">
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              background:
                'radial-gradient(ellipse at 45% 42%, rgba(196,245,66,0.14) 0%, transparent 52%), radial-gradient(ellipse at 50% 72%, rgba(77,162,255,0.12) 0%, transparent 48%)',
            }}
            aria-hidden
          />
          {showSculpt ? (
            <Suspense
              fallback={
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <img
                    src="/sui-relief.png"
                    alt=""
                    className="h-[68%] w-auto max-w-[85%] object-contain opacity-60"
                  />
                </div>
              }
            >
              <PixelSculpt
                src="/sui-relief.png"
                resolution={80}
                depth={4}
                gap={0.15}
                tileShape="square"
                hoverEffect="raise"
                clickEffect="pulse"
                colorMode="image"
                removeBackground
                backgroundTolerance={0.12}
                tilt={28}
                scale={1.18}
                offsetX={-0.16}
                offsetY={0}
                interactionRadius={6}
                interactionStrength={1}
                backgroundColor="#000000"
                dpr={2}
                autoRotate
                rotateSpeed={0.4}
                onError={handleSculptError}
                className="absolute inset-0 h-full w-full"
              />
            </Suspense>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <img
                src="/sui-relief.png"
                alt=""
                className="h-[68%] w-auto max-w-[85%] object-contain opacity-50"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ContactSection({ showPortal }) {
  return (
    <Reveal>
      <section id="contact" className="scroll-mt-24 mb-8">
        <SectionHeading
          eyebrow="03 · Contact"
          title="Build with Tyr"
          subtitle="Ideas, collabs, or questions about CommandOSS skills and Sui — reach out."
        />
        <motion.div
          variants={fadeUp}
          className="panel panel-glow rounded-2xl p-6 sm:p-10 relative overflow-hidden min-h-[180px]"
        >
          {showPortal ? (
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <Suspense fallback={null}>
                <Portal
                  className="absolute inset-0"
                  primaryColor="#c4f542"
                  secondaryColor="#4da2ff"
                  centerColor="#e8e4d9"
                  speed={0.7}
                  density={0.85}
                  layerCount={5}
                  waveAmplitude={0.7}
                  brightness={0.85}
                  scale={1.15}
                  ballBgColor="transparent"
                />
              </Suspense>
            </div>
          ) : (
            <div
              className="absolute inset-0 pointer-events-none opacity-50"
              style={{
                background:
                  'radial-gradient(ellipse at 90% 10%, rgba(31,46,40,0.9) 0%, transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(59,169,255,0.12) 0%, transparent 45%)',
              }}
            />
          )}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h3 className="display-tight text-xl sm:text-2xl text-[#e8e4d9] mb-2">
                Let&apos;s ship — CommandOSS × Sui
              </h3>
              <p className="text-sm text-[#8a8580] max-w-md">
                Placeholders below — swap in your real GitHub, X, and Telegram
                when ready.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition hover:-translate-y-0.5 hover:border-[#c4f542]/35"
                style={{
                  background: 'rgba(17,17,16,0.9)',
                  border: '1px solid rgba(42,41,38,0.85)',
                  color: '#e8e4d9',
                }}
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition hover:-translate-y-0.5 hover:border-[#c4f542]/35"
                style={{
                  background: 'rgba(17,17,16,0.9)',
                  border: '1px solid rgba(42,41,38,0.85)',
                  color: '#e8e4d9',
                }}
              >
                <Twitter className="w-4 h-4" />
                Twitter / X
              </a>
              <a
                href="https://skills.commandoss.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition hover:brightness-110 hover:-translate-y-0.5"
                style={{ background: '#c4f542', color: '#0a0a0a' }}
              >
                <Sparkles className="w-4 h-4" />
                Skills hub
              </a>
              <a
                href="https://t.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition hover:-translate-y-0.5 hover:border-[#c4f542]/35"
                style={{
                  background: 'rgba(17,17,16,0.9)',
                  border: '1px solid rgba(42,41,38,0.85)',
                  color: '#e8e4d9',
                }}
              >
                <MessageCircle className="w-4 h-4" />
                Telegram
              </a>
            </div>
          </div>
        </motion.div>

        <footer
          className="mt-10 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-[11px] font-mono"
          style={{
            borderTop: '1px solid rgba(42,41,38,0.75)',
            color: '#8a8580',
          }}
        >
          <span>© {new Date().getFullYear()} Tyr · CommandOSS · Sui</span>
          <span className="flex items-center gap-1.5 flex-wrap">
            Hero · Projects · Skills · Contact
          </span>
        </footer>
      </section>
    </Reveal>
  );
}

export default function App() {
  const [activeId, setActiveId] = useState('hero');
  const mainRef = useRef(null);
  const scrollingRef = useRef(false);
  const isMobile = useIsMobile(768);
  const budget = useWebGLBudget({ isMobile });

  const navigateTo = useCallback((id) => {
    setActiveId(id);
    scrollingRef.current = true;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    window.setTimeout(() => {
      scrollingRef.current = false;
    }, 800);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.3, 0.5] },
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const silkColors = useMemo(
    () => [
      '#050505',
      '#0a0a0a',
      '#111110',
      '#1f2e28',
      '#16241e',
      '#0d1a14',
      '#1a2210',
      '#c4f542',
    ],
    [],
  );

  return (
    <div
      className={`min-h-screen relative bg-[#050505] ${
        budget.showCursor ? 'cursor-none' : ''
      }`}
    >
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[#050505]">
        {budget.showSilk ? (
          <Suspense fallback={<div className="absolute inset-0 bg-[#050505]" />}>
            <SilkWaves
              className="absolute inset-0 h-full w-full"
              speed={isMobile ? 0.35 : 0.55}
              scale={isMobile ? 1.6 : 1.35}
              distortion={1.15}
              curve={0.85}
              contrast={0.75}
              colors={silkColors}
              rotation={18}
              brightness={0.72}
              opacity={isMobile ? 0.62 : 0.88}
              complexity={0.9}
              frequency={0.85}
            />
          </Suspense>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 30% 20%, rgba(31,46,40,0.55) 0%, transparent 50%), #050505',
            }}
          />
        )}
      </div>
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 10%, rgba(31,46,40,0.35) 0%, transparent 50%), radial-gradient(ellipse at 85% 70%, rgba(59,169,255,0.08) 0%, transparent 45%), linear-gradient(180deg, rgba(5,5,5,0.35) 0%, rgba(5,5,5,0.55) 100%)',
        }}
      />

      {budget.showCursor && (
        <div className="fixed inset-0 z-[60] pointer-events-none">
          <Suspense fallback={null}>
            <AsciiCursor
              characters="✶◆◇▣⬡◈*.+"
              size={28}
              color="#c4f542"
              backgroundColor="#050505"
              enableFade
              spread={16}
              persistence={1.6}
              opacity={0.85}
              enableBloom={false}
            />
          </Suspense>
        </div>
      )}

      <MobileNavBar
        activeId={activeId}
        onNavigate={navigateTo}
        navGroups={NAV_GROUPS}
      />

      <aside className="hidden lg:block fixed left-4 top-4 bottom-4 z-40 w-[280px] xl:w-[300px] pointer-events-none">
        <div className="h-full pointer-events-auto">
          <FlowerSidebar
            navGroups={NAV_GROUPS}
            activeId={activeId}
            onNavigate={navigateTo}
            brandSub="CommandOSS · Sui"
            profileLabel="CommandOSS · Sui"
            skillCount={SKILL_COUNT}
            className="h-full"
          />
        </div>
      </aside>

      <main ref={mainRef} className="relative w-full min-w-0 pb-12">
        <Hero showSculpt={budget.showSculpt} />

        <div className="w-full px-4 sm:px-6 lg:pl-[calc(280px+2.5rem)] xl:pl-[calc(300px+3rem)] lg:pr-8 xl:pr-10 pt-10 sm:pt-12">
          <div className="w-full max-w-5xl xl:max-w-6xl">
            <ProjectsShowcase />
            <SkillsShowcase />
            <ContactSection showPortal={budget.showContactPortal} />
          </div>
        </div>
      </main>
    </div>
  );
}
