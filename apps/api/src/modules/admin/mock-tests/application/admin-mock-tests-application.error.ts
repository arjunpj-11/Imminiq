export class AdminMockTestsApplicationError extends Error {
  readonly statusCode: number;
  readonly code: string;

  private constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }

  static notFound() {
    return new AdminMockTestsApplicationError(404, 'MOCK_TEST_NOT_FOUND', 'Mock test not found');
  }

  static issueNotFound() {
    return new AdminMockTestsApplicationError(
      404,
      'MOCK_TEST_QUESTION_ISSUE_NOT_FOUND',
      'Mock test question report not found'
    );
  }
}
