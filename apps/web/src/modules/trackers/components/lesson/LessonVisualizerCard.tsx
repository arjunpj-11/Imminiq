// apps/web/src/modules/trackers/components/lesson/LessonVisualizerCard.tsx

import { useEffect, useRef, useState } from 'react'
import { useGenerateLessonVisualization } from '../../hooks/useTrackers'
import { cn } from '../../utils/tracker-ui'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  trackerId: string
  subtopicId: string
  lessonTitle: string
}

// ─── Sparkle icon ─────────────────────────────────────────────────────────────

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
  )
}

// ─── Animated loading dots ────────────────────────────────────────────────────

function GeneratingPulse() {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-[rgba(184,76,43,0.12)] dark:bg-[rgba(232,129,106,0.10)]" />
        <span className="absolute inset-2 animate-pulse rounded-full bg-[rgba(184,76,43,0.08)] dark:bg-[rgba(232,129,106,0.08)]" />
        <SparkleIcon className="relative h-6 w-6 text-[#b84c2b] dark:text-[#e8816a]" />
      </div>

      <div className="text-center">
        <p className="font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.14em] text-[#b84c2b] dark:text-[#e8816a]">
          Gemini is thinking
        </p>
        <p className="mt-1 text-[12px] text-[#6b5f58] dark:text-[#9b9a92]">
          Crafting your visualization...
        </p>
      </div>

      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-[#b84c2b] dark:bg-[#e8816a]"
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
  )
}

// ─── Scaled iframe that fits Gemini's output without clipping ─────────────────
//
// Gemini tends to generate HTML at a fixed ~1100–1400px wide canvas.
// We render it at GEMINI_CANVAS_W × GEMINI_CANVAS_H inside the iframe, then
// use CSS transform: scale() to shrink it so it fills the available modal area
// without scrollbars and without cutting anything off.

const GEMINI_CANVAS_W = 1280
const GEMINI_CANVAS_H = 900

function ScaledIframe({
  html,
  title,
}: {
  html: string
  title: string
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    const recalc = () => {
      const scaleX = el.clientWidth / GEMINI_CANVAS_W
      const scaleY = el.clientHeight / GEMINI_CANVAS_H
      // Use the smaller axis so nothing is clipped; cap at 1 (never upscale)
      setScale(Math.min(scaleX, scaleY, 1))
    }

    recalc()

    const ro = new ResizeObserver(recalc)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    // Outer wrapper — fills modal body, hides any stray overflow
    <div ref={wrapperRef} className="relative h-full w-full overflow-hidden bg-[#0a0a0a]">
      {/*
        Inner container positioned at top-left, sized to the Gemini canvas,
        then scaled down. transform-origin top-left keeps it anchored to the
        top-left corner so nothing disappears behind the header.
      */}
      <div
        style={{
          width: GEMINI_CANVAS_W,
          height: GEMINI_CANVAS_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <iframe
          srcDoc={html}
          sandbox="allow-scripts"
          title={title}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            colorScheme: 'dark',
            display: 'block',
          }}
        />
      </div>
    </div>
  )
}

// ─── Visualizer modal ────────────────────────────────────────────────────────

function VisualizerModal({
  html,
  lessonTitle,
  onClose,
  onRegenerate,
  isRegenerating,
}: {
  html: string
  lessonTitle: string
  onClose: () => void
  onRegenerate: () => void
  isRegenerating: boolean
}) {
  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-130 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex h-[min(820px,94vh)] w-[min(1100px,96vw)] flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#0a0a0a] shadow-[0_24px_80px_rgba(0,0,0,0.85)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/8 bg-[#111] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <SparkleIcon className="h-4 w-4 text-[#e8816a]" />
            <div>
              <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.16em] text-[#e8816a]">
                AI Visualizer
              </span>
              <p className="mt-0.5 line-clamp-1 text-[13px] font-semibold text-[#f2f0eb]">
                {lessonTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="rounded-[10px] border border-white/12 bg-[#1a1a1a] px-3.5 py-1.5 font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#888] transition hover:border-[#e8816a]/40 hover:bg-[rgba(232,129,106,0.08)] hover:text-[#e8816a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRegenerating ? 'Regenerating...' : '↺ Regenerate'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-white/12 bg-[#1a1a1a] text-[#666] transition hover:bg-[#252525] hover:text-[#f2f0eb]"
              aria-label="Close visualizer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Canvas — flex-1 so it fills all space between header and footer */}
        <div className="relative min-h-0 flex-1">
          {isRegenerating ? (
            <div className="flex h-full items-center justify-center bg-[#0a0a0a]">
              <GeneratingPulse />
            </div>
          ) : (
            <ScaledIframe html={html} title={`${lessonTitle} Visualization`} />
          )}
        </div>

        {/* Footer hint */}
        <div className="shrink-0 border-t border-white/8 bg-[#0e0e0e] px-5 py-2">
          <p className="text-center font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.12em] text-[#333]">
            Interactive — use the controls inside the visualization to explore
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LessonVisualizerCard({
  trackerId,
  subtopicId,
  lessonTitle,
}: Props) {
  const visualizeMutation = useGenerateLessonVisualization()

  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cache key — reset HTML when lesson changes
  const prevSubtopicIdRef = useRef(subtopicId)
  useEffect(() => {
    if (prevSubtopicIdRef.current !== subtopicId) {
      prevSubtopicIdRef.current = subtopicId
      setGeneratedHtml(null)
      setError(null)
    }
  }, [subtopicId])

  const isGenerating = visualizeMutation.isPending

  const generate = () => {
    setError(null)
    visualizeMutation.mutate(
      { trackerId, subtopicId },
      {
        onSuccess: (data) => {
          setGeneratedHtml(data.data.html)
          setModalOpen(true)
        },
        onError: (err) => {
          setError(err.message || 'Failed to generate visualization.')
        },
      }
    )
  }

  const handleOpenOrGenerate = () => {
    if (generatedHtml) {
      setModalOpen(true)
    } else {
      generate()
    }
  }

  const handleRegenerate = () => {
    setGeneratedHtml(null)
    setError(null)
    visualizeMutation.mutate(
      { trackerId, subtopicId, regenerate: true },
      {
        onSuccess: (data) => {
          setGeneratedHtml(data.data.html)
          setModalOpen(true)
        },
        onError: (err) => {
          setError(err.message || 'Failed to generate visualization.')
        },
      }
    )
  }

  const isReady = Boolean(generatedHtml) && !isGenerating

  return (
    <>
      <section className="rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-[#e0d0c5] pb-3.5 dark:border-white/9">
          <div className="flex items-center gap-2">
            <SparkleIcon className="h-4 w-4 text-[#b84c2b] dark:text-[#e8816a]" />
            <h3 className="text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
              AI Visualizer
            </h3>
          </div>

          <span className="rounded-full border border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] px-2.5 py-1 font-['DM_Mono',monospace] text-[8.5px] font-bold uppercase tracking-wider text-[#2d6a47] dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]">
            Gemini Flash
          </span>
        </div>

        {/* Body */}
        {isGenerating ? (
          <GeneratingPulse />
        ) : (
          <div className="flex flex-col gap-3.5">
            {/* Description */}
            <p className="text-[12.5px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
              {isReady
                ? 'Your visualization is ready. Open it to explore the concept interactively.'
                : `Generate an interactive canvas visualization powered by Gemini that demonstrates "${lessonTitle}" visually.`}
            </p>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-[rgba(200,50,50,0.22)] bg-[rgba(200,50,50,0.06)] px-3.5 py-2.5 text-[11.5px] leading-[1.55] text-red-600 dark:border-[rgba(255,100,100,0.20)] dark:bg-[rgba(255,100,100,0.07)] dark:text-red-400">
                {error}
              </div>
            )}

            {/* Ready state: preview badge */}
            {isReady && (
              <div className="flex items-center gap-2 rounded-xl border border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.07)] px-3.5 py-2.5 dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.08)]">
                <span className="text-[14px]">✦</span>
                <p className="text-[11.5px] font-medium text-[#2d6a47] dark:text-[#5cc98a]">
                  Visualization generated
                </p>
              </div>
            )}

            {/* CTA button */}
            <button
              type="button"
              onClick={handleOpenOrGenerate}
              disabled={isGenerating}
              className={cn(
                'relative w-full overflow-hidden rounded-[13px] px-4 py-3 text-[12.5px] font-bold tracking-[0.01em] transition-all duration-200',
                'disabled:cursor-not-allowed disabled:opacity-60',
                isReady
                  ? 'border-[1.5px] border-[rgba(184,76,43,0.30)] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] hover:bg-[rgba(184,76,43,0.14)] hover:border-[rgba(184,76,43,0.50)] dark:border-[rgba(232,129,106,0.28)] dark:bg-[rgba(232,129,106,0.09)] dark:text-[#e8816a] dark:hover:bg-[rgba(232,129,106,0.15)]'
                  : 'bg-[#b84c2b] text-white shadow-[0_4px_18px_rgba(184,76,43,0.32)] hover:bg-[#a03d22] hover:shadow-[0_6px_24px_rgba(184,76,43,0.42)] dark:bg-[#c85d3a] dark:hover:bg-[#b84c2b]'
              )}
            >
              <span className="flex items-center justify-center gap-2">
                <SparkleIcon className="h-3.5 w-3.5" />
                {isReady ? 'Open Visualization' : 'Generate Visualization'}
              </span>
            </button>

            {/* Regenerate link */}
            {isReady && (
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="text-center font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#6b5f58]/60 underline-offset-2 transition hover:text-[#b84c2b] hover:underline disabled:cursor-not-allowed dark:text-[#9b9a92]/50 dark:hover:text-[#e8816a]"
              >
                Regenerate
              </button>
            )}
          </div>
        )}
      </section>

      {/* Modal */}
      {modalOpen && generatedHtml && (
        <VisualizerModal
          html={generatedHtml}
          lessonTitle={lessonTitle}
          onClose={() => setModalOpen(false)}
          onRegenerate={handleRegenerate}
          isRegenerating={isGenerating}
        />
      )}
    </>
  )
}