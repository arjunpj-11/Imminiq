import { useEffect, useRef, useState } from 'react';
import { getUserFacingError } from '../../../../../lib/user-facing-error';
import { toast } from '../../../../../lib/toast';
import { useGenerateLessonVisualization } from '../../hooks/useTrackers';
import { cn } from '../../utils/tracker-ui';

interface IProps {
  trackerId: string;
  subtopicId: string;
  lessonTitle: string;
  visualizationKind?: string;
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 2L11.5 8.5L18 10L11.5 11.5L10 18L8.5 11.5L2 10L8.5 8.5L10 2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GeneratingPulse() {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-[rgba(184,76,43,0.12)] dark:bg-[rgba(232,129,106,0.10)]" />
        <span className="absolute inset-2 animate-pulse rounded-full bg-[rgba(184,76,43,0.08)] dark:bg-[rgba(232,129,106,0.08)]" />
        <SparkleIcon className="relative h-6 w-6 text-(--brand-500) dark:text-(--brand-500)" />
      </div>

      <div className="text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-(--brand-500) dark:text-(--brand-500)">
          Gemini is thinking
        </p>
        <p className="mt-1 text-[12px] text-(--text-secondary) dark:text-(--text-secondary)">
          Crafting your visualization...
        </p>
      </div>

      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-(--brand-500) dark:bg-(--brand-500)"
            style={{
              animation: `bounce 1.2s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function VisualizationFrame({ html, title }: { html: string; title: string }) {
  return (
    <iframe
      srcDoc={html}
      sandbox="allow-scripts"
      title={title}
      className="block h-full w-full border-0 bg-[#0a0a0a]"
      style={{ colorScheme: 'dark' }}
    />
  );
}

function VisualizerModal({
  html,
  lessonTitle,
  visualTitle,
  visualDescription,
  onClose,
  onRegenerate,
  isRegenerating,
}: {
  html: string;
  lessonTitle: string;
  visualTitle: string;
  visualDescription: string;
  onClose: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-130 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={visualTitle || `${lessonTitle} visualization`}
    >
      <div
        className="relative flex h-[min(860px,94vh)] w-[min(1240px,97vw)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-[0_24px_80px_rgba(0,0,0,0.85)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/8 bg-[#111] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <SparkleIcon className="h-4 w-4 text-(--brand-500)" />
            <div>
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-(--brand-500)">
                Interactive lesson
              </span>
              <p className="mt-0.5 line-clamp-1 text-[13px] font-semibold text-[#f2f0eb]">
                {visualTitle || lessonTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="rounded-md border border-white/12 bg-[#1a1a1a] px-3.5 py-1.5 font-mono text-[9px] uppercase tracking-widest text-[#888] transition hover:border-(--brand-500)/40 hover:bg-[rgba(232,129,106,0.08)] hover:text-(--brand-500) disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRegenerating ? 'Regenerating...' : '↺ Regenerate'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-white/12 bg-[#1a1a1a] text-[#666] transition hover:bg-[#252525] hover:text-[#f2f0eb]"
              aria-label="Close visualizer"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1">
          {isRegenerating ? (
            <div className="flex h-full items-center justify-center bg-[#0a0a0a]">
              <GeneratingPulse />
            </div>
          ) : (
            <VisualizationFrame html={html} title={`${lessonTitle} visualization`} />
          )}
        </div>

        <div className="shrink-0 border-t border-white/8 bg-[#0e0e0e] px-5 py-2.5">
          <p className="text-center text-[10px] text-[#777]">
            {visualDescription || 'Use the controls inside the visualization to explore each step.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LessonVisualizerCard({
  trackerId,
  subtopicId,
  lessonTitle,
  visualizationKind,
}: IProps) {
  const visualizeMutation = useGenerateLessonVisualization();

  const [visualization, setVisualization] = useState<{
    html: string;
    visualTitle: string;
    visualDescription: string;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const prevSubtopicIdRef = useRef(subtopicId);
  useEffect(() => {
    if (prevSubtopicIdRef.current !== subtopicId) {
      prevSubtopicIdRef.current = subtopicId;
      setVisualization(null);
      setModalOpen(false);
    }
  }, [subtopicId]);

  const isGenerating = visualizeMutation.isPending;

  const generate = () => {
    visualizeMutation.mutate(
      { trackerId, subtopicId },
      {
        onSuccess: (data) => {
          setVisualization(data.data);
          setModalOpen(true);
        },
        onError: (err) => {
          toast.error(
            'Visualization not generated',
            getUserFacingError(err, 'Failed to generate visualization.')
          );
        },
      }
    );
  };

  const handleOpenOrGenerate = () => {
    if (visualization) {
      setModalOpen(true);
    } else {
      generate();
    }
  };

  const handleRegenerate = () => {
    visualizeMutation.mutate(
      { trackerId, subtopicId, regenerate: true },
      {
        onSuccess: (data) => {
          setVisualization(data.data);
          setModalOpen(true);
        },
        onError: (err) => {
          toast.error(
            'Visualization not regenerated',
            getUserFacingError(err, 'Failed to generate visualization.')
          );
        },
      }
    );
  };

  const isReady = Boolean(visualization) && !isGenerating;
  const kindLabel = visualizationKind
    ? `${visualizationKind.replaceAll('_', ' ')} visualization`
    : 'Interactive visualization';

  return (
    <>
      <div>
        <button
          type="button"
          onClick={handleOpenOrGenerate}
          disabled={isGenerating}
          className={cn(
            'group flex w-full items-center gap-3 rounded-xl border-[1.5px] px-4 py-3.5 text-left shadow-(--shadow-1) transition',
            'disabled:cursor-wait disabled:opacity-70',
            isReady
              ? 'border-[rgba(45,106,71,0.25)] bg-[rgba(45,106,71,0.07)] hover:border-(--success)'
              : 'border-[rgba(184,76,43,0.26)] bg-[linear-gradient(135deg,rgba(184,76,43,0.10),rgba(184,76,43,0.03))] hover:-translate-y-px hover:border-(--brand-500)'
          )}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-(--brand-500) text-white shadow-[0_5px_16px_rgba(184,76,43,0.25)]">
            <SparkleIcon className={cn('h-4 w-4', isGenerating && 'animate-pulse')} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-bold text-(--text-primary)">
              {isGenerating
                ? 'Building visualization…'
                : isReady
                  ? 'Open visualization'
                  : 'Visualize this lesson'}
            </span>
            <span className="mt-0.5 block truncate text-[10.5px] capitalize text-(--text-secondary)">
              {kindLabel}
            </span>
          </span>
          <span
            aria-hidden="true"
            className="text-(--brand-500) transition group-hover:translate-x-0.5"
          >
            ↗
          </span>
        </button>
      </div>

      {modalOpen && visualization && (
        <VisualizerModal
          html={visualization.html}
          lessonTitle={lessonTitle}
          visualTitle={visualization.visualTitle}
          visualDescription={visualization.visualDescription}
          onClose={() => setModalOpen(false)}
          onRegenerate={handleRegenerate}
          isRegenerating={isGenerating}
        />
      )}
    </>
  );
}
