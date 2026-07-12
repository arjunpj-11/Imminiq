import { lazy } from 'react'

export const OnboardingGeneratingPage = lazy(
  () => import('../../modules/onboarding/pages/OnboardingGeneratingPage'),
)

export const OnboardingRoadmapEvaluationLoadingPage = lazy(
  () =>
    import(
      '../../modules/onboarding/pages/OnboardingRoadmapEvaluationLoadingPage'
    ),
)

export const OnboardingRoadmapEvaluationScorePage = lazy(
  () =>
    import(
      '../../modules/onboarding/pages/OnboardingRoadmapEvaluationScorePage'
    ),
)

export const OnboardingRoadmapReadyPage = lazy(
  () => import('../../modules/onboarding/pages/OnboardingRoadmapReadyPage'),
)

export const OnboardingStepOnePage = lazy(
  () => import('../../modules/onboarding/pages/OnboardingStepOnePage'),
)

export const OnboardingStepTwoPage = lazy(
  () => import('../../modules/onboarding/pages/OnboardingStepTwoPage'),
)