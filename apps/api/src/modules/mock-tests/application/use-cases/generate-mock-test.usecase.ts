import type { MockTestRepositoryContract } from '../../domain/repositories/mock-test.repository.interface'
import type { MockTestQuestionRepositoryContract } from '../../domain/repositories/mock-test-question.repository.interface'
import type { MockTestAIServiceContract } from '../../domain/services/mock-test-ai.service.interface'
import type {
  MockTestQuestionBankServiceContract,
  QuestionBankItem,
} from '../../domain/services/mock-test-question-bank.service.interface'
import type { GenerateMockTestPayload, MockTest } from '../dtos/mock-tests.dto'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'

type GenerateMockTestRepository =
  MockTestRepositoryContract &
  MockTestQuestionRepositoryContract

export class GenerateMockTestUseCase {
  constructor(
    private readonly repo: GenerateMockTestRepository,
    private readonly aiService: MockTestAIServiceContract,
    private readonly questionBankService: MockTestQuestionBankServiceContract,
  ) { }

  async execute(
    userId: string,
    payload: GenerateMockTestPayload,
  ): Promise<MockTest> {
    const topic = payload.topic?.trim()

    if (!topic || topic.length < 2) {
      throw MockTestsApplicationError.validation('Topic is required')
    }

    const questionCount = payload.questionCount || 10
    let questions: QuestionBankItem[]
    let title: string
    let description: string

    if (this.questionBankService.shouldUseAI()) {
      const generated = await this.aiService.generateQuestions({
        topic,
        difficulty: payload.difficulty || 'medium',
        questionCount,
        questionTypes: payload.questionTypes?.length
          ? payload.questionTypes
          : ['mcq'],
      })

      if (!generated.questions?.length) {
        throw MockTestsApplicationError.aiGenerationFailed()
      }

      questions = await this.questionBankService.saveToQuestionBank(
        topic,
        generated.questions,
      )

      title = generated.title || `${topic} Mock Test`
      description = generated.description || `Practice test for ${topic}`
    } else {
      questions = await this.questionBankService.sampleFromQuestionBank(
        topic,
        questionCount,
        payload.difficulty,
      )

      if (!questions.length) {
        throw MockTestsApplicationError.noQuestionsAvailable(topic)
      }

      title = `${topic} Mock Test`
      description = `Practice test for ${topic}`
    }

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
      isAIGenerated: this.questionBankService.shouldUseAI(),
    })

    await this.repo.createQuestions(
      questions.map((question, index) => ({
        testId: test._id,
        type: question.type,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: question.difficulty,
        order: index + 1,
        points: question.points,
        coding: question.coding,
      })),
    )

    return test
  }
}
