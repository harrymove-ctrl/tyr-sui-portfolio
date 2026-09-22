import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Layers } from 'lucide-react';
import { DiagonalCardStack } from '../DiagonalCardStack';
import {
  SUI_PROJECT_CARDS,
  COMMANDOSS_PROJECTS,
} from '../../data/content';

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

export function ProjectsShowcase() {
  const [isStacked, setIsStacked] = useState(false);

  return (
    <section id="projects" className="scroll-mt-24 mb-20 sm:mb-24 relative">
      <div
        className="absolute -inset-x-2 -top-6 bottom-0 pointer-events-none -z-0 overflow-hidden rounded-3xl"
        aria-hidden
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at 20% 10%, rgba(196,245,66,0.12), transparent 45%), radial-gradient(ellipse at 80% 60%, rgba(77,162,255,0.1), transparent 50%)',
          }}
        />
      </div>

      <motion.div
        className="relative z-10"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-12% 0px -8% 0px' }}
      >
        <motion.div variants={fadeUp} className="mb-8 sm:mb-10">
          <p className="label-mono mb-2 text-[#c4f542]">01 · Projects</p>
          <h2 className="display-tight text-2xl sm:text-3xl md:text-4xl text-[#e8e4d9]">
            Sui mental models
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#8a8580] max-w-xl leading-relaxed">
            One diagonal stream — drag to explore, flip to STACK DECK.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#c4f542]" />
              <p className="label-mono text-[#c4f542]">Diagonal stream</p>
            </div>
            <button
              type="button"
              onClick={() => setIsStacked((v) => !v)}
              className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-xl text-[11px] font-mono uppercase tracking-wider transition hover:brightness-110"
              style={{
                color: isStacked ? '#0a0a0a' : '#c4f542',
                background: isStacked
                  ? '#c4f542'
                  : 'rgba(17,17,16,0.85)',
                border: isStacked
                  ? '1px solid rgba(196,245,66,0.9)'
                  : '1px solid rgba(42,41,38,0.85)',
              }}
              aria-pressed={isStacked}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{
                  background: isStacked ? '#0a0a0a' : '#4da2ff',
                  boxShadow: isStacked
                    ? 'none'
                    : '0 0 8px rgba(77,162,255,0.8)',
                }}
              />
              {isStacked ? 'STACK DECK' : 'STREAM'}
              <span className="opacity-60 normal-case tracking-normal">
                · click to {isStacked ? 'fan out' : 'stack'}
              </span>
            </button>
          </div>

          <div className="w-full panel panel-glow rounded-2xl overflow-hidden">
            <DiagonalCardStack
              cards={SUI_PROJECT_CARDS}
              isStacked={isStacked}
              autoPlay
              speed={1}
              cardWidth={240}
              cardHeight={280}
              stepX={138}
              stepY={90}
              onCardClick={() => setIsStacked((v) => !v)}
              className="w-full"
            />
          </div>
          <p className="mt-2 text-[10px] font-mono text-[#8a8580]/80 text-center sm:text-left">
            Drag along the diagonal · click a card or STACK DECK to collapse
          </p>
        </motion.div>

        {/* CommandOSS — quiet link chips, not another gallery */}
        <motion.div variants={fadeUp} className="pt-2">
          <p className="label-mono text-[#8a8580] mb-3">Also from CommandOSS</p>
          <div className="flex flex-wrap gap-2">
            {COMMANDOSS_PROJECTS.map((c) => (
              <a
                key={c.id}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono tracking-wide transition hover:-translate-y-0.5 hover:border-[#c4f542]/40"
                style={{
                  color: c.accent === '#c4f542' ? '#c4f542' : '#e8e4d9',
                  background:
                    c.accent === '#c4f542'
                      ? 'rgba(31,46,40,0.85)'
                      : 'rgba(17,17,16,0.85)',
                  border: '1px solid rgba(42,41,38,0.85)',
                }}
              >
                {c.title}
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-70 transition" />
              </a>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default ProjectsShowcase;
