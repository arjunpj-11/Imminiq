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
    return new AdminTrackersApplicationError(
      'missing-resource',
      'TRACKER_NOT_FOUND',
      'Tracker not found'
    );
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

  static reviewNotFound() {
    return new AdminTrackersApplicationError(
      'missing-resource',
      'TRACKER_REVIEW_NOT_FOUND',
      'Tracker review not found'
    );
  }

  static reviewNotOpen() {
    return new AdminTrackersApplicationError(
      'conflict',
      'TRACKER_REVIEW_NOT_OPEN',
      'Consensus can only be changed while a review is open'
    );
  }
}
