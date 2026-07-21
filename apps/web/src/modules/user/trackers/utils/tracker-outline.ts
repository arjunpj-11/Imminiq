export type TrackerOutlineNode = {
  title: string;
  description: string;
  subtopics: TrackerOutlineNode[];
};

export type TrackerOutlineTopic = Omit<TrackerOutlineNode, 'subtopics'> & {
  subtopics: TrackerOutlineNode[];
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const readNodes = (value: unknown, depth: number, count: { value: number }): TrackerOutlineNode[] => {
  if (!Array.isArray(value)) throw new Error('Every topics or subtopics field must be an array.');
  if (depth > 8) throw new Error('The outline can contain at most 8 nested levels.');

  return value.map((rawNode, index) => {
    const node = asRecord(rawNode);
    if (!node) throw new Error(`Outline item ${index + 1} must be an object.`);

    const title = typeof node.title === 'string' ? node.title.trim() : '';
    if (!title) throw new Error(`Outline item ${index + 1} is missing a title.`);
    if (title.length > 120) throw new Error(`“${title.slice(0, 30)}…” is longer than 120 characters.`);

    count.value += 1;
    if (count.value > 250) throw new Error('An import can contain at most 250 topics and subtopics.');

    const description = typeof node.description === 'string' ? node.description.trim() : '';
    const children = node.subtopics ?? node.children ?? [];

    return {
      title,
      description,
      subtopics: readNodes(children, depth + 1, count),
    };
  });
};

export const parseTrackerOutlineJson = (source: string): TrackerOutlineTopic[] => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    throw new Error('This is not valid JSON. Check commas, quotes, and brackets.');
  }

  const root = asRecord(parsed);
  const rawTopics = Array.isArray(parsed) ? parsed : root?.topics;
  if (!Array.isArray(rawTopics)) {
    throw new Error('Use a topics array, either directly or inside { "topics": [...] }.');
  }

  const topics = readNodes(rawTopics, 0, { value: 0 });
  if (topics.length === 0) throw new Error('Add at least one topic to the JSON outline.');
  return topics;
};

export const trackerOutlineExample = JSON.stringify(
  {
    topics: [
      {
        title: 'Core concepts',
        description: 'Build a strong foundation.',
        subtopics: [
          {
            title: 'Fundamentals',
            description: 'Learn the essential ideas.',
            subtopics: [{ title: 'Guided practice', subtopics: [] }],
          },
        ],
      },
    ],
  },
  null,
  2
);

export const selectedOutline = (
  nodes: TrackerOutlineNode[],
  selectedPaths: Set<string>,
  parentPath = ''
): TrackerOutlineNode[] =>
  nodes.flatMap((node, index) => {
    const path = parentPath ? `${parentPath}.${index}` : String(index);
    if (!selectedPaths.has(path)) return [];
    return [{ ...node, subtopics: selectedOutline(node.subtopics, selectedPaths, path) }];
  });

export const allOutlinePaths = (nodes: TrackerOutlineNode[], parentPath = ''): string[] =>
  nodes.flatMap((node, index) => {
    const path = parentPath ? `${parentPath}.${index}` : String(index);
    return [path, ...allOutlinePaths(node.subtopics, path)];
  });
