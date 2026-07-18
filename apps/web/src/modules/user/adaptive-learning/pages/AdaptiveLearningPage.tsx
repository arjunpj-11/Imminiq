import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppShellBoundary } from '../../../../components/layout/AppShell';
import { MicButton } from '../../../../components/input/VoiceInputButton';
import ConfirmDialog from '../../../../components/overlays/ConfirmDialog';
import { useVoiceInput } from '../../../../hooks/useVoiceInput';
import { ROUTES } from '../../../../routes/config/route-paths';
import AdaptiveMasteryGraph from '../components/AdaptiveMasteryGraph';
import { useGenerateRoadmap, useOnboardingStore } from '../../tracker-creation';
import { useGenerateMockTest } from '../../mock-tests/hooks/useMockTests';
import type { AdaptiveAdvisorAction } from '../types/adaptive-learning.types';
import {
  useAdaptiveAdvisorChat,
  useClearAdaptiveAdvisorChat,
  useAdaptiveLearningDashboard,
  useGenerateAdaptiveAssessment,
} from '../hooks/useAdaptiveLearning';

export default function AdaptiveLearningPage() {
  const navigate = useNavigate();
  const dashboard = useAdaptiveLearningDashboard();
  const chat = useAdaptiveAdvisorChat();
  const clearChat = useClearAdaptiveAdvisorChat();
  const generate = useGenerateAdaptiveAssessment();
  const generateRoadmap = useGenerateRoadmap();
  const generateMockTest = useGenerateMockTest();
  const saveStepOneDraft = useOnboardingStore((state) => state.saveStep1);
  const saveStepTwoDraft = useOnboardingStore((state) => state.saveStep2);
  const setActiveRoadmapJobId = useOnboardingStore((state) => state.setActiveRoadmapJobId);
  const activeRoadmapJobId = useOnboardingStore((state) => state.activeRoadmapJobId);
  const [question, setQuestion] = useState('');
  const [advisorAction, setAdvisorAction] = useState<AdaptiveAdvisorAction | null>(null);
  const [actionError, setActionError] = useState('');
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [assessmentGenerationStarted, setAssessmentGenerationStarted] = useState(false);
  const voice = useVoiceInput((transcript) =>
    setQuestion((current) => (current.trim() ? `${current.trim()} ${transcript}` : transcript))
  );
  const messagesContainer = useRef<HTMLDivElement>(null);
  const data = dashboard.data;

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
    setActionError('');
    const result = await chat.mutateAsync(value);
    setAdvisorAction(result.action ?? null);
  };

  const generateExam = async () => {
    await generate.mutateAsync();
    setAssessmentGenerationStarted(true);
  };

  const clearAdvisorConversation = async () => {
    if (voice.isListening) voice.toggle();
    await clearChat.mutateAsync();
    setClearDialogOpen(false);
    setQuestion('');
    setAdvisorAction(null);
    setActionError('');
  };

  const executeAdvisorAction = async () => {
    if (!advisorAction || generateRoadmap.isPending || generateMockTest.isPending) {
      return;
    }

    setActionError('');
    try {
      if (advisorAction.type === 'create_tracker') {
        if (activeRoadmapJobId) {
          setActionError(
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
      setActionError(
        apiMessage ||
          (error instanceof Error ? error.message : 'Unable to start the recommended action.')
      );
    }
  };

  return (
    <AppShellBoundary>
      <main className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full flex-col gap-6 pb-24 max-[640px]:w-[calc(100%-20px)]">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-mono text-[8.5px] uppercase tracking-[0.12em] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
              <span className="h-1.25 w-1.25 rounded-full bg-(--success) dark:bg-(--success)" />
              Adaptive Learning
            </div>
            <h1 className="font-ui text-[clamp(26px,3.5vw,38px)] font-extrabold leading-[1.15] tracking-[-0.8px] text-(--text-primary) dark:text-(--text-primary)">
              Your learning{' '}
              <span className="text-(--brand-500) dark:text-(--brand-500)">navigator</span>
            </h1>
            <p className="mt-2 max-w-125 text-[13px] italic leading-[1.55] text-(--text-secondary) opacity-80 dark:text-(--text-secondary)">
              Ask what to study next, which tracker to continue, or which mock test will expose your
              current weak areas.
            </p>
          </div>
          <div className="min-w-47.5 rounded-lg border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-5 py-4 text-right shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card) max-[560px]:w-full">
            <div className="font-mono text-[7.5px] uppercase tracking-[0.14em] text-(--text-secondary) opacity-55">
              Adaptive level
            </div>
            <div className="mt-1 font-ui text-[24px] font-extrabold leading-none capitalize text-(--brand-500)">
              {data?.profile.level ?? 'Loading'}
            </div>
            <div className="mt-1.5 text-[11px] text-(--text-secondary)">
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
            <div className="flex items-start justify-between gap-4 border-b border-(--border-subtle) p-5">
              <div>
                <h2 className="font-ui text-[18px] font-black text-(--text-primary)">Ask Immi</h2>
                <p className="mt-1 text-[12px] text-(--text-secondary)">
                  The agent can inspect your learning profile through read-only tools.
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
                  Try: “What should I study next?”, “Which tracker should I continue?”, or “What
                  mock test should I take today?”
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
                      : `Generate a ${advisorAction.difficulty} ${advisorAction.questionCount}-question mock test for ${advisorAction.topic}.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => void executeAdvisorAction()}
                    disabled={generateRoadmap.isPending || generateMockTest.isPending}
                    className="mt-3 rounded-xl bg-(--brand-500) px-4 py-2.5 text-[12px] font-bold text-white disabled:opacity-60"
                  >
                    {generateRoadmap.isPending || generateMockTest.isPending
                      ? 'Starting generation…'
                      : advisorAction.label}
                  </button>
                  {actionError ? (
                    <p className="mt-2 text-[11px] font-semibold text-red-600">{actionError}</p>
                  ) : null}
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
              <MicButton
                isListening={voice.isListening}
                isSupported={voice.isSupported}
                onToggle={voice.toggle}
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
                    Predicted score: {data.latestAssessment.predictedScore}% ·{' '}
                    {data.latestAssessment.difficulty}
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
                    disabled={generate.isPending || assessmentGenerationStarted}
                    onClick={() => void generateExam()}
                    className="mt-4 w-full rounded-xl bg-(--brand-500) py-3 text-[12px] font-bold text-white disabled:opacity-60"
                  >
                    {generate.isPending
                      ? 'Starting background job…'
                      : assessmentGenerationStarted
                        ? 'Generating in background'
                        : 'Generate adaptive exam'}
                  </button>
                  {assessmentGenerationStarted ? (
                    <p className="mt-3 text-[11.5px] leading-5 text-(--text-secondary)">
                      You can continue using Imminiq. We’ll notify you when the assessment is ready.
                    </p>
                  ) : null}
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
