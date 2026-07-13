import { useEffect, useRef } from 'react';

import { heroTrailCards } from '../constants/landing.constants';

type TrailCard = (typeof heroTrailCards)[number];

const toneClasses: Record<TrailCard['tone'], string> = {
  rust: 'border-[rgba(184,76,43,0.35)] bg-[rgba(184,76,43,0.14)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.42)] dark:bg-[rgba(232,129,106,0.16)] dark:text-[#e8816a]',
  blue: 'border-[rgba(59,108,183,0.35)] bg-[rgba(59,108,183,0.14)] text-[#3b6cb7] dark:border-[rgba(107,159,232,0.42)] dark:bg-[rgba(107,159,232,0.16)] dark:text-[#6b9fe8]',
  green:
    'border-[rgba(45,106,71,0.35)] bg-[rgba(45,106,71,0.14)] text-[#2d6a47] dark:border-[rgba(92,201,138,0.42)] dark:bg-[rgba(92,201,138,0.16)] dark:text-[#5cc98a]',
  amber:
    'border-[rgba(138,98,0,0.35)] bg-[rgba(138,98,0,0.14)] text-[#8a6200] dark:border-[rgba(240,168,66,0.42)] dark:bg-[rgba(240,168,66,0.16)] dark:text-[#f0a842]',
};

export const useHeroTrail = (enabled = true) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const indexRef = useRef(0);
  const lastPointRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleMove = (event: MouseEvent) => {
      if (window.innerWidth < 768) return;

      const bounds = container.getBoundingClientRect();
      const isInsideHero =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;

      if (!isInsideHero) return;

      const previous = lastPointRef.current;
      const dx = event.clientX - previous.x;
      const dy = event.clientY - previous.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 115) return;

      lastPointRef.current = { x: event.clientX, y: event.clientY };

      const card = heroTrailCards[indexRef.current % heroTrailCards.length];
      indexRef.current += 1;

      const dirX = dx / Math.max(distance, 1);
      const dirY = dy / Math.max(distance, 1);
      const rotate = dirX > 0 ? 9 : -9;
      const node = document.createElement('div');

      node.className = [
        'pointer-events-none absolute z-30 w-68 rounded-3xl border px-5 py-4 shadow-[0_24px_70px_rgba(26,23,20,0.18)] backdrop-blur-xl transition-none dark:shadow-[0_24px_80px_rgba(0,0,0,0.42)]',
        toneClasses[card.tone],
      ].join(' ');

      const localX = event.clientX - bounds.left;
      const localY = event.clientY - bounds.top;

      node.style.left = `${localX}px`;
      node.style.top = `${localY}px`;
      node.style.transform = `translate(-50%, -50%) translate(${-dirX * 70}px, ${-dirY * 70}px) scale(0.72) rotate(${rotate * -1}deg)`;
      node.style.opacity = '0';
      node.style.willChange = 'transform, opacity';
      node.innerHTML = `
        <div style="font-family:DM Mono,monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase;opacity:.8">${card.eyebrow}</div>
        <div style="margin-top:8px;font-family:Playfair Display,serif;font-size:22px;font-weight:800;letter-spacing:-.5px;line-height:1.05;color:currentColor">${card.title}</div>
        <div style="margin-top:8px;font-size:12.5px;line-height:1.45;opacity:.74;color:currentColor">${card.body}</div>
      `;

      container.appendChild(node);

      requestAnimationFrame(() => {
        node.style.transition = 'transform 900ms cubic-bezier(.16,1,.3,1), opacity 320ms ease';
        node.style.opacity = '1';
        node.style.transform = `translate(-50%, -50%) translate(${dirX * 75}px, ${dirY * 75}px) scale(1) rotate(${rotate}deg)`;
      });

      window.setTimeout(() => {
        node.style.transition = 'transform 650ms ease, opacity 650ms ease';
        node.style.opacity = '0';
        node.style.transform = `translate(-50%, -50%) translate(${dirX * 120}px, ${dirY * 120}px) scale(0.92) rotate(${rotate * 1.2}deg)`;
      }, 820);

      window.setTimeout(() => node.remove(), 1550);
    };

    container.addEventListener('mousemove', handleMove);
    return () => container.removeEventListener('mousemove', handleMove);
  }, [enabled]);

  return containerRef;
};
