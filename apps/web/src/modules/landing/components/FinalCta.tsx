import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/landing-ui';
import { ROUTES } from '../../../routes/config/route-paths';

export default function FinalCta() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [bigVisible, setBigVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          setTimeout(() => setBigVisible(true), 300);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="render-lazy-section relative flex min-h-[68vh] flex-col justify-between overflow-hidden bg-[#f5ede4] px-5 pb-4 pt-18 text-[#1a1714] dark:bg-[#050505] dark:text-[#f2f0eb] sm:px-8 sm:pt-20 lg:px-10"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'linear-gradient(rgba(26,23,20,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(26,23,20,.16) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Top content row */}
      <div
        className={cn(
          'relative z-10 mx-auto flex w-full max-w-280 flex-col gap-10 transition-all duration-700 md:flex-row md:justify-between',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-14 opacity-0'
        )}
      >
        <div>
          <p className="font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.18em] text-[#b84c2b] dark:text-[#e8816a]">
            Start a living learning path
          </p>
          <p className="mt-5 max-w-118 text-[15px] leading-[1.8] text-[#6b5f58] dark:text-[#b8b4aa]">
            Create a tracker for what you want to master, find people on the same path, and help
            build the learning structure you wish you had from day one.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-[14px] text-[#6b5f58] dark:text-[#b8b4aa]">
          <Link
            to={ROUTES.privacy}
            className="transition hover:text-[#b84c2b] dark:hover:text-[#e8816a]"
          >
            Privacy
          </Link>
          <Link
            to={ROUTES.terms}
            className="transition hover:text-[#b84c2b] dark:hover:text-[#e8816a]"
          >
            Terms
          </Link>
          <Link
            to={ROUTES.login}
            className="transition hover:text-[#b84c2b] dark:hover:text-[#e8816a]"
          >
            Sign in
          </Link>
        </div>

        <Link
          to={ROUTES.register}
          className="h-fit rounded-full bg-[#b84c2b] px-6 py-3 text-[13px] font-extrabold text-[#fdf8f5] transition hover:-translate-y-1 hover:bg-[#963d22] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#f09a84]"
        >
          Create your tracker
        </Link>
      </div>

      {/* Big "Let’s start" with staggered letter reveal */}
      <Link
        to={ROUTES.register}
        className={cn(
          "relative z-10 mt-20 block text-center font-['Playfair_Display',serif] text-[clamp(70px,20vw,260px)] font-black leading-[0.8] tracking-[-0.11em] text-[#1a1714] transition-all duration-1000 hover:text-[#b84c2b] dark:text-[#f2f0eb] dark:hover:text-[#e8816a]",
          bigVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        )}
        aria-label="Create a learning tracker with Imminiq"
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
  );
}
