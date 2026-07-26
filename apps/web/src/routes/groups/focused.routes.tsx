import type { RouteObject } from 'react-router';

import {
  MockTestAttemptPage,
  TrackerLessonPage,
  TrackerQuickRevisionPage,
} from '../config/focused-pages';
import { ROUTES } from '../config/route-paths';
import { FeatureAvailabilityGate } from '../guards/FeatureAvailabilityGate';

export const focusedRoutes: RouteObject[] = [
  {
    path: ROUTES.mockTestAttemptPattern,
    element: (
      <FeatureAvailabilityGate feature="mockTests">
        <MockTestAttemptPage />
      </FeatureAvailabilityGate>
    ),
  },
  {
    path: ROUTES.trackerLessonPattern,
    element: (
      <FeatureAvailabilityGate feature="trackers">
        <TrackerLessonPage />
      </FeatureAvailabilityGate>
    ),
  },
  {
    path: ROUTES.trackerRevisionPattern,
    element: (
      <FeatureAvailabilityGate feature="trackers">
        <TrackerQuickRevisionPage />
      </FeatureAvailabilityGate>
    ),
  },
];
