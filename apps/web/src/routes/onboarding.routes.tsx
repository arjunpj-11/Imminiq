import type { RouteObject } from 'react-router-dom'

import {
  OnboardingGeneratingPage,
  OnboardingRoadmapEvaluationLoadingPage,
  OnboardingRoadmapEvaluationScorePage,
  OnboardingRoadmapReadyPage,
  OnboardingStepOnePage,
  OnboardingStepTwoPage,
} from './onboarding-pages'

export const onboardingRoutes: RouteObject[] = [
  {
    path: '/onboarding/step-1',
    element: <OnboardingStepOnePage />,
  },
  {
    path: '/onboarding/step-2',
    element: <OnboardingStepTwoPage />,
  },
  {
    path: '/onboarding/generating/:jobId',
    element: <OnboardingGeneratingPage />,
  },
  {
    path: '/onboarding/roadmap-ready/:jobId',
    element: <OnboardingRoadmapReadyPage />,
  },
  {
    path: '/onboarding/roadmap-evaluation/:jobId',
    element: <OnboardingRoadmapEvaluationLoadingPage />,
  },
  {
    path: '/onboarding/roadmap-evaluation/:jobId/score',
    element: <OnboardingRoadmapEvaluationScorePage />,
  },
]