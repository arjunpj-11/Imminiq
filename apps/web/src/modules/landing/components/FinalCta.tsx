import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../utils/landing-ui'

export default function FinalCta() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)
  const [bigVisible, setBigVisible] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          setTimeout(() => setBigVisible(true), 300)
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#141412] px-5 pb-4 pt-20 text-[#f2f0eb] dark:bg-[#050505] sm:px-8 lg:px-10"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
        <div className="h-full w-full" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.18) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      {/* Top content row */}
      <div
        className={cn(
          'relative z-10 mx-auto flex w-full max-w-280 flex-col gap-10 transition-all duration-700 md:flex-row md:justify-between',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-14 opacity-0'
        )}
      >
        <div>
          <p className="font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.18em] text-[#e8816a]">
            Start before the crowd
          </p>
          <p className="mt-5 max-w-118 text-[15px] leading-[1.8] text-[#b8b4aa]">
            Imminiq is preparing for launch. Join early access and be ready when the full learning system opens.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-[14px] text-[#b8b4aa]">
          <Link to="/privacy" className="transition hover:text-[#e8816a]">Privacy</Link>
          <Link to="/terms" className="transition hover:text-[#e8816a]">Terms</Link>
          <Link to="/login" className="transition hover:text-[#e8816a]">Sign in</Link>
        </div>

        <Link
          to="/login"
          className="h-fit rounded-full bg-[#e8816a] px-6 py-3 text-[13px] font-extrabold text-[#141412] transition hover:-translate-y-1 hover:bg-[#f09a84]"
        >
          Start now
        </Link>
      </div>

      {/* Big "Start now" with staggered letter reveal */}
      <Link
        to="/login"
        className={cn(
          "relative z-10 mt-20 block text-center font-['Playfair_Display',serif] text-[clamp(70px,20vw,260px)] font-black leading-[0.8] tracking-[-0.11em] text-[#f2f0eb] transition-all duration-1000 hover:text-[#e8816a]",
          bigVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        )}
        aria-label="Start now by signing in"
      >
        {'Start now'.split('').map((char, i) => (
          <span
            key={i}
            className="inline-block transition-all"
            style={{
              opacity: bigVisible ? 1 : 0,
              transform: bigVisible ? 'none' : 'translateY(40px)',
              transitionDuration: '0.7s',
              transitionDelay: bigVisible ? `${i * 55}ms` : '0ms',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </Link>
    </section>
  )
}