import type { RouteObject } from 'react-router';

import {
  MockTestAttemptPage,
  TrackerLessonPage,
  TrackerQuickRevisionPage,
} from '../config/focused-pages';
import { ROUTES } from '../config/route-paths';

export const focusedRoutes: RouteObject[] = [
  {
    path: ROUTES.mockTestAttemptPattern,
    element: <MockTestAttemptPage />,
  },
  {
    path: ROUTES.trackerLessonPattern,
    element: <TrackerLessonPage />,
  },
  {
    path: ROUTES.trackerRevisionPattern,
    element: <TrackerQuickRevisionPage />,
  },
];
