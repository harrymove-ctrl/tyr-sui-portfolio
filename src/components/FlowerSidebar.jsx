import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Menu, X } from 'lucide-react';

const ACID = '#c4f542';
const PAPER = '#e8e4d9';
const STONE = '#8a8580';
const INK = '#0a0a0a';
const FOREST = '#1f2e28';
const HAIRLINE = '#2a2926';

export function LilacFlowerIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="5.8" r="3.6" fill={PAPER} stroke={STONE} strokeWidth="0.8" />
      <circle cx="17.4" cy="8.9" r="3.6" fill={PAPER} stroke={STONE} strokeWidth="0.8" />
      <circle cx="17.4" cy="15.1" r="3.6" fill={PAPER} stroke={STONE} strokeWidth="0.8" />
      <circle cx="12" cy="18.2" r="3.6" fill={PAPER} stroke={STONE} strokeWidth="0.8" />
      <circle cx="6.6" cy="15.1" r="3.6" fill={PAPER} stroke={STONE} strokeWidth="0.8" />
      <circle cx="6.6" cy="8.9" r="3.6" fill={PAPER} stroke={STONE} strokeWidth="0.8" />
      <circle cx="12" cy="12" r="3.4" fill={INK} stroke={PAPER} strokeWidth="0.8" />
      <circle cx="12" cy="12" r="1.3" fill={ACID} />
    </svg>
  );
}

export function TyrMark({ className = 'w-7 h-7' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill={FOREST} stroke={HAIRLINE} />
      <circle cx="16" cy="8" r="3.8" fill={PAPER} />
      <circle cx="22.5" cy="12" r="3.8" fill={STONE} />
      <circle cx="22.5" cy="20" r="3.8" fill={PAPER} />
      <circle cx="16" cy="24" r="3.8" fill={STONE} />
      <circle cx="9.5" cy="20" r="3.8" fill={PAPER} />
      <circle cx="9.5" cy="12" r="3.8" fill={STONE} />
      <circle cx="16" cy="16" r="3.6" fill={INK} stroke={PAPER} strokeWidth="1" />
      <circle cx="16" cy="16" r="1.4" fill={ACID} />
    </svg>
  );
}

const DEFAULT_NAV_GROUPS = [
  {
    category: 'PORTFOLIO',
    items: [
      { id: 'hero', label: 'Home' },
      { id: 'projects', label: 'Projects' },
    ],
  },
  {
    category: 'CONNECT',
    items: [
      { id: 'skills', label: 'Agent Skills' },
      { id: 'contact', label: 'Contact' },
    ],
  },
];

/**
 * FlowerSidebar — reusable rail nav with blooming flower indicator.
 * Restyled: solid panel, paper/acid accents, no glass/lilac.
 */
export function FlowerSidebar({
  navGroups = DEFAULT_NAV_GROUPS,
  activeId = 'hero',
  onNavigate,
  brand = 'Tyr',
  brandSub = 'CommandOSS · Sui',
  className = '',
  showSearch = true,
  profileLabel = 'CommandOSS · Sui',
  skillCount = 20,
}) {
  const [search, setSearch] = useState('');

  const flatItems = useMemo(() => {
    const list = [];
    const q = search.trim().toLowerCase();
    navGroups.forEach((g) => {
      const items = q
        ? g.items.filter((it) => it.label.toLowerCase().includes(q) || it.id.includes(q))
        : g.items;
      if (items.length === 0 && q) return;
      list.push({ id: `cat-${g.category}`, isCategory: true, label: g.category });
      items.forEach((it) => list.push({ ...it, isCategory: false }));
    });
    return list;
  }, [navGroups, search]);

  const itemHeight = 36;
  const startY = 18;
  const rootX = 16;
  const nestedX = 26;

  const nodes = useMemo(() => {
    return flatItems.map((item, idx) => ({
      ...item,
      x: item.isCategory ? rootX : nestedX,
      y: startY + idx * itemHeight,
      idx,
    }));
  }, [flatItems]);

  const activeNode = nodes.find((n) => n.id === activeId) || nodes.find((n) => !n.isCategory) || nodes[0];
  const activeIdx = activeNode ? activeNode.idx : 0;

  const railPath = useMemo(() => {
    if (nodes.length === 0) return '';
    let d = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 1; i < nodes.length; i++) {
      const prev = nodes[i - 1];
      const curr = nodes[i];
      if (prev.x === curr.x) {
        d += ` L ${curr.x} ${curr.y}`;
      } else {
        const midY = (prev.y + curr.y) / 2;
        d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
      }
    }
    return d;
  }, [nodes]);

  const coveredPath = useMemo(() => {
    if (nodes.length === 0 || activeIdx <= 0) return '';
    let d = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 1; i <= activeIdx; i++) {
      const prev = nodes[i - 1];
      const curr = nodes[i];
      if (prev.x === curr.x) {
        d += ` L ${curr.x} ${curr.y}`;
      } else {
        const midY = (prev.y + curr.y) / 2;
        d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
      }
    }
    return d;
  }, [nodes, activeIdx]);

  const handleClick = (id) => {
    if (onNavigate) onNavigate(id);
  };

  return (
    <aside
      className={`w-full h-full flex flex-col justify-between overflow-hidden panel panel-glow rounded-2xl p-4 sm:p-5 ${className}`}
    >
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
        <div className="flex items-center gap-2.5 pb-3.5 border-b" style={{ borderColor: HAIRLINE }}>
          <TyrMark className="w-8 h-8 object-contain shrink-0" />
          <div className="min-w-0">
            <h4 className="text-sm font-bold tracking-tight" style={{ color: PAPER }}>
              {brand}
            </h4>
            <a
              href="https://skills.commandoss.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono hover:text-[#c4f542] transition"
              style={{ color: STONE, textDecoration: 'none' }}
            >
              {brandSub}
            </a>
          </div>
        </div>

        {showSearch && (
          <div className="relative my-3">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
              style={{ color: STONE }}
            />
            <input
              type="text"
              placeholder="Jump to section..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none transition-colors font-mono"
              style={{
                background: INK,
                border: `1px solid ${HAIRLINE}`,
                color: PAPER,
              }}
            />
          </div>
        )}

        <div className="relative py-1">
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible"
            style={{ zIndex: 5 }}
          >
            <path
              d={railPath}
              fill="none"
              stroke={HAIRLINE}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d={coveredPath}
              fill="none"
              stroke={ACID}
              strokeWidth="2.5"
              strokeLinecap="round"
              className="transition-all duration-300"
            />
            {nodes.map((n) => (
              <circle
                key={n.id}
                cx={n.x}
                cy={n.y}
                r={n.isCategory ? 2.5 : 2}
                fill={n.idx <= activeIdx ? ACID : STONE}
                className="transition-colors duration-200"
              />
            ))}
          </svg>

          {activeNode && (
            <motion.div
              animate={{ x: activeNode.x - 8, y: activeNode.y - 8 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="absolute z-20 pointer-events-none"
            >
              <LilacFlowerIcon className="w-4 h-4" />
            </motion.div>
          )}

          <div className="flex flex-col">
            {nodes.map((node) => {
              if (node.isCategory) {
                return (
                  <div
                    key={node.id}
                    style={{ height: itemHeight, color: STONE }}
                    className="flex items-center pl-11 text-[10px] font-mono font-bold tracking-wider uppercase select-none"
                  >
                    {node.label}
                  </div>
                );
              }

              const isActive = activeId === node.id;

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => handleClick(node.id)}
                  style={{
                    height: itemHeight,
                    color: isActive ? PAPER : STONE,
                    background: isActive ? 'rgba(196, 245, 66, 0.08)' : 'transparent',
                  }}
                  className="flex items-center justify-between pl-12 pr-3.5 rounded-xl text-xs transition-colors text-left cursor-pointer select-none hover:text-[#e8e4d9]"
                >
                  <span className={isActive ? 'font-semibold' : ''}>{node.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: ACID }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-3 space-y-3" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
        <div className="flex flex-wrap gap-1.5">
          {['CMK', 'SUI', 'SDK', 'PTB'].map((chip, i) => (
            <span
              key={chip}
              className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md"
              style={{
                color: i % 2 === 0 ? ACID : '#4da2ff',
                background: i % 2 === 0 ? 'rgba(31,46,40,0.9)' : 'rgba(10,30,50,0.85)',
                border: `1px solid ${HAIRLINE}`,
              }}
            >
              {chip}
            </span>
          ))}
        </div>
        <a
          href="https://skills.commandoss.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 transition hover:border-[#c4f542]/35"
          style={{
            background: INK,
            border: `1px solid ${HAIRLINE}`,
            textDecoration: 'none',
          }}
        >
          <div className="min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: ACID }}>
              Skills hub
            </p>
            <p className="text-[11px] font-medium truncate" style={{ color: PAPER }}>
              skills.commandoss.com
            </p>
          </div>
          <span
            className="text-[10px] font-mono shrink-0 px-1.5 py-0.5 rounded-lg"
            style={{ color: PAPER, background: FOREST, border: `1px solid ${HAIRLINE}` }}
          >
            {skillCount}+
          </span>
        </a>
        <div className="flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: ACID }} />
            <span className="text-[11px] font-mono truncate" style={{ color: STONE }}>
              {profileLabel}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span
              className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-lg"
              style={{ color: ACID, background: FOREST, border: `1px solid ${HAIRLINE}` }}
            >
              CMK
            </span>
            <span
              className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-lg"
              style={{ color: '#4da2ff', background: 'rgba(10,30,50,0.9)', border: `1px solid ${HAIRLINE}` }}
            >
              Sui
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Mobile top bar that opens the flower nav as a drawer */
export function MobileNavBar({ activeId, onNavigate, navGroups = DEFAULT_NAV_GROUPS, brand = 'Tyr' }) {
  const [open, setOpen] = useState(false);

  const flatLinks = navGroups.flatMap((g) => g.items);

  return (
    <>
      <header
        className="lg:hidden sticky top-0 z-40 px-4 py-3 flex items-center justify-between"
        style={{ background: INK, borderBottom: `1px solid ${HAIRLINE}` }}
      >
        <div className="flex items-center gap-2">
          <TyrMark className="w-7 h-7" />
          <span className="text-sm font-bold tracking-tight" style={{ color: PAPER }}>
            {brand}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-2 rounded-xl transition-colors"
          style={{ background: '#111110', border: `1px solid ${HAIRLINE}`, color: PAPER }}
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.75)' }}
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-[min(300px,88vw)] h-full p-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-5 right-5 z-10 p-1.5 rounded-xl"
              style={{ background: HAIRLINE, color: PAPER }}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <FlowerSidebar
              navGroups={navGroups}
              activeId={activeId}
              onNavigate={(id) => {
                onNavigate(id);
                setOpen(false);
              }}
              className="h-full"
            />
          </div>
        </div>
      )}

      <nav
        className="lg:hidden px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none"
        style={{ borderBottom: `1px solid ${HAIRLINE}` }}
      >
        {flatLinks.map((link) => {
          const isActive = activeId === link.id;
          return (
            <button
              key={link.id}
              type="button"
              onClick={() => onNavigate(link.id)}
              className="shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-colors"
              style={{
                background: isActive ? 'rgba(196, 245, 66, 0.1)' : '#111110',
                color: isActive ? ACID : STONE,
                border: `1px solid ${isActive ? ACID : HAIRLINE}`,
              }}
            >
              {link.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}

export default FlowerSidebar;
