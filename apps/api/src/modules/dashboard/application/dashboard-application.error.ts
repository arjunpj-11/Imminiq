import { DashboardDomainError } from '../domain/dashboard-domain.error'

export type DashboardApplicationErrorCode =
  | 'NOT_FOUND'
  | 'DASHBOARD_INSIGHT_GENERATION_FAILED'

export class DashboardApplicationError extends DashboardDomainError {
  readonly statusCode: number

  private constructor(
    statusCode: number,
    code: DashboardApplicationErrorCode,
    message: string
  ) {
    super(code, message)
    this.name = 'DashboardApplicationError'
    this.statusCode = statusCode
  }

  static userNotFound(): DashboardApplicationError {
    return new DashboardApplicationError(404, 'NOT_FOUND', 'User not found')
  }

  static insightGenerationFailed(): DashboardApplicationError {
    return new DashboardApplicationError(
      503,
      'DASHBOARD_INSIGHT_GENERATION_FAILED',
      'Dashboard insights are temporarily unavailable'
    )
  }
}

export const isDashboardApplicationError = (
  error: unknown
): error is DashboardApplicationError =>
  error instanceof DashboardApplicationError
