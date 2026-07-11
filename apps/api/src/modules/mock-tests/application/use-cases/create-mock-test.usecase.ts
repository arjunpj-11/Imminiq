import type { MockTestRepositoryContract } from '../../domain/repositories/mock-test.repository.interface'
import type { MockTestQuestionRepositoryContract } from '../../domain/repositories/mock-test-question.repository.interface'
import type { CreateMockTestPayload, MockTest } from '../dtos/mock-tests.dto'
import { MAX_MANUAL_QUESTIONS } from '../../domain/constants/mock-tests.constants'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'
import type { MockTestsMapperContract } from '../mappers/mock-tests.mapper'

type CreateMockTestRepository =
  MockTestRepositoryContract &
  MockTestQuestionRepositoryContract

export class CreateMockTestUseCase {
  constructor(
    private readonly _repo: CreateMockTestRepository,
    private readonly _mapper: MockTestsMapperContract,
  ) { }

  async execute(
    userId: string,
    payload: CreateMockTestPayload,
  ): Promise<MockTest> {
    if (!payload.questions?.length) {
      throw MockTestsApplicationError.validation('At least one question is required')
    }

    if (payload.questions.length > MAX_MANUAL_QUESTIONS) {
      throw MockTestsApplicationError.validation(
        `Maximum ${MAX_MANUAL_QUESTIONS} questions allowed`,
      )
    }

    const test = await this._repo.createTest({
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
    })

    await this._repo.createQuestions(
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
          (question.difficulty === 'hard'
            ? 3
            : question.difficulty === 'medium'
              ? 2
              : 1),
        coding: question.coding,
      })),
    )

    return this._mapper.toMockTest(test)
  }
}
