import type { MockTestRepositoryContract } from '../../domain/repositories/mock-test.repository.interface'
import type { MockTestQuestionRepositoryContract } from '../../domain/repositories/mock-test-question.repository.interface'
import type { MockTestActivityServiceContract } from '../../domain/services/mock-test-activity.service.interface'
import type { MockTestAIServiceContract } from '../../domain/services/mock-test-ai.service.interface'
import type {
  MockTestQuestionBankServiceContract,
  QuestionBankItem,
} from '../../domain/services/mock-test-question-bank.service.interface'
import type {
  GenerateMockTestPayload,
  MockTest,
} from '../dtos/mock-tests.dto'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'

type GenerateMockTestRepository =
  MockTestRepositoryContract &
    MockTestQuestionRepositoryContract

export class GenerateMockTestUseCase {
  constructor(
    private readonly _repo:
      GenerateMockTestRepository,

    private readonly _aiService:
      MockTestAIServiceContract,

    private readonly _questionBankService:
      MockTestQuestionBankServiceContract,

    private readonly _activityService:
      MockTestActivityServiceContract,
  ) {}

  async execute(
    userId: string,
    payload: GenerateMockTestPayload,
  ): Promise<MockTest> {
    const topic = payload.topic?.trim()

    if (!topic || topic.length < 2) {
      throw MockTestsApplicationError.validation(
        'Topic is required',
      )
    }

    const difficulty =
      payload.difficulty || 'medium'

    const questionCount =
      payload.questionCount || 10

    const isAIGenerated =
      this._questionBankService.shouldUseAI()

    let questions: QuestionBankItem[]
    let title: string
    let description: string

    if (isAIGenerated) {
      const generated =
        await this._aiService.generateQuestions({
          topic,
          difficulty,
          questionCount,

          questionTypes:
            payload.questionTypes?.length
              ? payload.questionTypes
              : ['mcq'],
        })

      if (!generated.questions?.length) {
        throw MockTestsApplicationError
          .aiGenerationFailed()
      }

      questions =
        await this._questionBankService
          .saveToQuestionBank(
            topic,
            generated.questions,
          )

      title =
        generated.title ||
        `${topic} Mock Test`

      description =
        generated.description ||
        `Practice test for ${topic}`
    } else {
      questions =
        await this._questionBankService
          .sampleFromQuestionBank(
            topic,
            questionCount,
            difficulty,
          )

      if (!questions.length) {
        throw MockTestsApplicationError
          .noQuestionsAvailable(topic)
      }

      title = `${topic} Mock Test`
      description =
        `Practice test for ${topic}`
    }

    const test = await this._repo.createTest({
      ownerId: userId,
      title,
      description,
      difficulty,

      visibility:
        payload.visibility || 'private',

      timeLimitMinutes:
        payload.timeLimitMinutes || 30,

      passingScore:
        payload.passingScore || 60,

      questionCount: questions.length,
      tags: [topic],
      trackerId: payload.trackerId,
      isAIGenerated,
    })

    await this._repo.createQuestions(
      questions.map((question, index) => ({
        testId: test._id,
        type: question.type,
        question: question.question,
        options: question.options,

        correctAnswer:
          question.correctAnswer,

        explanation:
          question.explanation,

        difficulty:
          question.difficulty,

        order: index + 1,
        points: question.points,
        coding: question.coding,
      })),
    )

    /*
     * Record activity only after both the test and its
     * questions have been stored successfully.
     *
     * The event key is based on the created test ID, so the
     * same test cannot produce duplicate activity.
     */
    await this._activityService
      .recordMockTestGenerated({
        userId,
        mockTestId: test._id,

        ...(test.trackerId
          ? {
              trackerId: test.trackerId,
            }
          : {}),

        testTitle: test.title,
        difficulty: test.difficulty,
        totalQuestions: test.questionCount,
      })

    return test
  }
}