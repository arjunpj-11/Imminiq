import { lazy } from 'react';

export const TrackerGenerationProgressPage = lazy(
  () => import('../../modules/user/tracker-creation/pages/TrackerGenerationProgressPage')
);

export const TrackerEvaluationProgressPage = lazy(
  () => import('../../modules/user/tracker-creation/pages/TrackerEvaluationProgressPage')
);

export const TrackerEvaluationResultPage = lazy(
  () => import('../../modules/user/tracker-creation/pages/TrackerEvaluationResultPage')
);

export const TrackerRoadmapReviewPage = lazy(
  () => import('../../modules/user/tracker-creation/pages/TrackerRoadmapReviewPage')
);

export const AiTrackerCreationPage = lazy(
  () => import('../../modules/user/tracker-creation/pages/AiTrackerCreationPage')
);

export const TrackerCreationChoicePage = lazy(
  () => import('../../modules/user/tracker-creation/pages/TrackerCreationChoicePage')
);

export const ManualTrackerCreationPage = lazy(
  () => import('../../modules/user/tracker-creation/pages/ManualTrackerCreationPage')
);
