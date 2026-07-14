import { MockTestsDomainError } from '../../../domain/mock-tests-domain.error';
import type { MongoDuplicateKeyError } from './mongo-mock-tests.types';

export type ErrorMapper = (error: unknown) => MockTestsDomainError | null;

export class MongoMockTestsErrorMapper {
  static mapDuplicateMockTestRecordError(error: unknown): MockTestsDomainError | null {
    if (!MongoMockTestsErrorMapper.isDuplicateKeyError(error)) {
      return null;
    }

    const keyPattern = MongoMockTestsErrorMapper.getKeyPattern(error);

    if (MongoMockTestsErrorMapper.hasKey(keyPattern, 'shareToken')) {
      return new MockTestsDomainError(
        'DUPLICATE_SHARE_TOKEN',
        'Mock test share token already exists'
      );
    }

    if (
      MongoMockTestsErrorMapper.hasKey(keyPattern, 'ownerId') &&
      MongoMockTestsErrorMapper.hasKey(keyPattern, 'sourceTestId')
    ) {
      return new MockTestsDomainError(
        'MOCK_TEST_ALREADY_IMPORTED',
        'This shared mock test is already imported'
      );
    }

    if (
      MongoMockTestsErrorMapper.hasKey(keyPattern, 'testId') &&
      MongoMockTestsErrorMapper.hasKey(keyPattern, 'order')
    ) {
      return new MockTestsDomainError(
        'DUPLICATE_QUESTION_ORDER',
        'Mock test question order already exists'
      );
    }

    if (
      MongoMockTestsErrorMapper.hasKey(keyPattern, 'attemptId') &&
      MongoMockTestsErrorMapper.hasKey(keyPattern, 'questionId')
    ) {
      return new MockTestsDomainError(
        'DUPLICATE_ATTEMPT_ANSWER',
        'Answer for this question already exists in this attempt'
      );
    }

    if (
      MongoMockTestsErrorMapper.hasKey(keyPattern, 'userId') &&
      MongoMockTestsErrorMapper.hasKey(keyPattern, 'status')
    ) {
      return new MockTestsDomainError(
        'ACTIVE_CREATION_SESSION_EXISTS',
        'An active mock test creation session already exists'
      );
    }

    return new MockTestsDomainError(
      'DUPLICATE_MOCK_TEST_RECORD',
      'Mock test record already exists'
    );
  }

  private static isDuplicateKeyError(error: unknown): error is MongoDuplicateKeyError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as MongoDuplicateKeyError).code === 11000
    );
  }

  private static getKeyPattern(error: MongoDuplicateKeyError): Record<string, unknown> {
    return error.keyPattern && typeof error.keyPattern === 'object' ? error.keyPattern : {};
  }

  private static hasKey(keyPattern: Record<string, unknown>, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(keyPattern, key);
  }
}
