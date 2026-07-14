export const onboardingKeys = {
  all: ['onboarding'] as const,
  activeRoadmapJob: () => [...onboardingKeys.all, 'active-roadmap-job'] as const,
  roadmapJobStatus: (jobId: string) =>
    [...onboardingKeys.all, 'roadmap-job-status', jobId] as const,
  roadmapJobResult: (jobId: string) =>
    [...onboardingKeys.all, 'roadmap-job-result', jobId] as const,
  evaluationJobStatus: (jobId: string) =>
    [...onboardingKeys.all, 'roadmap-evaluation-job-status', jobId] as const,
  evaluationResult: (jobId: string) =>
    [...onboardingKeys.all, 'roadmap-evaluation-result', jobId] as const,
};
