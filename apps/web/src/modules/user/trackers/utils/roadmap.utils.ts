import { safeSessionStorage } from '../../../../lib/storage/safe-storage'
import type { IRoadmapSubtopic, IRoadmapTopic } from '../types/tracker.types'
import { getRoadmapStackStorageKey } from './lesson-formatters'
import type { BreadcrumbItem, RoadmapNode } from './roadmap.types'

export const readSavedRoadmapStack = (trackerId?: string): BreadcrumbItem[] => {
  if (!trackerId) return []
  try {
    const raw = safeSessionStorage.get(getRoadmapStackStorageKey(trackerId))
    if (!raw) return []
    return JSON.parse(raw) as BreadcrumbItem[]
  } catch {
    return []
  }
}

export const saveRoadmapStack = (
  trackerId: string | undefined,
  stack: BreadcrumbItem[]
) => {
  if (!trackerId) return
  safeSessionStorage.set(
    getRoadmapStackStorageKey(trackerId),
    JSON.stringify(stack)
  )
}

export const getInitials = (name: string) =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

export const formatLevelLabel = (isPremium: boolean) =>
  isPremium ? 'Imminiq Pro' : 'Free Scholar'

const mapSubtopicToNode = (subtopic: IRoadmapSubtopic): RoadmapNode => ({
  _id: subtopic._id,
  title: subtopic.title,
  description: subtopic.description,
  order: subtopic.order,
  status: subtopic.status,
  progressPercent: subtopic.progressPercent,
  estimatedMinutes: subtopic.estimatedMinutes,
  isLocked: subtopic.isLocked,
  learningVideo: subtopic.learningVideo,
  nodeType: 'subtopic',
  children: (subtopic.children || []).map(mapSubtopicToNode),
})

export const mapTopicToNode = (topic: IRoadmapTopic): RoadmapNode => ({
  _id: topic._id,
  title: topic.title,
  description: topic.description,
  order: topic.order,
  status: topic.status,
  progressPercent: topic.progressPercent,
  estimatedHours: topic.estimatedHours,
  learningVideo: topic.learningVideo,
  nodeType: 'topic',
  children: topic.subtopics.map(mapSubtopicToNode),
})

export const getNodeState = (node: RoadmapNode, isFirstLevel: boolean) => {
  if (isFirstLevel && (node.isLocked || node.status === 'locked')) return 'locked'
  if (node.status === 'completed') return 'completed'
  if (node.status === 'in_progress') return 'active'
  return 'available'
}

// ─── Helpers for fresh node lookup ───────────────────────────────────────────

export const findFreshNodes = (
  nodes: RoadmapNode[],
  targetId: string
): RoadmapNode[] | null => {
  for (const node of nodes) {
    if (node._id === targetId) return node.children
    if (node.children.length > 0) {
      const found = findFreshNodes(node.children, targetId)
      if (found) return found
    }
  }
  return null
}
