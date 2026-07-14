import type { RouteObject } from 'react-router-dom';

import {
  OnboardingGeneratingPage,
  OnboardingRoadmapEvaluationLoadingPage,
  OnboardingRoadmapEvaluationScorePage,
  OnboardingRoadmapReadyPage,
  OnboardingStepOnePage,
} from '../config/onboarding-pages';
import { ROUTES } from '../config/route-paths';

export const onboardingRoutes: RouteObject[] = [
  {
    path: ROUTES.onboardingStepOne,
    element: <OnboardingStepOnePage />,
  },
  {
    path: ROUTES.onboardingGeneratingPattern,
    element: <OnboardingGeneratingPage />,
  },
  {
    path: ROUTES.onboardingRoadmapReadyPattern,
    element: <OnboardingRoadmapReadyPage />,
  },
  {
    path: ROUTES.onboardingEvaluationPattern,
    element: <OnboardingRoadmapEvaluationLoadingPage />,
  },
  {
    path: ROUTES.onboardingEvaluationScorePattern,
    element: <OnboardingRoadmapEvaluationScorePage />,
  },
];
