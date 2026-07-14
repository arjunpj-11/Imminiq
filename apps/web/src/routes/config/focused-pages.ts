import { lazy } from 'react';

export const MockTestAttemptPage = lazy(
  () => import('../../modules/user/mock-tests/pages/MockTestAttemptPage')
);

export const TrackerLessonPage = lazy(
  () => import('../../modules/user/trackers/pages/TrackerLessonPage')
);

export const TrackerQuickRevisionPage = lazy(
  () => import('../../modules/user/trackers/pages/TrackerQuickRevisionPage')
);
