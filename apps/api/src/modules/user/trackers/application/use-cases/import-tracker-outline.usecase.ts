import type { ICreateTrackerSubtopicUseCase } from './create-tracker-subtopic.usecase';
import type { ICreateTrackerTopicUseCase } from './create-tracker-topic.usecase';

export type ImportOutlineNode = {
  title: string;
  description?: string;
  subtopics: ImportOutlineNode[];
};

export type ImportTrackerOutlineInput =
  | { trackerId: string; userId: string; kind: 'topics'; topics: ImportOutlineNode[] }
  | {
      trackerId: string;
      userId: string;
      kind: 'subtopics';
      topicId: string;
      parentSubtopicId?: string | null;
      subtopics: ImportOutlineNode[];
    };

export type ImportTrackerOutlineResult = { topicsAdded: number; subtopicsAdded: number };

export interface IImportTrackerOutlineUseCase {
  execute(input: ImportTrackerOutlineInput): Promise<ImportTrackerOutlineResult>;
}

export class ImportTrackerOutlineUseCase implements IImportTrackerOutlineUseCase {
  constructor(
    private readonly createTopic: ICreateTrackerTopicUseCase,
    private readonly createSubtopic: ICreateTrackerSubtopicUseCase
  ) {}

  async execute(input: ImportTrackerOutlineInput) {
    let topicsAdded = 0;
    let subtopicsAdded = 0;

    const addSubtopics = async (
      topicId: string,
      parentSubtopicId: string | null,
      nodes: ImportOutlineNode[]
    ): Promise<void> => {
      for (const node of nodes) {
        const created = await this.createSubtopic.execute({
          trackerId: input.trackerId,
          userId: input.userId,
          topicId,
          parentSubtopicId,
          title: node.title,
          description: node.description || '',
        });
        subtopicsAdded += 1;
        await addSubtopics(topicId, created._id.toString(), node.subtopics);
      }
    };

    if (input.kind === 'topics') {
      for (const topic of input.topics) {
        const created = await this.createTopic.execute({
          trackerId: input.trackerId,
          userId: input.userId,
          title: topic.title,
          description: topic.description || '',
        });
        topicsAdded += 1;
        await addSubtopics(created._id.toString(), null, topic.subtopics);
      }
    } else {
      await addSubtopics(input.topicId, input.parentSubtopicId || null, input.subtopics);
    }

    return { topicsAdded, subtopicsAdded };
  }
}
