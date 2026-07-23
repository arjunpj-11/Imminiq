import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { MicButton } from '../../../../components/input/VoiceInputButton';
import ConfirmDialog from '../../../../components/overlays/ConfirmDialog';
import { useVoiceInput } from '../../../../hooks/useVoiceInput';
import { ROUTES } from '../../../../routes/config/route-paths';
import OnboardingBrandLink from '../components/OnboardingBrandLink';
import { useActiveRoadmapJob } from '../hooks/useActiveRoadmapJob';
import { useGenerateRoadmap } from '../hooks/useGenerateRoadmap';
import { useRoadmapJobStatus } from '../hooks/useRoadmapJobStatus';
import { useSaveOnboardingStepOne } from '../hooks/useSaveOnboardingStepOne';
import { useSaveOnboardingStepTwo } from '../hooks/useSaveOnboardingStepTwo';
import { useTrackerIntake } from '../hooks/useTrackerIntake';
import { useTrackerReuseSuggestions } from '../hooks/useTrackerReuseSuggestions';
import { useOnboardingStore } from '../store/useOnboardingStore';
import type { ITrackerIntakeMessage, ITrackerIntakeProfile } from '../types/onboarding.types';

const INITIAL_MESSAGE: ITrackerIntakeMessage = {
  role: 'assistant',
  content: 'What would you like to learn, and what made you choose it right now?',
};

const buildPersonalizedGoal = (profile: ITrackerIntakeProfile) =>
  [
    `Motivation: ${profile.motivation}`,
    `Outcome: ${profile.desiredOutcome}`,
    `Experience: ${profile.currentExperience}`,
    `Time: ${profile.weeklyTimeCommitment}`,
    `Language: ${profile.preferredLanguage}`,
    profile.learningPreferences.length
      ? `Preferences: ${profile.learningPreferences.join(', ')}`
      : '',
    profile.constraints.length ? `Constraints: ${profile.constraints.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join(' · ')
    .slice(0, 400);

const ArrowLeftIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const SendIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

function ConversationMessage({ message }: { message: ITrackerIntakeMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser ? (
        <span className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.09)] text-[13px] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)]">
          ✦
        </span>
      ) : null}

      <div
        className={`max-w-[86%] rounded-2xl px-4 py-3 shadow-[0_5px_18px_rgba(26,23,20,0.05)] sm:max-w-[76%] ${
          isUser
            ? 'rounded-br-md bg-(--brand-500) text-white dark:text-[#141412]'
            : 'rounded-bl-md border border-(--border-subtle) bg-(--surface-card) text-(--text-primary) dark:border-white/15'
        }`}
      >
        <p
          className={`mb-1 text-[9px] font-bold uppercase tracking-widest ${isUser ? 'text-white/70 dark:text-[#141412]/60' : 'text-(--brand-500)'}`}
        >
          {isUser ? 'You' : 'Immi'}
        </p>
        <p className="text-[13.5px] leading-6 sm:text-[14px]">{message.content}</p>
      </div>
    </div>
  );
}

function CreationOverview({ profile }: { profile: ITrackerIntakeProfile | null }) {
  const steps = [
    ['Tell Immi your goal', 'A short conversation captures your outcome and current experience.'],
    [
      'Review the best route',
      'Reuse a trusted community tracker or generate a new personalised one.',
    ],
    ['Generate and evaluate', 'The roadmap is built, previewed, and checked for useful coverage.'],
  ];

  return (
    <aside className="hidden min-h-0 flex-col gap-4 overflow-y-auto lg:flex">
      <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-[0_12px_36px_rgba(26,23,20,0.05)] dark:border-white/15">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-(--brand-500)">
          Creation overview
        </p>
        <h2 className="mt-2 font-serif text-[22px] font-black tracking-[-0.4px]">
          From idea to roadmap
        </h2>
        <p className="mt-2 text-[12.5px] leading-6 text-(--text-secondary)">
          The conversation stays focused and only asks for details needed to shape your tracker.
        </p>

        <div className="mt-5 space-y-3">
          {steps.map(([title, description], index) => (
            <div
              key={title}
              className="flex gap-3 rounded-xl bg-(--surface-canvas)/55 p-3.5 dark:bg-(--surface-canvas)/40"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] text-[12px] font-black text-(--brand-500)">
                {index + 1}
              </span>
              <div>
                <p className="text-[12.5px] font-black text-(--text-primary)">{title}</p>
                <p className="mt-1 text-[11px] leading-5 text-(--text-secondary)">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-5 dark:border-white/15">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-(--brand-500)">
            Personalisation status
          </p>
          <span
            className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] ${profile ? 'bg-[rgba(76,175,125,0.10)] text-(--success)' : 'bg-(--surface-canvas) text-(--text-secondary)'}`}
          >
            {profile ? 'Ready' : 'Learning'}
          </span>
        </div>

        {profile ? (
          <dl className="mt-4 space-y-2.5">
            {[
              ['Topic', profile.topic],
              ['Level', profile.inferredLevel],
              ['Language', profile.preferredLanguage],
              ['Weekly time', profile.weeklyTimeCommitment],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-(--border-subtle) px-3.5 py-3 dark:border-white/10"
              >
                <dt className="text-[9px] font-bold uppercase tracking-[0.09em] text-(--text-secondary)">
                  {label}
                </dt>
                <dd className="mt-1 line-clamp-2 text-[12px] font-black text-(--text-primary)">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-(--border-subtle) bg-(--surface-canvas)/45 p-4 text-[11.5px] leading-5 text-(--text-secondary) dark:border-white/15">
            Your topic, level, language, and available time will appear here as Immi understands
            your answers.
          </div>
        )}
      </div>
    </aside>
  );
}

export default function OnboardingStepOnePage() {
  const navigate = useNavigate();
  const storedMessages = useOnboardingStore((state) => state.intakeMessages);
  const storedProfile = useOnboardingStore((state) => state.intakeProfile);
  const saveIntake = useOnboardingStore((state) => state.saveIntake);
  const clearIntake = useOnboardingStore((state) => state.clearIntake);
  const activeRoadmapJobId = useOnboardingStore((state) => state.activeRoadmapJobId);
  const setActiveRoadmapJobId = useOnboardingStore((state) => state.setActiveRoadmapJobId);
  const saveStepOneDraft = useOnboardingStore((state) => state.saveStep1);
  const saveStepTwoDraft = useOnboardingStore((state) => state.saveStep2);
  const [messages, setMessages] = useState<ITrackerIntakeMessage[]>(() =>
    storedMessages.length ? storedMessages : [INITIAL_MESSAGE]
  );
  const [profile, setProfile] = useState<ITrackerIntakeProfile | null>(() =>
    storedProfile &&
    storedProfile.preferredLanguage &&
    ['beginner', 'intermediate', 'advanced'].includes(storedProfile.inferredLevel)
      ? storedProfile
      : null
  );
  const [answer, setAnswer] = useState('');
  const [generationError, setGenerationError] = useState('');
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const conversationRef = useRef<HTMLDivElement>(null);
  const intake = useTrackerIntake();
  const saveStepOne = useSaveOnboardingStepOne();
  const saveStepTwo = useSaveOnboardingStepTwo();
  const generateRoadmap = useGenerateRoadmap();
  const serverActiveJob = useActiveRoadmapJob();
  const effectiveActiveJobId = activeRoadmapJobId ?? serverActiveJob.data?.jobId ?? null;
  const activeJob = useRoadmapJobStatus(effectiveActiveJobId ?? undefined);
  const voice = useVoiceInput((transcript) =>
    setAnswer((current) => (current.trim() ? `${current.trim()} ${transcript}` : transcript))
  );
  const suggestions = useTrackerReuseSuggestions(profile?.topic);

  useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTop = conversation.scrollHeight;
  }, [intake.isPending, messages.length]);

  useEffect(() => {
    if (serverActiveJob.data?.jobId && !activeRoadmapJobId) {
      setActiveRoadmapJobId(serverActiveJob.data.jobId);
    }
  }, [activeRoadmapJobId, serverActiveJob.data?.jobId, setActiveRoadmapJobId]);

  const activeJobStatus = (
    activeJob.data?.data?.status ||
    activeJob.data?.data?.state ||
    ''
  ).toLowerCase();
  const trackerGenerationActive =
    Boolean(effectiveActiveJobId) &&
    !['completed', 'failed', 'success', 'done', 'error'].includes(activeJobStatus);
  const generationProgress = Math.max(
    8,
    Math.min(
      95,
      Math.round(
        ((activeJob.data?.data?.currentStep ?? 0) /
          Math.max(activeJob.data?.data?.totalSteps ?? 5, 1)) *
          100
      )
    )
  );

  useEffect(() => {
    if (['completed', 'success', 'done'].includes(activeJobStatus)) {
      clearIntake();
      setActiveRoadmapJobId(null);
    } else if (['failed', 'error'].includes(activeJobStatus)) {
      setActiveRoadmapJobId(null);
    }
  }, [activeJobStatus, clearIntake, setActiveRoadmapJobId]);

  const submitAnswer = async (event: FormEvent) => {
    event.preventDefault();
    const content = answer.trim();
    if (!content || intake.isPending || profile) return;

    if (voice.isListening) voice.toggle();
    const nextMessages: ITrackerIntakeMessage[] = [...messages, { role: 'user', content }];
    setAnswer('');
    setMessages(nextMessages);

    try {
      const result = await intake.mutateAsync(nextMessages);
      const completedMessages: ITrackerIntakeMessage[] = [
        ...nextMessages,
        { role: 'assistant', content: result.assistantMessage },
      ];
      setMessages(completedMessages);
      if (result.isComplete && result.profile) setProfile(result.profile);
      saveIntake(completedMessages, result.profile);
    } catch {
      setMessages(messages);
      setAnswer(content);
    }
  };

  const startGeneration = async () => {
    if (!profile) return;

    setGenerationError('');
    const goal = buildPersonalizedGoal(profile);
    const stepOnePayload = {
      topic: profile.topic,
      goal,
      preferredLanguage: profile.preferredLanguage,
    };
    const stepTwoPayload = { level: profile.inferredLevel };
    saveStepOneDraft(stepOnePayload);
    saveStepTwoDraft(stepTwoPayload);

    try {
      await saveStepOne.mutateAsync(stepOnePayload);
      await saveStepTwo.mutateAsync(stepTwoPayload);
      const response = await generateRoadmap.mutateAsync({
        ...stepOnePayload,
        level: profile.inferredLevel,
      });
      const jobId = response.data?.jobId;
      if (!jobId) throw new Error('Generation started without a job ID.');
      setActiveRoadmapJobId(jobId);
      navigate(ROUTES.trackerCreateGenerating(jobId), { replace: true });
    } catch (error) {
      const apiMessage = (error as { response?: { data?: { message?: string } } }).response?.data
        ?.message;
      setGenerationError(
        apiMessage ||
          (error instanceof Error
            ? error.message
            : 'Unable to start tracker generation. Please try again.')
      );
    }
  };

  const isStartingGeneration =
    saveStepOne.isPending || saveStepTwo.isPending || generateRoadmap.isPending;

  const startNewConversation = () => {
    if (voice.isListening) voice.toggle();
    setClearDialogOpen(false);
    clearIntake();
    intake.reset();
    setMessages([INITIAL_MESSAGE]);
    setProfile(null);
    setAnswer('');
    setGenerationError('');
  };

  const errorMessage =
    generationError ||
    (intake.isError ? 'Something went wrong. Your answer is still here—please try again.' : '');

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-(--surface-canvas) text-(--text-primary)">
      <header className="shrink-0 border-b border-(--border-subtle) bg-(--surface-canvas)/92 backdrop-blur-xl dark:border-white/15">
        <div className="mx-auto flex h-16 w-full max-w-300 items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-(--border-subtle) bg-(--surface-card) text-(--text-secondary) transition hover:border-(--brand-500) hover:text-(--brand-500) dark:border-white/15"
              aria-label="Go back"
            >
              <ArrowLeftIcon />
            </button>
            <OnboardingBrandLink hideWordmarkOnMobile />
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-(--brand-500) sm:inline-flex">
              AI-guided creation
            </span>
            {!trackerGenerationActive && !serverActiveJob.isLoading ? (
              <button
                type="button"
                onClick={() => setClearDialogOpen(true)}
                disabled={intake.isPending || (messages.length === 1 && !answer && !profile)}
                className="rounded-xl border border-(--border-subtle) bg-(--surface-card) px-3.5 py-2 text-[11px] font-bold text-(--text-secondary) transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/15 dark:hover:bg-red-950/20"
              >
                Clear chat
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1">
        {serverActiveJob.isLoading ? (
          <section className="flex h-full items-center justify-center p-5">
            <div className="w-full max-w-lg rounded-3xl border border-(--border-subtle) bg-(--surface-card) p-8 text-center shadow-[0_20px_60px_rgba(26,23,20,0.08)] dark:border-white/15">
              <div className="mx-auto h-11 w-11 animate-spin rounded-full border-2 border-(--border-subtle) border-t-(--brand-500)" />
              <p className="mt-5 text-[14px] font-black">Checking your tracker status</p>
              <p className="mt-2 text-[12px] leading-5 text-(--text-secondary)">
                Immi is checking whether a roadmap is already being created for you.
              </p>
            </div>
          </section>
        ) : trackerGenerationActive ? (
          <section className="relative flex h-full items-center justify-center overflow-hidden bg-[linear-gradient(135deg,var(--surface-canvas),rgba(184,76,43,0.07),var(--surface-canvas))] px-5 py-10 text-center">
            <div className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-[rgba(184,76,43,0.08)] blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[rgba(184,76,43,0.10)] blur-3xl" />
            <div className="relative w-full max-w-190 rounded-3xl border border-[rgba(184,76,43,0.22)] bg-(--surface-card)/95 p-7 shadow-[0_28px_90px_rgba(26,23,20,0.13)] backdrop-blur sm:p-11">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-(--brand-500) text-2xl text-white shadow-[0_12px_32px_rgba(184,76,43,0.28)] dark:text-[#141412]">
                ✦
              </div>
              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.14em] text-(--brand-500)">
                Generation in progress
              </p>
              <h1 className="mt-3 font-serif text-[clamp(30px,5vw,48px)] font-black leading-tight">
                Your tracker is taking shape
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-[14px] leading-7 text-(--text-secondary)">
                Another tracker cannot be started while Immi is building this one. Watch the
                progress or return to your dashboard.
              </p>
              <div className="mx-auto mt-7 max-w-lg rounded-2xl border border-(--border-subtle) bg-(--surface-canvas)/70 p-5 text-left dark:border-white/15">
                <div className="flex items-center justify-between gap-3 text-[12px] font-bold text-(--text-secondary)">
                  <span>Building personalised roadmap</span>
                  <span className="text-(--brand-500)">{generationProgress}%</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-black/8 dark:bg-white/10">
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
                    navigate(ROUTES.trackerCreateGenerating(effectiveActiveJobId ?? ''))
                  }
                  className="rounded-xl bg-(--brand-500) px-6 py-3.5 text-[12px] font-bold text-white shadow-[0_8px_24px_rgba(184,76,43,0.24)] transition hover:-translate-y-0.5 hover:bg-(--brand-600) dark:text-[#141412]"
                >
                  View generation progress
                </button>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.dashboard)}
                  className="rounded-xl border border-(--border-subtle) bg-(--surface-canvas) px-6 py-3.5 text-[12px] font-bold text-(--text-primary) transition hover:border-(--brand-500) dark:border-white/15"
                >
                  Return to dashboard
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="mx-auto grid h-full w-full max-w-300 gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_330px] lg:p-6">
            <div className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-(--border-subtle) bg-(--surface-card) shadow-[0_20px_60px_rgba(26,23,20,0.08)] dark:border-white/15">
              <div className="shrink-0 border-b border-(--border-subtle) px-5 py-5 dark:border-white/15 sm:px-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-(--brand-500)" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-(--brand-500)">
                        Personalisation conversation
                      </p>
                    </div>
                    <h1 className="mt-2 font-serif text-[clamp(26px,4vw,36px)] font-black leading-tight tracking-[-0.6px]">
                      Build a tracker around you
                    </h1>
                    <p className="mt-2 max-w-3xl text-[12.5px] leading-6 text-(--text-secondary)">
                      Immi uses your learning history, then asks only what it still needs to create
                      an accurate roadmap.
                    </p>
                  </div>
                  <span className="hidden rounded-xl border border-(--border-subtle) bg-(--surface-canvas) px-3 py-2 text-[10px] font-bold text-(--text-secondary) sm:inline-flex dark:border-white/10">
                    {profile
                      ? 'Profile ready'
                      : `${Math.max(messages.filter((message) => message.role === 'user').length, 0)} answers`}
                  </span>
                </div>
              </div>

              <div
                ref={conversationRef}
                className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-black/1.5 px-4 py-5 dark:bg-white/1.5 sm:px-7 sm:py-6"
              >
                {messages.map((message, index) => (
                  <ConversationMessage
                    key={`${message.role}-${index}-${message.content.slice(0, 16)}`}
                    message={message}
                  />
                ))}
                {intake.isPending ? (
                  <div className="flex items-end gap-2.5">
                    <span className="mb-1 flex h-8 w-8 items-center justify-center rounded-xl border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.09)] text-[13px] text-(--brand-500)">
                      ✦
                    </span>
                    <div className="rounded-2xl rounded-bl-md border border-(--border-subtle) bg-(--surface-card) px-4 py-3 dark:border-white/15">
                      <div
                        className="flex items-center gap-1.5"
                        aria-label="Immi is reviewing your answer"
                      >
                        <span className="h-2 w-2 animate-bounce rounded-full bg-(--brand-500) [animation-delay:-0.2s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-(--brand-500) [animation-delay:-0.1s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-(--brand-500)" />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {profile ? (
                <div className="max-h-[46%] shrink-0 overflow-y-auto border-t border-(--border-subtle) bg-(--surface-card) p-4 dark:border-white/15 sm:p-5">
                  <div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-(--brand-500)">
                          Recommended next step
                        </p>
                        <h2 className="mt-1 font-serif text-[20px] font-black">
                          Choose the best starting point
                        </h2>
                        <p className="mt-1 text-[11.5px] leading-5 text-(--text-secondary)">
                          Reuse a close community match, or create a new {profile.inferredLevel}{' '}
                          tracker in {profile.preferredLanguage}.
                        </p>
                      </div>
                      <span className="w-fit rounded-full bg-[rgba(76,175,125,0.09)] px-3 py-1.5 text-[10px] font-bold text-(--success)">
                        Profile complete
                      </span>
                    </div>

                    {suggestions.isLoading ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {[0, 1, 2].map((item) => (
                          <div
                            key={item}
                            className="h-28 animate-pulse rounded-2xl bg-(--surface-canvas)"
                          />
                        ))}
                      </div>
                    ) : suggestions.data?.length ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {suggestions.data.map((tracker) => (
                          <button
                            key={tracker._id}
                            type="button"
                            onClick={() =>
                              navigate(ROUTES.communityTracker(tracker._id), {
                                state: {
                                  returnTo: ROUTES.trackerCreate,
                                  returnLabel: 'Back to recommendations',
                                  finishTrackerCreationOnClone: true,
                                },
                              })
                            }
                            className="group flex min-h-32 flex-col rounded-2xl border border-(--border-subtle) bg-(--surface-canvas)/55 p-4 text-left transition hover:-translate-y-0.5 hover:border-(--brand-500) hover:shadow-[0_10px_28px_rgba(184,76,43,0.10)] dark:border-white/15 dark:bg-(--surface-canvas)/40"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="line-clamp-2 text-[13px] font-black text-(--text-primary)">
                                {tracker.title}
                              </span>
                              <span className="shrink-0 text-[10px] font-bold text-(--warning)">
                                ★ {tracker.rating.toFixed(1)}
                              </span>
                            </div>
                            <span className="mt-2 line-clamp-2 text-[11px] leading-5 text-(--text-secondary)">
                              {tracker.description || tracker.topic}
                            </span>
                            <span className="mt-auto pt-3 text-[10px] font-black text-(--brand-500)">
                              View tracker, ratings & reviews{' '}
                              <span className="inline-block transition group-hover:translate-x-1">
                                →
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-dashed border-(--border-subtle) bg-(--surface-canvas)/45 px-4 py-5 text-center text-[11.5px] text-(--text-secondary) dark:border-white/15">
                        No close community match was found. A new personalised tracker is the best
                        fit.
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => void startGeneration()}
                      disabled={isStartingGeneration}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-(--brand-500) px-5 py-3.5 text-[12px] font-bold text-white shadow-[0_8px_22px_rgba(184,76,43,0.20)] transition hover:-translate-y-0.5 hover:bg-(--brand-600) disabled:opacity-60 dark:text-[#141412]"
                    >
                      {isStartingGeneration
                        ? 'Starting generation…'
                        : 'Create a new personalised tracker'}
                      {!isStartingGeneration ? <span>→</span> : null}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="shrink-0 border-t border-(--border-subtle) bg-(--surface-card) p-4 dark:border-white/15 sm:p-5">
                  <form
                    onSubmit={(event) => void submitAnswer(event)}
                    className="rounded-2xl border border-(--border-subtle) bg-(--surface-canvas)/50 p-2 transition focus-within:border-(--brand-500) focus-within:shadow-[0_0_0_3px_rgba(184,76,43,0.08)] dark:border-white/15 dark:bg-(--surface-canvas)/35"
                  >
                    <textarea
                      value={answer}
                      onChange={(event) => setAnswer(event.target.value)}
                      placeholder="Type your answer, or use the microphone…"
                      rows={2}
                      className="max-h-32 min-h-13 w-full resize-none bg-transparent px-2.5 py-2 text-[13px] leading-5 outline-none placeholder:text-(--text-secondary)/65"
                    />
                    <div className="flex items-center justify-between gap-3 border-t border-(--border-subtle) px-1 pt-2 dark:border-white/10">
                      <span className="hidden text-[10px] text-(--text-secondary) sm:inline">
                        Share only the detail needed to personalise your roadmap.
                      </span>
                      <div className="ml-auto flex items-center gap-2">
                        <MicButton
                          isListening={voice.isListening}
                          isSupported={voice.isSupported}
                          onToggle={voice.toggle}
                        />
                        <button
                          type="submit"
                          disabled={!answer.trim() || intake.isPending}
                          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-(--brand-500) px-4 text-[12px] font-bold text-white transition hover:bg-(--brand-600) disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#141412]"
                        >
                          Send <SendIcon />
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {errorMessage ? (
                <p className="shrink-0 border-t border-red-200 bg-red-50 px-5 py-3 text-[12px] font-semibold text-red-600 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
                  {errorMessage}
                </p>
              ) : null}
            </div>

            <CreationOverview profile={profile} />
          </section>
        )}
      </main>

      <ConfirmDialog
        open={clearDialogOpen}
        title="Start a new tracker conversation?"
        description="Your current answers and Immi's tracker recommendations will be cleared."
        confirmText="Clear chat"
        variant="danger"
        onConfirm={startNewConversation}
        onClose={() => setClearDialogOpen(false)}
      />
    </div>
  );
}
