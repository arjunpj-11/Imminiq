import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useHeroTrail } from '../hooks/useHeroTrail';
import ScrambleWord from './ScrambleWord';
import { ROUTES } from '../../../routes/config/route-paths';

const WORD_PAUSE_MS = 380;

export default function LandingHero({ skipIntro = false }: { skipIntro?: boolean }) {
  const trailRef = useHeroTrail(true);

  const [wordStep, setWordStep] = useState(skipIntro ? 3 : 0);
  const [showSub, setShowSub] = useState(skipIntro);
  const [showBtns, setShowBtns] = useState(skipIntro);
  const timerRef = useRef<number | null>(null);

  const advance = useCallback((step: number) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setWordStep(step + 1);
      if (step + 1 >= 3) {
        setTimeout(() => {
          setShowSub(true);
          setShowBtns(true);
        }, 200);
      }
    }, WORD_PAUSE_MS);
  }, []);

  const onDone0 = useCallback(() => advance(0), [advance]);
  const onDone1 = useCallback(() => advance(1), [advance]);
  const onDone2 = useCallback(() => advance(2), [advance]);

  return (
    <section
      id="hero"
      ref={trailRef}
      className="relative z-1 flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#f5ede4] px-4 py-24 text-[#1a1714] dark:bg-[#050505] dark:text-[#f2f0eb] max-[767px]:pb-28 max-[767px]:pt-20"
    >
      <h1 className="sr-only">
        Imminiq — living learning trackers created by AI and evolved by communities
      </h1>
      <div className="pointer-events-none absolute inset-0 opacity-[0.045] landing-grid-mask">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'linear-gradient(rgba(26,23,20,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(26,23,20,.16) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="landing-pulse-orb pointer-events-none absolute left-1/2 top-1/2 h-120 w-120 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.18),transparent_68%)] dark:bg-[radial-gradient(circle,rgba(184,76,43,0.30),transparent_68%)] blur-3xl" />
      <div className="landing-pulse-orb pointer-events-none absolute bottom-[12%] right-[10%] h-88 w-88 rounded-full bg-[radial-gradient(circle,rgba(59,108,183,0.12),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(59,108,183,0.20),transparent_70%)] blur-3xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-295 flex-col items-center justify-center gap-7 md:gap-10">
        {/* Row 1 — IMMINIQ */}
        <div className="flex w-full flex-col items-center gap-4 md:ml-[-16%] md:flex-row md:justify-center">
          <div aria-hidden="true" className="font-['Playfair_Display',serif] text-[clamp(64px,12vw,164px)] font-black leading-[0.78] tracking-[-0.09em] text-[#1a1714] dark:text-[#f7f2ec]">
            <ScrambleWord
              text="IMMINIQ"
              delay={skipIntro ? 0 : 320}
              skip={skipIntro}
              accentFromIndex={5}
              onDone={skipIntro ? undefined : onDone0}
            />
          </div>
          <p
            className="hidden max-w-68 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b84c2b] underline decoration-[#b84c2b]/45 dark:text-[#e8816a] dark:decoration-[#e8816a]/45 underline-offset-4 md:block md:translate-y-5 md:text-left md:text-[12px] transition-all duration-500"
            style={{ opacity: showSub ? 1 : 0, transform: showSub ? 'none' : 'translateY(8px)' }}
          >
            Living learning paths, shaped by everyone who follows them
          </p>
        </div>

        <div className="mx-auto max-w-sm text-center md:hidden">
          <p className="font-['DM_Mono',monospace] text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b84c2b] dark:text-[#e8816a]">
            AI starts the tracker. The community makes it better.
          </p>
          <p className="mt-4 text-[18px] font-semibold leading-[1.45] text-[#3f3732] dark:text-[#d8d6cf]">
            Start with a structured path, learn alongside others, and improve it for everyone who follows.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <Link
              to={ROUTES.register}
              className="min-h-12 rounded-full bg-[#b84c2b] px-6 py-3 text-[13px] font-extrabold text-[#fdf8f5] shadow-[0_18px_44px_rgba(184,76,43,0.22)] dark:bg-[#e8816a] dark:text-[#141412]"
            >
              Create your tracker
            </Link>
            <Link
              to={ROUTES.login}
              className="min-h-12 rounded-full border border-[#d8c7bc] bg-[#fdf8f5]/70 px-6 py-3 text-[13px] font-bold dark:border-white/14 dark:bg-white/6"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Row 2 — LEARN */}
        <div className="hidden w-full text-center md:block">
          <div aria-hidden="true" className="font-['Playfair_Display',serif] text-[clamp(64px,12vw,164px)] font-black leading-[0.78] tracking-[-0.09em] text-[#1a1714] dark:text-[#f7f2ec]">
            {wordStep >= 1 && (
              <ScrambleWord
                text="LEARN"
                delay={0}
                skip={skipIntro}
                onDone={skipIntro ? undefined : onDone1}
              />
            )}
          </div>
        </div>

        {/* Row 3 — EVOLVE */}
        <div className="hidden w-full flex-col-reverse items-center gap-4 md:ml-[14%] md:flex md:flex-row md:justify-center">
          <p
            className="max-w-76 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b5f58] underline decoration-[#1a1714]/20 dark:text-[#9b9a92] dark:decoration-white/20 underline-offset-4 md:-translate-y-2 md:text-right md:text-[12px] transition-all duration-500"
            style={{ opacity: showSub ? 1 : 0, transform: showSub ? 'none' : 'translateY(8px)' }}
          >
            Learn together, contribute what is missing, and leave a stronger path behind
          </p>
          <div aria-hidden="true" className="font-['Playfair_Display',serif] text-[clamp(64px,12vw,164px)] font-black leading-[0.78] tracking-[-0.09em] text-[#1a1714] dark:text-[#f7f2ec]">
            {wordStep >= 2 && (
              <ScrambleWord
                text="EVOLVE"
                delay={0}
                skip={skipIntro}
                onDone={skipIntro ? undefined : onDone2}
              />
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div
          className="mt-5 hidden flex-wrap items-center justify-center gap-3 transition-all duration-700 md:flex"
          style={{ opacity: showBtns ? 1 : 0, transform: showBtns ? 'none' : 'translateY(16px)' }}
        >
          <Link
            to={ROUTES.register}
            className="rounded-full bg-[#b84c2b] px-6 py-3 text-[13px] font-extrabold text-[#fdf8f5] shadow-[0_20px_50px_rgba(184,76,43,0.18)] transition hover:-translate-y-1 hover:bg-[#963d22] dark:bg-[#e8816a] dark:text-[#141412] dark:shadow-[0_20px_50px_rgba(232,129,106,0.24)] dark:hover:bg-[#f09a84]"
          >
            Create your tracker
          </Link>
          <Link
            to={ROUTES.login}
            className="rounded-full border border-[#d8c7bc] bg-[#fdf8f5]/70 px-6 py-3 text-[13px] font-bold text-[#1a1714] backdrop-blur transition hover:-translate-y-1 hover:border-[#b84c2b]/45 hover:text-[#b84c2b] dark:border-white/14 dark:bg-white/6 dark:text-[#f2f0eb] dark:hover:border-[#e8816a]/45 dark:hover:text-[#e8816a]"
          >
            Sign in
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.24em] text-[#6b5f58] dark:text-white/42 md:block">
        move your mouse inside hero · scroll vertically
      </div>
    </section>
  );
}
