import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type { ITrackerAIGateway } from '../../domain/services/tracker-ai.interface';
import type { IQuestionHasher } from '../../domain/services/question-hasher.interface';
import type {
  AskLessonQuestionSolutionDoubtPayloadDTO,
  LessonQuestionSolutionDoubtAnswerDTO,
} from '../tracker.dto';

export interface IAskLessonQuestionSolutionDoubtUseCase {
  execute(
    input: AskLessonQuestionSolutionDoubtPayloadDTO
  ): Promise<LessonQuestionSolutionDoubtAnswerDTO>;
}

export class AskLessonQuestionSolutionDoubtUseCase implements IAskLessonQuestionSolutionDoubtUseCase {
  constructor(
    private readonly _trackerRepository: Pick<
      ITrackerRepository,
      | 'createLessonQuestionSolutionDoubt'
      | 'findLessonBySubtopicId'
      | 'findLessonQuestionSolution'
      | 'findOwnedTrackerById'
      | 'getLessonQuestionSolutionDoubts'
    >,
    private readonly _trackerAIGateway: Pick<
      ITrackerAIGateway,
      'chatWithLessonQuestionSolutionDoubt'
    >,
    private readonly _questionHasher: IQuestionHasher,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(
    input: AskLessonQuestionSolutionDoubtPayloadDTO
  ): Promise<LessonQuestionSolutionDoubtAnswerDTO> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    });

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    const lesson = await this._trackerRepository.findLessonBySubtopicId({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    });

    if (!lesson) {
      throw TrackerApplicationError.lessonNotGenerated(
        'Generate the lesson before asking solution doubt'
      );
    }

    const questionHash = this._questionHasher.hash(input.question);

    const solution = await this._trackerRepository.findLessonQuestionSolution({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      questionHash,
    });

    if (!solution) {
      throw TrackerApplicationError.solutionNotGenerated(
        'Generate the solution before asking doubts'
      );
    }

    const solutionText = solution.solution;

    if (!solutionText) {
      throw TrackerApplicationError.solutionEmpty('Saved solution is empty');
    }

    const lessonId = lesson._id.toString();
    const solutionId = solution._id.toString();

    await this._trackerRepository.createLessonQuestionSolutionDoubt({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      lessonId,
      solutionId,
      question: input.question,
      questionHash,
      role: 'user',
      content: input.message,
    });

    const history = await this._trackerRepository.getLessonQuestionSolutionDoubts({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      questionHash,
    });

    const messages = history.map(({ role, content }) => ({ role, content }));

    const answer = await this._trackerAIGateway.chatWithLessonQuestionSolutionDoubt({
      lessonTitle: lesson.title,
      lessonExplanation: lesson.explanation,
      question: input.question,
      solution: solutionText,
      messages,
    });

    await this._trackerRepository.createLessonQuestionSolutionDoubt({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      lessonId,
      solutionId,
      question: input.question,
      questionHash,
      role: 'assistant',
      content: answer,
    });

    return this._trackerMapper.toLessonQuestionSolutionDoubtAnswerDto({
      answer,
    });
  }
}
