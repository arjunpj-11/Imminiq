import { lazy } from 'react'

export const OnboardingGeneratingPage = lazy(
  () => import('../../modules/user/onboarding/pages/OnboardingGeneratingPage'),
)

export const OnboardingRoadmapEvaluationLoadingPage = lazy(
  () =>
    import(
      '../../modules/user/onboarding/pages/OnboardingRoadmapEvaluationLoadingPage'
    ),
)

export const OnboardingRoadmapEvaluationScorePage = lazy(
  () =>
    import(
      '../../modules/user/onboarding/pages/OnboardingRoadmapEvaluationScorePage'
    ),
)

export const OnboardingRoadmapReadyPage = lazy(
  () => import('../../modules/user/onboarding/pages/OnboardingRoadmapReadyPage'),
)

export const OnboardingStepOnePage = lazy(
  () => import('../../modules/user/onboarding/pages/OnboardingStepOnePage'),
)

export const OnboardingStepTwoPage = lazy(
  () => import('../../modules/user/onboarding/pages/OnboardingStepTwoPage'),
)