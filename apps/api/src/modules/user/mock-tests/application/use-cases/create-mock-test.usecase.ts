import type { IMockTestRepository } from '../../domain/repositories/mock-test.repository.interface';
import type { IMockTestQuestionRepository } from '../../domain/repositories/mock-test-question.repository.interface';
import type { CreateMockTestPayloadDTO, MockTestDTO } from '../mock-tests.dto';
import { MockTestsApplicationError } from '../mock-tests-application.error';
import type { IMockTestsMapper } from '../mock-tests.mapper';
import type { IMockTestPolicyReader } from '../../../../../shared/platform-policy';

type CreateMockTestRepository = IMockTestRepository & IMockTestQuestionRepository;

export interface ICreateMockTestUseCase {
  execute(userId: string, payload: CreateMockTestPayloadDTO): Promise<MockTestDTO>;
}

export class CreateMockTestUseCase implements ICreateMockTestUseCase {
  constructor(
    private readonly _repository: CreateMockTestRepository,
    private readonly _mapper: IMockTestsMapper,
    private readonly _policyReader: IMockTestPolicyReader
  ) {}

  async execute(userId: string, payload: CreateMockTestPayloadDTO): Promise<MockTestDTO> {
    const policy = await this._policyReader.getMockTestPolicy();
    if (!payload.questions?.length) {
      throw MockTestsApplicationError.validation('At least one question is required');
    }

    if (payload.questions.length > policy.maxManualQuestions) {
      throw MockTestsApplicationError.validation(
        `Maximum ${policy.maxManualQuestions} questions allowed`
      );
    }

    const test = await this._repository.createTest({
      ownerId: userId,
      title: payload.title,
      description: payload.description || '',
      difficulty: payload.difficulty || 'medium',
      timeLimitMinutes: payload.timeLimitMinutes || policy.defaultTimeLimitMinutes,
      passingScore: payload.passingScore || policy.defaultPassingScore,
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
