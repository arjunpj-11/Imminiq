import { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'
import { MockTestAIServiceContract } from '../../domain/services/mock-test-ai.service.interface'
import { GenerateMockTestPayload, MockTest } from '../../domain/types/mock-tests.types'
import { ApiError } from '../../../../shared/utils/ApiError'

export class GenerateMockTestUseCase {
  constructor(private readonly repo: MockTestsRepositoryContract, private readonly aiService: MockTestAIServiceContract) {}

  async execute(userId: string, payload: GenerateMockTestPayload): Promise<MockTest> {
    const topic = payload.topic?.trim()
    if (!topic || topic.length < 2) throw new ApiError(400, 'Topic is required', 'VALIDATION_ERROR')

    const generated = await this.aiService.generateQuestions({
      topic,
      difficulty: payload.difficulty || 'medium',
      questionCount: payload.questionCount || 10,
      questionTypes: payload.questionTypes?.length ? payload.questionTypes : ['mcq'],
    })

    if (!generated.questions?.length) throw new ApiError(502, 'AI did not return questions', 'AI_GENERATION_FAILED')

    const test = await this.repo.createTest({
      ownerId: userId,
      title: generated.title || `${topic} Mock Test`,
      description: generated.description || `Practice test for ${topic}`,
      difficulty: payload.difficulty || 'medium',
      visibility: payload.visibility || 'private',
      timeLimitMinutes: payload.timeLimitMinutes || 30,
      passingScore: payload.passingScore || 60,
      questionCount: generated.questions.length,
      tags: [topic],
      trackerId: payload.trackerId,
      isAIGenerated: true,
    })

    await this.repo.createQuestions(generated.questions.map((q, i) => ({
      testId: test._id,
      type: q.type,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      order: i + 1,
      points: q.points || (q.difficulty === 'hard' ? 3 : q.difficulty === 'medium' ? 2 : 1),
    })))

    return test
  }
}
