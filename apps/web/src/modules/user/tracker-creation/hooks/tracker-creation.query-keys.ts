export const trackerCreationKeys = {
  all: ['tracker-creation'] as const,
  activeRoadmapJob: () => [...trackerCreationKeys.all, 'active-roadmap-job'] as const,
  roadmapJobStatus: (jobId: string) =>
    [...trackerCreationKeys.all, 'roadmap-job-status', jobId] as const,
  roadmapJobResult: (jobId: string) =>
    [...trackerCreationKeys.all, 'roadmap-job-result', jobId] as const,
  evaluationJobStatus: (jobId: string) =>
    [...trackerCreationKeys.all, 'roadmap-evaluation-job-status', jobId] as const,
  evaluationResult: (jobId: string) =>
    [...trackerCreationKeys.all, 'roadmap-evaluation-result', jobId] as const,
  reuseSuggestions: (topic: string) =>
    [...trackerCreationKeys.all, 'reuse-suggestions', topic.trim().toLowerCase()] as const,
};
