import { useId, type CSSProperties } from 'react';

interface IImminiqProgressMarkProps {
  progress: number;
  active?: boolean;
  settled?: boolean;
  fade?: boolean;
  isDark?: boolean;
  size?: number;
}

/** The shared Imminiq scan-reveal mark used by both startup and route loading. */
export default function ImminiqProgressMark({
  progress,
  active = true,
  settled = false,
  fade = false,
  isDark = false,
  size = 96,
}: IImminiqProgressMarkProps) {
  const clipId = `im-reveal-${useId().replace(/:/g, '')}`;
  const boundedProgress = Math.min(100, Math.max(0, progress));
  const rust = isDark ? '#e8816a' : '#b84c2b';
  const clipWidth = (boundedProgress / 100) * 80;

  return (
    <div
      aria-hidden="true"
      style={{ width: size + 24, height: size + 24, position: 'relative' }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `conic-gradient(${rust} ${boundedProgress * 3.6}deg, transparent 0)`,
          WebkitMask:
            'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          opacity: active && !fade ? 1 : 0,
          transform: `scale(${active ? 1 : 0.86})`,
          transition: 'opacity .4s ease, transform .45s cubic-bezier(.34,1.56,.64,1)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 6,
          borderRadius: 22,
          background: rust,
          filter: 'blur(20px)',
          opacity: settled ? (isDark ? 0.35 : 0.15) : 0,
          transition: 'opacity .7s ease',
          pointerEvents: 'none',
        }}
      />

      {!isDark && (
        <div
          style={{
            position: 'absolute',
            inset: 12,
            borderRadius: 18,
            boxShadow: '0 0 0 1px rgba(26,23,20,0.10), 0 4px 24px rgba(26,23,20,0.10)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      )}

      <div style={{ position: 'absolute', inset: 12 }}>
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'relative',
            zIndex: 1,
            overflow: 'visible',
            transform: settled ? 'scale(1)' : 'scale(.97)',
            transition: 'transform .45s cubic-bezier(.34,1.56,.64,1)',
          }}
        >
          <rect
            x="10"
            y="10"
            width="80"
            height="80"
            rx="18"
            fill="#1e1c19"
            style={{ opacity: active ? 1 : 0, transition: 'opacity .3s ease' }}
          />
          <clipPath id={clipId}>
            <rect x="10" y="10" width={clipWidth} height="80" />
          </clipPath>
          <g clipPath={`url(#${clipId})`}>
            <line
              x1="28"
              y1="38"
              x2="28"
              y2="69"
              stroke="#fff8ed"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <circle cx="28" cy="26" r="5.3" fill={rust} />
            <path
              d="M63 33.8 C72.8 35.7 78.5 43.2 78.5 52.5 C78.5 62.8 70.2 69 59.2 69 C52.2 69 47.2 66.5 44.1 61.8"
              fill="none"
              stroke="#fff8ed"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <line
              x1="62.8"
              y1="56.5"
              x2="74.8"
              y2="68.5"
              stroke={rust}
              strokeWidth="9"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      <div
        style={
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: -26,
            textAlign: 'center',
            fontFamily: "'SFMono-Regular', Consolas, monospace",
            fontVariantNumeric: 'tabular-nums',
            fontSize: 11,
            letterSpacing: '0.08em',
            color: rust,
            opacity: active && !fade ? 0.85 : 0,
            transition: 'opacity .35s ease',
          } as CSSProperties
        }
      >
        {String(Math.round(boundedProgress)).padStart(2, '0')}%
      </div>
    </div>
  );
}
