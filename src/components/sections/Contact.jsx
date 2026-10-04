import { motion } from 'framer-motion';
import { ArrowUpRight, FolderTree, Mail } from 'lucide-react';
import { CONTACT, LINKS, SITE } from '../../data/content';
import { useStudio } from '../../theme/ThemeProvider';
import { SmokeGradient } from '../effects/SmokeGradient';
import { GitHubMark } from '../ui';

const EASE = [0.22, 1, 0.36, 1];

function OutLink({ href, children, primary = false, icon: Icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn ${primary ? 'btn-primary' : 'btn-secondary'}`}
    >
      {Icon && <Icon aria-hidden className="size-4" />}
      {children}
      <ArrowUpRight aria-hidden className="size-4 opacity-70" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function Contact() {
  const { palette, motionPaused } = useStudio();
  return (
    <section id="contact" aria-labelledby="contact-title" className="pb-10 pt-16 sm:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative isolate overflow-hidden rounded-[32px] border border-line shadow-lift"
      >
        <SmokeGradient
          colors={palette.smoke.colors}
          background={palette.smoke.background}
          density={0.55}
          plumes={3}
          height={0.8}
          rise={0.4}
          curl={0.6}
          softness={0.7}
          grain={0.02}
          grainMotion={false}
          interactive
          transition={1.2}
          paused={motionPaused}
          className="absolute inset-0 -z-10"
        />

        <div className="grid min-h-[520px] items-start gap-8 p-5 pb-48 sm:p-8 sm:pb-56 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end lg:p-12">
          <div className="rounded-[24px] border border-line p-6 shadow-card backdrop-blur-md sm:p-8" style={{ background: 'var(--scrim)' }}>
            <p className="eyebrow mb-4 text-primary">Contact</p>
            <h2 id="contact-title" className="display text-4xl text-fg sm:text-6xl">
              {CONTACT.heading}
            </h2>
            <p className="mt-5 max-w-lg text-lg text-muted">{CONTACT.body}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {LINKS.email && (
                <a href={`mailto:${LINKS.email}`} className="btn btn-primary">
                  <Mail aria-hidden className="size-4" />
                  Send a message
                </a>
              )}
              <OutLink href={LINKS.github.href} icon={GitHubMark} primary={!LINKS.email}>
                {LINKS.github.label}
              </OutLink>
              <OutLink href={LINKS.skillsHub.href} icon={FolderTree}>
                {LINKS.skillsHub.label}
              </OutLink>
            </div>
          </div>

          <ul className="hidden flex-col items-end gap-2 lg:flex" aria-label="Good starting points">
            {[
              { label: LINKS.aiDevkitSource.label, href: LINKS.aiDevkitSource.href },
              { label: 'Sui CLI Web', href: 'https://sui-cli.dev/' },
              { label: 'MemWal', href: 'https://memory.walrus.xyz/' },
            ].map((item, i) => (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.2 + i * 0.08 }}
              >
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lift inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold text-fg shadow-card backdrop-blur-md"
                  style={{ background: 'var(--scrim)' }}
                >
                  {item.label}
                  <ArrowUpRight aria-hidden className="size-4" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>

      <footer className="mt-10 flex flex-col gap-2 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0">
          © {new Date().getFullYear()} {SITE.name} · {SITE.org} · Sui
        </p>
        <a href="#home" className="text-link inline-flex min-h-11 items-center self-start sm:self-auto">
          Back to top
        </a>
      </footer>
    </section>
  );
}
