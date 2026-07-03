import { lazy } from 'react'

export const MockTestAttemptPage = lazy(
  () => import('../modules/mock-tests/pages/MockTestAttemptPage'),
)

export const TrackerLessonPage = lazy(
  () => import('../modules/trackers/pages/TrackerLessonPage'),
)

export const TrackerQuickRevisionPage = lazy(
  () => import('../modules/trackers/pages/TrackerQuickRevisionPage'),
)