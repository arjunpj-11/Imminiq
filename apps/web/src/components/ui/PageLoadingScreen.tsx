import { useEffect, useState } from 'react';
import ImminiqProgressMark from './ImminiqProgressMark';

export default function PageLoadingScreen() {
  const [progress, setProgress] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 100
      : 8,
  );
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false,
  );

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;

    let frame = 0;
    let startedAt: number | undefined;
    const tick = (now: number) => {
      startedAt ??= now;
      const elapsed = now - startedAt;
      setProgress(Math.min(94, 8 + (1 - Math.exp(-elapsed / 650)) * 88));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5ede4] dark:bg-[#141412]"
      role="status"
      aria-live="polite"
      aria-label="Loading Imminiq"
    >
      <ImminiqProgressMark progress={progress} settled isDark={isDark} />
    </div>
  );
}
