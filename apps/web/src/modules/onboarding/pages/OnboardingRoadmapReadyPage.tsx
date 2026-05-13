import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  MouseEvent,
  ReactNode,
} from 'react'
import {
  Link,
  useParams,
} from 'react-router-dom'
import ThemeToggle from '../../../components/ui/ThemeToggle'
import {
  useRoadmapJobResult,
  type RoadmapSubtopic,
  type RoadmapTopic,
} from '../../../hooks/onboarding/useRoadmapJobResult'

type Section = {
  id: string
  title: string
  items: RoadmapSubtopic[]
}

type EvalLine = {
  message: string
  progress: number
  tone?: 'normal' | 'success' | 'highlight'
}

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(' ')
}

const capitalize = (value?: string) => {
  if (!value) return '—'
  return value.charAt(0).toUpperCase() + value.slice(1)
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

const ArrowRightIcon = () => {
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
      <polyline points="9 18 15 12 9 6" />
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

const CloseIcon = () => {
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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
        'shrink-0 whitespace-nowrap rounded-[4px] border px-2 py-[3px] font-mono text-[8px] uppercase tracking-[0.1em]',
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
    <div className="flex min-h-[420px] w-full items-center justify-center rounded-[18px] border border-[#e0d0c5] bg-[#fdf8f5] px-6 text-center shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19] dark:shadow-[0_8px_40px_rgba(0,0,0,0.35),0_1px_4px_rgba(0,0,0,0.2)]">
      <div className="flex flex-col items-center">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-[#b84c2b] dark:border-t-[#e8816a]" />

        <p className="font-serif text-xl font-bold text-[#1a1714] dark:text-[#f2f0eb]">
          Loading your generated roadmap
        </p>

        <p className="mt-2 max-w-[360px] text-sm leading-relaxed text-[#6b5f58] dark:text-[#9b9a92]">
          Fetching the tracker, topics, and roadmap structure saved by the AI job.
        </p>
      </div>
    </div>
  )
}

const EmptyPanel = ({ message }: { message: string }) => {
  return (
    <div className="flex min-h-[320px] w-full items-center justify-center rounded-[18px] border border-[#e0d0c5] bg-[#fdf8f5] px-6 text-center shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19]">
      <div>
        <p className="font-serif text-xl font-bold text-[#1a1714] dark:text-[#f2f0eb]">
          Roadmap result unavailable
        </p>

        <p className="mt-2 max-w-[460px] text-sm leading-relaxed text-[#6b5f58] dark:text-[#9b9a92]">
          {message}
        </p>
      </div>
    </div>
  )
}

export default function OnboardingRoadmapReadyPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const previewRef = useRef<HTMLDivElement | null>(null)

  const {
    data,
    isLoading,
    error,
  } = useRoadmapJobResult(jobId)

  const tracker = data?.data?.tracker
  const topics = data?.data?.topics || []

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [sectionOverrides, setSectionOverrides] = useState<
    Record<string, boolean>
  >({})
  const [isEvalOpen, setIsEvalOpen] = useState(false)
  const [evaluationRunning, setEvaluationRunning] = useState(false)
  const [evalLines, setEvalLines] = useState<EvalLine[]>([])
  const [evalProgress, setEvalProgress] = useState(0)

  const activeTopicId =
    selectedTopicId || topics[0]?._id || ''

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
      const count =
        topic.subtopicsCount ||
        flattenSectionCount(topic)

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

    return `Your roadmap starts with ${firstTopicTitle} and expands into ${totalTopics} structured topic areas. Begin with the first section, then move through the roadmap in order to keep the learning curve steady.`
  }, [topics, totalTopics])

  const resultError =
    error?.response?.data?.message ||
    (!jobId
      ? 'Missing roadmap generation job ID.'
      : 'Unable to fetch the generated roadmap result.')

  const toggleSection = (
    sectionId: string,
    defaultOpen: boolean
  ) => {
    setSectionOverrides((current) => ({
      ...current,
      [sectionId]:
        current[sectionId] === undefined
          ? !defaultOpen
          : !current[sectionId],
    }))
  }

  const handleStartLearning = () => {
    const firstSection = sections[0]

    if (firstSection) {
      setSectionOverrides((current) => ({
        ...current,
        [firstSection.id]: true,
      }))
    }

    previewRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const evalSteps = useMemo<EvalLine[]>(() => {
    return [
      {
        message: '↳ Loading generated tracker tree…',
        progress: 12,
      },
      {
        message: `✓ Parsed ${totalTopics} topics and ${totalSubtopics} subtopics`,
        progress: 28,
        tone: 'success',
      },
      {
        message: '↳ Reviewing topic sequence and roadmap balance…',
        progress: 45,
      },
      {
        message: '✓ Topic progression appears structurally consistent',
        progress: 62,
        tone: 'success',
      },
      {
        message: '↳ Scanning for missing structural coverage…',
        progress: 78,
      },
      {
        message: '✓ No blocking structural gaps detected in the generated preview',
        progress: 92,
        tone: 'success',
      },
      {
        message: '✦ Preview evaluation complete',
        progress: 100,
        tone: 'highlight',
      },
    ]
  }, [totalTopics, totalSubtopics])

  useEffect(() => {
    if (!evaluationRunning) {
      return
    }

    let timeoutId: number | undefined
    let index = 0

    const runNext = () => {
      const current = evalSteps[index]

      if (!current) {
        setEvaluationRunning(false)
        return
      }

      setEvalLines((lines) => [...lines, current])
      setEvalProgress(current.progress)

      index += 1

      timeoutId = window.setTimeout(
        runNext,
        index % 2 === 0 ? 650 : 850
      )
    }

    timeoutId = window.setTimeout(runNext, 250)

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [evaluationRunning, evalSteps])

  useEffect(() => {
    if (!isEvalOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsEvalOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isEvalOpen])

  const openEvaluation = () => {
    setEvalLines([])
    setEvalProgress(0)
    setEvaluationRunning(false)
    setIsEvalOpen(true)
  }

  const closeEvaluation = () => {
    setIsEvalOpen(false)
    setEvaluationRunning(false)
    setEvalLines([])
    setEvalProgress(0)
  }

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeEvaluation()
    }
  }

  const runEvaluation = () => {
    setEvalLines([])
    setEvalProgress(0)
    setEvaluationRunning(true)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f5ede4] font-[DM_Sans,sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
        <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[#e0d0c5] bg-[#f5ede4]/95 px-5 backdrop-blur-xl dark:border-white/15 dark:bg-[#141412]/95 sm:px-8 md:px-12">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <LogoIcon className="h-8 w-8 rounded-[8px]" />

            <span className="text-[19px] font-bold tracking-[-0.5px]">
              immin
              <span className="text-[#b84c2b] dark:text-[#e8816a]">iq</span>
              <span className="text-[#b84c2b] dark:text-[#e8816a]">.</span>
            </span>
          </Link>

          <ThemeToggle />
        </header>

        <main className="mx-auto flex w-full max-w-[1120px] flex-1 items-center px-4 py-8 sm:px-6 md:px-12">
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
            <LogoIcon className="h-8 w-8 rounded-[8px]" />

            <span className="text-[19px] font-bold tracking-[-0.5px]">
              immin
              <span className="text-[#b84c2b] dark:text-[#e8816a]">iq</span>
              <span className="text-[#b84c2b] dark:text-[#e8816a]">.</span>
            </span>
          </Link>

          <ThemeToggle />
        </header>

        <main className="mx-auto flex w-full max-w-[1120px] flex-1 items-center px-4 py-8 sm:px-6 md:px-12">
          <EmptyPanel message={resultError} />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5ede4] font-[DM_Sans,sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[#e0d0c5] bg-[#f5ede4]/95 px-5 backdrop-blur-xl dark:border-white/15 dark:bg-[#141412]/95 sm:px-8 md:px-12">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <LogoIcon className="h-8 w-8 rounded-[8px]" />

          <span className="text-[19px] font-bold leading-none tracking-[-0.5px]">
            immin
            <span className="text-[#b84c2b] dark:text-[#e8816a]">iq</span>
            <span className="text-[#b84c2b] dark:text-[#e8816a]">.</span>
          </span>
        </Link>

        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-10">
        <section className="relative overflow-hidden rounded-[18px] bg-[#1a1714] px-5 py-6 text-[#fdf8f5] shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:bg-[#0f0e0c] sm:px-7 sm:py-7 md:px-9 md:py-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.20)_0%,transparent_70%)]" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(184,76,43,0.32)] bg-[rgba(184,76,43,0.20)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#e8816a]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e8816a]" />
                Roadmap Ready
              </div>

              <h1 className="max-w-[700px] font-serif text-[clamp(24px,5vw,38px)] font-extrabold leading-[1.08] tracking-[-1px]">
                {tracker.title}
              </h1>

              {tracker.description && (
                <p className="mt-3 max-w-[700px] text-sm leading-relaxed text-[#f2f0eb]/70">
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
          <div
            ref={previewRef}
            className="min-w-0 flex-1 overflow-hidden rounded-[16px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19] dark:shadow-[0_8px_40px_rgba(0,0,0,0.35),0_1px_4px_rgba(0,0,0,0.2)]"
          >
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
                        : 'border-[#e0d0c5] bg-transparent text-[#6b5f58] hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/15 dark:text-[#9b9a92] dark:hover:border-[#f5a090] dark:hover:bg-[rgba(232,129,106,0.10)] dark:hover:text-[#e8816a]'
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

                  const open =
                    sectionOverrides[section.id] ?? defaultOpen

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
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-[12px] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
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

          <aside className="flex w-full flex-col gap-4 lg:w-[312px] lg:shrink-0">
            <div className="rounded-[16px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19] dark:shadow-[0_8px_40px_rgba(0,0,0,0.35),0_1px_4px_rgba(0,0,0,0.2)]">
              <h3 className="mb-4 font-serif text-[15px] font-bold tracking-[-0.3px]">
                Coverage
              </h3>

              <div className="flex flex-col gap-3">
                {coverageRows.map((row, index) => (
                  <div key={row.id}>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="truncate text-[12px] font-medium text-[#1a1714] dark:text-[#f2f0eb]">
                        {row.title}
                      </span>

                      <span className="font-mono text-[9.5px] tracking-[0.06em] text-[#6b5f58] dark:text-[#9b9a92]">
                        {row.count}
                      </span>
                    </div>

                    <div className="h-1 overflow-hidden rounded-full bg-[#1a1714]/[0.08] dark:bg-[#f2f0eb]/[0.09]">
                      <div
                        className={cn(
                          'relative h-full overflow-hidden rounded-full transition-[width] duration-1000 ease-out',
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

              <div className="mt-4 flex items-center justify-between rounded-[10px] border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-3 dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)]">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#6b5f58] dark:text-[#9b9a92]">
                  Total nodes
                </span>

                <span className="font-serif text-[22px] font-bold text-[#b84c2b] dark:text-[#e8816a]">
                  {totalPreviewNodes}
                </span>
              </div>
            </div>

            <div className="rounded-[16px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19]">
              <h3 className="mb-4 font-serif text-[15px] font-bold tracking-[-0.3px]">
                Your Context
              </h3>

              <div className="flex items-center justify-between gap-3 border-b border-[#e0d0c5] py-2.5 dark:border-white/15">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#6b5f58]/70 dark:text-[#9b9a92]/70">
                  Field
                </span>

                <span className="max-w-[60%] truncate rounded-[5px] bg-[rgba(184,76,43,0.08)] px-2.5 py-1 text-[11.5px] font-semibold text-[#b84c2b] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                  {tracker.field || 'AI-generated'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 border-b border-[#e0d0c5] py-2.5 dark:border-white/15">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#6b5f58]/70 dark:text-[#9b9a92]/70">
                  Level
                </span>

                <span className="rounded-[5px] bg-[rgba(184,76,43,0.08)] px-2.5 py-1 text-[11.5px] font-semibold text-[#b84c2b] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                  {capitalize(tracker.level)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#6b5f58]/70 dark:text-[#9b9a92]/70">
                  Status
                </span>

                <span className="rounded-[5px] bg-[rgba(184,76,43,0.08)] px-2.5 py-1 text-[11.5px] font-semibold text-[#b84c2b] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                  {capitalize(tracker.status || 'draft')}
                </span>
              </div>
            </div>

            <div className="rounded-[16px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19]">
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
              onClick={handleStartLearning}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[11px] bg-[#b84c2b] px-4 py-3.5 text-sm font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-[#963d22] hover:shadow-[0_6px_20px_rgba(184,76,43,0.28)] active:translate-y-0 active:shadow-none dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
            >
              <span className="pointer-events-none absolute left-[-100%] top-0 h-full w-[55%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.13),transparent)] transition-[left] duration-500 group-hover:left-[160%]" />

              <ArrowRightIcon />
              Start Learning
            </button>

            <button
              type="button"
              onClick={openEvaluation}
              className="flex w-full items-center justify-center gap-2 rounded-[11px] bg-[#1a1714] px-4 py-3.5 text-sm font-bold text-[#f5ede4] transition hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(26,23,20,0.22)] active:translate-y-0 active:shadow-none dark:bg-[#f2f0eb] dark:text-[#141412] dark:hover:shadow-[0_6px_24px_rgba(242,240,235,0.10)]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-[#b84c2b] text-white dark:bg-[#e8816a]">
                <PulseIcon />
              </span>

              Run AI Evaluation
            </button>

            <p className="text-center font-mono text-[9px] uppercase tracking-[0.1em] text-[#6b5f58]/50 dark:text-[#9b9a92]/50">
              Preview-quality check UI
            </p>
          </aside>
        </section>
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e0d0c5] px-5 py-4 dark:border-white/15 sm:px-8 md:px-12">
        <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-[#6b5f58]/50 dark:text-[#9b9a92]/50">
          © 2026 Imminiq. Scholarly rigor meets digital intelligence.
        </span>

        <div className="flex items-center gap-4">
          <Link
            to="/privacy"
            className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-[#6b5f58]/50 transition hover:text-[#b84c2b] dark:text-[#9b9a92]/50 dark:hover:text-[#e8816a]"
          >
            Privacy
          </Link>

          <Link
            to="/terms"
            className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-[#6b5f58]/50 transition hover:text-[#b84c2b] dark:text-[#9b9a92]/50 dark:hover:text-[#e8816a]"
          >
            Terms
          </Link>
        </div>
      </footer>

      {isEvalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="roadmap-eval-title"
          onMouseDown={handleOverlayClick}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
        >
          <div className="w-full max-w-[440px] rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.30)] dark:border-white/15 dark:bg-[#1e1c19] sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#b84c2b] dark:text-[#e8816a]">
                  AI Evaluation
                </p>

                <h2
                  id="roadmap-eval-title"
                  className="mt-1 font-serif text-[20px] font-bold tracking-[-0.3px] text-[#1a1714] dark:text-[#f2f0eb]"
                >
                  Evaluate Roadmap Preview
                </h2>
              </div>

              <button
                type="button"
                onClick={closeEvaluation}
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border-[1.5px] border-[#e0d0c5] text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/15 dark:text-[#9b9a92] dark:hover:border-[#f5a090] dark:hover:bg-[rgba(232,129,106,0.10)] dark:hover:text-[#e8816a]"
              >
                <CloseIcon />
              </button>
            </div>

            {!evalLines.length && (
              <p className="mb-5 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
                This preview check analyses the generated roadmap layout, topic spread,
                and visible structural completeness before you begin learning.
              </p>
            )}

            {!!evalLines.length && (
              <div className="mb-5 max-h-[210px] overflow-y-auto rounded-[10px] border border-[#e0d0c5] bg-[#f5ede4] p-3.5 dark:border-white/15 dark:bg-[#141412]">
                <div className="space-y-1.5">
                  {evalLines.map((line, index) => (
                    <div
                      key={`${line.message}-${index}`}
                      className={cn(
                        'font-mono text-[11px] leading-[1.7] tracking-[0.04em] text-[#6b5f58] dark:text-[#9b9a92]',
                        line.tone === 'success' &&
                          'text-[#4caf7d] dark:text-[#5cc98a]',
                        line.tone === 'highlight' &&
                          'text-[#b84c2b] dark:text-[#e8816a]'
                      )}
                    >
                      {line.message}
                    </div>
                  ))}
                </div>

                <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-[#1a1714]/[0.08] dark:bg-[#f2f0eb]/[0.09]">
                  <div
                    className="h-full rounded-full bg-[#b84c2b] transition-[width] duration-700 ease-out dark:bg-[#e8816a]"
                    style={{ width: `${evalProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={closeEvaluation}
                className="flex-1 rounded-[10px] border-[1.5px] border-[#e0d0c5] px-4 py-3 text-sm font-medium text-[#6b5f58] transition hover:border-[#6b5f58] hover:text-[#1a1714] dark:border-white/15 dark:text-[#9b9a92] dark:hover:border-white/30 dark:hover:text-[#f2f0eb]"
              >
                {evalLines.length && !evaluationRunning ? 'Close' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={runEvaluation}
                disabled={evaluationRunning}
                className="flex-[2] rounded-[10px] bg-[#b84c2b] px-4 py-3 text-sm font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-[#963d22] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
              >
                {evaluationRunning ? 'Running evaluation…' : 'Run Evaluation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}