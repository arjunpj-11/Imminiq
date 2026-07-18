import { useEffect, useRef, useState } from 'react';

export default function LandingFooter() {
  const footerRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const text = 'Imminiq · Adaptive learning · Built for mastery';

  return (
    <footer
      ref={footerRef}
      className="bg-[#f5ede4] px-5 pb-24 pt-8 text-center font-['DM_Mono',monospace] text-[11px] uppercase tracking-[0.16em] text-[#6b5f58] dark:bg-[#050505] dark:text-white/55"
    >
      <div>
        {text.split('').map((char, i) => (
          <span
            key={i}
            className="inline-block transition-all"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateY(10px)',
              transitionDuration: '0.5s',
              transitionDelay: visible ? `${i * 22}ms` : '0ms',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    </footer>
  );
}
