import type { CommunityPublicTrackerDetail } from '../types/community.types'

export const ratingLabel: Readonly<Record<number, string>> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very good',
  5: 'Excellent',
}

export const getTotalSubtopics = (
  tracker: CommunityPublicTrackerDetail,
): number => {
  if (tracker.subtopicsCount > 0) {
    return tracker.subtopicsCount
  }

  return tracker.topics.reduce(
    (total, topic) => total + topic.subtopics.length,
    0,
  )
}