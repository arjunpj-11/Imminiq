import type { ErrorKind } from '../../../../shared/errors/error-kind';
import { DashboardDomainError } from '../domain/dashboard-domain.error';

export type DashboardApplicationErrorCode = 'NOT_FOUND' | 'DASHBOARD_INSIGHT_GENERATION_FAILED';

export class DashboardApplicationError extends DashboardDomainError {
  readonly kind: ErrorKind;

  private constructor(kind: ErrorKind, code: DashboardApplicationErrorCode, message: string) {
    super(code, message);
    this.name = 'DashboardApplicationError';
    this.kind = kind;
  }

  static userNotFound(): DashboardApplicationError {
    return new DashboardApplicationError('missing-resource', 'NOT_FOUND', 'User not found');
  }

  static insightGenerationFailed(): DashboardApplicationError {
    return new DashboardApplicationError(
      'dependency-unavailable',
      'DASHBOARD_INSIGHT_GENERATION_FAILED',
      'Dashboard insights are temporarily unavailable'
    );
  }
}

export const isDashboardApplicationError = (error: unknown): error is DashboardApplicationError =>
  error instanceof DashboardApplicationError;
