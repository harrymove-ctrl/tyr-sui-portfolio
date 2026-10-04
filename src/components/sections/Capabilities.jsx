import { motion } from 'framer-motion';
import { ArrowUpRight, Bot, Check, Code2, Database, Hammer, Lightbulb, Medal, Wrench } from 'lucide-react';
import { CAPABILITIES } from '../../data/content';
import { SectionHeader } from '../ui';

const EASE = [0.22, 1, 0.36, 1];
const HELP_ICONS = { tooling: Wrench, sdk: Code2, walrus: Database, agents: Bot };

const column = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay: i * 0.1 } }),
};

function Column({ index, icon: Icon, title, count, note, children }) {
  return (
    <motion.section
      custom={index}
      variants={column}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      aria-labelledby={`cap-${index}`}
      className="theme-fade flex flex-col rounded-[20px] bg-column p-3"
    >
      <header className="flex items-center gap-2 px-2 pb-3 pt-1">
        <span className="grid size-8 place-items-center rounded-lg bg-surface text-primary shadow-card">
          <Icon aria-hidden className="size-4" />
        </span>
        <h3 id={`cap-${index}`} className="font-display text-lg font-bold text-fg">
          {title}
        </h3>
        <span className="ml-auto rounded-full border border-line bg-surface px-2 py-0.5 font-mono text-xs text-muted">
          {count}
        </span>
      </header>
      {note && <p className="px-2 pb-3 text-sm text-muted">{note}</p>}
      {children}
    </motion.section>
  );
}

export function Capabilities() {
  const { help, fit, proof } = CAPABILITIES;
  return (
    <section id="capabilities" aria-labelledby="capabilities-title" className="py-16 sm:py-24">
      <SectionHeader
        id="capabilities-title"
        eyebrow="Capabilities"
        title="Where I’m useful"
        intro="What I work on, who it suits, and the work you can check for yourself."
      />

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Column index={0} icon={Hammer} title={help.title} count={help.items.length}>
          <ul className="flex flex-col gap-2.5">
            {help.items.map((item) => {
              const Icon = HELP_ICONS[item.id];
              return (
                <li key={item.id} className="card lift flex items-start gap-3 p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-soft text-primary">
                    <Icon aria-hidden className="size-4" />
                  </span>
                  <p className="pt-1.5 font-medium text-fg">{item.text}</p>
                </li>
              );
            })}
          </ul>
        </Column>

        <Column index={1} icon={Lightbulb} title={fit.title} count={fit.items.length}>
          <ul className="flex flex-col gap-3 px-1 pb-1">
            {fit.items.map((item, i) => (
              <li
                key={item.id}
                className="lift relative rounded-2xl border border-line bg-surface p-4 pl-11 shadow-card"
                style={{ rotate: i % 2 ? '0.5deg' : '-0.5deg' }}
              >
                <Check aria-hidden className="absolute left-4 top-[1.15rem] size-4 text-primary" />
                <p className="text-fg">{item.text}</p>
              </li>
            ))}
          </ul>
        </Column>

        <Column index={2} icon={Medal} title={proof.title} count={proof.items.length} note={proof.note}>
          <ul className="flex flex-col gap-2.5">
            {proof.items.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card lift group flex items-center gap-3 border-dashed p-4"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-fg group-hover:text-primary">{item.label}</span>
                    <span className="block text-sm text-muted">{item.detail}</span>
                    <span className="mt-1 block truncate font-mono text-xs text-muted">{new URL(item.href).host}</span>
                  </span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-fg transition-transform group-hover:rotate-45">
                    <ArrowUpRight aria-hidden className="size-4" />
                  </span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </Column>
      </div>
    </section>
  );
}
