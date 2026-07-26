import { useState, useEffect, type CSSProperties } from 'react';
import { Link } from 'react-router';

import ImminiqLogo from '../../../components/ui/ImminiqLogo';
import ImminiqWordmark from '../../../components/ui/ImminiqWordmark';
import { ROUTES } from '../../../routes/config/route-paths';

export default function FloatingStudioNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] left-1/2 z-1000 w-[min(520px,calc(100%-24px))] -translate-x-1/2 transition-all duration-300 ${
        scrolled ? 'scale-[0.96] opacity-95' : 'scale-100 opacity-100'
      }`}
    >
      <div
        className={`flex w-full items-center justify-between gap-3 rounded-2xl border transition-all duration-300 ${
          scrolled
            ? 'h-11 border-[#b84c2b]/30 bg-[#fdf8f5]/85 px-3 text-[#1a1714] shadow-[0_16px_40px_rgba(26,23,20,0.28)] backdrop-blur-2xl dark:border-[#e8816a]/30 dark:bg-[#f2f0eb]/85 dark:text-[#141412]'
            : 'h-13 border-[#e0d0c5] bg-[#fdf8f5]/95 px-3.5 text-[#1a1714] shadow-[0_22px_60px_rgba(26,23,20,0.20)] backdrop-blur-xl dark:border-white/10 dark:bg-[#f2f0eb]/95 dark:text-[#141412]'
        }`}
      >
        <Link
          to={ROUTES.home}
          className="flex min-w-0 items-center gap-3 no-underline"
          aria-label="Imminiq home"
        >
          <ImminiqLogo size={scrolled ? 30 : 34} className="rounded-[10px] transition-all duration-300" decorative />

          <ImminiqWordmark
            className="truncate text-[14px] font-extrabold tracking-[-0.02em]"
            style={
              {
                '--imminiq-wordmark-prefix': '#1a1714',
                '--imminiq-wordmark-accent': '#b84c2b',
              } as CSSProperties
            }
          />
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to={ROUTES.login}
            className="rounded-xl border border-[#e0d0c5] px-3 py-1.5 text-[12px] font-bold text-[#1a1714] no-underline transition hover:-translate-y-px hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-black/10 dark:text-[#141412]"
          >
            Login
          </Link>

          <Link
            to={ROUTES.register}
            className="rounded-xl bg-[#e8816a] px-3 py-1.5 text-[12px] font-bold text-[#141412] no-underline transition hover:-translate-y-px hover:bg-[#f07058]"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
