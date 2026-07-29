import { useEffect, useRef, useState } from 'react';

import ImminiqProgressMark from '../../../components/ui/ImminiqProgressMark';
import { PRODUCT_LANGUAGE } from '../../../config/product-language';
import { cn } from '../utils/landing-ui';

const EXIT_MS = 220;
const REVEAL_MS = 320;
const DECODE_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&$*';
const FULL_WORD = PRODUCT_LANGUAGE.brand;

const STATIC_CSS = `
  @keyframes im-blink   { 0%,100%{opacity:1} 50%{opacity:0} }
`;

function injectCSS() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('imminiq-loader-css')) return;
  const el = document.createElement('style');
  el.id = 'imminiq-loader-css';
  el.textContent = STATIC_CSS;
  document.head.appendChild(el);
}

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

    t(() => setLoaderPhase('frame'), 40);
    t(() => setLoaderPhase('revealing'), 80);
    t(() => setLoaderPhase('settled'), 80 + REVEAL_MS);
    t(() => setLoaderPhase('naming'), 80 + REVEAL_MS + 40);
    t(() => {
      onDoneRef.current?.();
    }, 680);
    t(() => setLoaderPhase('leaving'), 740);
    t(() => {
      onGoneRef.current?.();
      setLoaderPhase('done');
    }, 740 + EXIT_MS);

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
        'transition-all duration-200 ease-in-out',
        isLeaving && '-translate-y-16 scale-[0.74] opacity-0 blur-[6px]'
      )}
      style={{ '--im-rust': rust } as React.CSSProperties}
      role="status"
      aria-live="polite"
      aria-label="Loading Imminiq"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 60% 60% at 50% 50%, transparent 40%, rgba(0,0,0,0.45) 100%)'
            : 'radial-gradient(ellipse 60% 60% at 50% 50%, transparent 40%, rgba(26,23,20,0.12) 100%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center" style={{ gap: 34 }}>
        <LogoScene phase={phase} isDark={isDark} />
        <WordMark phase={phase} isDark={isDark} />
      </div>
    </div>
  );
}

function LogoScene({ phase, isDark }: { phase: LoaderPhase; isDark: boolean }) {
  const [revealPct, setRevealPct] = useState(0);
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
      const id = setTimeout(() => setFadeRing(true), 180);
      return () => clearTimeout(id);
    }
  }, [phase]);

  return (
    <ImminiqProgressMark
      progress={revealPct}
      active={frameActive && ringIn}
      settled={settled}
      fade={fadeRing}
      isDark={isDark}
    />
  );
}

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
    const perCharMs = 24;
    const cycles = 3;
    const stagger = 32;
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
