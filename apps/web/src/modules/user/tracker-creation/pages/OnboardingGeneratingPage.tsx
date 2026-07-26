import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

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
import { generationSteps } from '../constants/onboarding.constants';
import { useRoadmapJobStatus } from '../hooks/useRoadmapJobStatus';
import { useOnboardingStore } from '../store/useOnboardingStore';
import type {
  ActivityChip,
  IJobStatusApiData,
  INormalizedJobStatus,
  JobTerminalState,
  ProgressStepState,
} from '../types/onboarding.types';
import { clampProgress, normalizeProgressStepIndex } from '../utils/onboarding-progress';

const activityProgressMap = [0, 1, 2, 3, 3];
const stepProgressFloors = [15, 35, 55, 75, 90];

const capitalize = (value: string) => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const ProfileInputIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M9 9h6M9 12h6M9 15h4" />
  </svg>
);

const SearchIcon = () => (
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

const PriorityIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const FlagIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

const activityChips: ActivityChip[] = [
  { label: 'Reading profile inputs', icon: <ProfileInputIcon /> },
  { label: 'Detecting weak areas', icon: <SearchIcon /> },
  { label: 'Ranking topic priority', icon: <PriorityIcon /> },
  { label: 'Creating milestones', icon: <FlagIcon /> },
];

const defaultJobStatus: INormalizedJobStatus = {
  progress: 8,
  activeStepIndex: 0,
  terminalState: null,
  logMessage: 'Connecting to the roadmap engine… Preparing your learning context.',
  engineLabel: 'Initialising generation pipeline',
  nextLabel: 'Estimated next: Goal analysis',
  stepsLabel: '0 / 5 steps complete',
  activeActivityIndex: 0,
};

const normalizeJobStatus = (payload: IJobStatusApiData | undefined): INormalizedJobStatus => {
  if (!payload) return defaultJobStatus;

  const rawStatus = (payload.status || payload.state || '').toLowerCase();
  const terminalState: JobTerminalState =
    rawStatus === 'completed' || rawStatus === 'success' || rawStatus === 'done'
      ? 'completed'
      : rawStatus === 'failed' || rawStatus === 'error'
        ? 'failed'
        : null;
  const completedSteps = payload.completedSteps ?? payload.completedStep ?? undefined;
  const rawProgress = payload.progress ?? payload.progressPercent ?? payload.percentage;
  const activeStepIndex = normalizeProgressStepIndex(
    payload.currentStep ?? payload.step,
    completedSteps,
    rawProgress ?? 0
  );
  const progress = clampProgress(
    rawProgress ??
      (terminalState === 'completed'
        ? 100
        : (stepProgressFloors[activeStepIndex] ?? defaultJobStatus.progress))
  );
  const completedStepCount =
    terminalState === 'completed'
      ? 5
      : typeof completedSteps === 'number'
        ? Math.min(5, Math.max(0, completedSteps))
        : Math.min(4, Math.max(0, activeStepIndex));
  const defaultActiveStep =
    generationSteps[activeStepIndex]?.activeLabel ||
    generationSteps[activeStepIndex]?.label ||
    'Generating roadmap…';
  const defaultLogByStep = [
    'Analysing your selected topic and goal to understand the roadmap direction.',
    'Mapping the most important topic areas for your preparation stage.',
    'Structuring the roadmap flow, practice depth, and topic progression.',
    'Matching supportive resources and implementation guidance.',
    'Finalising your personalised learning path and preparing the result.',
  ];
  const defaultNextLabels = [
    'Estimated next: Topic mapping',
    'Estimated next: Roadmap structure',
    'Estimated next: Resource mapping',
    'Estimated next: Finalisation',
    'Estimated next: Roadmap ready',
  ];

  return {
    progress,
    activeStepIndex,
    terminalState,
    logMessage:
      payload.logMessage ||
      payload.message ||
      (terminalState === 'completed'
        ? 'Roadmap complete. Your personalised learning path is ready. ✦'
        : terminalState === 'failed'
          ? 'Roadmap generation failed. Please try again from the previous step.'
          : defaultLogByStep[activeStepIndex] || defaultJobStatus.logMessage),
    engineLabel:
      payload.engineLabel ||
      payload.progressLabel ||
      (terminalState === 'completed'
        ? 'Generation complete'
        : terminalState === 'failed'
          ? 'Generation interrupted'
          : defaultActiveStep),
    nextLabel:
      payload.nextLabel ||
      payload.nextStep ||
      (terminalState === 'completed'
        ? 'Ready — opening your roadmap'
        : terminalState === 'failed'
          ? 'Return to the tracker conversation and generate again'
          : defaultNextLabels[activeStepIndex] || defaultJobStatus.nextLabel),
    stepsLabel: `${completedStepCount} / 5 steps complete`,
    activeActivityIndex:
      terminalState === 'completed' ? -1 : (activityProgressMap[activeStepIndex] ?? 0),
  };
};

export default function OnboardingGeneratingPage() {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const setActiveRoadmapJobId = useOnboardingStore((state) => state.setActiveRoadmapJobId);
  const clearIntake = useOnboardingStore((state) => state.clearIntake);
  const topic = useOnboardingStore((state) => state.step1Data?.topic || 'MERN stack interviews');
  const goal = useOnboardingStore(
    (state) => state.step1Data?.goal || 'Crack top company interviews'
  );
  const level = useOnboardingStore((state) => state.step2Data?.level || 'intermediate');
  const { data: jobStatusResponse, error: jobStatusError } = useRoadmapJobStatus(jobId);
  const jobStatus = useMemo(
    () => normalizeJobStatus(jobStatusResponse?.data),
    [jobStatusResponse?.data]
  );
  const statusError =
    jobStatusError?.response?.data?.message ||
    (jobStatusError
      ? 'Unable to read roadmap generation progress.'
      : !jobId
        ? 'Missing roadmap generation job ID.'
        : '');

  useEffect(() => {
    if (jobStatus.terminalState !== 'completed' || !jobId) return;

    const timer = window.setTimeout(() => {
      clearIntake();
      setActiveRoadmapJobId(null);
      navigate(ROUTES.trackerCreateReady(jobId), { replace: true });
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [clearIntake, jobStatus.terminalState, navigate, jobId, setActiveRoadmapJobId]);

  const stepStates = useMemo<ProgressStepState[]>(() => {
    return generationSteps.map((_, index) => {
      if (jobStatus.terminalState === 'completed') return 'done';
      if (index < jobStatus.activeStepIndex) return 'done';
      if (index === jobStatus.activeStepIndex) return 'active';
      return 'pending';
    });
  }, [jobStatus.activeStepIndex, jobStatus.terminalState]);

  return (
    <div className="flex min-h-screen flex-col bg-(--surface-canvas) font-[DM_Sans,sans-serif] text-(--text-primary)">
      <OnboardingWorkflowHeader label="AI Roadmap Generator" />

      <main className="mx-auto flex w-full max-w-280 flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-10">
        <OnboardingWorkflowHero
          eyebrow="Personalised tracker creation"
          title="Creating your learning roadmap"
          description="Immi is turning your goals, experience, and available time into a focused roadmap with a clear learning sequence."
        />

        {statusError ? <OnboardingErrorBanner message={statusError} /> : null}

        <section className="grid w-full grid-cols-1 gap-5 lg:grid-cols-2">
          <OnboardingContextCard
            title="Your learning context"
            description="These inputs guide the depth, pacing, and structure of the tracker being created."
            rows={[
              { label: 'Field', value: topic },
              { label: 'Goal', value: goal },
              { label: 'Level', value: capitalize(level) },
            ]}
          />

          <OnboardingStepCard
            title="Generation progress"
            description="Each completed stage adds another layer to your personalised learning plan."
            steps={generationSteps}
            states={stepStates}
          />
        </section>

        <OnboardingProgressStatusCard
          logMessage={jobStatus.logMessage}
          engineLabel={jobStatus.engineLabel}
          nextLabel={jobStatus.nextLabel}
          progress={jobStatus.progress}
          stepsLabel={jobStatus.stepsLabel}
          progressAriaLabel="Generation progress"
        />

        <OnboardingActivityChips
          chips={activityChips}
          activeActivityIndex={jobStatus.activeActivityIndex}
          completed={jobStatus.terminalState === 'completed'}
          ariaLabel="Current AI activities"
        />

        {jobStatus.terminalState === 'failed' ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => navigate(ROUTES.trackerCreate, { replace: true })}
              className="rounded-xl bg-(--brand-500) px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(184,76,43,0.22)] transition hover:-translate-y-0.5 hover:bg-(--brand-600) disabled:opacity-60 dark:text-[#141412]"
            >
              Return to tracker conversation
            </button>
          </div>
        ) : null}

        {jobStatus.terminalState === null ? (
          <button
            type="button"
            onClick={() => navigate(ROUTES.dashboard, { replace: true })}
            className="group flex w-full items-center gap-4 rounded-2xl border border-[rgba(184,76,43,0.22)] bg-[linear-gradient(135deg,var(--surface-card),rgba(184,76,43,0.07))] p-4 text-left shadow-[0_12px_36px_rgba(26,23,20,0.07)] transition hover:-translate-y-0.5 hover:border-(--brand-500) hover:shadow-[0_16px_42px_rgba(184,76,43,0.13)] dark:border-[rgba(232,129,106,0.24)] dark:bg-[linear-gradient(135deg,var(--surface-card),rgba(232,129,106,0.07))] sm:p-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--brand-500) text-lg font-bold text-white shadow-[0_7px_20px_rgba(184,76,43,0.24)] dark:text-[#141412]">
              ↗
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-black text-(--text-primary)">
                Continue in the background
              </span>
              <span className="mt-1 block text-[12px] leading-5 text-(--text-secondary)">
                Return to your dashboard now. The tracker will remain active and ready when
                generation finishes.
              </span>
            </span>
            <span className="shrink-0 text-xl text-(--brand-500) transition group-hover:translate-x-1">
              →
            </span>
          </button>
        ) : null}
      </main>

      <OnboardingWorkflowFooter />
    </div>
  );
}
