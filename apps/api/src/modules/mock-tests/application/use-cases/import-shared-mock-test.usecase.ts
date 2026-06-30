import type { MockTestQuestionRepositoryContract } from '../../domain/repositories/mock-test-question.repository.interface'
import type { MockTestSharingRepositoryContract } from '../../domain/repositories/mock-test-sharing.repository.interface'
import type { MockTestRepositoryContract } from '../../domain/repositories/mock-test.repository.interface'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'

type ImportSharedMockTestRepository =
  MockTestRepositoryContract &
  MockTestQuestionRepositoryContract &
  MockTestSharingRepositoryContract

const SAFE_SHARE_TOKEN_PATTERN = /^[a-zA-Z0-9_-]{16,100}$/

export class ImportSharedMockTestUseCase {
  constructor(private readonly _repo: ImportSharedMockTestRepository) {}

  async execute(input: { userId: string; shareToken: string }) {
    const shareToken = input.shareToken.trim()

    if (!SAFE_SHARE_TOKEN_PATTERN.test(shareToken)) {
      throw MockTestsApplicationError.invalidShareLink()
    }

    const sourceTest = await this._repo.findSharedTestByToken(shareToken)

    if (!sourceTest || !sourceTest.isShareEnabled) {
      throw MockTestsApplicationError.sharedTestNotFound()
    }

    if (sourceTest.ownerId === input.userId) {
      return {
        test: sourceTest,
        imported: false,
        alreadyImported: true,
      }
    }

    const existingImport = await this._repo.findImportedSharedTest({
  ownerId: input.userId,
  sourceTestId: sourceTest._id,
})

    if (existingImport) {
      return {
        test: existingImport,
        imported: false,
        alreadyImported: true,
      }
    }

    const sourceQuestions = await this._repo.findQuestionsByTest(sourceTest._id)

    if (!sourceQuestions.length) {
      throw MockTestsApplicationError.sharedTestEmpty()
    }

    const importedTest = await this._repo.createTest({
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

    await this._repo.createQuestions(
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
        coding: question.coding,
      })),
    )

    await this._repo.incrementCloneCount(sourceTest._id)

    return {
      test: importedTest,
      imported: true,
      alreadyImported: false,
    }
  }
}