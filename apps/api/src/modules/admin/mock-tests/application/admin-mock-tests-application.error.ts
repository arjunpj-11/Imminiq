import type { ErrorKind } from '../../../../shared/errors/error-kind';
export class AdminMockTestsApplicationError extends Error {
  readonly kind: ErrorKind;
  readonly code: string;

  private constructor(kind: ErrorKind, code: string, message: string) {
    super(message);
    this.kind = kind;
    this.code = code;
  }

  static notFound() {
    return new AdminMockTestsApplicationError('missing-resource', 'MOCK_TEST_NOT_FOUND', 'Mock test not found');
  }

  static issueNotFound() {
    return new AdminMockTestsApplicationError(
      'missing-resource',
      'MOCK_TEST_QUESTION_ISSUE_NOT_FOUND',
      'Mock test question report not found'
    );
  }
}
