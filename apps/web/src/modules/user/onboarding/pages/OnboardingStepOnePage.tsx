import { type FormEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { MicButton } from '../../../../components/input/VoiceInputButton'
import { useVoiceInput } from '../../../../hooks/useVoiceInput'
import OnboardingBrandLink from '../components/OnboardingBrandLink'
import { useGenerateRoadmap } from '../hooks/useGenerateRoadmap'
import { useSaveOnboardingStepOne } from '../hooks/useSaveOnboardingStepOne'
import { useSaveOnboardingStepTwo } from '../hooks/useSaveOnboardingStepTwo'
import { useRoadmapJobStatus } from '../hooks/useRoadmapJobStatus'
import { useActiveRoadmapJob } from '../hooks/useActiveRoadmapJob'
import { useTrackerIntake } from '../hooks/useTrackerIntake'
import { useOnboardingStore } from '../store/useOnboardingStore'
import type {
  ITrackerIntakeMessage,
  ITrackerIntakeProfile,
} from '../types/onboarding.types'

const INITIAL_MESSAGE: ITrackerIntakeMessage = {
  role: 'assistant',
  content:
    'What would you like to learn, and what made you choose it right now?',
}

const buildPersonalizedGoal = (profile: ITrackerIntakeProfile) =>
  [
    `Motivation: ${profile.motivation}`,
    `Outcome: ${profile.desiredOutcome}`,
    `Experience: ${profile.currentExperience}`,
    `Time: ${profile.weeklyTimeCommitment}`,
    profile.learningPreferences.length
      ? `Preferences: ${profile.learningPreferences.join(', ')}`
      : '',
    profile.constraints.length
      ? `Constraints: ${profile.constraints.join(', ')}`
      : '',
  ]
    .filter(Boolean)
    .join(' · ')
    .slice(0, 400)

export default function OnboardingStepOnePage() {
  const navigate = useNavigate()
  const storedMessages = useOnboardingStore((state) => state.intakeMessages)
  const storedProfile = useOnboardingStore((state) => state.intakeProfile)
  const saveIntake = useOnboardingStore((state) => state.saveIntake)
  const clearIntake = useOnboardingStore((state) => state.clearIntake)
  const activeRoadmapJobId = useOnboardingStore(
    (state) => state.activeRoadmapJobId,
  )
  const setActiveRoadmapJobId = useOnboardingStore(
    (state) => state.setActiveRoadmapJobId,
  )
  const saveStepOneDraft = useOnboardingStore((state) => state.saveStep1)
  const saveStepTwoDraft = useOnboardingStore((state) => state.saveStep2)
  const [messages, setMessages] = useState<ITrackerIntakeMessage[]>(() =>
    storedMessages.length ? storedMessages : [INITIAL_MESSAGE],
  )
  const [profile, setProfile] = useState<ITrackerIntakeProfile | null>(() =>
    storedProfile &&
    ['beginner', 'intermediate', 'advanced'].includes(
      storedProfile.inferredLevel,
    )
      ? storedProfile
      : null,
  )
  const [answer, setAnswer] = useState('')
  const [generationError, setGenerationError] = useState('')
  const conversationRef = useRef<HTMLDivElement>(null)
  const intake = useTrackerIntake()
  const saveStepOne = useSaveOnboardingStepOne()
  const saveStepTwo = useSaveOnboardingStepTwo()
  const generateRoadmap = useGenerateRoadmap()
  const serverActiveJob = useActiveRoadmapJob()
  const effectiveActiveJobId =
    activeRoadmapJobId ?? serverActiveJob.data?.jobId ?? null
  const activeJob = useRoadmapJobStatus(effectiveActiveJobId ?? undefined)
  const voice = useVoiceInput((transcript) =>
    setAnswer((current) =>
      current.trim() ? `${current.trim()} ${transcript}` : transcript,
    ),
  )

  useEffect(() => {
    const conversation = conversationRef.current
    if (conversation) conversation.scrollTop = conversation.scrollHeight
  }, [intake.isPending, messages.length])

  useEffect(() => {
    if (serverActiveJob.data?.jobId && !activeRoadmapJobId) {
      setActiveRoadmapJobId(serverActiveJob.data.jobId)
    }
  }, [activeRoadmapJobId, serverActiveJob.data?.jobId, setActiveRoadmapJobId])

  const activeJobStatus = (
    activeJob.data?.data?.status || activeJob.data?.data?.state || ''
  ).toLowerCase()
  const trackerGenerationActive =
    Boolean(effectiveActiveJobId) &&
    !['completed', 'failed', 'success', 'done', 'error'].includes(
      activeJobStatus,
    )
  const generationProgress = Math.max(
    8,
    Math.min(
      95,
      Math.round(
        ((activeJob.data?.data?.currentStep ?? 0) /
          Math.max(activeJob.data?.data?.totalSteps ?? 5, 1)) *
          100,
      ),
    ),
  )

  useEffect(() => {
    if (['completed', 'success', 'done'].includes(activeJobStatus)) {
      clearIntake()
      setActiveRoadmapJobId(null)
    } else if (['failed', 'error'].includes(activeJobStatus)) {
      setActiveRoadmapJobId(null)
    }
  }, [activeJobStatus, clearIntake, setActiveRoadmapJobId])

  const submitAnswer = async (event: FormEvent) => {
    event.preventDefault()
    const content = answer.trim()
    if (!content || intake.isPending || profile) return

    if (voice.isListening) voice.toggle()
    const nextMessages: ITrackerIntakeMessage[] = [
      ...messages,
      { role: 'user', content },
    ]
    setAnswer('')
    setMessages(nextMessages)

    try {
      const result = await intake.mutateAsync(nextMessages)
      const completedMessages: ITrackerIntakeMessage[] = [
        ...nextMessages,
        { role: 'assistant', content: result.assistantMessage },
      ]
      setMessages(completedMessages)
      if (result.isComplete && result.profile) setProfile(result.profile)
      saveIntake(completedMessages, result.profile)
    } catch {
      setMessages(messages)
      setAnswer(content)
    }
  }

  const startGeneration = async () => {
    if (!profile) return

    setGenerationError('')
    const goal = buildPersonalizedGoal(profile)
    const stepOnePayload = { topic: profile.topic, goal }
    const stepTwoPayload = { level: profile.inferredLevel }
    saveStepOneDraft(stepOnePayload)
    saveStepTwoDraft(stepTwoPayload)

    try {
      await saveStepOne.mutateAsync(stepOnePayload)
      await saveStepTwo.mutateAsync(stepTwoPayload)
      const response = await generateRoadmap.mutateAsync({
        ...stepOnePayload,
        level: profile.inferredLevel,
      })
      const jobId = response.data?.jobId
      if (!jobId) throw new Error('Generation started without a job ID.')
      setActiveRoadmapJobId(jobId)
      navigate(`/onboarding/generating/${jobId}`, { replace: true })
    } catch (error) {
      const apiMessage = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message
      setGenerationError(
        apiMessage || (error instanceof Error
          ? error.message
          : 'Unable to start tracker generation. Please try again.'),
      )
    }
  }

  const isStartingGeneration =
    saveStepOne.isPending || saveStepTwo.isPending || generateRoadmap.isPending

  const startNewConversation = () => {
    if (voice.isListening) voice.toggle()
    clearIntake()
    intake.reset()
    setMessages([INITIAL_MESSAGE])
    setProfile(null)
    setAnswer('')
    setGenerationError('')
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-(--surface-canvas) text-(--text-primary)">
      <header className="flex shrink-0 items-center justify-between border-b border-(--border-subtle) px-5 py-4 sm:px-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-(--border-subtle) bg-(--surface-card)"
            aria-label="Go back"
          >
            ←
          </button>
          <OnboardingBrandLink hideWordmarkOnMobile />
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.14em] text-(--text-secondary) sm:inline">
            AI-guided tracker creation
          </span>
          {!trackerGenerationActive && !serverActiveJob.isLoading ? (
            <button
              type="button"
              onClick={startNewConversation}
              disabled={
                intake.isPending ||
                (messages.length === 1 && !answer && !profile)
              }
              className="rounded-xl border border-(--border-subtle) bg-(--surface-card) px-3.5 py-2 text-[11px] font-bold text-(--text-secondary) transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-45 dark:hover:bg-red-950/20"
            >
              Clear chat
            </button>
          ) : null}
        </div>
      </header>

      <main className="flex min-h-0 w-full flex-1 flex-col">
        {serverActiveJob.isLoading ? (
          <section className="flex h-full w-full flex-col items-center justify-center bg-(--surface-card) p-8 text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-(--border-subtle) border-t-(--brand-500)" />
            <p className="mt-4 text-[13px] font-semibold text-(--text-secondary)">
              Checking your tracker generation status…
            </p>
          </section>
        ) : trackerGenerationActive ? (
          <section className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[linear-gradient(135deg,var(--surface-canvas),rgba(184,76,43,0.07),var(--surface-canvas))] px-5 py-10 text-center">
            <div className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-[rgba(184,76,43,0.08)] blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[rgba(184,76,43,0.10)] blur-3xl" />
            <div className="relative w-full max-w-180 rounded-3xl border border-[rgba(184,76,43,0.22)] bg-(--surface-card)/95 p-7 shadow-[0_28px_90px_rgba(26,23,20,0.13)] backdrop-blur sm:p-11">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-(--brand-500) text-2xl text-white shadow-[0_12px_32px_rgba(184,76,43,0.28)]">
                ✦
              </div>
              <div className="mt-6 font-mono text-[9px] uppercase tracking-[0.16em] text-(--brand-500)">
                Generation in progress
              </div>
              <h1 className="mt-3 font-serif text-[clamp(30px,5vw,48px)] font-black leading-tight">
                Your tracker is taking shape
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-[14px] leading-7 text-(--text-secondary)">
                Another tracker cannot be started while Immi is building this one. You can watch the generation or return to your dashboard—we’ll notify you when the review is ready.
              </p>
              <div className="mx-auto mt-7 max-w-lg rounded-2xl border border-(--border-subtle) bg-(--surface-canvas) p-4 text-left">
                <div className="flex items-center justify-between text-[11px] font-bold text-(--text-secondary)">
                  <span>Building personalized roadmap</span>
                  <span className="text-(--brand-500)">In progress</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/8 dark:bg-white/8">
                  <div
                    className="h-full animate-pulse rounded-full bg-(--brand-500) transition-[width] duration-500"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              </div>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  navigate(`/onboarding/generating/${effectiveActiveJobId}`)
                }
                className="rounded-xl bg-(--brand-500) px-6 py-3.5 text-[12px] font-bold text-white shadow-[0_8px_24px_rgba(184,76,43,0.24)] transition hover:-translate-y-0.5 hover:bg-(--brand-600)"
              >
                View generation progress
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="rounded-xl border border-(--border-subtle) bg-(--surface-canvas) px-6 py-3.5 text-[12px] font-bold text-(--text-primary) transition hover:border-(--brand-500)"
              >
                Return to dashboard
              </button>
              </div>
            </div>
          </section>
        ) : (
        <section className="flex h-full min-h-0 w-full flex-col bg-(--surface-card)">
          <div className="shrink-0 border-b border-(--border-subtle) px-5 py-5 sm:px-10 lg:px-16">
            <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--brand-500)">
              Personalization conversation
            </div>
            <h1 className="mt-2 font-serif text-[32px] font-black leading-tight">
              Build a tracker around you
            </h1>
            <p className="mt-2 text-[13px] leading-6 text-(--text-secondary)">
              Immi uses your previous trackers and test performance, then asks only what it still needs to create an accurate roadmap.
            </p>
          </div>

          <div
            ref={conversationRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-black/[0.018] px-5 py-6 dark:bg-white/[0.018] sm:px-10 lg:px-16"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}-${message.content.slice(0, 16)}`}
                className={`max-w-[86%] rounded-2xl px-4 py-3 text-[14px] leading-6 sm:max-w-[75%] ${
                  message.role === 'user'
                    ? 'ml-auto bg-(--brand-500) text-white'
                    : 'border border-(--border-subtle) bg-(--surface-card)'
                }`}
              >
                {message.content}
              </div>
            ))}
            {intake.isPending ? (
              <div className="text-[12px] text-(--text-secondary)">
                Immi is reviewing your answer and learning history…
              </div>
            ) : null}
          </div>

          {profile ? (
            <div className="shrink-0 border-t border-(--border-subtle) px-5 py-4 sm:px-10 lg:px-16">
            <div className="rounded-xl border border-[rgba(40,160,90,0.24)] bg-[rgba(40,160,90,0.08)] p-4">
              <p className="text-[13px] font-bold text-(--text-primary)">
                Ready to create: {profile.topic}
              </p>
              <p className="mt-1 text-[12px] leading-5 text-(--text-secondary)">
                Immi has enough context and assessed this roadmap at a {profile.inferredLevel} starting level.
              </p>
              <button
                type="button"
                onClick={() => void startGeneration()}
                disabled={isStartingGeneration}
                className="mt-3 w-full rounded-xl bg-(--brand-500) py-3 text-[12px] font-bold text-white disabled:opacity-60"
              >
                {isStartingGeneration
                  ? 'Starting generation…'
                  : 'Generate my tracker →'}
              </button>
            </div>
            </div>
          ) : (
            <div className="shrink-0 border-t border-(--border-subtle) bg-(--surface-card) px-5 py-4 sm:px-10 lg:px-16">
            <form
              onSubmit={(event) => void submitAnswer(event)}
              className="flex gap-2"
            >
              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Type your answer, or use the microphone…"
                rows={2}
                className="min-w-0 flex-1 resize-none rounded-xl border border-(--border-subtle) bg-transparent px-4 py-3 text-[13px] outline-none focus:border-(--brand-500)"
              />
              <MicButton
                isListening={voice.isListening}
                isSupported={voice.isSupported}
                onToggle={voice.toggle}
              />
              <button
                type="submit"
                disabled={!answer.trim() || intake.isPending}
                className="rounded-xl bg-(--brand-500) px-5 text-[12px] font-bold text-white disabled:opacity-50"
              >
                Send
              </button>
            </form>
            </div>
          )}

          {intake.isError || generationError ? (
            <p className="shrink-0 px-5 pb-3 text-[12px] font-semibold text-red-600 sm:px-10 lg:px-16">
              {generationError ||
                'Something went wrong. Your answer is still here—please try again.'}
            </p>
          ) : null}
        </section>
        )}
      </main>
    </div>
  )
}
