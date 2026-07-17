import { lazy } from 'react';

export const OnboardingGeneratingPage = lazy(
  () => import('../../modules/user/tracker-creation/pages/OnboardingGeneratingPage')
);

export const OnboardingRoadmapEvaluationLoadingPage = lazy(
  () => import('../../modules/user/tracker-creation/pages/OnboardingRoadmapEvaluationLoadingPage')
);

export const OnboardingRoadmapEvaluationScorePage = lazy(
  () => import('../../modules/user/tracker-creation/pages/OnboardingRoadmapEvaluationScorePage')
);

export const OnboardingRoadmapReadyPage = lazy(
  () => import('../../modules/user/tracker-creation/pages/OnboardingRoadmapReadyPage')
);

export const OnboardingStepOnePage = lazy(
  () => import('../../modules/user/tracker-creation/pages/OnboardingStepOnePage')
);
