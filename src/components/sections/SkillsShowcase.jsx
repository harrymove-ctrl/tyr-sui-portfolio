import React, { lazy, Suspense, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ExternalLink } from 'lucide-react';

const BendingMarquee = lazy(() => import('../react-bits/bending-marquee'));

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

const HUB_LINKS = [
  {
    label: 'skills.commandoss.com',
    href: 'https://skills.commandoss.com/',
    accent: '#c4f542',
    blurb: 'CommandOSS agent skills hub',
  },
  {
    label: 'docs.sui.io/skills',
    href: 'https://docs.sui.io/skills',
    accent: '#4da2ff',
    blurb: 'Official Sui agent skills',
  },
  {
    label: 'Mysten sui-dev-skills',
    href: 'https://github.com/MystenLabs/sui-dev-skills',
    accent: '#818cf8',
    blurb: 'Move · TS SDK · frontend',
  },
];

export function SkillsShowcase() {
  const marqueeItems = useMemo(
    () => [
      'CommandOSS skills',
      'cmk:sui-sdk',
      'delivery-pipeline',
      'Mysten sui-dev',
      'docs.sui.io skills',
      'Move · PTB · Walrus',
    ],
    [],
  );

  return (
    <section id="skills" className="scroll-mt-24 mb-20 sm:mb-24 relative">
      <motion.div
        className="relative z-10"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-12% 0px -8% 0px' }}
      >
        <motion.div variants={fadeUp} className="mb-8 sm:mb-10">
          <p className="label-mono mb-2 text-[#c4f542]">02 · Agent Skills</p>
          <h2 className="display-tight text-2xl sm:text-3xl md:text-4xl text-[#e8e4d9]">
            Skills I shout out
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#8a8580] max-w-xl leading-relaxed">
            Installable agent skills — CommandOSS first, then Mysten and official
            Sui. Quiet links, one kinetic strip.
          </p>
        </motion.div>

        {/* ONE kinetic: bending marquee */}
        <motion.div
          variants={fadeUp}
          className="mb-10 h-[88px] sm:h-[110px] overflow-hidden rounded-2xl"
          style={{
            background: 'rgba(10,10,10,0.55)',
            border: '1px solid rgba(42,41,38,0.75)',
          }}
        >
          <Suspense fallback={null}>
            <BendingMarquee
              items={marqueeItems}
              separator="◆"
              panelWidth={320}
              panelHeight={72}
              bend={38}
              depth={70}
              speed={28}
              direction="left"
              rows={1}
              fontSize={18}
              fontWeight={600}
              letterSpacing={0.5}
              color="#c4f542"
              bandColor="transparent"
              markSway={12}
              pauseOnHover
              fit
              className="h-full w-full"
            />
          </Suspense>
        </motion.div>

        {/* Compact hub chips */}
        <motion.div
          variants={fadeUp}
          className="grid sm:grid-cols-3 gap-3 sm:gap-4"
        >
          {HUB_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group panel rounded-2xl p-5 flex flex-col gap-2 transition hover:-translate-y-0.5 hover:border-[#c4f542]/30"
              style={{ borderColor: `${link.accent}33` }}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-[10px] font-mono uppercase tracking-wider"
                  style={{ color: link.accent }}
                >
                  Hub
                </span>
                <ArrowUpRight
                  className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition"
                  style={{ color: link.accent }}
                />
              </div>
              <h3 className="text-sm font-semibold text-[#e8e4d9] group-hover:text-[#c4f542] transition leading-snug">
                {link.label}
              </h3>
              <p className="text-[11px] text-[#8a8580] leading-relaxed">
                {link.blurb}
              </p>
              <span className="mt-auto inline-flex items-center gap-1 text-[10px] font-mono text-[#8a8580]/80 pt-1">
                Open
                <ExternalLink className="w-3 h-3" />
              </span>
            </a>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

export default SkillsShowcase;
