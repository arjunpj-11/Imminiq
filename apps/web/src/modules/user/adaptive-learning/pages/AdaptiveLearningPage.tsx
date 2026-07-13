import { type FormEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppShellBoundary } from '../../../../components/layout/AppShell'
import AdaptiveMasteryGraph from '../components/AdaptiveMasteryGraph'
import {
  useAdaptiveAdvisorChat,
  useAdaptiveLearningDashboard,
  useGenerateAdaptiveAssessment,
} from '../hooks/useAdaptiveLearning'

export default function AdaptiveLearningPage() {
  const navigate = useNavigate()
  const dashboard = useAdaptiveLearningDashboard()
  const chat = useAdaptiveAdvisorChat()
  const generate = useGenerateAdaptiveAssessment()
  const [question, setQuestion] = useState('')
  const messagesContainer = useRef<HTMLDivElement>(null)
  const data = dashboard.data

  useEffect(() => {
    const container = messagesContainer.current
    if (container) container.scrollTop = container.scrollHeight
  }, [data?.messages.length, chat.isPending])

  const sendQuestion = async (event: FormEvent) => {
    event.preventDefault()
    const value = question.trim()
    if (!value || chat.isPending) return
    setQuestion('')
    await chat.mutateAsync(value)
  }

  const generateExam = async () => {
    const result = await generate.mutateAsync()
    navigate(`/mock-tests/${result.test.testId}`)
  }

  return (
    <AppShellBoundary>
      <main className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full flex-col gap-6 pb-24 max-[640px]:w-[calc(100%-20px)]">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--brand-500)">
              Immi adaptive agent
            </div>
            <h1 className="mt-2 font-ui text-[38px] font-black leading-tight text-(--text-primary)">
              Your learning navigator
            </h1>
            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-(--text-secondary)">
              Ask what to study next, which tracker to continue, or which mock test will expose your current weak areas.
            </p>
          </div>
          <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) px-5 py-3 text-right shadow-(--shadow-1)">
            <div className="text-[11px] text-(--text-secondary)">Adaptive level</div>
            <div className="font-ui text-[22px] font-black capitalize text-(--brand-500)">
              {data?.profile.level ?? 'Loading'}
            </div>
            <div className="text-[11px] text-(--text-secondary)">
              {data?.profile.masteryScore ?? 0}% mastery
            </div>
          </div>
        </header>

        {dashboard.isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            The learning agent dashboard could not be loaded.
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="flex h-[640px] min-h-[520px] max-h-[calc(100vh-120px)] flex-col overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-1)">
            <div className="border-b border-(--border-subtle) p-5">
              <h2 className="font-ui text-[18px] font-black text-(--text-primary)">
                Ask Immi
              </h2>
              <p className="mt-1 text-[12px] text-(--text-secondary)">
                The agent can inspect your learning profile through read-only tools.
              </p>
            </div>

            <div
              ref={messagesContainer}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5"
            >
              {!data?.messages.length ? (
                <div className="rounded-2xl bg-[rgba(184,76,43,0.08)] p-4 text-[13px] leading-6 text-(--text-secondary)">
                  Try: “What should I study next?”, “Which tracker should I continue?”, or “What mock test should I take today?”
                </div>
              ) : null}
              {data?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[86%] rounded-2xl px-4 py-3 text-[13px] leading-6 ${
                    message.role === 'user'
                      ? 'ml-auto bg-(--brand-500) text-white'
                      : 'border border-(--border-subtle) bg-white/40 text-(--text-primary) dark:bg-black/10'
                  }`}
                >
                  {message.content}
                </div>
              ))}
              {chat.isPending ? (
                <div className="max-w-[86%] rounded-2xl border border-(--border-subtle) px-4 py-3 text-[13px] text-(--text-secondary)">
                  Immi is checking your progress…
                </div>
              ) : null}
            </div>

            <form
              onSubmit={(event) => void sendQuestion(event)}
              className="flex gap-2 border-t border-(--border-subtle) p-4"
            >
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask what to prepare next…"
                className="min-w-0 flex-1 rounded-xl border border-(--border-subtle) bg-transparent px-4 py-3 text-[13px] text-(--text-primary) outline-none focus:border-(--brand-500)"
              />
              <button
                type="submit"
                disabled={chat.isPending || !question.trim()}
                className="rounded-xl bg-(--brand-500) px-5 py-3 text-[12px] font-bold text-white disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[rgba(184,76,43,0.22)] bg-[rgba(184,76,43,0.08)] p-5">
              <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--brand-500)">
                Agent-selected exam
              </div>
              <h2 className="mt-2 font-ui text-[18px] font-black text-(--text-primary)">
                {data?.latestAssessment?.status === 'ready'
                  ? data.latestAssessment.topic
                  : 'Ready for a fresh assessment?'}
              </h2>
              {data?.latestAssessment?.status === 'ready' ? (
                <>
                  <p className="mt-2 text-[12.5px] leading-6 text-(--text-secondary)">
                    Predicted score: {data.latestAssessment.predictedScore}% · {data.latestAssessment.difficulty}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/mock-tests/${data.latestAssessment?.testId}`)}
                    className="mt-4 w-full rounded-xl bg-(--brand-500) py-3 text-[12px] font-bold text-white"
                  >
                    Open adaptive exam
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={generate.isPending}
                  onClick={() => void generateExam()}
                  className="mt-4 w-full rounded-xl bg-(--brand-500) py-3 text-[12px] font-bold text-white disabled:opacity-60"
                >
                  {generate.isPending ? 'Planning exam…' : 'Generate adaptive exam'}
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1)">
              <h2 className="font-ui text-[17px] font-black text-(--text-primary)">
                Suggested next steps
              </h2>
              <ul className="mt-3 space-y-3">
                {data?.suggestions.map((suggestion) => (
                  <li
                    key={suggestion}
                    className="flex gap-2 text-[12.5px] leading-5 text-(--text-secondary)"
                  >
                    <span className="text-(--brand-500)">✦</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {data ? <AdaptiveMasteryGraph history={data.profile.history} /> : null}
      </main>
    </AppShellBoundary>
  )
}
