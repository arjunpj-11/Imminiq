import { cn } from '../../../../../lib/cn';
import { normalizePercentage } from '../../../../../lib/bounded-number';
import type { RoadmapNode } from '../../utils/roadmap.types';
import { getNodeState } from '../../utils/roadmap.utils';
import EmbeddedLearningVideo from '../EmbeddedLearningVideo';

const LockIcon = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 10 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="1.5" y="4.5" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.1" />
    <path
      d="M3 4.5V3a2 2 0 0 1 4 0v1.5"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
    />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M5.5 3.5L9 7L5.5 10.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M2.5 7H11.5M8 3.5L11.5 7L8 10.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M3 8.5L6.5 12L13 5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CompassIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="9" cy="9" r="1.25" fill="currentColor" />
    <path d="M11.5 6.5L10 9L6.5 11.5L8 9L11.5 6.5Z" fill="currentColor" />
  </svg>
);

export const StarIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M9 2L10.85 6.74L16 7.27L12.25 10.47L13.41 15.5L9 12.77L4.59 15.5L5.75 10.47L2 7.27L7.15 6.74L9 2Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

export const LayersIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    aria-hidden="true"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const CodeIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M7 7L2.5 11L7 15M15 7L19.5 11L15 15"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M13 5L9 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const TypeIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M4 6h14M4 11h14M4 16h8"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const AtomIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="2" fill="currentColor" />
    <ellipse cx="11" cy="11" rx="8.5" ry="3.5" stroke="currentColor" strokeWidth="1.4" />
    <ellipse
      cx="11"
      cy="11"
      rx="8.5"
      ry="3.5"
      stroke="currentColor"
      strokeWidth="1.4"
      transform="rotate(60 11 11)"
    />
    <ellipse
      cx="11"
      cy="11"
      rx="8.5"
      ry="3.5"
      stroke="currentColor"
      strokeWidth="1.4"
      transform="rotate(120 11 11)"
    />
  </svg>
);

const ServerIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="2.5" y="3" width="17" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    <rect
      x="2.5"
      y="10.5"
      width="17"
      height="5.5"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <circle cx="5.5" cy="5.75" r="1" fill="currentColor" />
    <circle cx="5.5" cy="13.25" r="1" fill="currentColor" />
  </svg>
);

const TrainIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="4" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M4 9h14" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="M7 16.5L5 19M15 16.5L17 19"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <circle cx="7.5" cy="12.5" r="1.2" fill="currentColor" />
    <circle cx="14.5" cy="12.5" r="1.2" fill="currentColor" />
  </svg>
);

const LeafIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M18 4C18 4 10 4 6 9C3 13 5 19 5 19C5 19 8 17 11 15C14 13 18 4 18 4Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M5 19C5 19 8 14 11 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const DatabaseIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <ellipse cx="11" cy="5.5" rx="7.5" ry="2.5" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="M3.5 5.5V11C3.5 12.38 6.91 13.5 11 13.5C15.09 13.5 18.5 12.38 18.5 11V5.5"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <path
      d="M3.5 11V16.5C3.5 17.88 6.91 19 11 19C15.09 19 18.5 17.88 18.5 16.5V11"
      stroke="currentColor"
      strokeWidth="1.4"
    />
  </svg>
);

const PlugIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M8 3v4M14 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="5" y="7" width="12" height="6" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M11 13v3M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M11 3L4 6V11C4 14.87 7.13 18.28 11 19C14.87 18.28 18 14.87 18 11V6L11 3Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="M8 11L10.5 13.5L15 8.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RocketIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M11 3C11 3 16 5 16 11L13 14H9L6 11C6 5 11 3 11 3Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M9 14L8 18H14L13 14" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <circle cx="11" cy="9.5" r="1.5" fill="currentColor" />
    <path
      d="M6 11L3.5 13.5M16 11L18.5 13.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const MicIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="8" y="2.5" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="M5 11C5 14.31 7.69 17 11 17C14.31 17 17 14.31 17 11"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path d="M11 17V20M8.5 20H13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const PuzzleIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M9 3.5H6C5.17 3.5 4.5 4.17 4.5 5V8C5.33 8 6 8.67 6 9.5C6 10.33 5.33 11 4.5 11V14C4.5 14.83 5.17 15.5 6 15.5H9C9 14.67 9.67 14 10.5 14C11.33 14 12 14.67 12 15.5H15C15.83 15.5 16.5 14.83 16.5 14V11C15.67 11 15 10.33 15 9.5C15 8.67 15.67 8 16.5 8V5C16.5 4.17 15.83 3.5 15 3.5H12C12 4.33 11.33 5 10.5 5C9.67 5 9 4.33 9 3.5Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

const BookIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M4 4.5C4 4.5 6.5 3.5 11 3.5C15.5 3.5 18 4.5 18 4.5V18.5C18 18.5 15.5 17.5 11 17.5C6.5 17.5 4 18.5 4 18.5V4.5Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M11 3.5V17.5" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const BrainIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M8.5 5C6.5 5 4.5 6.5 4.5 9C4.5 10 5 10.5 5 11C5 12 4 12.5 4 13.5C4 15.5 5.5 17 7.5 17H11"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M13.5 5C15.5 5 17.5 6.5 17.5 9C17.5 10 17 10.5 17 11C17 12 18 12.5 18 13.5C18 15.5 16.5 17 14.5 17H11"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path d="M11 5V17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path
      d="M8 8.5C8.5 8 9.5 7.5 11 8"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path
      d="M14 8.5C13.5 8 12.5 7.5 11 8"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const WrenchIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M14.5 3.5C12.5 3.5 11 5 11 7C11 7.5 11.1 8 11.3 8.4L4.5 15.5C4 16 4 17 4.5 17.5C5 18 6 18 6.5 17.5L13.6 10.7C14 10.9 14.5 11 15 11C17 11 18.5 9.5 18.5 7.5C18.5 7 18.4 6.5 18.2 6.1L15.8 8.5L13.5 6.2L15.9 3.8C15.5 3.6 15 3.5 14.5 3.5Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

const LightbulbIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M11 3C8.24 3 6 5.24 6 8C6 10 7.1 11.8 8.75 12.75V15H13.25V12.75C14.9 11.8 16 10 16 8C16 5.24 13.76 3 11 3Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="M9 15H13M9.5 17.5H12.5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const TargetIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="11" cy="11" r="4.5" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="11" cy="11" r="1.5" fill="currentColor" />
  </svg>
);

const BoxIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M3.5 7L11 3.5L18.5 7V15L11 18.5L3.5 15V7Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M11 3.5V18.5M3.5 7L11 10.5L18.5 7" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const FALLBACK_ICONS = [
  <BookIcon />,
  <BrainIcon />,
  <WrenchIcon />,
  <LightbulbIcon />,
  <TargetIcon />,
  <BoxIcon />,
];

const getNodeIcon = (title: string, index: number): React.ReactNode => {
  const lower = title.toLowerCase();
  if (lower.includes('javascript')) return <CodeIcon />;
  if (lower.includes('typescript')) return <TypeIcon />;
  if (lower.includes('react')) return <AtomIcon />;
  if (lower.includes('node')) return <ServerIcon />;
  if (lower.includes('express')) return <TrainIcon />;
  if (lower.includes('mongo')) return <LeafIcon />;
  if (lower.includes('database')) return <DatabaseIcon />;
  if (lower.includes('api')) return <PlugIcon />;
  if (lower.includes('auth')) return <ShieldIcon />;
  if (lower.includes('deploy')) return <RocketIcon />;
  if (lower.includes('interview')) return <MicIcon />;
  if (lower.includes('project')) return <PuzzleIcon />;
  return FALLBACK_ICONS[index % FALLBACK_ICONS.length];
};

export function FlowConnector({ direction }: { direction: 'down' | 'left' | 'right' }) {
  if (direction === 'down') {
    return (
      <div className="h-14 w-full">
        <svg
          viewBox="0 0 600 60"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          <line
            x1="300"
            y1="0"
            x2="300"
            y2="60"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="5 4"
            className="text-[rgba(184,76,43,0.30)] dark:text-[rgba(232,129,106,0.28)]"
          />
        </svg>
      </div>
    );
  }
  return (
    <div className="h-20 w-full max-w-150">
      <svg
        viewBox="0 0 600 90"
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
      >
        <path
          d={direction === 'right' ? 'M 160 0 Q 160 90 440 90' : 'M 440 0 Q 440 90 160 90'}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 4"
          className="text-[rgba(184,76,43,0.30)] dark:text-[rgba(232,129,106,0.28)]"
        />
      </svg>
    </div>
  );
}

// ─── Roadmap flow node ────────────────────────────────────────────────────────

export function RoadmapFlowNode({
  node,
  index,
  isFirstLevel,
  onClick,
}: {
  node: RoadmapNode;
  index: number;
  isFirstLevel: boolean;
  onClick: () => void;
}) {
  const state = getNodeState(node, isFirstLevel);
  const progress = normalizePercentage(node.progressPercent);

  const locked = state === 'locked';
  const completed = state === 'completed';
  const active = state === 'active';
  const hasChildren = node.children.length > 0;

  return (
    <div
      className={cn(
        'flex w-full',
        index % 2 === 0 && 'justify-start',
        index % 2 === 1 && 'justify-end'
      )}
    >
      <div className="w-[min(420px,90%)]">
        <button
          type="button"
          disabled={locked}
          onClick={onClick}
          aria-label={
            locked
              ? `${node.title}. Locked until the previous topic is completed.`
              : `${node.title}. ${hasChildren ? 'Open topic.' : 'Open lesson.'}`
          }
          title={locked ? 'Complete the previous topic to unlock this step.' : undefined}
          className={cn(
            'group relative w-full overflow-hidden rounded-lg border-[1.5px] bg-(--surface-card) p-4.5 text-left shadow-[0_4px_24px_rgba(26,23,20,0.08),0_1px_4px_rgba(26,23,20,0.05)] transition dark:bg-(--surface-card) dark:shadow-[0_4px_24px_rgba(0,0,0,0.30),0_1px_4px_rgba(0,0,0,0.20)]',
            locked &&
              'cursor-not-allowed border-(--border-subtle) opacity-70 dark:border-(--border-subtle)',
            !locked &&
              'cursor-pointer border-(--border-subtle) hover:-translate-y-1 hover:border-[rgba(184,76,43,0.22)] hover:shadow-[0_8px_40px_rgba(184,76,43,0.18)] dark:border-(--border-subtle) dark:hover:border-[rgba(232,129,106,0.24)]',
            active &&
              'border-(--brand-500) shadow-[0_8px_40px_rgba(184,76,43,0.18)] dark:border-(--brand-500)',
            completed && 'border-[rgba(45,106,71,0.20)] dark:border-[rgba(92,201,138,0.22)]'
          )}
        >
          {(active || completed) && (
            <div
              className={cn(
                'absolute left-0 right-0 top-0 h-0.75',
                completed
                  ? 'bg-linear-to-r from-[#70d49a] to-(--success)'
                  : 'bg-linear-to-r from-(--brand-500) to-(--brand-500)'
              )}
            />
          )}

          <div className="pointer-events-none absolute inset-0 rounded-lg bg-linear-to-br from-white/50 to-transparent dark:from-white/3" />

          <div className="relative flex items-center gap-4">
            <div className="relative flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[rgba(184,76,43,0.08)] text-(--brand-500) dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
              {getNodeIcon(node.title, index)}
              {locked && (
                <div className="absolute bottom-0.75 right-0.75 flex h-5 w-5 items-center justify-center rounded-md border border-(--border-subtle) bg-(--surface-card) text-(--text-secondary) dark:border-(--border-subtle) dark:bg-(--surface-elevated) dark:text-(--text-secondary)">
                  <LockIcon />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-(--text-secondary) opacity-70 dark:text-(--text-secondary)">
                {node.nodeType === 'topic' ? `Topic ${node.order}` : `Level ${node.order}`}
              </div>

              <h3 className="font-ui text-[18px] font-extrabold tracking-[-0.3px] text-(--text-primary) dark:text-(--text-primary)">
                {node.title}
              </h3>

              <p className="mt-1 line-clamp-2 text-[12px] leading-[1.45] text-(--text-secondary) dark:text-(--text-secondary)">
                {node.description ||
                  (hasChildren
                    ? 'Open this node to go deeper.'
                    : 'Open the lesson and start learning.')}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em]',
                    locked &&
                      'border-(--border-subtle) bg-[rgba(26,23,20,0.04)] text-(--text-secondary) dark:border-(--border-subtle) dark:bg-white/6 dark:text-(--text-secondary)',
                    active &&
                      'border-[rgba(184,76,43,0.20)] bg-[rgba(184,76,43,0.08)] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)',
                    completed &&
                      'border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] text-(--success) dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-(--success)',
                    state === 'available' &&
                      'border-(--border-subtle) bg-transparent text-(--text-secondary) dark:border-(--border-subtle) dark:text-(--text-secondary)'
                  )}
                >
                  {locked
                    ? 'Complete previous topic'
                    : completed
                      ? 'Completed'
                      : active
                        ? 'In Progress'
                        : hasChildren
                          ? 'Open'
                          : 'Lesson'}
                </span>

                {!locked && (
                  <>
                    <div className="h-1.25 min-w-18 flex-1 overflow-hidden rounded-full bg-[rgba(26,23,20,0.09)] dark:bg-white/9">
                      <div
                        className={cn(
                          'h-full rounded-full bg-linear-to-r',
                          completed
                            ? 'from-[#70d49a] to-(--success)'
                            : 'from-(--brand-500) to-(--brand-500)'
                        )}
                        style={{ width: `${completed ? 100 : progress}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-(--text-secondary) dark:text-(--text-secondary)">
                      {completed ? 100 : progress}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {!locked && (
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition group-hover:translate-x-0.5',
                  completed
                    ? 'bg-(--success)'
                    : 'bg-(--brand-500) dark:bg-(--brand-500) dark:text-[#141412]'
                )}
              >
                {hasChildren ? <ChevronRightIcon /> : <ArrowRightIcon />}
              </div>
            )}
          </div>
        </button>

        {node.learningVideo && (
          <EmbeddedLearningVideo video={node.learningVideo} className="mt-2.5" />
        )}
      </div>
    </div>
  );
}
