export class AdminTrackerReviewsApplicationError extends Error {
  readonly statusCode: number;
  readonly code: string;

  private constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'AdminTrackerReviewsApplicationError';
    this.statusCode = statusCode;
    this.code = code;
  }

  static notFound() {
    return new AdminTrackerReviewsApplicationError(
      404,
      'TRACKER_REVIEW_NOT_FOUND',
      'Tracker review not found'
    );
  }

  static notOpen() {
    return new AdminTrackerReviewsApplicationError(
      409,
      'TRACKER_REVIEW_NOT_OPEN',
      'Consensus can only be changed while a review is open'
    );
  }
}
