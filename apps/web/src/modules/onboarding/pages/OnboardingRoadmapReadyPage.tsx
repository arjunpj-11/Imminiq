import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import {
  useRoadmapJobResult,
  type RoadmapSubtopic,
  type RoadmapTopic,
} from '../hooks/useRoadmapJobResult'
import { useRunRoadmapEvaluation } from '../hooks/useRunRoadmapEvaluation'
import { OnboardingLogoIcon as LogoIcon } from '../components/OnboardingLogoIcon'
import type { Section } from '../types/onboarding.types'
import { cn } from '../utils/cn'
import { capitalize } from '../utils/onboarding-formatters'

const ChevronDownIcon = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

const PulseIcon = () => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

const DashboardIcon = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}

const getChildren = (node?: RoadmapSubtopic) => {
  return node?.children || node?.subtopics || []
}

const countNestedSubtopics = (nodes: RoadmapSubtopic[] = []): number => {
  return nodes.reduce((total, node) => {
    return total + 1 + countNestedSubtopics(getChildren(node))
  }, 0)
}

const buildSections = (topic?: RoadmapTopic): Section[] => {
  if (!topic) return []

  const directChildren = topic.children || topic.subtopics || []

  if (!directChildren.length) {
    return []
  }

  const groupedChildren = directChildren.filter((child) => {
    return getChildren(child).length > 0
  })

  const leafChildren = directChildren.filter((child) => {
    return getChildren(child).length === 0
  })

  const sections: Section[] = groupedChildren.map((child, index) => {
    return {
      id: child._id || `${topic._id}-section-${index}`,
      title: child.title || `Section ${index + 1}`,
      items: getChildren(child),
    }
  })

  if (leafChildren.length) {
    sections.unshift({
      id: `${topic._id}-core-roadmap`,
      title: groupedChildren.length ? 'Core Topics' : 'Roadmap Topics',
      items: leafChildren,
    })
  }

  return sections
}

const flattenSectionCount = (topic?: RoadmapTopic) => {
  return countNestedSubtopics(topic?.children || topic?.subtopics || [])
}

const SectionDifficultyBadge = ({
  item,
}: {
  item: RoadmapSubtopic
}) => {
  const difficulty = item.difficulty || item.level

  if (!difficulty) {
    return null
  }

  return (
    <span
      className={cn(
        'shrink-0 whitespace-nowrap rounded-sm border px-2 py-0.75 font-mono text-[8px] uppercase tracking-widest',
        difficulty === 'beginner' &&
          'border-[rgba(76,175,125,0.25)] bg-[rgba(76,175,125,0.10)] text-[#4caf7d] dark:border-[rgba(92,201,138,0.25)] dark:bg-[rgba(92,201,138,0.12)] dark:text-[#5cc98a]',
        difficulty === 'intermediate' &&
          'border-[rgba(201,128,0,0.22)] bg-[rgba(201,128,0,0.09)] text-[#c98000] dark:border-[rgba(240,168,66,0.26)] dark:bg-[rgba(240,168,66,0.12)] dark:text-[#f0a842]',
        difficulty === 'advanced' &&
          'border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]'
      )}
    >
      {difficulty}
    </span>
  )
}

const LoadingPanel = () => {
  return (
    <div className="flex min-h-105 w-full items-center justify-center rounded-[18px] border border-[#e0d0c5] bg-[#fdf8f5] px-6 text-center shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19]">
      <div className="flex flex-col items-center">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-[#b84c2b] dark:border-t-[#e8816a]" />

        <p className="font-serif text-xl font-bold text-[#1a1714] dark:text-[#f2f0eb]">
          Loading your generated roadmap
        </p>

        <p className="mt-2 max-w-90 text-sm leading-relaxed text-[#6b5f58] dark:text-[#9b9a92]">
          Fetching the tracker, topics, and roadmap structure saved by the AI job.
        </p>
      </div>
    </div>
  )
}

const EmptyPanel = ({ message }: { message: string }) => {
  return (
    <div className="flex min-h-80 w-full items-center justify-center rounded-[18px] border border-[#e0d0c5] bg-[#fdf8f5] px-6 text-center shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19]">
      <div>
        <p className="font-serif text-xl font-bold text-[#1a1714] dark:text-[#f2f0eb]">
          Roadmap result unavailable
        </p>

        <p className="mt-2 max-w-115 text-sm leading-relaxed text-[#6b5f58] dark:text-[#9b9a92]">
          {message}
        </p>
      </div>
    </div>
  )
}

export default function OnboardingRoadmapReadyPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()

  const { data, isLoading, error } = useRoadmapJobResult(jobId)
  const runRoadmapEvaluation = useRunRoadmapEvaluation()

  const tracker = data?.data?.tracker

  const topics = useMemo(() => {
    return data?.data?.topics || []
  }, [data?.data?.topics])

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [sectionOverrides, setSectionOverrides] = useState<
    Record<string, boolean>
  >({})
  const [evaluationError, setEvaluationError] = useState<string | null>(null)

  const activeTopicId = selectedTopicId || topics[0]?._id || ''

  const activeTopic = useMemo(() => {
    return topics.find((topic) => topic._id === activeTopicId) || topics[0]
  }, [topics, activeTopicId])

  const sections = useMemo(() => {
    return buildSections(activeTopic)
  }, [activeTopic])

  const totalTopics = tracker?.topicsCount || topics.length

  const totalSubtopics =
    tracker?.subtopicsCount ||
    topics.reduce((total, topic) => {
      return total + flattenSectionCount(topic)
    }, 0)

  const totalPreviewNodes = totalTopics + totalSubtopics

  const coverageRows = useMemo(() => {
    return topics.map((topic) => {
      const count = topic.subtopicsCount || flattenSectionCount(topic)

      const percent =
        totalSubtopics > 0
          ? Math.round((count / totalSubtopics) * 100)
          : topics.length > 0
            ? Math.round(100 / topics.length)
            : 0

      return {
        id: topic._id,
        title: topic.title,
        count,
        percent,
      }
    })
  }, [topics, totalSubtopics])

  const aiInsight = useMemo(() => {
    const firstTopicTitle = topics[0]?.title || 'your first learning module'

    return `Your roadmap starts with ${firstTopicTitle} and expands into ${totalTopics} structured topic areas. Run AI Evaluation to let Gemini score the roadmap quality, completeness, and interview-readiness.`
  }, [topics, totalTopics])

  const resultError =
    error?.response?.data?.message ||
    (!jobId
      ? 'Missing roadmap generation job ID.'
      : 'Unable to fetch the generated roadmap result.')

  const toggleSection = (sectionId: string, defaultOpen: boolean) => {
    setSectionOverrides((current) => ({
      ...current,
      [sectionId]:
        current[sectionId] === undefined
          ? !defaultOpen
          : !current[sectionId],
    }))
  }

  const handleRunAiEvaluation = async () => {
    if (!jobId || !tracker) {
      setEvaluationError('Roadmap data is missing. Please regenerate it.')
      return
    }

    setEvaluationError(null)

    try {
      const response =
        await runRoadmapEvaluation.mutateAsync(jobId)

      navigate(
        `/onboarding/roadmap-evaluation/${response.data.jobId}`
      )
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : 'Unable to evaluate roadmap right now.'

      setEvaluationError(message)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f5ede4] font-[DM_Sans,sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
        <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[#e0d0c5] bg-[#f5ede4]/95 px-5 backdrop-blur-xl dark:border-white/15 dark:bg-[#141412]/95 sm:px-8 md:px-12">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <LogoIcon className="h-8 w-8 rounded-lg" />
            <span className="text-[19px] font-bold tracking-[-0.5px]">
              immin
              <span className="text-[#b84c2b] dark:text-[#e8816a]">iq</span>
              <span className="text-[#b84c2b] dark:text-[#e8816a]">.</span>
            </span>
          </Link>

          
        </header>

        <main className="mx-auto flex w-full max-w-280 flex-1 items-center px-4 py-8 sm:px-6 md:px-12">
          <LoadingPanel />
        </main>
      </div>
    )
  }

  if (!tracker) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f5ede4] font-[DM_Sans,sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
        <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[#e0d0c5] bg-[#f5ede4]/95 px-5 backdrop-blur-xl dark:border-white/15 dark:bg-[#141412]/95 sm:px-8 md:px-12">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <LogoIcon className="h-8 w-8 rounded-lg" />
            <span className="text-[19px] font-bold tracking-[-0.5px]">
              immin
              <span className="text-[#b84c2b] dark:text-[#e8816a]">iq</span>
              <span className="text-[#b84c2b] dark:text-[#e8816a]">.</span>
            </span>
          </Link>

          
        </header>

        <main className="mx-auto flex w-full max-w-280 flex-1 items-center px-4 py-8 sm:px-6 md:px-12">
          <EmptyPanel message={resultError} />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5ede4] font-[DM_Sans,sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[#e0d0c5] bg-[#f5ede4]/95 px-5 backdrop-blur-xl dark:border-white/15 dark:bg-[#141412]/95 sm:px-8 md:px-12">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <LogoIcon className="h-8 w-8 rounded-lg" />

          <span className="text-[19px] font-bold leading-none tracking-[-0.5px]">
            immin
            <span className="text-[#b84c2b] dark:text-[#e8816a]">iq</span>
            <span className="text-[#b84c2b] dark:text-[#e8816a]">.</span>
          </span>
        </Link>

        
      </header>

      <main className="mx-auto flex w-full max-w-280 flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-10">
        <section className="relative overflow-hidden rounded-[18px] bg-[#1a1714] px-5 py-6 text-[#fdf8f5] shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:bg-[#0f0e0c] sm:px-7 sm:py-7 md:px-9 md:py-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-55 w-55 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.20)_0%,transparent_70%)]" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(184,76,43,0.32)] bg-[rgba(184,76,43,0.20)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#e8816a]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e8816a]" />
                Roadmap Ready
              </div>

              <h1 className="max-w-175 font-serif text-[clamp(24px,5vw,38px)] font-extrabold leading-[1.08] tracking-[-1px]">
                {tracker.title}
              </h1>

              {tracker.description && (
                <p className="mt-3 max-w-175 text-sm leading-relaxed text-[#f2f0eb]/70">
                  {tracker.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex max-w-full items-center rounded-md border border-white/10 bg-white/[0.07] px-2.5 py-1 text-[11px] font-medium text-[#f2f0eb]/70">
                  {tracker.field || 'AI-generated field'}
                </span>

                <span className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.07] px-2.5 py-1 text-[11px] font-medium text-[#f2f0eb]/70">
                  {capitalize(tracker.level)}
                </span>

                <span className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.07] px-2.5 py-1 text-[11px] font-medium text-[#f2f0eb]/70">
                  {capitalize(tracker.visibility || 'private')}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 gap-5">
              <div className="flex flex-col sm:items-end">
                <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-[#f2f0eb]/40">
                  Topics
                </span>
                <span className="font-serif text-[34px] font-extrabold leading-none text-[#f0a842]">
                  {totalTopics}
                </span>
              </div>

              <div className="flex flex-col sm:items-end">
                <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-[#f2f0eb]/40">
                  Subtopics
                </span>
                <span className="font-serif text-[34px] font-extrabold leading-none text-[#fdf8f5]">
                  {totalSubtopics}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19]">
            <div className="flex flex-wrap gap-2 px-4 pt-4 sm:px-6 sm:pt-5">
              {topics.map((topic) => {
                const active = topic._id === activeTopic?._id

                return (
                  <button
                    key={topic._id}
                    type="button"
                    onClick={() => setSelectedTopicId(topic._id)}
                    className={cn(
                      'rounded-full border-[1.5px] px-3 py-2 text-[12.5px] font-medium transition',
                      active
                        ? 'border-[#b84c2b] bg-[#b84c2b] text-[#fdf8f5] dark:border-[#e8816a] dark:bg-[#e8816a] dark:text-[#141412]'
                        : 'border-[#e0d0c5] bg-transparent text-[#6b5f58] hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/15 dark:text-[#9b9a92]'
                    )}
                  >
                    {topic.title}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 border-y-[1.5px] border-[#e0d0c5] px-4 py-4 dark:border-white/15 sm:px-6">
              <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#6b5f58]/60 dark:text-[#9b9a92]/60">
                Roadmap Topic
              </div>

              <h2 className="font-serif text-[clamp(18px,3vw,24px)] font-bold tracking-[-0.3px] text-[#b84c2b] dark:text-[#e8816a]">
                {activeTopic?.title || 'Generated Topic'}
              </h2>

              <p className="mt-1 text-[12.5px] leading-relaxed text-[#6b5f58] dark:text-[#9b9a92]">
                {activeTopic?.description ||
                  'Explore the generated sections and learning nodes inside this topic.'}
              </p>
            </div>

            {sections.length ? (
              <div>
                {sections.map((section, index) => {
                  const defaultOpen = index === 0
                  const open = sectionOverrides[section.id] ?? defaultOpen

                  return (
                    <div
                      key={section.id}
                      className="border-b border-[#e0d0c5] last:border-b-0 dark:border-white/15"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id, defaultOpen)}
                        aria-expanded={open}
                        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-[rgba(184,76,43,0.04)] dark:hover:bg-[rgba(232,129,106,0.05)] sm:px-6"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-[12px] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                            ✦
                          </span>

                          <span className="truncate text-sm font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                            {section.title}
                          </span>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <span className="font-mono text-[9.5px] tracking-[0.08em] text-[#6b5f58]/60 dark:text-[#9b9a92]/60">
                            {section.items.length} items
                          </span>

                          <span
                            className={cn(
                              'text-[#6b5f58]/50 transition-transform dark:text-[#9b9a92]/60',
                              open && 'rotate-180'
                            )}
                          >
                            <ChevronDownIcon />
                          </span>
                        </div>
                      </button>

                      {open && (
                        <div className="px-4 pb-3 sm:px-6">
                          {section.items.map((item, itemIndex) => (
                            <div
                              key={item._id || `${section.id}-${itemIndex}`}
                              className="flex items-center justify-between gap-3 border-b border-[#e0d0c5] py-3 last:border-b-0 dark:border-white/15"
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-2">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e0d0c5] dark:bg-white/20" />
                                <span className="min-w-0 text-[13px] text-[#1a1714] dark:text-[#f2f0eb]">
                                  {item.title}
                                </span>
                              </div>

                              <SectionDifficultyBadge item={item} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-[#6b5f58] dark:text-[#9b9a92] sm:px-6">
                This topic does not contain preview subtopics in the result payload yet.
              </div>
            )}
          </div>

          <aside className="flex w-full flex-col gap-4 lg:w-78 lg:shrink-0">
            <div className="rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/15 dark:bg-[#1e1c19]">
              <h3 className="mb-4 font-serif text-[15px] font-bold tracking-[-0.3px]">
                Coverage
              </h3>

              <div className="flex flex-col gap-3">
                {coverageRows.map((row, index) => (
                  <div key={row.id}>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="truncate text-[12px] font-medium">
                        {row.title}
                      </span>

                      <span className="font-mono text-[9.5px] text-[#6b5f58] dark:text-[#9b9a92]">
                        {row.count}
                      </span>
                    </div>

                    <div className="h-1 overflow-hidden rounded-full bg-[#1a1714]/8 dark:bg-[#f2f0eb]/9">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          index % 3 === 1
                            ? 'bg-[#4caf7d] dark:bg-[#5cc98a]'
                            : index % 3 === 2
                              ? 'bg-[#c98000] dark:bg-[#f0a842]'
                              : 'bg-[#b84c2b] dark:bg-[#e8816a]'
                        )}
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-[10px] border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#6b5f58] dark:text-[#9b9a92]">
                  Total nodes
                </span>

                <span className="font-serif text-[22px] font-bold text-[#b84c2b] dark:text-[#e8816a]">
                  {totalPreviewNodes}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/15 dark:bg-[#1e1c19]">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#b84c2b] dark:bg-[#e8816a]" />
                <span className="font-mono text-[9px] uppercase tracking-[0.13em] text-[#b84c2b] dark:text-[#e8816a]">
                  AI Insight
                </span>
              </div>

              <p className="text-[12.5px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
                {aiInsight}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRunAiEvaluation}
              disabled={runRoadmapEvaluation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-[11px] bg-[#1a1714] px-4 py-3.5 text-sm font-bold text-[#f5ede4] transition hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(26,23,20,0.22)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 dark:bg-[#f2f0eb] dark:text-[#141412]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-[#b84c2b] text-white dark:bg-[#e8816a]">
                <PulseIcon />
              </span>

              {runRoadmapEvaluation.isPending
                ? 'Gemini is evaluating roadmap...'
                : 'Run AI Evaluation'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex w-full items-center justify-center gap-2 rounded-[11px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-4 py-3.5 text-sm font-bold text-[#6b5f58] transition hover:-translate-y-px hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] hover:shadow-[0_6px_24px_rgba(184,76,43,0.10)] dark:border-white/15 dark:bg-[#1e1c19] dark:text-[#9b9a92] dark:hover:border-[#e8816a] dark:hover:text-[#e8816a]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-[5px] border border-[rgba(184,76,43,0.20)] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                <DashboardIcon />
              </span>

              Go to Dashboard
            </button>

            {evaluationError && (
              <p className="rounded-[10px] border border-red-300 bg-red-50 px-3 py-2 text-center text-[12px] font-medium text-red-600 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300">
                {evaluationError}
              </p>
            )}

            <p className="text-center font-mono text-[9px] uppercase tracking-widest text-[#6b5f58]/50 dark:text-[#9b9a92]/50">
              Gemini-powered roadmap quality score
            </p>
          </aside>
        </section>
      </main>
    </div>
  )
}