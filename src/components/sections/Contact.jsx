import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check, Copy, TelegramLogo } from '@phosphor-icons/react';
import { CONTACT, SITE } from '../../data/content';
import { useStudio } from '../../theme/ThemeProvider';
import { MeshGradient } from '../effects/MeshGradient';

const EASE = [0.22, 1, 0.36, 1];
const TELEGRAM = '#229ED9';
// Studio light field behind the pass: deep blue edge → soft cyan → page (theme-independent).
const LIGHT = ['#f7f7f4', '#175d83', '#b9dfea', '#2b7fb0', '#e4f0f6', '#9dd9e8'];

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '0px 0px -10% 0px' },
  transition: { duration: 0.4, ease: EASE, delay },
});

async function writeClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

/** Copy control: fixed width, icon morphs Copy → Check, result announced politely. */
function CopyButton({ text, label, className = '' }) {
  const [state, setState] = useState('idle'); // idle | copied | failed
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const run = async () => {
    setState((await writeClipboard(text)) ? 'copied' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 1800);
  };
  const shown = state === 'copied' ? 'Copied' : state === 'failed' ? 'Press ⌘C to copy' : label;
  return (
    <button type="button" onClick={run} className={`inline-flex min-h-11 items-center gap-2 ${className}`}>
      <span className="relative grid size-[18px] place-items-center" aria-hidden>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={state === 'copied' ? 'c' : 'i'}
            className="absolute"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
          >
            {state === 'copied' ? <Check size={18} weight="bold" /> : <Copy size={18} />}
          </motion.span>
        </AnimatePresence>
      </span>
      {/* Reserve the widest label so the button never changes width. */}
      <span className="grid text-left">
        <span className="invisible [grid-area:1/1]" aria-hidden>{label.length > 16 ? label : 'Press ⌘C to copy'}</span>
        <span className="[grid-area:1/1]" aria-live="polite">{shown}</span>
      </span>
    </button>
  );
}

function Starter() {
  const { topics } = CONTACT;
  const [topicId, setTopicId] = useState(null);
  const [message, setMessage] = useState('');
  const refs = useRef([]);
  const pick = (t) => {
    setTopicId(t.id);
    setMessage(t.message);
  };
  const onKey = (e) => {
    const i = Math.max(0, topics.findIndex((t) => t.id === topicId));
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = topics[(i + d + topics.length) % topics.length];
    pick(n);
    refs.current[topics.indexOf(n)]?.focus();
  };
  return (
    <div className="mt-8">
      <p id="starter-label" className="text-sm font-semibold text-fg">Start with a topic <span className="font-normal text-muted">(optional)</span></p>
      <div role="radiogroup" aria-labelledby="starter-label" onKeyDown={onKey} className="mt-2 grid gap-1 rounded-2xl border border-line bg-surface p-1 @[520px]:inline-flex @[520px]:rounded-full">
        {topics.map((t, i) => {
          const on = t.id === topicId;
          return (
            <button
              key={t.id}
              ref={(el) => (refs.current[i] = el)}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on || (!topicId && i === 0) ? 0 : -1}
              onClick={() => pick(t)}
              className={`relative min-h-11 rounded-xl px-4 text-left text-sm @[520px]:rounded-full @[520px]:text-center font-medium transition-colors duration-200 ${on ? 'text-primary-fg' : 'text-muted hover:text-fg'}`}
            >
              {on && <motion.span layoutId="topic-pill" className="absolute inset-0 rounded-xl bg-primary @[520px]:rounded-full" transition={{ duration: 0.22, ease: EASE }} />}
              <span className="relative">{t.label}</span>
            </button>
          );
        })}
      </div>
      <AnimatePresence initial={false}>
        {topicId && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22, ease: EASE }} className="overflow-hidden">
            <label htmlFor="starter-msg" className="mt-4 block text-sm text-muted">A starting point—make it yours.</label>
            <textarea
              id="starter-msg"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1.5 w-full max-w-[56ch] resize-none rounded-2xl border border-line bg-surface px-4 py-3 text-[0.9375rem] text-fg focus:border-primary"
            />
            <CopyButton text={message} label="Copy message" className="mt-1 rounded-full px-1 text-sm font-semibold text-fg hover:text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The contact pass: one physical object. Signature detail: a narrow blue edge on the left. */
function Pass() {
  const { telegram } = CONTACT;
  return (
    <motion.figure
      initial={{ opacity: 0, y: 18, rotate: -2 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ type: 'spring', stiffness: 170, damping: 22, delay: 0.15 }}
      className="group relative mx-auto w-full max-w-[360px]"
    >
      {/* Decorative backing sheet: the only thing that moves on hover. */}
      <span aria-hidden className="absolute inset-0 translate-x-2 translate-y-2 rounded-[22px] bg-primary/25 transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3 motion-reduce:transition-none" />
      <div className="relative overflow-hidden rounded-[22px] border border-line bg-surface shadow-lift">
        <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-[linear-gradient(#175d83,#9dd9e8)]" />
        <div className="flex items-center gap-3 border-b border-line px-6 py-4">
          <img src="/tyr.webp" alt="" className="size-11 rounded-xl border border-line object-cover" />
          <div className="min-w-0">
            <p className="font-display text-lg font-bold leading-tight text-fg">{SITE.name}</p>
            <p className="text-sm text-muted">Building with CommandOSS</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#0f6e9c' }}>
            <TelegramLogo aria-hidden size={16} weight="fill" style={{ color: TELEGRAM }} /> Telegram
          </span>
        </div>
        <div className="px-6 py-5 text-center">
          {/* Solid white square in every theme; nothing ever overlays or animates the code. */}
          <div className="mx-auto w-fit rounded-xl bg-white p-1.5 ring-1 ring-line">
            <img src={telegram.qr} alt="QR code to connect with Tyr on Telegram." width={208} height={208} className="block size-[180px] sm:size-[208px]" />
          </div>
          <figcaption className="mt-3 text-sm text-muted">Scan to start a conversation</figcaption>
        </div>
        <div className="border-t border-line px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <a href={telegram.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 font-mono text-base font-semibold text-fg underline-offset-4 hover:underline">
              {telegram.handle}
              <ArrowUpRight aria-hidden size={14} />
              <span className="sr-only"> on Telegram (opens in a new tab)</span>
            </a>
            <CopyButton text={telegram.href} label="Copy link" className="rounded-lg px-2 text-sm text-muted hover:text-fg" />
          </div>
          <p className="mt-2 border-t border-dashed border-line pt-3 font-mono text-xs tracking-wide text-muted">Sui · Walrus · Agent tooling</p>
        </div>
      </div>
    </motion.figure>
  );
}

function FootLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-sm text-muted transition-colors hover:text-fg">
      {children}
      <ArrowUpRight aria-hidden size={14} />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function Contact() {
  const { motionPaused } = useStudio();
  const { telegram } = CONTACT;
  return (
    <section id="contact" aria-labelledby="contact-title" className="@container relative overflow-x-clip pb-8 pt-16 sm:pt-20">
      {/* Localized studio light behind the pass; fades out before reaching the text. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
        className="pointer-events-none absolute right-0 bottom-0 top-10 -z-10 w-[min(760px,85%)] [mask-image:radial-gradient(60%_60%_at_65%_55%,#000_25%,transparent_75%)]"
      >
        <MeshGradient colors={LIGHT} speed={0.25} scale={1.1} distortion={0.35} swirl={0.15} softness={0.8} grain={0} interactive={false} paused={motionPaused} className="absolute inset-0" />
      </motion.div>

      <div className="grid items-center gap-10 py-6 @[960px]:grid-cols-12 @[960px]:gap-14 @[960px]:py-14">
        <div className="@[960px]:col-span-7">
          <motion.p {...rise(0)} className="eyebrow mb-3">{CONTACT.eyebrow}</motion.p>
          <motion.h2 {...rise(0.06)} id="contact-title" className="display text-[clamp(2.25rem,4.5vw,3.5rem)] text-fg">{CONTACT.heading}</motion.h2>
          <motion.p {...rise(0.12)} className="mt-4 max-w-[52ch] text-lg text-muted">{CONTACT.body}</motion.p>
          <motion.p {...rise(0.18)} className="mt-3 flex items-start gap-2 text-[0.9375rem] text-fg">
            <span aria-hidden className="mt-[0.3em] inline-block h-[1.05em] w-[0.99em] shrink-0 bg-fg" style={{ WebkitMask: 'url(/brand-commandoss-mark.svg) center / contain no-repeat', mask: 'url(/brand-commandoss-mark.svg) center / contain no-repeat' }} />
            {SITE.affiliation}
          </motion.p>
          <motion.div {...rise(0.24)}>
            <Starter />
            <div className="mt-6 flex flex-col items-start gap-2">
              <a href={telegram.href} target="_blank" rel="noopener noreferrer" className="btn group/tg text-white active:scale-[0.98]" style={{ background: TELEGRAM }}>
                <TelegramLogo aria-hidden size={18} weight="fill" />
                Talk to Tyr
                <ArrowUpRight aria-hidden size={16} className="transition-transform group-hover/tg:-translate-y-0.5 group-hover/tg:translate-x-0.5" />
                <span className="sr-only"> on Telegram (opens in a new tab)</span>
              </a>
              <p className="text-sm text-muted">Open Telegram or scan the pass.</p>
            </div>
          </motion.div>
        </div>
        <div className="@[960px]:col-span-5">
          <Pass />
        </div>
      </div>

      <footer className="mt-6 flex flex-col gap-1 border-t border-line pt-4 text-sm text-muted @[640px]:flex-row @[640px]:items-center @[640px]:gap-6">
        <p className="m-0 mr-auto">© {new Date().getFullYear()} {SITE.name}</p>
        <a href={`mailto:${CONTACT.email}`} className="inline-flex min-h-11 items-center hover:text-fg">{CONTACT.email}</a>
        <FootLink href={CONTACT.x.href}>{CONTACT.x.handle} on X</FootLink>
        <FootLink href={CONTACT.org.href}>{CONTACT.org.label}</FootLink>
        <a href="#home" className="text-link inline-flex min-h-11 items-center">Back to top</a>
      </footer>
    </section>
  );
}
