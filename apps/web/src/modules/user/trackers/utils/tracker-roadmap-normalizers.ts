import { cn } from '../../../../lib/cn';
import type { ITracker } from '../types/tracker.types';

type RawRoadmapNode = Record<string, unknown>;

export type RoadmapSubtopicNode = {
  _id: string;
  title: string;
  description?: string;
  difficulty?: string;
  level?: string;
  order?: number;
  children?: RoadmapSubtopicNode[];
  subtopics?: RoadmapSubtopicNode[];
};

export type RoadmapTopicNode = {
  _id: string;
  sourceTopicId?: string | null;
  isCloneAddition?: boolean;
  title: string;
  description?: string;
  order?: number;
  subtopicsCount?: number;
  children?: RoadmapSubtopicNode[];
  subtopics?: RoadmapSubtopicNode[];
};

export type TrackerRoadmapLike = {
  tracker?: ITracker;
  topics?: unknown[];
  topicTree?: unknown[];
  roadmapTopics?: unknown[];
  roadmap?:
    | unknown[]
    | {
        topics?: unknown[];
        topicTree?: unknown[];
        roadmapTopics?: unknown[];
      };
  data?: {
    tracker?: ITracker;
    topics?: unknown[];
    topicTree?: unknown[];
    roadmapTopics?: unknown[];
    roadmap?:
      | unknown[]
      | {
          topics?: unknown[];
          topicTree?: unknown[];
          roadmapTopics?: unknown[];
        };
  };
};

export type SubtopicDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type AiVerificationStatus = 'idle' | 'checking' | 'approved' | 'rejected';
export type AiVerificationState = {
  status: AiVerificationStatus;
  message: string | null;
};

const getRawId = (node: RawRoadmapNode) => {
  const rawId = node._id || node.id || node.topicId || node.subtopicId;

  if (typeof rawId === 'string') return rawId;

  if (
    rawId &&
    typeof rawId === 'object' &&
    'toString' in rawId &&
    typeof rawId.toString === 'function'
  ) {
    return rawId.toString();
  }

  return '';
};

const getRawText = (node: RawRoadmapNode, keys: string[], fallback = '') => {
  for (const key of keys) {
    const value = node[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return fallback;
};

const getRawNumber = (node: RawRoadmapNode, key: string) => {
  const value = node[key];
  return typeof value === 'number' ? value : undefined;
};

const getRawArray = (node: RawRoadmapNode, keys: string[]): unknown[] => {
  for (const key of keys) {
    const value = node[key];
    if (Array.isArray(value)) return value;
  }
  return [];
};

const isRawNode = (value: unknown): value is RawRoadmapNode =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

const normalizeSubtopicNode = (
  value: unknown,
  fallbackIndex: number
): RoadmapSubtopicNode | null => {
  if (!isRawNode(value)) return null;

  const wrappedSubtopic = value.subtopic;
  const source = isRawNode(wrappedSubtopic) ? wrappedSubtopic : value;
  const id = getRawId(source) || getRawId(value);
  if (!id) return null;

  const children = getRawArray(source, ['children', 'subtopics', 'childSubtopics', 'nodes'])
    .map((child, index) => normalizeSubtopicNode(child, index))
    .filter((child): child is RoadmapSubtopicNode => Boolean(child));

  return {
    _id: id,
    title: getRawText(source, ['title', 'name'], `Subtopic ${fallbackIndex + 1}`),
    description: getRawText(source, ['description', 'summary']),
    difficulty: getRawText(source, ['difficulty']),
    level: getRawText(source, ['level']),
    order: getRawNumber(source, 'order') ?? getRawNumber(value, 'order'),
    children,
    subtopics: children,
  };
};

const normalizeTopicNode = (value: unknown, fallbackIndex: number): RoadmapTopicNode | null => {
  if (!isRawNode(value)) return null;

  const wrappedTopic = value.topic;
  const source = isRawNode(wrappedTopic) ? wrappedTopic : value;
  const id = getRawId(source) || getRawId(value);
  if (!id) return null;

  const subtopics = getRawArray(value, ['subtopics', 'children', 'lessons', 'nodes'])
    .concat(getRawArray(source, ['subtopics', 'children', 'lessons', 'nodes']))
    .map((subtopic, index) => normalizeSubtopicNode(subtopic, index))
    .filter((subtopic): subtopic is RoadmapSubtopicNode => Boolean(subtopic));

  const seen = new Set<string>();
  const uniqueSubtopics = subtopics.filter((subtopic) => {
    if (seen.has(subtopic._id)) return false;
    seen.add(subtopic._id);
    return true;
  });

  return {
    _id: id,
    sourceTopicId: getRawText(source, ['sourceTopicId']) || null,
    isCloneAddition: source.isCloneAddition === true,
    title: getRawText(source, ['title', 'name'], `Topic ${fallbackIndex + 1}`),
    description: getRawText(source, ['description', 'summary']),
    order: getRawNumber(source, 'order') ?? getRawNumber(value, 'order'),
    subtopicsCount:
      getRawNumber(source, 'subtopicsCount') ??
      getRawNumber(value, 'subtopicsCount') ??
      uniqueSubtopics.length,
    children: uniqueSubtopics,
    subtopics: uniqueSubtopics,
  };
};

export const getChildren = (node?: RoadmapTopicNode | RoadmapSubtopicNode) =>
  node?.children || node?.subtopics || [];

export const countNestedSubtopics = (nodes: RoadmapSubtopicNode[] = []): number =>
  nodes.reduce((total, node) => total + 1 + countNestedSubtopics(getChildren(node)), 0);

const extractFirstArray = (...values: unknown[]) =>
  values.find((value): value is unknown[] => Array.isArray(value)) || [];

export const extractRoadmapTopics = (roadmapData?: TrackerRoadmapLike): RoadmapTopicNode[] => {
  const roadmap = roadmapData?.roadmap;
  const dataRoadmap = roadmapData?.data?.roadmap;

  const rawTopics = extractFirstArray(
    Array.isArray(roadmap) ? roadmap : undefined,
    Array.isArray(dataRoadmap) ? dataRoadmap : undefined,
    roadmapData?.topics,
    roadmapData?.topicTree,
    roadmapData?.roadmapTopics,
    !Array.isArray(roadmap) ? roadmap?.topics : undefined,
    !Array.isArray(roadmap) ? roadmap?.topicTree : undefined,
    !Array.isArray(roadmap) ? roadmap?.roadmapTopics : undefined,
    roadmapData?.data?.topics,
    roadmapData?.data?.topicTree,
    roadmapData?.data?.roadmapTopics,
    !Array.isArray(dataRoadmap) ? dataRoadmap?.topics : undefined,
    !Array.isArray(dataRoadmap) ? dataRoadmap?.topicTree : undefined,
    !Array.isArray(dataRoadmap) ? dataRoadmap?.roadmapTopics : undefined
  );

  return rawTopics
    .map((topic, index) => normalizeTopicNode(topic, index))
    .filter((topic): topic is RoadmapTopicNode => Boolean(topic))
    .sort((first, second) => (first.order ?? 0) - (second.order ?? 0));
};

export const extractRoadmapTracker = (roadmapData?: TrackerRoadmapLike): ITracker | undefined =>
  roadmapData?.tracker || roadmapData?.data?.tracker;

export const flattenSubtopics = (
  nodes: RoadmapSubtopicNode[],
  depth = 0
): { node: RoadmapSubtopicNode; depth: number }[] =>
  nodes.flatMap((node) => [{ node, depth }, ...flattenSubtopics(getChildren(node), depth + 1)]);

export const getVerificationMessageClass = (status: AiVerificationStatus) =>
  cn(
    'rounded-[var(--radius-md)] border px-3 py-2 text-[12.5px] font-semibold leading-relaxed',
    status === 'approved' &&
      'border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] text-[var(--success)] dark:border-[rgba(92,201,138,0.25)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[var(--success)]',
    status === 'rejected' &&
      'border-red-300 bg-red-50 text-red-600 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300',
    status === 'checking' &&
      'border-[var(--border-subtle)] bg-[var(--surface-canvas)] text-[var(--text-secondary)] dark:border-white/15 dark:bg-[var(--surface-canvas)] dark:text-[var(--text-secondary)]'
  );
