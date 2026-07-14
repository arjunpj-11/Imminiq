export const adaptiveLearningKeys = {
  all: ['adaptive-learning'] as const,
  dashboard: () => [...adaptiveLearningKeys.all, 'dashboard'] as const,
};
