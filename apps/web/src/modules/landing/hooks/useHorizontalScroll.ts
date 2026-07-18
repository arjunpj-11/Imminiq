import { useEffect, useRef } from 'react';

export const useHorizontalScroll = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      if (window.matchMedia('(max-width: 767px)').matches) {
        track.style.transform = 'none';
        return;
      }

      const rect = section.getBoundingClientRect();
      const maxScroll = section.offsetHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(maxScroll, 1)));
      const maxTranslate = Math.max(0, track.scrollWidth - window.innerWidth + 48);
      track.style.transform = `translate3d(-${progress * maxTranslate}px, 0, 0)`;
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return { sectionRef, trackRef };
};
