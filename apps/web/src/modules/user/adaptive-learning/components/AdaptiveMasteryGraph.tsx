import { useState } from 'react';
import type { IAdaptiveHistoryEntry } from '../types/adaptive-learning.types';

interface IAdaptiveMasteryGraphProps {
  history: IAdaptiveHistoryEntry[];
}

const formatLevel = (level?: string): string => {
  if (!level) return 'Foundation';
  return level.charAt(0).toUpperCase() + level.slice(1);
};

const formatDate = (isoString?: string): string => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

export default function AdaptiveMasteryGraph({ history }: IAdaptiveMasteryGraphProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const points = history.slice(-10);

  const width = 760;
  const height = 220;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const xFor = (index: number) => {
    if (points.length <= 1) {
      return paddingLeft + chartWidth / 2;
    }
    return paddingLeft + (index / (points.length - 1)) * chartWidth;
  };

  const yFor = (score: number) => {
    const clampedScore = Math.max(0, Math.min(100, score));
    return paddingTop + chartHeight - (clampedScore / 100) * chartHeight;
  };

  const polylinePoints = points
    .map((point, index) => `${xFor(index)},${yFor(point.masteryScore)}`)
    .join(' ');

  const areaPoints =
    points.length > 1
      ? `${xFor(0)},${paddingTop + chartHeight} ${polylinePoints} ${xFor(
          points.length - 1
        )},${paddingTop + chartHeight}`
      : points.length === 1
        ? `${paddingLeft},${paddingTop + chartHeight} ${paddingLeft},${yFor(
            points[0].masteryScore
          )} ${width - paddingRight},${yFor(points[0].masteryScore)} ${
            width - paddingRight
          },${paddingTop + chartHeight}`
        : '';

  const latestPoint = points.at(-1);
  const firstPoint = points[0];
  const netChange =
    firstPoint && latestPoint ? latestPoint.masteryScore - firstPoint.masteryScore : 0;

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <section className="overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1)">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.14em] text-(--brand-500)">
              Adaptive mastery
            </span>
            {latestPoint && (
              <span className="rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase text-(--brand-500) dark:border-[rgba(232,129,106,0.22)]">
                {formatLevel(latestPoint.level)}
              </span>
            )}
          </div>
          <h2 className="mt-1 font-ui text-[19px] font-black text-(--text-primary)">
            Level Movement
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-right">
          {points.length > 1 && (
            <span
              className={`font-mono text-[11px] font-bold ${
                netChange >= 0
                  ? 'text-(--brand-500) dark:text-(--brand-500)'
                  : 'text-(--danger) dark:text-(--danger)'
              }`}
            >
              {netChange >= 0 ? `+${netChange}%` : `${netChange}%`} overall
            </span>
          )}
          <span className="font-mono text-[13px] font-black text-(--text-primary)">
            {latestPoint ? `${latestPoint.masteryScore}%` : '0%'} mastery
          </span>
        </div>
      </div>

      <div className="relative mt-4">
        {points.length === 0 ? (
          <div className="flex h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-(--border-subtle) bg-[rgba(26,23,20,0.015)] p-6 text-center dark:bg-white/1.5">
            <p className="font-ui text-[14px] font-bold text-(--text-primary)">
              No mastery assessments recorded yet
            </p>
            <p className="mt-1 max-w-sm text-[12px] text-(--text-secondary)">
              Complete an adaptive exam or topic assessment to begin tracking your mastery timeline.
            </p>
          </div>
        ) : (
          <svg
            className="h-auto w-full overflow-visible"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Adaptive mastery history graph"
          >
            <defs>
              <linearGradient id="masteryAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand-500)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--brand-500)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {[0, 25, 50, 75, 100].map((score) => (
              <g key={score}>
                <line
                  x1={paddingLeft}
                  x2={width - paddingRight}
                  y1={yFor(score)}
                  y2={yFor(score)}
                  stroke="currentColor"
                  className="text-(--border-subtle)"
                  strokeDasharray="4 6"
                  strokeOpacity="0.6"
                />
                <text
                  x={paddingLeft - 8}
                  y={yFor(score) + 3}
                  textAnchor="end"
                  className="fill-(--text-secondary) font-mono text-[9px]"
                  style={{ opacity: 0.65 }}
                >
                  {score}%
                </text>
              </g>
            ))}

            {areaPoints && <polygon points={areaPoints} fill="url(#masteryAreaGradient)" />}

            {points.length === 1 && (
              <line
                x1={paddingLeft}
                x2={width - paddingRight}
                y1={yFor(points[0].masteryScore)}
                y2={yFor(points[0].masteryScore)}
                stroke="var(--brand-500)"
                strokeWidth="3.5"
                strokeDasharray="6 6"
              />
            )}

            {points.length > 1 && (
              <polyline
                points={polylinePoints}
                fill="none"
                stroke="var(--brand-500)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {points.map((point, index) => {
              const cx = xFor(index);
              const cy = yFor(point.masteryScore);
              const isHovered = hoveredIndex === index;
              const isLatest = index === points.length - 1;

              return (
                <g key={point.id} className="cursor-pointer">
                  {isLatest && !isHovered && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r="10"
                      fill="var(--brand-500)"
                      opacity="0.25"
                      className="animate-ping"
                    />
                  )}

                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 8 : 6}
                    fill={
                      point.change < 0
                        ? '#dc5b55'
                        : point.change > 0
                          ? 'var(--brand-500)'
                          : '#c49a2c'
                    }
                    stroke="var(--surface-card)"
                    strokeWidth="2.5"
                    className="transition-all duration-150"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <title>{`${point.masteryScore}% (${formatLevel(point.level)}) — ${
                      point.reason
                    }`}</title>
                  </circle>
                </g>
              );
            })}
          </svg>
        )}

        {hoveredPoint && hoveredIndex !== null && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-(--border-subtle) bg-(--surface-card) p-3 shadow-lg transition-all dark:border-(--border-subtle) dark:bg-(--surface-card)"
            style={{
              left: `${(xFor(hoveredIndex) / width) * 100}%`,
              top: `${(yFor(hoveredPoint.masteryScore) / height) * 100 - 12}%`,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-[13px] font-black text-(--text-primary)">
                {hoveredPoint.masteryScore}%
              </span>
              <span className="rounded-full bg-[rgba(184,76,43,0.1)] px-2 py-0.5 font-mono text-[9.5px] font-bold text-(--brand-500)">
                {formatLevel(hoveredPoint.level)}
              </span>
              {hoveredPoint.change !== 0 && (
                <span
                  className={`font-mono text-[10px] font-bold ${
                    hoveredPoint.change > 0 ? 'text-(--brand-500)' : 'text-(--danger)'
                  }`}
                >
                  {hoveredPoint.change > 0 ? `+${hoveredPoint.change}%` : `${hoveredPoint.change}%`}
                </span>
              )}
            </div>
            <p className="mt-1 max-w-[220px] text-[11px] leading-tight text-(--text-secondary)">
              {hoveredPoint.reason}
            </p>
            {hoveredPoint.recordedAt && (
              <div className="mt-1 font-mono text-[9px] text-[#b0a097] dark:text-[#6b6460]">
                {formatDate(hoveredPoint.recordedAt)}
              </div>
            )}
          </div>
        )}
      </div>

      {points.length > 0 && (
        <div className="mt-3 flex items-center justify-between text-[11px] text-(--text-secondary)">
          <span>First: {formatLevel(firstPoint?.level)}</span>
          <span className="font-mono text-[10px]">
            {points.length} {points.length === 1 ? 'assessment' : 'assessments'}
          </span>
          <span>Current: {formatLevel(latestPoint?.level)}</span>
        </div>
      )}
    </section>
  );
}
