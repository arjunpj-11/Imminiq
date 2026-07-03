import { useEffect, useRef, useState } from 'react'
import { cn } from '../utils/landing-ui'

const EXIT_MS = 800

// ── Static CSS injected once into <head> — no per-render style recalculation ──
const STATIC_CSS = `
  @keyframes im-stroke   { to { stroke-dashoffset: 0 } }
  @keyframes im-pop {
    0%   { transform: scale(0) rotate(-40deg); opacity: 0 }
    65%  { transform: scale(1.3) rotate(5deg); opacity: 1 }
    100% { transform: scale(1)   rotate(0deg); opacity: 1 }
  }
  @keyframes im-fadein   { from { opacity: 0 } to { opacity: 1 } }
  @keyframes im-ring {
    0%,100% { stroke-opacity: .1 }
    50%     { stroke-opacity: .5 }
  }
  @keyframes im-settle {
    0%   { transform: scale(1) }
    40%  { transform: scale(1.06) }
    100% { transform: scale(1) }
  }
  @keyframes im-think {
    0%,100% { transform: translateY(0);   opacity: .4 }
    50%     { transform: translateY(-4px); opacity: 1  }
  }
  @keyframes im-blink  { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes im-iq-in  {
    from { opacity: 0; transform: translateX(4px) }
    to   { opacity: 1; transform: translateX(0)   }
  }

  /* frame */
  .im-frame { opacity: 0 }
  .im-frame.im-active { animation: im-fadein .4s ease forwards }

  /* ring — color set via CSS var */
  .im-ring {
    fill: none;
    stroke: var(--im-rust);
    stroke-width: .9;
    stroke-opacity: 0;
  }
  .im-ring.im-active { animation: im-ring 2s ease-in-out infinite; animation-delay: .5s }

  /* strokes */
  .im-ibar-s { stroke-dasharray: 32; stroke-dashoffset: 32 }
  .im-ibar-s.im-draw { animation: im-stroke .40s cubic-bezier(.4,0,.2,1) forwards }

  .im-dot { transform-origin: 28px 26px; opacity: 0 }
  .im-dot.im-draw { animation: im-pop .40s cubic-bezier(.34,1.56,.64,1) forwards }

  .im-arc { stroke-dasharray: 95; stroke-dashoffset: 95 }
  .im-arc.im-draw { animation: im-stroke .62s cubic-bezier(.4,0,.2,1) forwards }

  .im-slash { stroke-dasharray: 20; stroke-dashoffset: 20 }
  .im-slash.im-draw { animation: im-stroke .28s cubic-bezier(.4,0,.2,1) forwards }

  /* svg settle */
  .im-svg-settle { animation: im-settle .5s cubic-bezier(.34,1.56,.64,1) forwards }

  /* thinking dots */
  .im-think-dot { animation: im-think .9s ease-in-out infinite }
`

function injectCSS() {
  if (typeof document === 'undefined') return
  if (document.getElementById('imminiq-loader-css')) return
  const el = document.createElement('style')
  el.id = 'imminiq-loader-css'
  el.textContent = STATIC_CSS
  document.head.appendChild(el)
}

// ── theme ─────────────────────────────────────────────────────────────────────
function useIsDark() {
  const [dark, setDark] = useState(() =>
    typeof window !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false
  )
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains('dark'))
    )
    obs.observe(document.documentElement, { attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

type LoaderPhase = 'idle' | 'frame' | 'drawing' | 'burst' | 'naming' | 'leaving' | 'done'

export default function LandingLoader({
  onDone,
  onGone,
}: {
  onDone?: () => void
  onGone?: () => void
}) {
  const [phase, setPhase] = useState<LoaderPhase>('idle')
  const onDoneRef = useRef(onDone)
  const onGoneRef = useRef(onGone)
  useEffect(() => { onDoneRef.current = onDone }, [onDone])
  useEffect(() => { onGoneRef.current = onGone }, [onGone])

  const cssInjectedRef = useRef(false)
  const phaseRef = useRef<LoaderPhase>('idle')

  useEffect(() => {
    if (!cssInjectedRef.current) {
      injectCSS()
      cssInjectedRef.current = true
    }

    const timers: ReturnType<typeof setTimeout>[] = []
    const t = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms))
    }
    const setLoaderPhase = (nextPhase: LoaderPhase) => {
      phaseRef.current = nextPhase
      setPhase(nextPhase)
    }
    const cleanup = () => timers.forEach(clearTimeout)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      t(() => {
        onDoneRef.current?.()
        onGoneRef.current?.()
        setLoaderPhase('done')
      }, 0)
      return cleanup
    }

    t(() => setLoaderPhase('frame'), 600)
    t(() => setLoaderPhase('drawing'), 1000)
    t(() => setLoaderPhase('burst'), 3800)
    t(() => setLoaderPhase('naming'), 3900)
    t(() => {
      onDoneRef.current?.()
    }, 7500)
    t(() => setLoaderPhase('leaving'), 7700)
    t(() => {
      onGoneRef.current?.()
      setLoaderPhase('done')
    }, 7700 + EXIT_MS)

    // Safety net: hidden tabs may throttle timers, so finish on return.
    const onVisible = () => {
      if (document.visibilityState === 'visible' && phaseRef.current === 'naming') {
        onDoneRef.current?.()
        onGoneRef.current?.()
        setLoaderPhase('done')
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cleanup()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  const isDark = useIsDark()

  if (phase === 'done') return null

  const isLeaving = phase === 'leaving'
  const rust = isDark ? '#e8816a' : '#b84c2b'

  return (
    <div
      className={cn(
        'fixed inset-0 z-9999 flex h-screen w-screen items-center justify-center overflow-hidden',
        'bg-[#f5ede4] dark:bg-[#141412]',
        'transition-all duration-800 ease-in-out',
        isLeaving && '-translate-y-16 scale-[0.74] opacity-0 blur-[6px]'
      )}
      // pass rust as CSS var so SVG ring can read it without re-injecting style blocks
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

      <div className="relative z-10 flex flex-col items-center" style={{ gap: 10 }}>
        <LogoScene phase={phase} isDark={isDark} />
        <WordMark phase={phase} isDark={isDark} />
      </div>
    </div>
  )
}

// ── draw steps ────────────────────────────────────────────────────────────────
type DrawAction = 'ibar' | 'dot' | 'arc' | 'slash' | 'move'
interface DrawStep { x: number; y: number; action: DrawAction; delay: number }

const DRAW_STEPS: DrawStep[] = [
  { x: 28,   y: 60,   action: 'move',  delay: 0   },
  { x: 28,   y: 69,   action: 'ibar',  delay: 320 },
  { x: 28,   y: 26,   action: 'move',  delay: 260 },
  { x: 28,   y: 26,   action: 'dot',   delay: 180 },
  { x: 63,   y: 33.8, action: 'move',  delay: 300 },
  { x: 44.1, y: 61.8, action: 'arc',   delay: 700 },
  { x: 62.8, y: 56.5, action: 'move',  delay: 260 },
  { x: 74.8, y: 68.5, action: 'slash', delay: 340 },
]

function LogoScene({ phase, isDark }: { phase: LoaderPhase; isDark: boolean }) {
  const SIZE    = 96
  const rust    = isDark ? '#e8816a' : '#b84c2b'
  const stroke  = '#fff8ed'

  const [stepIndex, setStepIndex] = useState(-1)
  const [cursorX, setCursorX]     = useState(50)
  const [cursorY, setCursorY]     = useState(50)
  const [thinking, setThinking]   = useState(false)
  const [clicking, setClicking]   = useState(false)
  const [cursorVisible, setCursorVisible] = useState(false)
  const [cursorFading, setCursorFading]   = useState(false)
  const [settled, setSettled]             = useState(false)

  useEffect(() => {
    if (phase !== 'frame') return
    const id = setTimeout(() => {
      setThinking(true)
      setCursorX(50); setCursorY(50)
      setCursorVisible(true)
    }, 0)
    return () => clearTimeout(id)
  }, [phase])

  // fade cursor out when drawing is done (burst phase)
  useEffect(() => {
    if (phase !== 'burst') return
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => setCursorFading(true), 0))
    timers.push(setTimeout(() => setCursorVisible(false), 220))
    return () => timers.forEach(clearTimeout)
  }, [phase])

  useEffect(() => {
    if (phase !== 'drawing') return
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => setThinking(false), 0))

    let cancelled = false
    let accumulated = 0
    DRAW_STEPS.forEach((step, i) => {
      accumulated += step.delay
      timers.push(setTimeout(() => {
        if (cancelled) return
        setCursorX(step.x); setCursorY(step.y)
        if (step.action === 'dot') {
          setClicking(true)
          timers.push(setTimeout(() => setClicking(false), 200))
        }
        setStepIndex(i)
      }, accumulated))
    })
    timers.push(setTimeout(() => { if (!cancelled) setSettled(true) }, accumulated + 120))

    return () => { cancelled = true; timers.forEach(clearTimeout) }
  }, [phase])

  const showIbar    = stepIndex >= 1
  const showDot     = stepIndex >= 3
  const showArc     = stepIndex >= 5
  const showSlash   = stepIndex >= 7
  const frameActive = phase !== 'idle'

  // light mode: subtle border + inner shadow so the card reads without a muddy glow
  const cardShadow = isDark
    ? undefined
    : '0 0 0 1px rgba(26,23,20,0.10), 0 4px 24px rgba(26,23,20,0.10)'

  return (
    <div style={{ width: SIZE, height: SIZE, position: 'relative' }}>
      {/* glow halo */}
      <div style={{
        position: 'absolute', inset: -12, borderRadius: 22,
        background: rust, filter: 'blur(22px)',
        opacity: settled ? (isDark ? 0.35 : 0.15) : 0,
        transition: 'opacity 1.2s ease',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* light-mode card border/shadow layer — sits between glow and svg */}
      {!isDark && (
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: 18,
          boxShadow: cardShadow,
          pointerEvents: 'none', zIndex: 2,
        }} />
      )}

      <svg
        viewBox="0 0 100 100"
        width={SIZE}
        height={SIZE}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={settled ? 'im-svg-settle' : ''}
        style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}
      >
        {/* no <style> block here — all rules live in the static <head> injection */}
        <rect
          className={cn('im-frame', frameActive && 'im-active')}
          x="10" y="10" width="80" height="80" rx="18" fill="#1e1c19"
        />
        <rect
          className={cn('im-ring', frameActive && 'im-active')}
          x="10" y="10" width="80" height="80" rx="18"
        />
        <line
          className={cn('im-ibar-s', showIbar && 'im-draw')}
          x1="28" y1="38" x2="28" y2="69"
          stroke={stroke} strokeWidth="9" strokeLinecap="round"
        />
        <circle
          className={cn('im-dot', showDot && 'im-draw')}
          cx="28" cy="26" r="5.3" fill={rust}
        />
        <path
          className={cn('im-arc', showArc && 'im-draw')}
          d="M63 33.8 C72.8 35.7 78.5 43.2 78.5 52.5 C78.5 62.8 70.2 69 59.2 69 C52.2 69 47.2 66.5 44.1 61.8"
          fill="none" stroke={stroke} strokeWidth="9" strokeLinecap="round"
        />
        <line
          className={cn('im-slash', showSlash && 'im-draw')}
          x1="62.8" y1="56.5" x2="74.8" y2="68.5"
          stroke={rust} strokeWidth="9" strokeLinecap="round"
        />
      </svg>

      {cursorVisible && (
        <div style={{
          position: 'absolute',
          left: `${cursorX}%`, top: `${cursorY}%`,
          transform: 'translate(-2px, -2px)',
          transition: 'left .32s cubic-bezier(.4,0,.2,1), top .32s cubic-bezier(.4,0,.2,1), opacity 200ms ease',
          opacity: cursorFading ? 0 : 1,
          zIndex: 10, pointerEvents: 'none',
        }}>
          <CursorSVG thinking={thinking} clicking={clicking} isDark={isDark} />
        </div>
      )}
    </div>
  )
}

function CursorSVG({ thinking, clicking, isDark }: { thinking: boolean; clicking: boolean; isDark: boolean }) {
  const rust = isDark ? '#e8816a' : '#b84c2b'
  return (
    <div style={{ position: 'relative' }}>
      <svg
        width="20" height="24" viewBox="0 0 20 24" fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.8))',
          transform: clicking ? 'scale(0.85)' : 'scale(1)',
          transition: 'transform .1s ease',
        }}
      >
        <path
          d="M2 2L2 18L6.5 13.5L9.5 20L12 19L9 12.5L15 12.5L2 2Z"
          fill="white" stroke="#222" strokeWidth="1.2" strokeLinejoin="round"
        />
      </svg>
      {thinking && (
        <div style={{ position: 'absolute', top: -20, left: 18, display: 'flex', gap: 3, alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="im-think-dot"
              style={{
                width: 4, height: 4, borderRadius: '50%', background: rust,
                animationDelay: `${i * 0.18}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── WordMark ──────────────────────────────────────────────────────────────────
const CHAR_MS = 70

type WordState =
  | 'idle' | 'typing-wrong' | 'flicker'
  | 'flip-first' | 'flip-second' | 'typing-iq' | 'done'

function WordMark({ phase, isDark }: { phase: LoaderPhase; isDark: boolean }) {
  const rust     = isDark ? '#e8816a' : '#b84c2b'
  const textMain = isDark ? '#f2f0eb' : '#1a1714'

  const [wordState, setWordState] = useState<WordState>('idle')
  const [displayed, setDisplayed] = useState('')
  const [flicker, setFlicker]     = useState(false)
  const [entered, setEntered]     = useState(false)

  const rotateTarget = wordState === 'flip-first' ? 90 : 0
  const active = phase === 'naming' || phase === 'leaving'

  useEffect(() => {
    if (!active) return
    const timers: ReturnType<typeof setTimeout>[] = []
    const t = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms))
    let acc = 0

    t(() => setEntered(true), 0)
    t(() => setWordState('typing-wrong'), 10)

    'nimmi'.split('').forEach((_, i) => {
      acc += CHAR_MS
      t(() => setDisplayed('nimmi'.slice(0, i + 1)), acc)
    })

    acc += 400
    t(() => { setWordState('flicker'); setFlicker(true) }, acc)
    ;[60, 120, 180, 240, 300, 360].forEach((offset, i) => {
      t(() => setFlicker(i % 2 === 0 ? false : true), acc + offset)
    })
    t(() => setFlicker(false), acc + 420)

    acc += 480
    t(() => setWordState('flip-first'), acc)

    acc += 220
    t(() => setDisplayed('immin'), acc)
    t(() => setWordState('flip-second'), acc + 10)

    acc += 280
    t(() => setWordState('typing-iq'), acc)
    'iq'.split('').forEach((_, i) => {
      acc += CHAR_MS
      t(() => setDisplayed('immin' + 'iq'.slice(0, i + 1)), acc)
    })

    acc += 180
    t(() => setWordState('done'), acc)

    return () => timers.forEach(clearTimeout)
  }, [active])

  const isFinal = wordState === 'done'
  const isWrong = wordState === 'flicker'
  const showIq  = wordState === 'typing-iq' || isFinal

  return (
    <>
      {flicker && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(220,38,38,0.08)',
          zIndex: 99999, pointerEvents: 'none',
          border: '2px solid rgba(220,38,38,0.45)',
        }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: isDark ? '#1a0000' : '#fff0f0',
            border: '1px solid #dc2626',
            borderRadius: 8, padding: '12px 28px',
            color: '#dc2626', fontFamily: 'monospace',
            fontSize: 13, letterSpacing: '0.05em', whiteSpace: 'nowrap',
          }}>
            ✕ &nbsp; TypeError: invalid sequence "nimmi"
          </div>
        </div>
      )}

      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(20px, 3vw, 32px)',
        fontWeight: 700,
        letterSpacing: '0.02em',
        fontSynthesis: 'none',
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',   // ← tightened from 0.06em — more considered
        display: 'flex',
        alignItems: 'baseline',
        gap: 0,
        minWidth: '7ch',
        opacity: entered ? 1 : 0,
        transform: entered ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.45s ease, transform 0.45s cubic-bezier(.22,1,.36,1)',
        perspective: '600px',
      }}>
        <span style={{
          display: 'inline-block',
          color: isWrong ? '#ef4444' : textMain,
          transform: `rotateY(${rotateTarget}deg)`,
          transition: 'transform 220ms cubic-bezier(.4,0,.2,1)',
          transformOrigin: 'center center',
        }}>
          {displayed.slice(0, 5)}
        </span>

        {showIq && (
          <span style={{
            color: rust,
            display: 'inline-block',
            animation: 'im-iq-in .25s cubic-bezier(.22,1,.36,1) forwards',
          }}>
            {displayed.slice(5)}
          </span>
        )}

        {!isFinal && active && (
          <span style={{
            display: 'inline-block', width: 2, height: '0.8em',
            background: isWrong ? '#ef4444' : textMain,
            marginLeft: 2, borderRadius: 2,
            animation: 'im-blink .85s step-end infinite',
          }} />
        )}
      </div>
    </>
  )
}