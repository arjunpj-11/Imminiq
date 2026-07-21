import { describe, expect, it, vi } from 'vitest';

import { ImportTrackerOutlineUseCase } from '../../src/modules/user/trackers/application/use-cases/import-tracker-outline.usecase';
import type { ICreateTrackerSubtopicUseCase } from '../../src/modules/user/trackers/application/use-cases/create-tracker-subtopic.usecase';
import type { ICreateTrackerTopicUseCase } from '../../src/modules/user/trackers/application/use-cases/create-tracker-topic.usecase';

describe('ImportTrackerOutlineUseCase', () => {
  it('creates a recursive tree with each child attached to its created parent', async () => {
    const createTopic = { execute: vi.fn().mockResolvedValue({ _id: { toString: () => 'topic-1' } }) };
    const createSubtopic = {
      execute: vi
        .fn()
        .mockResolvedValueOnce({ _id: { toString: () => 'subtopic-1' } })
        .mockResolvedValueOnce({ _id: { toString: () => 'subtopic-2' } }),
    };
    const useCase = new ImportTrackerOutlineUseCase(
      createTopic as unknown as ICreateTrackerTopicUseCase,
      createSubtopic as unknown as ICreateTrackerSubtopicUseCase
    );

    await expect(useCase.execute({
      trackerId: 'tracker-1',
      userId: 'user-1',
      kind: 'topics',
      topics: [{
        title: 'Topic',
        subtopics: [{
          title: 'Child',
          subtopics: [{ title: 'Grandchild', subtopics: [] }],
        }],
      }],
    })).resolves.toEqual({ topicsAdded: 1, subtopicsAdded: 2 });

    expect(createSubtopic.execute).toHaveBeenNthCalledWith(1, expect.objectContaining({
      topicId: 'topic-1',
      parentSubtopicId: null,
      title: 'Child',
    }));
    expect(createSubtopic.execute).toHaveBeenNthCalledWith(2, expect.objectContaining({
      topicId: 'topic-1',
      parentSubtopicId: 'subtopic-1',
      title: 'Grandchild',
    }));
  });
});
