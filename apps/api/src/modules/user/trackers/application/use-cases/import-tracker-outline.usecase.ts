import type { ICreateTrackerSubtopicUseCase } from './create-tracker-subtopic.usecase';
import type { ICreateTrackerTopicUseCase } from './create-tracker-topic.usecase';
import type {
  ImportTrackerOutlineInputDTO,
  ImportTrackerOutlineNodeDTO,
  ImportTrackerOutlineResultDTO,
} from '../tracker.dto';

export interface IImportTrackerOutlineUseCase {
  execute(input: ImportTrackerOutlineInputDTO): Promise<ImportTrackerOutlineResultDTO>;
}

export class ImportTrackerOutlineUseCase implements IImportTrackerOutlineUseCase {
  constructor(
    private readonly _createTopic: ICreateTrackerTopicUseCase,
    private readonly _createSubtopic: ICreateTrackerSubtopicUseCase
  ) {}

  async execute(input: ImportTrackerOutlineInputDTO) {
    let topicsAdded = 0;
    let subtopicsAdded = 0;

    const addSubtopics = async (
      topicId: string,
      parentSubtopicId: string | null,
      nodes: ImportTrackerOutlineNodeDTO[]
    ): Promise<void> => {
      await Promise.all(
        nodes.map(async (node) => {
          const created = await this._createSubtopic.execute({
            trackerId: input.trackerId,
            userId: input.userId,
            topicId,
            parentSubtopicId,
            title: node.title,
            description: node.description || '',
          });
          subtopicsAdded += 1;
          if (node.subtopics && node.subtopics.length > 0) {
            await addSubtopics(topicId, created._id.toString(), node.subtopics);
          }
        })
      );
    };

    if (input.kind === 'topics') {
      await Promise.all(
        input.topics.map(async (topic) => {
          const created = await this._createTopic.execute({
            trackerId: input.trackerId,
            userId: input.userId,
            title: topic.title,
            description: topic.description || '',
          });
          topicsAdded += 1;
          await addSubtopics(created._id.toString(), null, topic.subtopics);
        })
      );
    } else {
      await addSubtopics(input.topicId, input.parentSubtopicId || null, input.subtopics);
    }

    return { topicsAdded, subtopicsAdded };
  }
}
