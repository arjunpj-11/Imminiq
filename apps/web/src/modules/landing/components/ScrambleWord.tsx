import { useEffect, useRef } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&';
const SCRAMBLE_FRAMES = 9;
const FRAME_MS = 42;
const LETTER_GAP_MS = 68;

export default function ScrambleWord({
  text,
  delay = 0,
  skip = false,
  className = '',
  accentFromIndex,
  accentClassName = 'text-[#b84c2b] dark:text-[#e8816a]',
  onDone,
}: {
  text: string;
  delay?: number;
  skip?: boolean; // if true, instantly show final text with no animation
  className?: string;
  accentFromIndex?: number;
  accentClassName?: string;
  onDone?: () => void;
}) {
  const refs = useRef<Array<HTMLSpanElement | null>>([]);
  const doneCount = useRef(0);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    doneCount.current = 0;
    const timers: number[] = [];

    // Skip animation — instantly set final chars, no scramble
    const showFinal = () => {
      refs.current.forEach((node, i) => {
        if (node) node.textContent = text[i] === ' ' ? '\u00A0' : text[i];
      });
      onDoneRef.current?.();
    };

    if (skip) {
      showFinal();
      return;
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      showFinal();
      return;
    }

    refs.current.forEach((node, index) => {
      if (!node) return;
      const finalChar = text[index] || '';
      if (finalChar === ' ') {
        node.textContent = '\u00A0';
        doneCount.current++;
        if (doneCount.current === text.length) onDoneRef.current?.();
        return;
      }

      const startTimer = window.setTimeout(
        () => {
          let frame = 0;
          node.style.color = '#e8816a';
          const iv = window.setInterval(() => {
            if (frame < SCRAMBLE_FRAMES) {
              node.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
              frame++;
            } else {
              window.clearInterval(iv);
              node.textContent = finalChar;
              node.style.color = '';
              doneCount.current++;
              if (doneCount.current === text.length) onDoneRef.current?.();
            }
          }, FRAME_MS);
          timers.push(iv);
        },
        delay + index * LETTER_GAP_MS
      );

      timers.push(startTimer);
    });

    return () =>
      timers.forEach((t) => {
        window.clearTimeout(t);
        window.clearInterval(t);
      });
  }, [delay, text, skip]);

  return (
    <span className={`landing-word ${className}`}>
      {text.split('').map((char, index) => (
        <span
          key={`${char}-${index}`}
          ref={(node) => {
            refs.current[index] = node;
          }}
          aria-hidden="true"
          className={
            accentFromIndex !== undefined && index >= accentFromIndex ? accentClassName : undefined
          }
          style={{ display: 'inline-block', transition: 'color 0.15s' }}
        >
          {char === ' ' ? '\u00A0' : ''}
        </span>
      ))}
    </span>
  );
}
