import type { RouteObject } from 'react-router-dom';

import {
  MockTestAttemptPage,
  TrackerLessonPage,
  TrackerQuickRevisionPage,
} from '../config/focused-pages';

export const focusedRoutes: RouteObject[] = [
  {
    path: '/mock-tests/attempts/:attemptId',
    element: <MockTestAttemptPage />,
  },
  {
    path: '/trackers/:trackerId/lessons/:subtopicId',
    element: <TrackerLessonPage />,
  },
  {
    path: '/trackers/:trackerId/revision',
    element: <TrackerQuickRevisionPage />,
  },
];
