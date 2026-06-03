// ============================================================
// MockTestDetailsPage.tsx — aligned with Trackers design
// ============================================================
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import AppFooter from '../../../components/layout/Footer'
import BottomNav from '../../../components/layout/BottomNav'

import {
  useMockTestDetails,
  useStartMockTestAttempt,
} from '../hooks/useMockTests'

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

const NoiseOverlay = () => (
  <div
    className="pointer-events-none fixed inset-0 z-0 opacity-[0.025] dark:opacity-[0.04]"
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
      backgroundSize: '180px',
    }}
  />
)

function PageShell({
  sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed, children,
}: {
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (fn: (c: boolean) => boolean) => void
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#141412] text-[#f2f0eb]">
      <NoiseOverlay />
      <div className="relative z-1 flex min-h-screen w-full overflow-x-clip">
        <Sidebar
          mobileOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onCloseMobile={() => setSidebarOpen(false)}
          onToggleCollapsed={() =>
            setSidebarCollapsed((current) => {
              const next = !current
              if (typeof window !== 'undefined') localStorage.setItem('imminiq_sb', next ? 'closed' : 'open')
              return next
            })
          }
        />
        <main
          className={cn(
            'flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300',
            sidebarCollapsed ? 'min-[901px]:ml-0' : 'min-[901px]:ml-56'
          )}
        >
          <TopBar onMenuClick={() => setSidebarOpen(true)} streakDays={0} userName="Achu" userInitials="AC" userLevel="Free Scholar" isGuest={false} />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mx-auto mt-5.5 flex w-[min(860px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
              {children}
              <AppFooter />
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

export default function MockTestDetailsPage() {
  const { testId = '' } = useParams()
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('imminiq_sb') === 'closed'
  )

  const detailsQuery = useMockTestDetails(testId)
  const startMutation = useStartMockTestAttempt()
  const data = detailsQuery.data

  const shellProps = { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed }

  const start = async () => {
    if (!testId) return
    const response = await startMutation.mutateAsync(testId)
    const started = response.data
    navigate(`/mock-tests/attempts/${started.attempt._id}`, { state: started })
  }

  if (detailsQuery.isLoading) {
    return (
      <PageShell {...shellProps}>
        <div className="h-72 animate-pulse rounded-[16px] border border-white/10 bg-[#1c1a18]" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-[16px] border border-white/10 bg-[#1c1a18]" />
          ))}
        </div>
      </PageShell>
    )
  }

  if (detailsQuery.isError) {
    return (
      <PageShell {...shellProps}>
        <div className="rounded-[16px] border border-red-500/30 bg-red-500/10 p-6 text-red-300">
          Failed to load mock test.
        </div>
      </PageShell>
    )
  }

  if (!data) {
    return (
      <PageShell {...shellProps}>
        <div className="rounded-[16px] border border-white/10 bg-[#1c1a18] p-6 text-[#9b9a92]">
          Test not found.
        </div>
      </PageShell>
    )
  }

  const isContinuing = data.latestAttempt?.status === 'in_progress'

  return (
    <PageShell {...shellProps}>
      {/* ── hero card ── */}
      <section className="rounded-[16px] border border-white/10 bg-[#1c1a18] p-7"
        style={{ borderTop: '2.5px solid #e8816a' }}
      >
        <div className="font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.16em] text-[#9b9a92]">
          {data.test.difficulty} · {data.test.questionCount} questions · {data.test.timeLimitMinutes} min
        </div>

        <h1 className="mt-3 font-['Playfair_Display',serif] text-[38px] font-[900] leading-tight text-[#f2f0eb]">
          {data.test.title}
        </h1>

        {data.test.description && (
          <p className="mt-3 text-[14px] leading-7 text-[#6b6560]">
            {data.test.description}
          </p>
        )}

        {/* tags */}
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.1em] text-[#9b9a92]">
            {data.test.visibility}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.1em] text-[#9b9a92]">
            {data.test.isAIGenerated ? 'AI generated' : 'Manual'}
          </span>
          {data.test.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.1em] text-[#9b9a92]"
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={start}
          disabled={startMutation.isPending}
          className="mt-6 rounded-[14px] bg-[#e8816a] px-5 py-3 font-['Playfair_Display',serif] text-[15px] font-bold text-white transition hover:-translate-y-px hover:bg-[#d9522d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {startMutation.isPending ? 'Preparing...' : isContinuing ? 'Continue attempt' : 'Start test'}
        </button>
      </section>

      {/* ── question preview list ── */}
      <section className="space-y-3">
        {data.questions.map((question, index) => (
          <article
            key={question._id}
            className="rounded-[16px] border border-white/10 bg-[#1c1a18] p-4 transition hover:-translate-y-0.5 hover:border-white/20"
          >
            <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.13em] text-[#9b9a92]">
              Question {index + 1} · {question.type.replace('_', ' ')} · {question.points} pts
            </div>

            <h3 className="mt-2 font-['Playfair_Display',serif] text-[16px] font-[900] leading-snug text-[#f2f0eb]">
              {question.question}
            </h3>

            {question.options?.length ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {question.options.map((option) => (
                  <div
                    key={option}
                    className="rounded-[10px] border border-white/8 bg-[#141412] px-3 py-2 text-[13px] text-[#9b9a92]"
                  >
                    {option}
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </PageShell>
  )
}