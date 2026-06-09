import { ApiError } from '../../../../shared/utils/ApiError'
import { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'

const SAFE_SHARE_TOKEN_PATTERN = /^[a-zA-Z0-9_-]{16,100}$/

export class ImportSharedMockTestUseCase {
  constructor(private readonly repo: MockTestsRepositoryContract) {}

  async execute(input: {
    userId: string
    shareToken: string
  }) {
    const shareToken = input.shareToken.trim()

    if (!SAFE_SHARE_TOKEN_PATTERN.test(shareToken)) {
      throw new ApiError(400, 'Invalid share link', 'INVALID_SHARE_LINK')
    }

    const sourceTest = await this.repo.findSharedTestByToken(shareToken)

    if (!sourceTest || !sourceTest.isShareEnabled) {
      throw new ApiError(404, 'Shared mock test not found', 'SHARED_TEST_NOT_FOUND')
    }

    if (sourceTest.ownerId === input.userId) {
      return {
        test: sourceTest,
        imported: false,
        alreadyImported: true,
      }
    }

    const existingImport = await this.repo.findImportedSharedTest(
      input.userId,
      sourceTest._id,
    )

    if (existingImport) {
      return {
        test: existingImport,
        imported: false,
        alreadyImported: true,
      }
    }

    const sourceQuestions = await this.repo.findQuestionsByTest(sourceTest._id)

    if (!sourceQuestions.length) {
      throw new ApiError(400, 'Shared test has no questions', 'SHARED_TEST_EMPTY')
    }

    const importedTest = await this.repo.createTest({
      ownerId: input.userId,
      sourceTestId: sourceTest._id,
      title: sourceTest.title,
      description: sourceTest.description,
      difficulty: sourceTest.difficulty,
      visibility: 'private',
      timeLimitMinutes: sourceTest.timeLimitMinutes,
      passingScore: sourceTest.passingScore,
      questionCount: sourceTest.questionCount,
      tags: sourceTest.tags,
      isAIGenerated: sourceTest.isAIGenerated,
    })

    await this.repo.createQuestions(
      sourceQuestions.map((question) => ({
        testId: importedTest._id,
        type: question.type,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: question.difficulty,
        order: question.order,
        points: question.points,
      })),
    )

    await this.repo.incrementCloneCount(sourceTest._id)

    return {
      test: importedTest,
      imported: true,
      alreadyImported: false,
    }
  }
}