import type { ErrorKind } from '../../../../shared/errors/error-kind';
export class AdminTrackersApplicationError extends Error {
  readonly kind: ErrorKind;
  readonly code: string;

  private constructor(kind: ErrorKind, code: string, message: string) {
    super(message);
    this.name = 'AdminTrackersApplicationError';
    this.kind = kind;
    this.code = code;
  }

  static trackerNotFound() {
    return new AdminTrackersApplicationError('missing-resource', 'TRACKER_NOT_FOUND', 'Tracker not found');
  }

  static publishedTrackerNotFound() {
    return new AdminTrackersApplicationError(
      'missing-resource',
      'PUBLISHED_TRACKER_NOT_FOUND',
      'Published tracker not found'
    );
  }

  static reportNotFound() {
    return new AdminTrackersApplicationError(
      'missing-resource',
      'TRACKER_REPORT_NOT_FOUND',
      'Tracker report not found'
    );
  }
}
