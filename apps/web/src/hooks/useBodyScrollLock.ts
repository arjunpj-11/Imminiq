import { useEffect } from 'react';

let activeLocks = 0;
let restore: (() => void) | null = null;

export const useBodyScrollLock = (locked: boolean) => {
  useEffect(() => {
    if (!locked || typeof document === 'undefined') return;

    activeLocks += 1;

    if (activeLocks === 1) {
      const html = document.documentElement;
      const body = document.body;
      const previous = {
        htmlOverflow: html.style.overflow,
        htmlOverscroll: html.style.overscrollBehavior,
        bodyOverflow: body.style.overflow,
        bodyOverscroll: body.style.overscrollBehavior,
        bodyPaddingRight: body.style.paddingRight,
      };
      const scrollbarWidth = window.innerWidth - html.clientWidth;

      html.style.overflow = 'hidden';
      html.style.overscrollBehavior = 'none';
      body.style.overflow = 'hidden';
      body.style.overscrollBehavior = 'none';
      if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

      restore = () => {
        html.style.overflow = previous.htmlOverflow;
        html.style.overscrollBehavior = previous.htmlOverscroll;
        body.style.overflow = previous.bodyOverflow;
        body.style.overscrollBehavior = previous.bodyOverscroll;
        body.style.paddingRight = previous.bodyPaddingRight;
      };
    }

    return () => {
      activeLocks = Math.max(0, activeLocks - 1);
      if (activeLocks === 0) {
        restore?.();
        restore = null;
      }
    };
  }, [locked]);
};
