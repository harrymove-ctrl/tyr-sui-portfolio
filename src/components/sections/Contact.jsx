import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Buildings, Check, Copy, GithubLogo, PaperPlaneTilt } from '@phosphor-icons/react';
import { CONTACT, SITE } from '../../data/content';
import { useStudio } from '../../theme/ThemeProvider';
import { SmokeGradient } from '../effects/SmokeGradient';

const EASE = [0.22, 1, 0.36, 1];
const TELEGRAM = '#229ED9';

function OutLink({ href, children, primary = false, icon: Icon, style }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`btn ${primary ? 'btn-primary' : 'btn-secondary'}`} style={style}>
      <Icon aria-hidden size={18} weight={primary ? 'fill' : 'regular'} />
      {children}
      <ArrowUpRight aria-hidden size={16} className="opacity-70" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function CopyLink({ value }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard API blocked (permissions / insecure context): fall back to a hidden textarea.
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      if (!ok) return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button type="button" onClick={copy} className="btn btn-secondary">
      <span className="relative grid size-[18px] place-items-center" aria-hidden>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? 'check' : 'copy'}
            initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.16 }}
            className="absolute"
          >
            {copied ? <Check size={18} weight="bold" style={{ color: 'var(--cat-walrus)' }} /> : <Copy size={18} />}
          </motion.span>
        </AnimatePresence>
      </span>
      <span aria-live="polite">{copied ? 'Copied' : 'Copy Telegram link'}</span>
    </button>
  );
}

export function Contact() {
  const { palette, motionPaused } = useStudio();
  const { telegram } = CONTACT;
  return (
    <section id="contact" aria-labelledby="contact-title" className="pb-10 pt-16 sm:pt-24">
      <div className="relative isolate overflow-hidden rounded-[32px] border border-line bg-surface shadow-card">
        {/* Smoke rises from the far bottom-right corner, away from the copy and actions. */}
        <SmokeGradient
          colors={palette.smoke.colors}
          background={palette.smoke.background}
          density={0.5}
          plumes={3}
          height={0.7}
          rise={0.4}
          curl={0.6}
          softness={0.7}
          grain={0.02}
          grainMotion={false}
          interactive
          transition={1.2}
          paused={motionPaused}
          className="absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(70%_80%_at_100%_100%,#000_20%,transparent_75%)]"
        />

        <div className="grid items-center gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:p-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <p className="eyebrow mb-4">{CONTACT.eyebrow}</p>
            <h2 id="contact-title" className="display text-[clamp(2.25rem,5vw,3.75rem)] text-fg">
              {CONTACT.heading}
            </h2>
            <p className="mt-5 max-w-[56ch] text-lg text-muted">{CONTACT.body}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <OutLink href={telegram.href} icon={PaperPlaneTilt} primary style={{ background: TELEGRAM, color: '#fff' }}>
                Message me on Telegram
              </OutLink>
              <CopyLink value={telegram.href} />
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <OutLink href={CONTACT.github.href} icon={GithubLogo}>
                {CONTACT.github.label}
              </OutLink>
              <OutLink href={CONTACT.org.href} icon={Buildings}>
                {CONTACT.org.label}
              </OutLink>
            </div>
          </motion.div>

          <motion.figure
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.08 }}
            className="mx-auto w-full max-w-[300px] rounded-[24px] border bg-white p-5 text-center shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lift focus-within:-translate-y-0.5 motion-reduce:transform-none"
            style={{ borderColor: `${TELEGRAM}66` }}
          >
            <img
              src={telegram.qr}
              alt="QR code to connect with Tyr on Telegram."
              width={220}
              height={220}
              className="mx-auto block size-[160px] sm:size-[200px] [image-rendering:pixelated]"
            />
            <figcaption className="mt-3">
              <span className="block text-sm text-[#58636B]">Scan or open</span>
              <a
                href={telegram.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 font-mono text-base font-semibold underline-offset-4 hover:underline"
                style={{ color: '#0F6E9C' }}
              >
                {telegram.handle}
                <ArrowUpRight aria-hidden size={16} />
                <span className="sr-only"> on Telegram (opens in a new tab)</span>
              </a>
            </figcaption>
          </motion.figure>
        </div>
      </div>

      <footer className="mt-10 flex flex-col gap-2 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0">
          © {new Date().getFullYear()} {SITE.name} · {SITE.org}
        </p>
        <a href="#home" className="text-link inline-flex min-h-11 items-center self-start sm:self-auto">
          Back to top
        </a>
      </footer>
    </section>
  );
}
