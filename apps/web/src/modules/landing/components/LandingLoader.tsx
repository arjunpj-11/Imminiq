import { useEffect, useRef, useState } from 'react';
import { cn } from '../utils/landing-ui';

const EXIT_MS = 280;
const REVEAL_MS = 420;
const DECODE_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&$*';
const FULL_WORD = 'imminiq'; // first 5 chars = main color, last 2 = rust

// ── Static CSS injected once into <head> — no per-render style recalculation ──
const STATIC_CSS = `
  @keyframes im-fadein  { from { opacity: 0 } to { opacity: 1 } }
  @keyframes im-settle  {
    0%   { transform: scale(1) }
    40%  { transform: scale(1.07) }
    100% { transform: scale(1) }
  }
  @keyframes im-blink   { 0%,100%{opacity:1} 50%{opacity:0} }

  .im-frame { opacity: 0 }
  .im-frame.im-active { animation: im-fadein .4s ease forwards }

  .im-svg-settle { animation: im-settle .5s cubic-bezier(.34,1.56,.64,1) forwards }
`;

function injectCSS() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('imminiq-loader-css')) return;
  const el = document.createElement('style');
  el.id = 'imminiq-loader-css';
  el.textContent = STATIC_CSS;
  document.head.appendChild(el);
}

// ── theme ─────────────────────────────────────────────────────────────────────
function useIsDark() {
  const [dark, setDark] = useState(() =>
    typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains('dark'))
    );
    obs.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

type LoaderPhase = 'idle' | 'frame' | 'revealing' | 'settled' | 'naming' | 'leaving' | 'done';

export default function LandingLoader({
  onDone,
  onGone,
}: {
  onDone?: () => void;
  onGone?: () => void;
}) {
  const [phase, setPhase] = useState<LoaderPhase>('idle');
  const onDoneRef = useRef(onDone);
  const onGoneRef = useRef(onGone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);
  useEffect(() => {
    onGoneRef.current = onGone;
  }, [onGone]);

  const cssInjectedRef = useRef(false);
  const phaseRef = useRef<LoaderPhase>('idle');

  useEffect(() => {
    if (!cssInjectedRef.current) {
      injectCSS();
      cssInjectedRef.current = true;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const t = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };
    const setLoaderPhase = (nextPhase: LoaderPhase) => {
      phaseRef.current = nextPhase;
      setPhase(nextPhase);
    };
    const cleanup = () => timers.forEach(clearTimeout);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      t(() => {
        onDoneRef.current?.();
        onGoneRef.current?.();
        setLoaderPhase('done');
      }, 0);
      return cleanup;
    }

    // ── schedule ──
    t(() => setLoaderPhase('frame'), 80);
    t(() => setLoaderPhase('revealing'), 140);
    t(() => setLoaderPhase('settled'), 140 + REVEAL_MS);
    t(() => setLoaderPhase('naming'), 140 + REVEAL_MS + 80);
    t(() => {
      onDoneRef.current?.();
    }, 760);
    t(() => setLoaderPhase('leaving'), 820);
    t(() => {
      onGoneRef.current?.();
      setLoaderPhase('done');
    }, 820 + EXIT_MS);

    // Safety net: hidden tabs may throttle timers, so finish on return.
    const onVisible = () => {
      if (document.visibilityState === 'visible' && phaseRef.current === 'naming') {
        onDoneRef.current?.();
        onGoneRef.current?.();
        setLoaderPhase('done');
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cleanup();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const isDark = useIsDark();

  if (phase === 'done') return null;

  const isLeaving = phase === 'leaving';
  const rust = isDark ? '#e8816a' : '#b84c2b';

  return (
    <div
      className={cn(
        'fixed inset-0 z-9999 flex h-screen w-screen items-center justify-center overflow-hidden',
        'bg-[#f5ede4] dark:bg-[#141412]',
        'transition-all duration-800 ease-in-out',
        isLeaving && '-translate-y-16 scale-[0.74] opacity-0 blur-[6px]'
      )}
      // pass rust as CSS var here so every descendant (ring, svg, wordmark) can read it
      style={{ '--im-rust': rust } as React.CSSProperties}
      role="status"
      aria-live="polite"
      aria-label="Loading Imminiq"
    >
      {/* radial vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 60% 60% at 50% 50%, transparent 40%, rgba(0,0,0,0.45) 100%)'
            : 'radial-gradient(ellipse 60% 60% at 50% 50%, transparent 40%, rgba(26,23,20,0.12) 100%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center" style={{ gap: 34 }}>
        <LogoScene phase={phase} isDark={isDark} rust={rust} />
        <WordMark phase={phase} isDark={isDark} />
      </div>
    </div>
  );
}

// ── LogoScene: scan-reveal + progress ring ──────────────────────────────────
function LogoScene({
  phase,
  isDark,
  rust,
}: {
  phase: LoaderPhase;
  isDark: boolean;
  rust: string;
}) {
  const SIZE = 96;
  const stroke = '#fff8ed';

  const [revealPct, setRevealPct] = useState(0); // 0–100, drives clip width + ring
  const [settled, setSettled] = useState(false);
  const [ringIn, setRingIn] = useState(false);
  const [fadeRing, setFadeRing] = useState(false);

  const frameActive = phase !== 'idle';

  useEffect(() => {
    if (phase === 'frame') {
      const id = requestAnimationFrame(() => setRingIn(true));
      return () => cancelAnimationFrame(id);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'revealing') return;
    let raf = 0;
    let start: number | null = null;

    const step = (ts: number) => {
      if (start === null) start = ts;
      const t = Math.min(1, (ts - start) / REVEAL_MS);
      const eased = t < 1 ? 1 - Math.pow(1 - t, 2) : 1;
      setRevealPct(eased * 100);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => {
    if (phase === 'settled' || phase === 'naming' || phase === 'leaving') {
      const id = requestAnimationFrame(() => {
        setRevealPct(100);
        setSettled(true);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'naming') {
      const id = setTimeout(() => setFadeRing(true), 900);
      return () => clearTimeout(id);
    }
  }, [phase]);

  const clipWidth = (revealPct / 100) * 80; // 0–80, matches card's 80-wide interior

  // light mode: subtle border + inner shadow so the card reads without a muddy glow
  const cardShadow = isDark
    ? undefined
    : '0 0 0 1px rgba(26,23,20,0.10), 0 4px 24px rgba(26,23,20,0.10)';

  return (
    <div style={{ width: SIZE + 24, height: SIZE + 24, position: 'relative' }}>
      {/* progress ring */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `conic-gradient(${rust} ${revealPct * 3.6}deg, transparent 0)`,
          WebkitMask:
            'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          opacity: ringIn ? (fadeRing ? 0 : 1) : 0,
          transform: `scale(${ringIn ? 1 : 0.86})`,
          transition:
            'opacity .5s ease, transform .5s cubic-bezier(.34,1.56,.64,1)',
        }}
      />

      {/* glow halo */}
      <div
        style={{
          position: 'absolute',
          inset: 6,
          borderRadius: 22,
          background: rust,
          filter: 'blur(20px)',
          opacity: settled ? (isDark ? 0.35 : 0.15) : 0,
          transition: 'opacity 1.2s ease',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* light-mode card border/shadow layer */}
      {!isDark && (
        <div
          style={{
            position: 'absolute',
            inset: 12,
            borderRadius: 18,
            boxShadow: cardShadow,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      )}

      <div style={{ position: 'absolute', inset: 12 }}>
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className={settled ? 'im-svg-settle' : ''}
          style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}
        >
          <rect
            className={cn('im-frame', frameActive && 'im-active')}
            x="10"
            y="10"
            width="80"
            height="80"
            rx="18"
            fill="#1e1c19"
          />
          <clipPath id="im-reveal-clip">
            <rect x="10" y="10" width={clipWidth} height="80" />
          </clipPath>
          <g clipPath="url(#im-reveal-clip)">
            <line
              x1="28"
              y1="38"
              x2="28"
              y2="69"
              stroke={stroke}
              strokeWidth="9"
              strokeLinecap="round"
            />
            <circle cx="28" cy="26" r="5.3" fill={rust} />
            <path
              d="M63 33.8 C72.8 35.7 78.5 43.2 78.5 52.5 C78.5 62.8 70.2 69 59.2 69 C52.2 69 47.2 66.5 44.1 61.8"
              fill="none"
              stroke={stroke}
              strokeWidth="9"
              strokeLinecap="round"
            />
            <line
              x1="62.8"
              y1="56.5"
              x2="74.8"
              y2="68.5"
              stroke={rust}
              strokeWidth="9"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      {/* percent readout */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: -26,
          textAlign: 'center',
          fontFamily: "'SFMono-Regular', Consolas, monospace",
          fontVariantNumeric: 'tabular-nums',
          fontSize: 11,
          letterSpacing: '0.08em',
          color: rust,
          opacity: fadeRing ? 0 : ringIn ? 0.85 : 0,
          transition: 'opacity .4s ease',
        }}
      >
        {String(Math.round(revealPct)).padStart(2, '0')}%
      </div>
    </div>
  );
}

// ── WordMark: decode-text reveal ────────────────────────────────────────────
function WordMark({ phase, isDark }: { phase: LoaderPhase; isDark: boolean }) {
  const textMain = isDark ? '#f2f0eb' : '#1a1714';

  const [entered, setEntered] = useState(false);
  const [displayed, setDisplayed] = useState('');
  const [wordDone, setWordDone] = useState(false);

  const active = phase === 'naming' || phase === 'leaving';

  useEffect(() => {
    if (!active) return;
    const enterId = requestAnimationFrame(() => setEntered(true));

    const settledFlags = new Array(FULL_WORD.length).fill(false);
    const perCharMs = 34;
    const cycles = 5;
    const stagger = 55;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const render = () => {
      const s = FULL_WORD.split('')
        .map((ch, i) =>
          settledFlags[i] ? ch : DECODE_GLYPHS[Math.floor(Math.random() * DECODE_GLYPHS.length)]
        )
        .join('');
      setDisplayed(s);
    };

    const ticker = setInterval(render, perCharMs);

    FULL_WORD.split('').forEach((_, i) => {
      timers.push(
        setTimeout(
          () => {
            settledFlags[i] = true;
            if (i === FULL_WORD.length - 1) {
              timers.push(
                setTimeout(() => {
                  clearInterval(ticker);
                  render();
                  setWordDone(true);
                }, cycles * perCharMs)
              );
            }
          },
          i * stagger + cycles * perCharMs
        )
      );
    });

    return () => {
      cancelAnimationFrame(enterId);
      clearInterval(ticker);
      timers.forEach(clearTimeout);
    };
  }, [active]);

  const mainPart = displayed.slice(0, 5);
  const iqPart = displayed.slice(5);

  return (
    <div
      style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(20px, 3vw, 32px)',
        fontWeight: 700,
        letterSpacing: '0.02em',
        fontSynthesis: 'none',
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
        display: 'flex',
        alignItems: 'baseline',
        gap: 0,
        minWidth: '7ch',
        opacity: entered ? 1 : 0,
        transform: entered ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.45s ease, transform 0.45s cubic-bezier(.22,1,.36,1)',
      }}
    >
      <span style={{ color: textMain, display: 'inline-block' }}>{mainPart}</span>
      <span style={{ color: 'var(--im-rust)', display: 'inline-block' }}>{iqPart}</span>

      {!wordDone && active && (
        <span
          style={{
            display: 'inline-block',
            width: 2,
            height: '0.8em',
            background: textMain,
            marginLeft: 2,
            borderRadius: 2,
            animation: 'im-blink .85s step-end infinite',
          }}
        />
      )}
    </div>
  );
}
