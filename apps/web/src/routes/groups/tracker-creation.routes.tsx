import type { ReactNode } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import {
  OnboardingGeneratingPage,
  OnboardingRoadmapEvaluationLoadingPage,
  OnboardingRoadmapEvaluationScorePage,
  OnboardingRoadmapReadyPage,
  OnboardingStepOnePage,
} from '../config/tracker-creation-pages';
import { ROUTES } from '../config/route-paths';
import LegacyTrackerCreationRedirect from '../components/LegacyTrackerCreationRedirect';

const legacyRedirect = (element: ReactNode, path: string): RouteObject => ({ path, element });

export const trackerCreationRoutes: RouteObject[] = [
  {
    path: ROUTES.trackerCreate,
    element: <OnboardingStepOnePage />,
  },
  {
    path: ROUTES.trackerCreateGeneratingPattern,
    element: <OnboardingGeneratingPage />,
  },
  {
    path: ROUTES.trackerCreateReadyPattern,
    element: <OnboardingRoadmapReadyPage />,
  },
  {
    path: ROUTES.trackerCreateEvaluationPattern,
    element: <OnboardingRoadmapEvaluationLoadingPage />,
  },
  {
    path: ROUTES.trackerCreateEvaluationScorePattern,
    element: <OnboardingRoadmapEvaluationScorePage />,
  },
  legacyRedirect(<Navigate replace to={ROUTES.trackerCreate} />, '/onboarding/step-1'),
  legacyRedirect(
    <LegacyTrackerCreationRedirect to={ROUTES.trackerCreateGenerating} />,
    '/onboarding/generating/:jobId'
  ),
  legacyRedirect(
    <LegacyTrackerCreationRedirect to={ROUTES.trackerCreateReady} />,
    '/onboarding/roadmap-ready/:jobId'
  ),
  legacyRedirect(
    <LegacyTrackerCreationRedirect to={ROUTES.trackerCreateEvaluation} />,
    '/onboarding/roadmap-evaluation/:jobId'
  ),
  legacyRedirect(
    <LegacyTrackerCreationRedirect to={ROUTES.trackerCreateEvaluationScore} />,
    '/onboarding/roadmap-evaluation/:jobId/score'
  ),
];
