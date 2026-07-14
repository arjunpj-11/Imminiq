import type { IRoadmapSubtopic, IRoadmapTopic } from '../../trackers';

export interface IFlatNode {
  _id: string;
  title: string;
  status?: string;
  depth: number;
  parentTopicId: string;
  parentTopicTitle: string;
}

function flattenSubtopic(
  subtopic: IRoadmapSubtopic,
  parentTopicId: string,
  parentTopicTitle: string,
  depth: number,
  acc: IFlatNode[]
): void {
  acc.push({
    _id: subtopic._id,
    title: subtopic.title,
    status: subtopic.status,
    depth,
    parentTopicId,
    parentTopicTitle,
  });

  for (const child of subtopic.children || []) {
    flattenSubtopic(child, parentTopicId, parentTopicTitle, depth + 1, acc);
  }
}

export function flattenRoadmap(topics: IRoadmapTopic[]): IFlatNode[] {
  const acc: IFlatNode[] = [];

  for (const topic of topics) {
    for (const subtopic of topic.subtopics) {
      flattenSubtopic(subtopic, topic._id, topic.title, 0, acc);
    }
  }

  return acc;
}

export function buildStructuredTopicString(
  selectedNodes: Map<string, string>,
  flatNodes: IFlatNode[],
  trackerTitle: string
): string {
  const byTopic = new Map<string, { topicTitle: string; subtopics: string[] }>();

  for (const [id, title] of selectedNodes.entries()) {
    const node = flatNodes.find((item) => item._id === id);
    if (!node) continue;

    if (!byTopic.has(node.parentTopicId)) {
      byTopic.set(node.parentTopicId, {
        topicTitle: node.parentTopicTitle,
        subtopics: [],
      });
    }

    byTopic.get(node.parentTopicId)!.subtopics.push(title);
  }

  const topicParts = Array.from(byTopic.values())
    .map(({ topicTitle, subtopics }) => `${topicTitle} → ${subtopics.join(', ')}`)
    .join(' | ');

  return `[${trackerTitle}] ${topicParts}`;
}
