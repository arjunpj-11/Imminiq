/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef } from 'react';

interface IParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  vRotation: number;
  opacity: number;
}

const COLORS = [
  '#b84c2b', // brand rust
  '#e8816a', // brand coral
  '#2d6a47', // success green
  '#5cc98a', // bright green
  '#3b6cb7', // blue
  '#c49a2c', // gold
  '#f4c95d', // yellow
];

let globalTriggerConfetti: (() => void) | null = null;

export const triggerConfetti = () => {
  if (globalTriggerConfetti) {
    globalTriggerConfetti();
  }
};

export default function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: IParticle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const spawnConfetti = () => {
      const count = 75;
      const originX = canvas.width / 2;
      const originY = canvas.height * 0.4;

      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 8 + Math.random() * 12;

        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - 4,
          color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? '#b84c2b',
          size: 6 + Math.random() * 6,
          rotation: Math.random() * Math.PI * 2,
          vRotation: (Math.random() - 0.5) * 0.2,
          opacity: 1,
        });
      }
    };

    globalTriggerConfetti = spawnConfetti;

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles = particles.filter((p) => p.opacity > 0.01 && p.y < canvas.height + 20);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.98; // drag
        p.rotation += p.vRotation;
        p.opacity -= 0.012; // fade out

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      globalTriggerConfetti = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      aria-hidden="true"
    />
  );
}
