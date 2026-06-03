import { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'
import { CreateMockTestPayload, MockTest } from '../../domain/types/mock-tests.types'
import { ApiError } from '../../../../shared/utils/ApiError'

export class CreateMockTestUseCase {
  constructor(private readonly repo: MockTestsRepositoryContract) {}

  async execute(userId: string, payload: CreateMockTestPayload): Promise<MockTest> {
    if (!payload.questions?.length) throw new ApiError(400, 'At least one question is required', 'VALIDATION_ERROR')
    if (payload.questions.length > 100) throw new ApiError(400, 'Maximum 100 questions allowed', 'VALIDATION_ERROR')

    const test = await this.repo.createTest({
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

    await this.repo.createQuestions(payload.questions.map((q, i) => ({
      testId: test._id,
      type: q.type,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty || payload.difficulty || 'medium',
      order: i + 1,
      points: q.points || (q.difficulty === 'hard' ? 3 : q.difficulty === 'medium' ? 2 : 1),
    })))

    return test
  }
}
