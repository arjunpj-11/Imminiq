import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { AppShellBoundary } from '../../../../components/layout/AppShell';
import PageHero from '../../../../components/layout/PageHero';
import { MicButton, VoiceInputStatus } from '../../../../components/input/VoiceInputButton';
import ConfirmDialog from '../../../../components/overlays/ConfirmDialog';
import { useVoiceInput } from '../../../../hooks/useVoiceInput';
import { ROUTES } from '../../../../routes/config/route-paths';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { toast } from '../../../../lib/toast';
import AdaptiveMasteryGraph from '../components/AdaptiveMasteryGraph';
import { useGenerateRoadmap, useTrackerCreationStore } from '../../tracker-creation';
import { useActiveMockTestGeneration, useGenerateMockTest } from '../../mock-tests';
import type { AdaptiveAdvisorAction } from '../types/adaptive-learning.types';
import {
  useAdaptiveAdvisorChat,
  useClearAdaptiveAdvisorChat,
  useAdaptiveLearningDashboard,
  useGenerateAdaptiveAssessment,
} from '../hooks/useAdaptiveLearning';
import { FEATURE_AVAILABILITY_SAFE_FALLBACK } from '../../../../config/feature-availability';
import { useFeatureAvailability } from '../../../../hooks/useFeatureAvailability';

export default function AdaptiveLearningPage() {
  const navigate = useNavigate();
  const featureQuery = useFeatureAvailability();
  const features = featureQuery.data ?? FEATURE_AVAILABILITY_SAFE_FALLBACK;
  const dashboard = useAdaptiveLearningDashboard();
  const chat = useAdaptiveAdvisorChat();
  const clearChat = useClearAdaptiveAdvisorChat();
  const generate = useGenerateAdaptiveAssessment();
  const activeMockTestGeneration = useActiveMockTestGeneration();
  const generateRoadmap = useGenerateRoadmap();
  const generateMockTest = useGenerateMockTest();
  const saveStepOneDraft = useTrackerCreationStore((state) => state.saveStep1);
  const saveStepTwoDraft = useTrackerCreationStore((state) => state.saveStep2);
  const setActiveRoadmapJobId = useTrackerCreationStore((state) => state.setActiveRoadmapJobId);
  const activeRoadmapJobId = useTrackerCreationStore((state) => state.activeRoadmapJobId);
  const [question, setQuestion] = useState('');
  const [advisorAction, setAdvisorAction] = useState<AdaptiveAdvisorAction | null>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const voice = useVoiceInput((transcript) =>
    setQuestion((current) => (current.trim() ? `${current.trim()} ${transcript}` : transcript))
  );
  const messagesContainer = useRef<HTMLDivElement>(null);
  const data = dashboard.data;
  const advisorActionAvailable =
    !advisorAction ||
    (advisorAction.type === 'create_tracker'
      ? features.trackers && features.trackerCreation
      : advisorAction.type === 'browse_community_trackers'
        ? features.community
        : features.mockTests);

  useEffect(() => {
    const container = messagesContainer.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [data?.messages.length, chat.isPending]);

  const sendQuestion = async (event: FormEvent) => {
    event.preventDefault();
    const value = question.trim();
    if (!value || chat.isPending) return;
    setQuestion('');
    setAdvisorAction(null);
    try {
      const result = await chat.mutateAsync(value);
      setAdvisorAction(result.action ?? null);
    } catch (error) {
      toast.error(
        'Immi could not answer',
        getUserFacingError(error, 'Unable to send this question right now.')
      );
    }
  };

  const generateExam = () => {
    generate.mutate(undefined, {
      onSuccess: (job) => navigate(ROUTES.mockTestGenerating(job.jobId)),
      onError: (error) =>
        toast.error(
          'Adaptive exam not generated',
          getUserFacingError(error, 'The adaptive exam could not be generated.')
        ),
    });
  };

  const clearAdvisorConversation = async () => {
    if (voice.isListening) voice.toggle();
    try {
      await clearChat.mutateAsync();
      setClearDialogOpen(false);
      setQuestion('');
      setAdvisorAction(null);
      toast.success('Advisor conversation cleared');
    } catch (error) {
      toast.error(
        'Conversation not cleared',
        getUserFacingError(error, 'Unable to clear this conversation.')
      );
    }
  };

  const executeAdvisorAction = async () => {
    if (!advisorAction || generateRoadmap.isPending || generateMockTest.isPending) {
      return;
    }

    try {
      if (advisorAction.type === 'browse_community_trackers') {
        navigate(`${ROUTES.community}?q=${encodeURIComponent(advisorAction.topic)}`);
        return;
      }

      if (advisorAction.type === 'create_tracker') {
        if (activeRoadmapJobId) {
          toast.info(
            'Tracker generation already active',
            'Another tracker is already being created. Wait for it to finish before creating a new one.'
          );
          return;
        }
        const response = await generateRoadmap.mutateAsync({
          topic: advisorAction.topic,
          goal: advisorAction.goal,
          level: advisorAction.level,
          preferredLanguage: 'English',
        });
        const jobId = response.data?.jobId;
        if (!jobId) throw new Error('Tracker generation did not return a job ID.');

        saveStepOneDraft({
          topic: advisorAction.topic,
          goal: advisorAction.goal,
          preferredLanguage: 'English',
        });
        saveStepTwoDraft({ level: advisorAction.level });
        setActiveRoadmapJobId(jobId);
        navigate(ROUTES.trackerCreateGenerating(jobId));
        return;
      }

      const response = await generateMockTest.mutateAsync({
        topic: advisorAction.topic,
        difficulty: advisorAction.difficulty,
        questionCount: advisorAction.questionCount,
        questionTypes: ['mcq'],
        trackerId: advisorAction.trackerId,
        timeLimitMinutes: Math.max(10, advisorAction.questionCount * 2),
        runInBackground: true,
      });
      const jobId = 'jobId' in response.data ? response.data.jobId : undefined;
      if (!jobId) throw new Error('Mock-test generation did not return a job ID.');
      navigate(`/mock-tests/generating/${jobId}`);
    } catch (error) {
      const apiMessage = (error as { response?: { data?: { message?: string } } }).response?.data
        ?.message;
      toast.error(
        'Recommended action not started',
        apiMessage ||
          (error instanceof Error ? error.message : 'Unable to start the recommended action.')
      );
    }
  };

  return (
    <AppShellBoundary>
      <main className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full flex-col gap-6 pb-24 max-[640px]:w-[calc(100%-20px)]">
        <PageHero
          eyebrow="Adaptive learning"
          title={
            <>
              Your learning <span className="text-(--brand-500)">navigator</span>
            </>
          }
          description="Ask what to study next, discover the best tracker to continue, or choose the assessment most likely to expose your current knowledge gaps."
          aside={
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
                Adaptive level
              </div>
              <div className="mt-3 font-ui text-[28px] font-extrabold leading-none capitalize text-(--brand-500)">
                {data?.profile.level ?? 'Loading'}
              </div>
              <div className="mt-2 text-[12px] text-(--text-secondary)">
                {data?.profile.masteryScore ?? 0}% mastery
              </div>
            </div>
          }
        />

        {dashboard.isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            The learning agent dashboard could not be loaded.
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="flex h-160 min-h-130 max-h-[calc(100vh-120px)] flex-col overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-1)">
            <div className="flex items-start justify-between gap-4 border-b border-(--border-subtle) p-5">
              <div>
                <h2 className="font-ui text-[18px] font-black text-(--text-primary)">Ask Immi</h2>
                <p className="mt-1 text-[12px] text-(--text-secondary)">
                  Recommendations use your trackers, recent test performance, mastery, and streak.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setClearDialogOpen(true)}
                disabled={clearChat.isPending || chat.isPending || !data?.messages.length}
                className="shrink-0 rounded-xl border border-(--border-subtle) bg-(--surface-card) px-3.5 py-2 text-[11px] font-bold text-(--text-secondary) transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-45 dark:hover:bg-red-950/20"
              >
                {clearChat.isPending ? 'Clearing…' : 'Clear chat'}
              </button>
            </div>

            <div ref={messagesContainer} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
              {!data?.messages.length ? (
                <div className="rounded-2xl bg-[rgba(184,76,43,0.08)] p-4 text-[13px] leading-6 text-(--text-secondary)">
                  <p>Choose a starting point or ask in your own words.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      'What should I study next?',
                      'Which tracker should I continue?',
                      'What should I revise today?',
                      'Which mock test would expose my gaps?',
                    ].map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => setQuestion(prompt)}
                        className="min-h-10 rounded-full border border-[rgba(184,76,43,0.22)] bg-(--surface-card) px-3 text-[12px] font-bold text-(--brand-500) transition hover:border-(--brand-500)"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
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
              {advisorAction ? (
                <div className="max-w-[92%] rounded-2xl border border-[rgba(184,76,43,0.25)] bg-[rgba(184,76,43,0.07)] p-4">
                  <div className="font-mono text-[9px] uppercase tracking-[0.13em] text-(--brand-500)">
                    Ready action
                  </div>
                  <p className="mt-2 text-[12px] leading-5 text-(--text-secondary)">
                    {advisorAction.type === 'create_tracker'
                      ? `Generate a ${advisorAction.level} tracker for ${advisorAction.topic}.`
                      : advisorAction.type === 'browse_community_trackers'
                        ? `Browse community trackers matching ${advisorAction.topic}.`
                        : `Generate a ${advisorAction.difficulty} ${advisorAction.questionCount}-question mock test for ${advisorAction.topic}.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => void executeAdvisorAction()}
                    disabled={
                      !advisorActionAvailable ||
                      generateRoadmap.isPending ||
                      generateMockTest.isPending
                    }
                    className="mt-3 rounded-xl bg-(--brand-500) px-4 py-2.5 text-[12px] font-bold text-white disabled:opacity-60"
                  >
                    {!advisorActionAvailable
                      ? 'Temporarily unavailable'
                      : generateRoadmap.isPending || generateMockTest.isPending
                        ? 'Starting generation…'
                        : advisorAction.label}
                  </button>
                </div>
              ) : null}
            </div>

            <form
              onSubmit={(event) => void sendQuestion(event)}
              className="flex gap-2 border-t border-(--border-subtle) p-4"
            >
              <div className="relative min-w-0 flex-1 overflow-hidden rounded-xl">
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  disabled={voice.phase !== 'idle'}
                  placeholder="Ask what to prepare next…"
                  className="h-full w-full rounded-xl border border-(--border-subtle) bg-transparent px-4 py-3 text-[13px] text-(--text-primary) outline-none focus:border-(--brand-500)"
                />
                <VoiceInputStatus phase={voice.phase} audioLevel={voice.audioLevel} />
              </div>
              <MicButton
                isListening={voice.isListening}
                phase={voice.phase}
                isSupported={voice.isSupported}
                onToggle={voice.toggle}
              />
              <button
                type="submit"
                disabled={chat.isPending || voice.phase !== 'idle' || !question.trim()}
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
                    Predicted score: {data.latestAssessment.predictedScore}% ·{' '}
                    {data.latestAssessment.difficulty}
                  </p>
                  <p className="mt-2 rounded-xl border border-(--border-subtle) bg-(--surface-card)/60 p-3 text-[11.5px] leading-5 text-(--text-secondary)">
                    Why this test: {data.latestAssessment.rationale}
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
                <>
                  <button
                    type="button"
                    disabled={generate.isPending}
                    onClick={() =>
                      activeMockTestGeneration.data
                        ? navigate(ROUTES.mockTestGenerating(activeMockTestGeneration.data.jobId))
                        : generateExam()
                    }
                    className="mt-4 w-full rounded-xl bg-(--brand-500) py-3 text-[12px] font-bold text-white disabled:opacity-60"
                  >
                    {activeMockTestGeneration.data
                      ? 'View generating test'
                      : generate.isPending
                        ? 'Starting background job…'
                        : 'Generate adaptive exam'}
                  </button>
                </>
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
              {data && (
                <details className="mt-4 rounded-xl border border-(--border-subtle) bg-(--surface-elevated) p-3">
                  <summary className="cursor-pointer text-[12px] font-bold text-(--text-primary)">
                    What Immi used
                  </summary>
                  <p className="mt-2 text-[11.5px] leading-5 text-(--text-secondary)">
                    {data.learnerSummary.trackerCount} trackers,{' '}
                    {data.learnerSummary.recentTestCount} recent tests,{' '}
                    {data.learnerSummary.averageScore === null
                      ? 'no recent average score'
                      : `${data.learnerSummary.averageScore}% average score`}
                    , and a {data.learnerSummary.streakCount}-day streak. Immi does not change your
                    trackers or start tests until you press an action button.
                  </p>
                </details>
              )}
            </div>
          </aside>
        </div>

        {data ? <AdaptiveMasteryGraph history={data.profile.history} /> : null}

        <ConfirmDialog
          open={clearDialogOpen}
          title="Clear this conversation?"
          description="This will permanently remove your conversation with Immi so you can start a new one."
          confirmText="Clear chat"
          variant="danger"
          isLoading={clearChat.isPending}
          onConfirm={() => void clearAdvisorConversation()}
          onClose={() => setClearDialogOpen(false)}
        />
      </main>
    </AppShellBoundary>
  );
}
