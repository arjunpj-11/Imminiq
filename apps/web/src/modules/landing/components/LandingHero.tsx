import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useHeroTrail } from '../hooks/useHeroTrail'
import ScrambleWord from './ScrambleWord'

const WORD_PAUSE_MS = 380

export default function LandingHero({ skipIntro = false }: { skipIntro?: boolean }) {
  const trailRef = useHeroTrail(true)

  const [wordStep, setWordStep] = useState(skipIntro ? 3 : 0)
  const [showSub, setShowSub] = useState(skipIntro)
  const [showBtns, setShowBtns] = useState(skipIntro)
  const timerRef = useRef<number | null>(null)

  const advance = useCallback((step: number) => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      setWordStep(step + 1)
      if (step + 1 >= 3) {
        setTimeout(() => { setShowSub(true); setShowBtns(true) }, 200)
      }
    }, WORD_PAUSE_MS)
  }, [])

  const onDone0 = useCallback(() => advance(0), [advance])
  const onDone1 = useCallback(() => advance(1), [advance])
  const onDone2 = useCallback(() => advance(2), [advance])

  return (
    <section
      id="hero"
      ref={trailRef}
      className="relative z-1 flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-4 py-24 text-[#f2f0eb]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.045] landing-grid-mask">
        <div className="h-full w-full" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.18) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      <div className="landing-pulse-orb pointer-events-none absolute left-1/2 top-1/2 h-120 w-120 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.30),transparent_68%)] blur-3xl" />
      <div className="landing-pulse-orb pointer-events-none absolute bottom-[12%] right-[10%] h-88 w-88 rounded-full bg-[radial-gradient(circle,rgba(59,108,183,0.20),transparent_70%)] blur-3xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-295 flex-col items-center justify-center gap-7 md:gap-10">

        {/* Row 1 — IMMINIQ */}
        <div className="flex w-full flex-col items-center gap-4 md:ml-[-16%] md:flex-row md:justify-center">
          <h1 className="font-['Playfair_Display',serif] text-[clamp(64px,12vw,164px)] font-black leading-[0.78] tracking-[-0.09em] text-[#f7f2ec]">
            <ScrambleWord
              text="IMMINIQ"
              delay={skipIntro ? 0 : 320}
              skip={skipIntro}
              onDone={skipIntro ? undefined : onDone0}
            />
          </h1>
          <p
            className="max-w-68 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e8816a] underline decoration-[#e8816a]/45 underline-offset-4 md:translate-y-5 md:text-left md:text-[12px] transition-all duration-500"
            style={{ opacity: showSub ? 1 : 0, transform: showSub ? 'none' : 'translateY(8px)' }}
          >
            AI roadmaps for serious learners
          </p>
        </div>

        {/* Row 2 — LEARN */}
        <div className="w-full text-center">
          <h1 className="font-['Playfair_Display',serif] text-[clamp(64px,12vw,164px)] font-black leading-[0.78] tracking-[-0.09em] text-[#f7f2ec]">
            {wordStep >= 1 && (
              <ScrambleWord
                text="LEARN"
                delay={0}
                skip={skipIntro}
                onDone={skipIntro ? undefined : onDone1}
              />
            )}
          </h1>
        </div>

        {/* Row 3 — BATTLE */}
        <div className="flex w-full flex-col-reverse items-center gap-4 md:ml-[14%] md:flex-row md:justify-center">
          <p
            className="max-w-76 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9b9a92] underline decoration-white/20 underline-offset-4 md:-translate-y-2 md:text-right md:text-[12px] transition-all duration-500"
            style={{ opacity: showSub ? 1 : 0, transform: showSub ? 'none' : 'translateY(8px)' }}
          >
            Practice with Scribe AI and battle loops
          </p>
          <h1 className="font-['Playfair_Display',serif] text-[clamp(64px,12vw,164px)] font-black leading-[0.78] tracking-[-0.09em] text-[#f7f2ec]">
            {wordStep >= 2 && (
              <ScrambleWord
                text="BATTLE"
                delay={0}
                skip={skipIntro}
                onDone={skipIntro ? undefined : onDone2}
              />
            )}
          </h1>
        </div>

        {/* CTA Buttons */}
        <div
          className="mt-5 flex flex-wrap items-center justify-center gap-3 transition-all duration-700"
          style={{ opacity: showBtns ? 1 : 0, transform: showBtns ? 'none' : 'translateY(16px)' }}
        >
          <Link
            to="/register"
            className="rounded-full bg-[#e8816a] px-6 py-3 text-[13px] font-extrabold text-[#141412] shadow-[0_20px_50px_rgba(232,129,106,0.24)] transition hover:-translate-y-1 hover:bg-[#f09a84]"
          >
            Join early access
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-white/14 bg-white/6 px-6 py-3 text-[13px] font-bold text-[#f2f0eb] backdrop-blur transition hover:-translate-y-1 hover:border-[#e8816a]/45 hover:text-[#e8816a]"
          >
            Sign in
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.24em] text-white/42 md:block">
        move your mouse inside hero · scroll vertically
      </div>
    </section>
  )
}