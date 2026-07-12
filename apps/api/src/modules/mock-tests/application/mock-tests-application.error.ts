import { MockTestsDomainError } from '../domain/mock-tests-domain.error'

export type MockTestsApplicationErrorCode =
  | 'AI_GENERATION_FAILED'
  | 'ANSWER_SAVE_FAILED'
  | 'EMPTY_TEST'
  | 'FORBIDDEN'
  | 'INVALID_SHARE_LINK'
  | 'MOCK_TEST_NOT_FOUND'
  | 'NOT_CODING_QUESTION'
  | 'NOT_COMPLETED'
  | 'NOT_FOUND'
  | 'NO_QUESTIONS_AVAILABLE'
  | 'SHARED_TEST_EMPTY'
  | 'SHARED_TEST_NOT_FOUND'
  | 'SHARE_LINK_FAILED'
  | 'TEST_NOT_ACTIVE'
  | 'USE_CODING_SUBMIT_ENDPOINT'
  | 'VALIDATION_ERROR'

export class MockTestsApplicationError extends MockTestsDomainError {
  readonly statusCode: number

  private constructor(
    statusCode: number,
    code: MockTestsApplicationErrorCode,
    message: string,
  ) {
    super(code, message)
    this.statusCode = statusCode
    this.name = 'MockTestsApplicationError'
  }

  static validation(message: string): MockTestsApplicationError {
    return new MockTestsApplicationError(400, 'VALIDATION_ERROR', message)
  }

  static notFound(message = 'Not found'): MockTestsApplicationError {
    return new MockTestsApplicationError(404, 'NOT_FOUND', message)
  }

  static forbidden(): MockTestsApplicationError {
    return new MockTestsApplicationError(403, 'FORBIDDEN', 'Forbidden')
  }

  static testNotActive(message = 'Test is not in progress'): MockTestsApplicationError {
    return new MockTestsApplicationError(400, 'TEST_NOT_ACTIVE', message)
  }

  static mockTestNotFound(): MockTestsApplicationError {
    return new MockTestsApplicationError(404, 'MOCK_TEST_NOT_FOUND', 'Mock test not found')
  }

  static shareLinkFailed(): MockTestsApplicationError {
    return new MockTestsApplicationError(500, 'SHARE_LINK_FAILED', 'Failed to create share link')
  }

  static notCompleted(): MockTestsApplicationError {
    return new MockTestsApplicationError(400, 'NOT_COMPLETED', 'Test not completed yet')
  }

  static notCodingQuestion(): MockTestsApplicationError {
    return new MockTestsApplicationError(400, 'NOT_CODING_QUESTION', 'This is not a coding question')
  }

  static emptyTest(): MockTestsApplicationError {
    return new MockTestsApplicationError(400, 'EMPTY_TEST', 'Test has no questions')
  }

  static aiGenerationFailed(): MockTestsApplicationError {
    return new MockTestsApplicationError(502, 'AI_GENERATION_FAILED', 'AI did not return questions')
  }

  static noQuestionsAvailable(topic: string): MockTestsApplicationError {
    return new MockTestsApplicationError(
      404,
      'NO_QUESTIONS_AVAILABLE',
      `No questions available for topic "${topic}". Try enabling AI generation.`,
    )
  }

  static useCodingSubmitEndpoint(): MockTestsApplicationError {
    return new MockTestsApplicationError(
      400,
      'USE_CODING_SUBMIT_ENDPOINT',
      'Use the coding submit endpoint for coding questions',
    )
  }

  static answerSaveFailed(): MockTestsApplicationError {
    return new MockTestsApplicationError(500, 'ANSWER_SAVE_FAILED', 'Failed to save answer')
  }

  static invalidShareLink(): MockTestsApplicationError {
    return new MockTestsApplicationError(400, 'INVALID_SHARE_LINK', 'Invalid share link')
  }

  static sharedTestNotFound(): MockTestsApplicationError {
    return new MockTestsApplicationError(404, 'SHARED_TEST_NOT_FOUND', 'Shared mock test not found')
  }

  static sharedTestEmpty(): MockTestsApplicationError {
    return new MockTestsApplicationError(400, 'SHARED_TEST_EMPTY', 'Shared test has no questions')
  }
}

export const isMockTestsApplicationError = (
  error: unknown,
): error is MockTestsApplicationError => error instanceof MockTestsApplicationError
