import type { IMockTestQuestionRepository } from '../../domain/repositories/mock-test-question.repository.interface';
import type { IMockTestSharingRepository } from '../../domain/repositories/mock-test-sharing.repository.interface';
import type { IMockTestRepository } from '../../domain/repositories/mock-test.repository.interface';
import { MockTestsApplicationError } from '../mock-tests-application.error';
import type {
  ImportSharedMockTestDTO,
  ImportSharedMockTestPayloadDTO,
} from '../mock-tests.dto';
import type { IMockTestsMapper } from '../mock-tests.mapper';

type ImportSharedMockTestRepository = IMockTestRepository &
  IMockTestQuestionRepository &
  IMockTestSharingRepository;

const SAFE_SHARE_TOKEN_PATTERN = /^[a-zA-Z0-9_-]{16,100}$/;

export interface IImportSharedMockTestUseCase {
  execute(input: ImportSharedMockTestPayloadDTO): Promise<ImportSharedMockTestDTO>;
}

export class ImportSharedMockTestUseCase implements IImportSharedMockTestUseCase {
  constructor(
    private readonly _repository: ImportSharedMockTestRepository,
    private readonly _mapper: IMockTestsMapper
  ) {}

  async execute(input: ImportSharedMockTestPayloadDTO) {
    const shareToken = input.shareToken.trim();

    if (!SAFE_SHARE_TOKEN_PATTERN.test(shareToken)) {
      throw MockTestsApplicationError.invalidShareLink();
    }

    const sourceTest = await this._repository.findSharedTestByToken(shareToken);

    if (!sourceTest || !sourceTest.isShareEnabled) {
      throw MockTestsApplicationError.sharedTestNotFound();
    }

    if (sourceTest.ownerId === input.userId) {
      return this._mapper.toImportSharedDto({
        test: sourceTest,
        imported: false,
        alreadyImported: true,
      });
    }

    const existingImport = await this._repository.findImportedSharedTest({
      ownerId: input.userId,
      sourceTestId: sourceTest._id,
    });

    if (existingImport) {
      return this._mapper.toImportSharedDto({
        test: existingImport,
        imported: false,
        alreadyImported: true,
      });
    }

    const sourceQuestions = await this._repository.findQuestionsByTest(sourceTest._id);

    if (!sourceQuestions.length) {
      throw MockTestsApplicationError.sharedTestEmpty();
    }

    const importedTest = await this._repository.createTest({
      ownerId: input.userId,
      sourceTestId: sourceTest._id,
      title: sourceTest.title,
      description: sourceTest.description,
      difficulty: sourceTest.difficulty,
      timeLimitMinutes: sourceTest.timeLimitMinutes,
      passingScore: sourceTest.passingScore,
      questionCount: sourceTest.questionCount,
      tags: sourceTest.tags,
      isAIGenerated: sourceTest.isAIGenerated,
    });

    await this._repository.createQuestions(
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
      }))
    );

    await this._repository.incrementCloneCount(sourceTest._id);

    return this._mapper.toImportSharedDto({
      test: importedTest,
      imported: true,
      alreadyImported: false,
    });
  }
}
