// application/use-cases/generate-mock-test.usecase.ts
import { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'
import { MockTestAIServiceContract } from '../../domain/services/mock-test-ai.service.interface'
import { GenerateMockTestPayload, MockTest } from '../../domain/types/mock-tests.types'
import { ApiError } from '../../../../shared/utils/ApiError'
import { USE_AI_GENERATION } from '../../infrastructure/config/feature-flags'
import {
  saveToQuestionBank,
  sampleFromQuestionBank,
  QuestionBankItem,
} from '../../infrastructure/question-bank.service'

export class GenerateMockTestUseCase {
  constructor(
    private readonly repo: MockTestsRepositoryContract,
    private readonly aiService: MockTestAIServiceContract,
  ) {}

  async execute(userId: string, payload: GenerateMockTestPayload): Promise<MockTest> {
    const topic = payload.topic?.trim()
    if (!topic || topic.length < 2) throw new ApiError(400, 'Topic is required', 'VALIDATION_ERROR')

    const questionCount = payload.questionCount || 10
    let questions: QuestionBankItem[]
    let title: string
    let description: string

    if (USE_AI_GENERATION) {
      // --- AI path: generate, seed bank, then use the new questions ---
      const generated = await this.aiService.generateQuestions({
        topic,
        difficulty: payload.difficulty || 'medium',
        questionCount,
        questionTypes: payload.questionTypes?.length ? payload.questionTypes : ['mcq'],
      })

      if (!generated.questions?.length)
        throw new ApiError(502, 'AI did not return questions', 'AI_GENERATION_FAILED')

      // Persist to question bank with sequential bankIds
      questions = await saveToQuestionBank(topic, generated.questions)

      title = generated.title || `${topic} Mock Test`
      description = generated.description || `Practice test for ${topic}`
    } else {
      // --- Bank path: sample random questions we already have ---
      questions = await sampleFromQuestionBank(topic, questionCount, payload.difficulty)

      if (!questions.length)
        throw new ApiError(
          404,
          `No questions available for topic "${topic}". Try enabling AI generation.`,
          'NO_QUESTIONS_AVAILABLE',
        )

      title = `${topic} Mock Test`
      description = `Practice test for ${topic}`
    }

    // Create the test record and attach the resolved questions — same shape for both paths
    const test = await this.repo.createTest({
      ownerId: userId,
      title,
      description,
      difficulty: payload.difficulty || 'medium',
      visibility: payload.visibility || 'private',
      timeLimitMinutes: payload.timeLimitMinutes || 30,
      passingScore: payload.passingScore || 60,
      questionCount: questions.length,
      tags: [topic],
      trackerId: payload.trackerId,
      isAIGenerated: USE_AI_GENERATION,
    })

    await this.repo.createQuestions(
  questions.map((q, i) => ({
    testId: test._id,
    type: q.type,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    difficulty: q.difficulty,
    order: i + 1,
    points: q.points,
    coding: q.coding,
  })),
)

    return test
  }
}