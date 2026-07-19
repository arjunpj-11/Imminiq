import { useNavigate } from 'react-router-dom';

import {
  useAdaptiveLearningDashboard,
  useGenerateAdaptiveAssessment,
} from '../hooks/useAdaptiveLearning';
import { useActiveMockTestGeneration } from '../../mock-tests';
import { ROUTES } from '../../../../routes/config/route-paths';
import { getUserFacingError } from '../../../../lib/user-facing-error';

export default function AdaptiveExamPanel() {
  const navigate = useNavigate();
  const dashboard = useAdaptiveLearningDashboard();
  const generate = useGenerateAdaptiveAssessment();
  const activeGeneration = useActiveMockTestGeneration();
  const assessment = dashboard.data?.latestAssessment;

  const generateExam = () => {
    generate.mutate(undefined, {
      onSuccess: (job) => navigate(ROUTES.mockTestGenerating(job.jobId)),
    });
  };

  return (
    <section className="rounded-2xl border border-[rgba(184,76,43,0.22)] bg-[linear-gradient(135deg,rgba(184,76,43,0.10),var(--surface-card))] p-5 shadow-(--shadow-1)">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--brand-500)">
            Adaptive agent exam
          </div>
          <h2 className="mt-2 font-ui text-[21px] font-black text-(--text-primary)">
            {assessment?.status === 'ready'
              ? `${assessment.topic} · predicted ${assessment.predictedScore}%`
              : 'Let the agent choose your next exam'}
          </h2>
          <p className="mt-2 text-[12.5px] leading-6 text-(--text-secondary)">
            {assessment?.status === 'ready'
              ? assessment.rationale
              : 'It reviews your trackers, progress, and previous mock-test results before choosing the topic and difficulty.'}
          </p>
          {assessment?.status === 'completed' ? (
            <p className="mt-2 text-[12px] font-bold text-(--brand-500)">
              Predicted {assessment.predictedScore}% · scored {assessment.actualScore}% · mastery{' '}
              {assessment.masteryChange && assessment.masteryChange > 0 ? '+' : ''}
              {assessment.masteryChange ?? 0}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate(ROUTES.learningAgent)}
            className="rounded-xl border border-(--border-subtle) bg-(--surface-card) px-4 py-2.5 text-[12px] font-bold text-(--text-primary)"
          >
            Ask the agent
          </button>
          {assessment?.status === 'ready' ? (
            <button
              type="button"
              onClick={() => navigate(`/mock-tests/${assessment.testId}`)}
              className="rounded-xl bg-(--brand-500) px-4 py-2.5 text-[12px] font-bold text-white"
            >
              Open exam
            </button>
          ) : (
            <button
              type="button"
              disabled={generate.isPending}
              onClick={() =>
                activeGeneration.data
                  ? navigate(ROUTES.mockTestGenerating(activeGeneration.data.jobId))
                  : generateExam()
              }
              className="rounded-xl bg-(--brand-500) px-4 py-2.5 text-[12px] font-bold text-white disabled:opacity-60"
            >
              {activeGeneration.data
                ? 'View generating test'
                : generate.isPending
                  ? 'Starting background job…'
                  : 'Generate my exam'}
            </button>
          )}
        </div>
      </div>
      {generate.isError ? (
        <p className="mt-3 text-[12px] font-semibold text-red-600">
          {getUserFacingError(generate.error, 'The adaptive exam could not be generated.')}
        </p>
      ) : null}
    </section>
  );
}
