import {
  Link,
  useParams,
} from 'react-router-dom'
import ThemeToggle from '../../../components/ui/ThemeToggle'
import { useRoadmapEvaluationResult } from '../../../hooks/onboarding/useRoadmapEvaluationResult'
import type { MissingRoadmapTopic } from '../../../hooks/onboarding/useRoadmapEvaluationResult'
import { useAddMissingEvaluationTopic } from '../../../hooks/trackers/useAddMissingEvaluationTopic'

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(' ')
}

const LogoIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={cn('block shrink-0 rounded-xl', className)}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="10" y="10" width="80" height="80" rx="18" fill="#050505" />

      <g transform="translate(-5, 1)">
        <rect x="31" y="35" width="9" height="34" rx="4.5" fill="#fff8ed" />
        <circle cx="35.5" cy="28.5" r="5.3" fill="#f15a35" />

        <path
          d="M64 32.8 C73.8 34.7 79.5 42.2 79.5 51.5 C79.5 61.8 71.2 68 60.2 68 C53.2 68 48.2 65.5 45.1 60.8"
          fill="none"
          stroke="#fff8ed"
          strokeWidth="9"
          strokeLinecap="round"
        />

        <line
          x1="63.8"
          y1="55.5"
          x2="75.8"
          y2="67.5"
          stroke="#f15a35"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

const PlusIcon = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

const CheckIcon = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

const ArrowRightIcon = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export default function OnboardingRoadmapEvaluationScorePage() {
  const { jobId } = useParams<{ jobId: string }>()

  const {
    data,
    isLoading,
    error,
  } = useRoadmapEvaluationResult(jobId)

  const addMissingTopic =
    useAddMissingEvaluationTopic()

  const evaluation = data?.data?.evaluation
  const trackerId = data?.data?.trackerId

  const handleAddMissingTopic = async (
    topicIndex: number
  ) => {
    if (!trackerId || !jobId) {
      return
    }

    await addMissingTopic.mutateAsync({
      trackerId,
      evaluationJobId: jobId,
      topicIndex,
    })
  }

  return (
    <div className="min-h-screen bg-[#f5ede4] font-[DM_Sans,sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[#e0d0c5] bg-[#f5ede4]/95 px-5 backdrop-blur-xl dark:border-white/15 dark:bg-[#141412]/95 sm:px-8 md:px-12">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <LogoIcon className="h-8 w-8 rounded-lg" />

          <span className="text-[19px] font-bold tracking-[-0.5px]">
            immin
            <span className="text-[#b84c2b] dark:text-[#e8816a]">iq</span>
            <span className="text-[#b84c2b] dark:text-[#e8816a]">.</span>
          </span>
        </Link>

        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-280 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-10">
        {isLoading ? (
          <div className="flex min-h-130 items-center justify-center rounded-[20px] border border-[#e0d0c5] bg-[#fdf8f5] dark:border-white/15 dark:bg-[#1e1c19]">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 h-11 w-11 animate-spin rounded-full border-2 border-transparent border-t-[#b84c2b] dark:border-t-[#e8816a]" />

              <p className="font-serif text-xl font-bold">
                Loading AI evaluation report
              </p>
            </div>
          </div>
        ) : error || !evaluation ? (
          <div className="flex min-h-105 items-center justify-center rounded-[20px] border border-red-300 bg-red-50 p-6 text-center dark:border-red-400/30 dark:bg-red-400/10">
            <div>
              <h1 className="font-serif text-2xl font-bold text-red-700 dark:text-red-300">
                Evaluation result unavailable
              </h1>

              <p className="mt-3 max-w-130 text-sm leading-relaxed text-red-600 dark:text-red-200">
                {error?.message ||
                  'The final roadmap evaluation could not be loaded.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <section className="relative overflow-hidden rounded-[22px] bg-[#1a1714] px-6 py-8 text-[#fdf8f5] dark:bg-[#0f0e0c] sm:px-8">
              <div className="pointer-events-none absolute -right-20 -top-20 h-70 w-70 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.24)_0%,transparent_72%)]" />

              <div className="relative">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e8816a]">
                  Gemini Evaluation Complete
                </p>

                <h1 className="mt-2 max-w-205 font-serif text-[clamp(28px,5vw,44px)] font-extrabold leading-[1.08] tracking-[-1px]">
                  Your roadmap scored{' '}
                  <span className="text-[#f0a842]">
                    {evaluation.score}/100
                  </span>
                </h1>

                <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-bold text-[#fdf8f5]">
                  Grade: {evaluation.grade}
                </div>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
              <div className="rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 text-center dark:border-white/15 dark:bg-[#1e1c19]">
                <div className="mx-auto flex h-52.5 w-52.5 items-center justify-center rounded-full border-14 border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] dark:border-[rgba(232,129,106,0.18)] dark:bg-[rgba(232,129,106,0.10)]">
                  <div>
                    <div className="font-serif text-[68px] font-extrabold leading-none text-[#b84c2b] dark:text-[#e8816a]">
                      {evaluation.score}
                    </div>

                    <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#6b5f58] dark:text-[#9b9a92]">
                      Score / 100
                    </div>
                  </div>
                </div>

                <div className="mt-5 inline-flex rounded-full bg-[#1a1714] px-4 py-2 text-sm font-bold text-[#fdf8f5] dark:bg-[#f2f0eb] dark:text-[#141412]">
                  Grade: {evaluation.grade}
                </div>
              </div>

              <div className="rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 dark:border-white/15 dark:bg-[#1e1c19]">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#b84c2b] dark:text-[#e8816a]">
                  Evaluation Summary
                </p>

                <h2 className="mt-2 font-serif text-[26px] font-bold tracking-[-0.5px]">
                  What Gemini found
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#6b5f58] dark:text-[#9b9a92]">
                  {evaluation.summary}
                </p>
              </div>
            </section>

            <section className="rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 dark:border-white/15 dark:bg-[#1e1c19] sm:p-7">
              <div className="flex flex-col gap-2 border-b border-[#e0d0c5] pb-5 dark:border-white/15 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#b84c2b] dark:text-[#e8816a]">
                    Coverage Gaps
                  </p>

                  <h2 className="mt-2 font-serif text-[26px] font-bold tracking-[-0.5px]">
                    Missing topics to strengthen your tracker
                  </h2>
                </div>

                <span className="inline-flex w-fit rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                  {evaluation.missingTopics.length} additions
                </span>
              </div>

              {addMissingTopic.error && (
                <div className="mt-5 rounded-[14px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300">
                  {addMissingTopic.error.message}
                </div>
              )}

              <div className="mt-5 space-y-4">
                {evaluation.missingTopics.length ? (
                  evaluation.missingTopics.map((topic, index) => (
                    <MissingTopicCard
                      key={`${topic.title}-${index}`}
                      topic={topic}
                      isAdding={
                        addMissingTopic.isPending &&
                        addMissingTopic.variables?.topicIndex === index
                      }
                      onAdd={() => handleAddMissingTopic(index)}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-[rgba(76,175,125,0.24)] bg-[rgba(76,175,125,0.08)] px-5 py-5 text-sm leading-relaxed text-[#3c8b64] dark:text-[#5cc98a]">
                    Gemini did not find any major missing topic. Your roadmap coverage looks strong.
                  </div>
                )}
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-6 py-7 text-center shadow-[0_4px_24px_rgba(26,23,20,0.06)] dark:border-white/15 dark:bg-[#1e1c19] dark:shadow-[0_8px_40px_rgba(0,0,0,0.22)] sm:px-8 sm:py-8">
              <div className="pointer-events-none absolute -bottom-24 left-1/2 h-55 w-105 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.14)_0%,transparent_72%)] dark:bg-[radial-gradient(circle,rgba(232,129,106,0.13)_0%,transparent_72%)]" />

              <div className="relative mx-auto flex max-w-170 flex-col items-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(76,175,125,0.24)] bg-[rgba(76,175,125,0.10)] text-[#3c8b64] dark:border-[rgba(92,201,138,0.24)] dark:bg-[rgba(92,201,138,0.12)] dark:text-[#5cc98a]">
                  <CheckIcon />
                </div>

                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#b84c2b] dark:text-[#e8816a]">
                  Roadmap setup complete
                </p>

                <h2 className="mt-2 font-serif text-[clamp(24px,4vw,30px)] font-bold tracking-[-0.5px] text-[#1a1714] dark:text-[#f2f0eb]">
                  Ready to continue from your dashboard
                </h2>

                <p className="mt-3 max-w-145 text-sm leading-7 text-[#6b5f58] dark:text-[#9b9a92]">
                  Your roadmap has been generated, evaluated, and improved with the topics you chose to add.
                </p>

                <Link
                  to="/dashboard"
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#b84c2b] px-6 py-3.5 text-sm font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-[#963d22] hover:shadow-[0_8px_24px_rgba(184,76,43,0.24)] active:translate-y-0 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
                >
                  Go to Dashboard
                  <ArrowRightIcon />
                </Link>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function MissingTopicCard({
  topic,
  onAdd,
  isAdding,
}: {
  topic: MissingRoadmapTopic
  onAdd: () => void
  isAdding: boolean
}) {
  const isAdded =
    Boolean(topic.isAdded) ||
    Boolean(topic.addedSubtopicId)

  return (
    <div className="rounded-[18px] border border-[#e0d0c5] bg-[#f5ede4]/55 p-5 dark:border-white/15 dark:bg-[#141412]/45">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-[20px] font-bold tracking-[-0.3px] text-[#1a1714] dark:text-[#f2f0eb]">
              {topic.title}
            </h3>

            <span className="inline-flex rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
              Suggested addition
            </span>
          </div>

          <p className="mt-3 text-[13.5px] leading-6 text-[#6b5f58] dark:text-[#9b9a92]">
            {topic.description}
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-[#e0d0c5] bg-[#fdf8f5] px-4 py-3 dark:border-white/15 dark:bg-[#1e1c19]">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#6b5f58]/70 dark:text-[#9b9a92]/70">
                Why add this
              </p>

              <p className="mt-1.5 text-[12.5px] leading-5 text-[#6b5f58] dark:text-[#9b9a92]">
                {topic.reason}
              </p>
            </div>

            <div className="rounded-xl border border-[#e0d0c5] bg-[#fdf8f5] px-4 py-3 dark:border-white/15 dark:bg-[#1e1c19]">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#6b5f58]/70 dark:text-[#9b9a92]/70">
                Suggested placement
              </p>

              <p className="mt-1.5 text-[12.5px] font-semibold leading-5 text-[#b84c2b] dark:text-[#e8816a]">
                {topic.suggestedParentTitle}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={isAdded || isAdding}
          className={cn(
            'inline-flex h-fit shrink-0 items-center justify-center gap-2 rounded-[11px] px-4 py-3 text-sm font-bold transition',
            isAdded
              ? 'cursor-default bg-[rgba(76,175,125,0.14)] text-[#3c8b64] dark:bg-[rgba(92,201,138,0.16)] dark:text-[#5cc98a]'
              : 'bg-[#b84c2b] text-[#fdf8f5] hover:-translate-y-px hover:bg-[#963d22] hover:shadow-[0_6px_20px_rgba(184,76,43,0.24)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]'
          )}
        >
          {isAdded ? (
            <>
              <CheckIcon />
              Added
            </>
          ) : isAdding ? (
            'Adding...'
          ) : (
            <>
              <PlusIcon />
              Add
            </>
          )}
        </button>
      </div>
    </div>
  )
}