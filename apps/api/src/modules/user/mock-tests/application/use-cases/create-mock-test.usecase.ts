import type { IMockTestRepository } from '../../domain/repositories/mock-test.repository.interface';
import type { IMockTestQuestionRepository } from '../../domain/repositories/mock-test-question.repository.interface';
import type { CreateMockTestPayloadDTO, MockTestDTO } from '../mock-tests.dto';
import { MAX_MANUAL_QUESTIONS } from '../../domain/mock-tests.constants';
import { MockTestsApplicationError } from '../mock-tests-application.error';
import type { IMockTestsMapper } from '../mock-tests.mapper';

type CreateMockTestRepository = IMockTestRepository & IMockTestQuestionRepository;

export interface ICreateMockTestUseCase {
  execute(userId: string, payload: CreateMockTestPayloadDTO): Promise<MockTestDTO>;
}

export class CreateMockTestUseCase implements ICreateMockTestUseCase {
  constructor(
    private readonly _repository: CreateMockTestRepository,
    private readonly _mapper: IMockTestsMapper
  ) {}

  async execute(userId: string, payload: CreateMockTestPayloadDTO): Promise<MockTestDTO> {
    if (!payload.questions?.length) {
      throw MockTestsApplicationError.validation('At least one question is required');
    }

    if (payload.questions.length > MAX_MANUAL_QUESTIONS) {
      throw MockTestsApplicationError.validation(
        `Maximum ${MAX_MANUAL_QUESTIONS} questions allowed`
      );
    }

    const test = await this._repository.createTest({
      ownerId: userId,
      title: payload.title,
      description: payload.description || '',
      difficulty: payload.difficulty || 'medium',
      visibility: payload.visibility || 'private',
      timeLimitMinutes: payload.timeLimitMinutes || 30,
      passingScore: payload.passingScore || 60,
      questionCount: payload.questions.length,
      tags: payload.tags || [],
      trackerId: payload.trackerId,
      isAIGenerated: false,
    });

    await this._repository.createQuestions(
      payload.questions.map((question, index) => ({
        testId: test._id,
        type: question.type,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: question.difficulty || payload.difficulty || 'medium',
        order: index + 1,
        points:
          question.points ||
          (question.difficulty === 'hard' ? 3 : question.difficulty === 'medium' ? 2 : 1),
        coding: question.coding,
      }))
    );

    return this._mapper.toMockTest(test);
  }
}
