export class AdminTrackersApplicationError extends Error {
  readonly statusCode: number;
  readonly code: string;

  private constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'AdminTrackersApplicationError';
    this.statusCode = statusCode;
    this.code = code;
  }

  static trackerNotFound() {
    return new AdminTrackersApplicationError(404, 'TRACKER_NOT_FOUND', 'Tracker not found');
  }

  static publishedTrackerNotFound() {
    return new AdminTrackersApplicationError(
      404,
      'PUBLISHED_TRACKER_NOT_FOUND',
      'Published tracker not found'
    );
  }

  static reportNotFound() {
    return new AdminTrackersApplicationError(
      404,
      'TRACKER_REPORT_NOT_FOUND',
      'Tracker report not found'
    );
  }
}
