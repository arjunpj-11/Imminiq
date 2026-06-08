import { useEffect, useRef, useState } from 'react'
import { cn } from '../utils/landing-ui'

const loaderWords = [
  'Welcome',
  'Bienvenido',
  'Bienvenue',
  'Willkommen',
  'Benvenuto',
  'ようこそ',
  '欢迎',
  'സ്വാഗതം',
  'स्वागत है',
  'Imminiq',
]

const WORD_VISIBLE_MS = 260
const FADE_MS = 120
const LAST_WORD_HOLD_MS = 760
const EXIT_MS = 700

export default function LandingLoader({
  onDone,
  onGone,
}: {
  onDone?: () => void  // last word shown — hero can mount behind loader
  onGone?: () => void  // exit animation done — mark session as played
}) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [leaving, setLeaving] = useState(false)
  const [done, setDone] = useState(false)

  const onDoneRef = useRef(onDone)
  const onGoneRef = useRef(onGone)
  useEffect(() => { onDoneRef.current = onDone }, [onDone])
  useEffect(() => { onGoneRef.current = onGone }, [onGone])

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    const t = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms)
      timers.push(id)
      return id
    }
    const cleanup = () => timers.forEach(clearTimeout)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      t(() => {
        onDoneRef.current?.()
        onGoneRef.current?.()
        setDone(true)
      }, 0)
      return cleanup
    }

    if (index < loaderWords.length - 1) {
      t(() => {
        setVisible(false)
        t(() => {
          setIndex(i => i + 1)
          setVisible(true)
        }, FADE_MS)
      }, WORD_VISIBLE_MS)
      return cleanup
    }

    // Last word — hold, start exit, then fully gone
    t(() => {
      onDoneRef.current?.()
      setLeaving(true)
      t(() => {
        onGoneRef.current?.()
        setDone(true)
      }, EXIT_MS)
    }, LAST_WORD_HOLD_MS)

    return cleanup
  }, [index])

  if (done) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-9999 flex h-screen w-screen items-center justify-center overflow-hidden bg-[#f5ede4] text-[#1a1714] dark:bg-[#050505] dark:text-[#f2f0eb] transition-all duration-700',
        leaving && '-translate-y-24 scale-75 opacity-0'
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading Imminiq"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.055]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'linear-gradient(rgba(26,23,20,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(26,23,20,.16) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="landing-loader-orb pointer-events-none absolute h-90 w-90 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.20),transparent_68%)] dark:bg-[radial-gradient(circle,rgba(232,129,106,0.36),transparent_68%)] blur-3xl" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <img
          src="./../../../../public/imminiq-logo.svg"
          alt="Imminiq"
          className="h-11 w-11 object-contain opacity-95"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />

        <div className="min-h-22 overflow-visible font-['Playfair_Display',serif] text-[clamp(42px,8vw,98px)] font-black leading-none tracking-[-0.06em] text-[#1a1714] dark:text-[#f2f0eb]">
          <span
            key={loaderWords[index]}
            className={cn(
              'block transition-opacity duration-150',
              visible ? 'opacity-100' : 'opacity-0'
            )}
          >
            {loaderWords[index]}
          </span>
        </div>

        <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.26em] text-[#b84c2b] dark:text-[#e8816a]">
          Preparing the learning arena
        </div>
      </div>
    </div>
  )
}