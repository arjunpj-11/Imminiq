import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ROUTES } from '../../../../routes/config/route-paths';
import {
  OnboardingActivityChips,
  OnboardingProgressStatusCard,
  OnboardingWorkflowFooter,
} from '../components/OnboardingWorkflowStatus';
import {
  OnboardingContextCard,
  OnboardingErrorBanner,
  OnboardingStepCard,
  OnboardingWorkflowHeader,
  OnboardingWorkflowHero,
} from '../components/OnboardingWorkflowLayout';
import { evaluationSteps } from '../constants/onboarding.constants';
import {
  useRoadmapEvaluationJobStatus,
  type EvaluationJobStatus,
} from '../hooks/useRoadmapEvaluationJobStatus';
import { useOnboardingStore } from '../store/useOnboardingStore';
import type { ActivityChip, JobTerminalState, ProgressStepState } from '../types/onboarding.types';
import { clampProgress, normalizeProgressStepIndex } from '../utils/onboarding-progress';

const activityProgressMap = [0, 1, 2, 3, 3];
const stepProgressFloors = [15, 35, 55, 75, 90];

const defaultEvalStatus = {
  progress: 8,
  activeStepIndex: 0,
  terminalState: null as JobTerminalState,
  logMessage: 'Connecting to the evaluation engine… Preparing your roadmap context.',
  engineLabel: 'Initialising evaluation pipeline',
  nextLabel: 'Estimated next: Completeness check',
  stepsLabel: '0 / 5 steps complete',
  activeActivityIndex: 0,
};

const normalizeEvalStatus = (status?: EvaluationJobStatus) => {
  if (!status) return defaultEvalStatus;

  const rawStatus = (status.status || '').toLowerCase();
  const terminalState: JobTerminalState =
    rawStatus === 'completed' || rawStatus === 'success' || rawStatus === 'done'
      ? 'completed'
      : rawStatus === 'failed' || rawStatus === 'error'
        ? 'failed'
        : null;
  const completedSteps =
    typeof status.completedSteps === 'number' ? status.completedSteps : undefined;
  const rawProgress =
    status.totalSteps > 0
      ? Math.round((status.completedSteps / status.totalSteps) * 100)
      : undefined;
  const activeStepIndex = normalizeProgressStepIndex(
    status.currentStepNumber,
    completedSteps,
    rawProgress ?? 0
  );
  const progress = clampProgress(
    rawProgress ??
      (terminalState === 'completed'
        ? 100
        : (stepProgressFloors[activeStepIndex] ?? defaultEvalStatus.progress))
  );
  const completedStepCount =
    terminalState === 'completed'
      ? 5
      : typeof completedSteps === 'number'
        ? Math.min(5, Math.max(0, completedSteps))
        : Math.min(4, Math.max(0, activeStepIndex));
  const defaultActiveStep =
    evaluationSteps[activeStepIndex]?.activeLabel ||
    evaluationSteps[activeStepIndex]?.label ||
    'Evaluating roadmap…';
  const defaultLogByStep = [
    'Scanning your roadmap for topic coverage and structural completeness.',
    'Measuring the depth of each learning area and progression logic.',
    'Assessing how well the roadmap prepares you for real interview scenarios.',
    'Identifying missing topics, strengths, and areas of improvement.',
    'Compiling your final roadmap score and detailed feedback.',
  ];
  const defaultNextLabels = [
    'Estimated next: Learning depth',
    'Estimated next: Interview readiness',
    'Estimated next: Gap analysis',
    'Estimated next: Score compilation',
    'Estimated next: Score ready',
  ];

  return {
    progress,
    activeStepIndex,
    terminalState,
    logMessage:
      terminalState === 'completed'
        ? 'Evaluation complete. Your roadmap score is ready. ✦'
        : terminalState === 'failed'
          ? 'Evaluation failed. Please try again.'
          : defaultLogByStep[activeStepIndex] || defaultEvalStatus.logMessage,
    engineLabel:
      terminalState === 'completed'
        ? 'Evaluation complete'
        : terminalState === 'failed'
          ? 'Evaluation interrupted'
          : defaultActiveStep,
    nextLabel:
      terminalState === 'completed'
        ? 'Ready — opening your score'
        : terminalState === 'failed'
          ? 'Return to roadmap and try again'
          : defaultNextLabels[activeStepIndex] || defaultEvalStatus.nextLabel,
    stepsLabel: `${completedStepCount} / 5 steps complete`,
    activeActivityIndex:
      terminalState === 'completed' ? -1 : (activityProgressMap[activeStepIndex] ?? 0),
  };
};

const CompletenessIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);

const DepthIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <line x1="12" y1="2" x2="12" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
);

const ReadinessIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const GapIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const activityChips: ActivityChip[] = [
  { label: 'Scanning completeness', icon: <CompletenessIcon /> },
  { label: 'Measuring learning depth', icon: <DepthIcon /> },
  { label: 'Checking readiness', icon: <ReadinessIcon /> },
  { label: 'Detecting coverage gaps', icon: <GapIcon /> },
];

export default function OnboardingRoadmapEvaluationLoadingPage() {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const roadmapTopic = useOnboardingStore(
    (state) => state.step1Data?.topic || 'MERN stack interviews'
  );
  const roadmapGoal = useOnboardingStore(
    (state) => state.step1Data?.goal || 'Crack top company interviews'
  );
  const { data, isLoading, error } = useRoadmapEvaluationJobStatus(jobId);
  const evalStatus = useMemo(() => normalizeEvalStatus(data?.data), [data?.data]);
  const statusError =
    error?.message || data?.data?.errorMessage || (!jobId ? 'Missing evaluation job ID.' : '');

  useEffect(() => {
    if (evalStatus.terminalState !== 'completed' || !jobId) return;

    const timer = window.setTimeout(() => {
      navigate(ROUTES.trackerCreateEvaluationScore(jobId), { replace: true });
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [evalStatus.terminalState, navigate, jobId]);

  const stepStates = useMemo<ProgressStepState[]>(() => {
    return evaluationSteps.map((_, index) => {
      if (evalStatus.terminalState === 'completed') return 'done';
      if (index < evalStatus.activeStepIndex) return 'done';
      if (index === evalStatus.activeStepIndex) return 'active';
      return 'pending';
    });
  }, [evalStatus.activeStepIndex, evalStatus.terminalState]);

  return (
    <div className="flex min-h-screen flex-col bg-(--surface-canvas) font-[DM_Sans,sans-serif] text-(--text-primary)">
      <OnboardingWorkflowHeader label="AI Roadmap Evaluation" />

      <main className="mx-auto flex w-full max-w-280 flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-10">
        <OnboardingWorkflowHero
          eyebrow="Roadmap quality review"
          title="Scoring your learning roadmap"
          description="Gemini is reviewing completeness, learning depth, interview readiness, and credible gaps before preparing your final score."
        />

        {statusError || (!isLoading && !data) ? (
          statusError ? (
            <OnboardingErrorBanner message={statusError} />
          ) : null
        ) : null}

        <section className="grid w-full grid-cols-1 gap-5 lg:grid-cols-2">
          <OnboardingContextCard
            title="Roadmap being evaluated"
            description="The score is measured against the topic and outcome you selected during tracker creation."
            rows={[
              { label: 'Field', value: roadmapTopic },
              { label: 'Goal', value: roadmapGoal },
            ]}
          />

          <OnboardingStepCard
            title="Evaluation progress"
            description="Each stage examines a different dimension of roadmap quality and usefulness."
            steps={evaluationSteps}
            states={stepStates}
          />
        </section>

        <OnboardingProgressStatusCard
          logMessage={evalStatus.logMessage}
          engineLabel={evalStatus.engineLabel}
          nextLabel={evalStatus.nextLabel}
          progress={evalStatus.progress}
          stepsLabel={evalStatus.stepsLabel}
          progressAriaLabel="Evaluation progress"
        />

        <OnboardingActivityChips
          chips={activityChips}
          activeActivityIndex={evalStatus.activeActivityIndex}
          completed={evalStatus.terminalState === 'completed'}
          ariaLabel="Current evaluation activities"
        />

        {evalStatus.terminalState === 'failed' ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl bg-(--brand-500) px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(184,76,43,0.22)] transition hover:-translate-y-0.5 hover:bg-(--brand-600) dark:text-[#141412]"
            >
              Return to roadmap
            </button>
          </div>
        ) : null}
      </main>

      <OnboardingWorkflowFooter />
    </div>
  );
}
