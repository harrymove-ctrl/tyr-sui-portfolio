import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  Suspense,
  lazy,
  memo,
} from 'react';
import { motion } from 'framer-motion';

const AsciiRipple = lazy(() => import('./react-bits/ascii-ripple'));

const MAX_LIVE_RIPPLES = 3;

/** Static ASCII-ish thumb — looks like a resting ripple without canvas cost */
function StaticThumb({ card }) {
  const fill = (card.thumbText || card.title || 'SUI').repeat(8);
  return (
    <div
      className="absolute inset-0 overflow-hidden card-thumb-static"
      style={{ background: card.gradient || 'linear-gradient(155deg, #1f2e28, #0a0a0a)' }}
      aria-hidden
    >
      <div
        className="absolute inset-0 card-thumb-drift opacity-90"
        style={{
          background: `radial-gradient(ellipse 80% 70% at 30% 20%, ${card.accent || '#4da2ff'}33 0%, transparent 55%),
            radial-gradient(ellipse 60% 50% at 80% 80%, ${card.rippleColor || card.accent || '#4da2ff'}22 0%, transparent 50%),
            ${card.gradient || 'linear-gradient(155deg, #0a0a0a, #111)'}`,
        }}
      />
      <pre
        className="absolute inset-0 p-2 m-0 overflow-hidden select-none pointer-events-none font-mono leading-[1.15] break-all whitespace-pre-wrap"
        style={{
          fontSize: 10,
          color: card.rippleColor || card.accent || '#4da2ff',
          opacity: 0.22,
          letterSpacing: '0.02em',
        }}
      >
        {fill}
      </pre>
      <div className="card-thumb-grain absolute inset-0 pointer-events-none" />
      <div className="card-thumb-shimmer absolute inset-0 pointer-events-none" />
      {card.icon && (
        <span
          className="absolute top-2.5 right-2.5 text-base sm:text-lg opacity-70 drop-shadow"
          style={{ filter: `drop-shadow(0 0 8px ${card.accent || '#c4f542'}66)` }}
        >
          {card.icon}
        </span>
      )}
    </div>
  );
}

const LiveThumb = memo(function LiveThumb({ card, interactive, paused }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl">
      <Suspense fallback={<StaticThumb card={card} />}>
        <AsciiRipple
          className="absolute inset-0"
          text={(card.thumbText || card.title || 'SUI ').repeat(12)}
          fontSize={11}
          lineHeight={1.15}
          textColor={card.accent || '#e8e4d9'}
          rippleColor={card.rippleColor || card.accent || '#4da2ff'}
          troughColor={card.troughColor || '#1a4a8c'}
          backgroundColor="#05080c"
          textOpacity={0.28}
          rain={2}
          rainStrength={0.55}
          resolution={2}
          vignette={0.55}
          interactive={interactive}
          paused={paused}
          style={{ width: '100%', height: '100%' }}
        />
      </Suspense>
      <div className="card-thumb-grain absolute inset-0 pointer-events-none opacity-40" />
      {card.icon && (
        <span
          className="absolute top-2.5 right-2.5 text-base sm:text-lg z-10 opacity-80 pointer-events-none"
          style={{ filter: `drop-shadow(0 0 8px ${card.accent || '#c4f542'}88)` }}
        >
          {card.icon}
        </span>
      )}
    </div>
  );
});

/**
 * DiagonalCardStack
 * Cascading diagonal card stream with vivid thumbnail zones + optional AsciiRipple.
 */
export function DiagonalCardStack({
  cards = null,
  isStacked = false,
  autoPlay = true,
  speed = 1.0,
  cardWidth = 240,
  cardHeight = 280,
  stepX = 138,
  stepY = 90,
  className = '',
  onCardClick = null,
  /** Global motion pause: freezes the live ripple thumbnails too. */
  paused = false,
  /** Card id to highlight as the current selection. */
  selectedId = null,
}) {
  const containerRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [containerWidth, setContainerWidth] = useState(900);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, startOffset: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerWidth(el.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const REFERENCE_WIDTH = 900;
  const geomScale = Math.min(1, Math.max(0.45, containerWidth / REFERENCE_WIDTH));
  const screenSize = containerWidth < 480 ? 'mobile' : containerWidth < 820 ? 'tablet' : 'desktop';
  const effCardWidth = Math.round(Math.min(cardWidth, 260) * geomScale);
  const effCardHeight = Math.round(Math.min(cardHeight, 300) * geomScale);
  const effStepX = Math.round(stepX * geomScale);
  const effStepY = Math.round(stepY * geomScale);

  const defaultCards = [
    {
      id: '1',
      title: 'Move',
      brand: 'Language',
      gradient: 'linear-gradient(155deg, #0b1c33 0%, #123a66 45%, #071018 100%)',
      accent: '#4da2ff',
      thumbText: 'move resource struct fun ',
      rippleColor: '#6fbcf0',
      troughColor: '#1a4a8c',
      icon: '⬡',
    },
    {
      id: '2',
      title: 'Objects',
      brand: 'Model',
      gradient: 'linear-gradient(155deg, #1a2e14 0%, #2a4a18 45%, #0a1208 100%)',
      accent: '#c4f542',
      thumbText: 'object UID Transfer Cap ',
      rippleColor: '#c4f542',
      troughColor: '#3d5c12',
      icon: '◆',
    },
    {
      id: '3',
      title: 'PTB',
      brand: 'Transactions',
      gradient: 'linear-gradient(155deg, #1e1433 0%, #3b1f66 45%, #0c0818 100%)',
      accent: '#a78bfa',
      thumbText: 'PTB MoveCall SplitCoins ',
      rippleColor: '#c4b5fd',
      troughColor: '#5b21b6',
      icon: '⟫',
    },
    {
      id: '4',
      title: 'Walrus',
      brand: 'Storage',
      gradient: 'linear-gradient(155deg, #0a2428 0%, #0e4a52 45%, #061214 100%)',
      accent: '#22d3ee',
      thumbText: 'walrus blob quilt epoch ',
      rippleColor: '#67e8f9',
      troughColor: '#0e7490',
      icon: '◈',
    },
    {
      id: '5',
      title: 'DeepBook',
      brand: 'DEX',
      gradient: 'linear-gradient(155deg, #2a1220 0%, #5c1a3a 45%, #12080e 100%)',
      accent: '#f472b6',
      thumbText: 'DeepBook CLOB bid ask ',
      rippleColor: '#f9a8d4',
      troughColor: '#9d174d',
      icon: '▣',
    },
    {
      id: '6',
      title: 'zkLogin',
      brand: 'Auth',
      gradient: 'linear-gradient(155deg, #1a1430 0%, #312e81 45%, #0c0a18 100%)',
      accent: '#818cf8',
      thumbText: 'zkLogin OIDC JWT proof ',
      rippleColor: '#a5b4fc',
      troughColor: '#3730a3',
      icon: '🔑',
    },
    {
      id: '7',
      title: 'SuiNS',
      brand: 'Identity',
      gradient: 'linear-gradient(155deg, #0f2418 0%, #14532d 45%, #06120c 100%)',
      accent: '#34d399',
      thumbText: 'SuiNS .sui name resolve ',
      rippleColor: '#6ee7b7',
      troughColor: '#047857',
      icon: '◎',
    },
    {
      id: '8',
      title: 'TS SDK',
      brand: 'Tooling',
      gradient: 'linear-gradient(155deg, #2a1c0a 0%, #92400e 45%, #120a04 100%)',
      accent: '#fbbf24',
      thumbText: 'SuiClient Transaction getObject ',
      rippleColor: '#fcd34d',
      troughColor: '#b45309',
      icon: '⚡',
    },
  ];

  const cardList = cards || defaultCards;
  const numCards = cardList.length;
  const totalLength = numCards * Math.hypot(effStepX, effStepY);
  const unitStep = Math.hypot(effStepX, effStepY);

  const norm = Math.hypot(effStepX, effStepY);
  const dirX = effStepX / norm;
  const dirY = effStepY / norm;

  useEffect(() => {
    if (isStacked || !autoPlay || isHovered || dragActive) {
      lastTimeRef.current = null;
      return;
    }

    const animate = (time) => {
      if (lastTimeRef.current != null) {
        const dt = (time - lastTimeRef.current) / 1000;
        const moveSpeed = 68 * speed;
        setOffset((prev) => {
          let next = prev - moveSpeed * dt;
          if (next < 0) next += totalLength;
          return next % totalLength;
        });
      }
      lastTimeRef.current = time;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isStacked, autoPlay, isHovered, dragActive, speed, totalLength]);

  const cardLayouts = useMemo(() => {
    return cardList.map((card, idx) => {
      let posX = 0;
      let posY = 0;
      let zIndex = idx + 1;
      let scale = 1;
      let opacity = 1;
      let distFromCenter = 0;

      if (isStacked) {
        const layerFromTop = numCards - 1 - idx;
        const stackStep = screenSize === 'mobile' ? 1.5 : 3;
        posX = -layerFromTop * stackStep;
        posY = -layerFromTop * stackStep;
        zIndex = idx + 10;
        scale = 1 - layerFromTop * 0.005;
        opacity = 1;
        distFromCenter = layerFromTop;
      } else {
        const basePos = idx * unitStep;
        let currentPos = (basePos + offset) % totalLength;
        if (currentPos > totalLength / 2) {
          currentPos -= totalLength;
        }

        const stepRatio = currentPos / unitStep;
        posX = stepRatio * effStepX;
        posY = stepRatio * effStepY;
        zIndex = Math.round(100 + stepRatio * 10);
        distFromCenter = Math.hypot(posX, posY);

        const fadeThreshold =
          screenSize === 'mobile' ? 220 : screenSize === 'tablet' ? 340 : 480;
        if (distFromCenter > fadeThreshold) {
          opacity = Math.max(0, 1 - (distFromCenter - fadeThreshold) / 100);
        }
      }

      return { card, idx, posX, posY, zIndex, scale, opacity, distFromCenter };
    });
  }, [
    cardList,
    isStacked,
    numCards,
    offset,
    totalLength,
    unitStep,
    effStepX,
    effStepY,
    screenSize,
  ]);

  /** Nearest cards get live AsciiRipple (plus hovered); cap at MAX_LIVE_RIPPLES */
  const liveIndices = useMemo(() => {
    const ranked = [...cardLayouts]
      .filter((l) => l.opacity > 0.35)
      .sort((a, b) => a.distFromCenter - b.distFromCenter)
      .map((l) => l.idx);

    const set = new Set();
    if (hoveredIdx != null) set.add(hoveredIdx);
    for (const i of ranked) {
      if (set.size >= MAX_LIVE_RIPPLES) break;
      set.add(i);
    }
    // In stacked mode only top + hovered need live thumbs
    if (isStacked) {
      const top = numCards - 1;
      const stackedSet = new Set([top]);
      if (hoveredIdx != null) stackedSet.add(hoveredIdx);
      return stackedSet;
    }
    return set;
  }, [cardLayouts, hoveredIdx, isStacked, numCards]);

  const handlePointerDown = (e) => {
    if (isStacked) return;
    setDragActive(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startOffset: offset,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragActive || isStacked) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const projectedDelta = dx * dirX + dy * dirY;
    let nextOffset = dragStartRef.current.startOffset + projectedDelta;
    while (nextOffset < 0) nextOffset += totalLength;
    setOffset(nextOffset % totalLength);
  };

  const handlePointerUp = (e) => {
    if (dragActive) {
      setDragActive(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
  };

  const thumbH = Math.round(effCardHeight * 0.58);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setDragActive(false);
        setHoveredIdx(null);
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-full max-w-full h-[420px] sm:h-[500px] md:h-[540px] overflow-hidden select-none cursor-grab active:cursor-grabbing rounded-2xl flex items-center justify-center ${className}`}
    >
      <div className="relative w-0 h-0 flex items-center justify-center pointer-events-none">
        {cardLayouts.map(({ card, idx, posX, posY, zIndex, scale, opacity }) => {
          const isLive = liveIndices.has(idx);
          const isCardHovered = hoveredIdx === idx || card.id === selectedId;

          return (
            <motion.div
              key={card.id || idx}
              initial={false}
              animate={{ x: posX, y: posY, scale, opacity }}
              transition={{
                type: 'spring',
                stiffness: isStacked ? 240 : 360,
                damping: isStacked ? 28 : 36,
                mass: 0.85,
              }}
              style={{
                width: effCardWidth,
                height: effCardHeight,
                zIndex,
                position: 'absolute',
                top: -effCardHeight / 2,
                left: -effCardWidth / 2,
              }}
              className="pointer-events-auto"
              onClick={() => onCardClick && onCardClick(card, idx)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx((h) => (h === idx ? null : h))}
            >
              <div
                className={`w-full h-full rounded-2xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-[1.045] relative project-card ${isCardHovered ? 'project-card--hot' : ''}`}
                style={{
                  border: `1px solid ${isCardHovered ? `${card.accent || '#c4f542'}55` : 'rgba(42,41,38,0.7)'}`,
                  boxShadow: isCardHovered
                    ? `0 26px 48px -16px rgba(0,0,0,0.75), 0 0 0 1px ${(card.accent || '#c4f542')}40, 0 0 32px -8px ${(card.accent || '#c4f542')}55`
                    : isStacked
                      ? '0 16px 36px -8px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(42,41,38,0.65), 0 0 24px -12px rgba(196,245,66,0.12)'
                      : '0 26px 48px -16px rgba(0, 0, 0, 0.72), 0 0 0 1px rgba(42,41,38,0.55), 0 0 28px -14px rgba(59,169,255,0.08)',
                  background: '#0a0a0a',
                }}
              >
                {/* Thumbnail zone (~58%) */}
                <div
                  className="relative w-full overflow-hidden rounded-xl"
                  style={{ height: thumbH }}
                >
                  {isLive ? (
                    <LiveThumb card={card} interactive={isCardHovered} paused={paused} />
                  ) : (
                    <StaticThumb card={card} />
                  )}
                </div>

                {/* Meta zone */}
                <div
                  className="absolute bottom-0 left-0 right-0 flex flex-col justify-end px-3.5 sm:px-4 pb-3.5 pt-8"
                  style={{
                    background:
                      'linear-gradient(180deg, transparent 0%, rgba(8,8,8,0.55) 28%, rgba(8,8,8,0.96) 70%)',
                    minHeight: effCardHeight - thumbH + 28,
                  }}
                >
                  <span
                    className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest"
                    style={{ color: card.accent || '#c4f542' }}
                  >
                    {card.brand || 'Sui'}
                  </span>
                  <h3
                    className="text-base sm:text-lg font-bold tracking-tight leading-tight mt-0.5"
                    style={{ color: '#e8e4d9' }}
                  >
                    {card.title}
                  </h3>
                  {card.subtitle && (
                    <p
                      className="mt-0.5 text-[10px] sm:text-[11px] line-clamp-2 leading-snug"
                      style={{ color: '#8a8580' }}
                    >
                      {card.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default DiagonalCardStack;
