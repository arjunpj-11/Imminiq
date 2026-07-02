import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const OnboardingGeneratingPage = lazy(
  () => import('../modules/onboarding/pages/OnboardingGeneratingPage'),
)
const OnboardingRoadmapEvaluationLoadingPage = lazy(
  () =>
    import(
      '../modules/onboarding/pages/OnboardingRoadmapEvaluationLoadingPage'
    ),
)
const OnboardingRoadmapEvaluationScorePage = lazy(
  () =>
    import('../modules/onboarding/pages/OnboardingRoadmapEvaluationScorePage'),
)
const OnboardingRoadmapReadyPage = lazy(
  () => import('../modules/onboarding/pages/OnboardingRoadmapReadyPage'),
)
const OnboardingStepOnePage = lazy(
  () => import('../modules/onboarding/pages/OnboardingStepOnePage'),
)
const OnboardingStepTwoPage = lazy(
  () => import('../modules/onboarding/pages/OnboardingStepTwoPage'),
)

export const onboardingRoutes: RouteObject[] = [
  { path: '/onboarding/step-1', element: <OnboardingStepOnePage /> },
  { path: '/onboarding/step-2', element: <OnboardingStepTwoPage /> },
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
