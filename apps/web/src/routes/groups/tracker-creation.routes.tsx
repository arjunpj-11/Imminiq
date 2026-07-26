import type { ReactNode } from 'react';
import { Navigate, type RouteObject } from 'react-router';

import {
  OnboardingGeneratingPage,
  OnboardingRoadmapEvaluationLoadingPage,
  OnboardingRoadmapEvaluationScorePage,
  OnboardingRoadmapReadyPage,
  OnboardingStepOnePage,
  TrackerCreationChoicePage,
  ManualTrackerCreationPage,
} from '../config/tracker-creation-pages';
import { ROUTES } from '../config/route-paths';
import LegacyTrackerCreationRedirect from '../components/LegacyTrackerCreationRedirect';
import { FeatureAvailabilityGate } from '../guards/FeatureAvailabilityGate';

const legacyRedirect = (element: ReactNode, path: string): RouteObject => ({ path, element });
const gateTrackerCreation = (element: ReactNode) => (
  <FeatureAvailabilityGate feature={['trackers', 'trackerCreation']}>
    {element}
  </FeatureAvailabilityGate>
);

export const trackerCreationRoutes: RouteObject[] = [
  {
    path: ROUTES.trackerCreate,
    element: gateTrackerCreation(<TrackerCreationChoicePage />),
  },
  {
    path: ROUTES.trackerCreateAi,
    element: gateTrackerCreation(<OnboardingStepOnePage />),
  },
  {
    path: ROUTES.trackerCreateManual,
    element: gateTrackerCreation(<ManualTrackerCreationPage />),
  },
  {
    path: ROUTES.trackerCreateGeneratingPattern,
    element: gateTrackerCreation(<OnboardingGeneratingPage />),
  },
  {
    path: ROUTES.trackerCreateReadyPattern,
    element: gateTrackerCreation(<OnboardingRoadmapReadyPage />),
  },
  {
    path: ROUTES.trackerCreateEvaluationPattern,
    element: gateTrackerCreation(<OnboardingRoadmapEvaluationLoadingPage />),
  },
  {
    path: ROUTES.trackerCreateEvaluationScorePattern,
    element: gateTrackerCreation(<OnboardingRoadmapEvaluationScorePage />),
  },
  legacyRedirect(
    gateTrackerCreation(<Navigate replace to={ROUTES.trackerCreate} />),
    '/onboarding/step-1'
  ),
  legacyRedirect(
    gateTrackerCreation(<LegacyTrackerCreationRedirect to={ROUTES.trackerCreateGenerating} />),
    '/onboarding/generating/:jobId'
  ),
  legacyRedirect(
    gateTrackerCreation(<LegacyTrackerCreationRedirect to={ROUTES.trackerCreateReady} />),
    '/onboarding/roadmap-ready/:jobId'
  ),
  legacyRedirect(
    gateTrackerCreation(<LegacyTrackerCreationRedirect to={ROUTES.trackerCreateEvaluation} />),
    '/onboarding/roadmap-evaluation/:jobId'
  ),
  legacyRedirect(
    gateTrackerCreation(<LegacyTrackerCreationRedirect to={ROUTES.trackerCreateEvaluationScore} />),
    '/onboarding/roadmap-evaluation/:jobId/score'
  ),
];
