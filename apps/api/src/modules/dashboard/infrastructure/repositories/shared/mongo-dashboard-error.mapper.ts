import { DashboardDomainError } from '../../../domain/errors/dashboard-domain.error'

export type ErrorMapper = (error: unknown) => DashboardDomainError | null

type MongoErrorLike = {
  name?: unknown
  code?: unknown
}

export class MongoDashboardErrorMapper {
  static mapMongoError(error: unknown): DashboardDomainError | null {
    if (error instanceof DashboardDomainError) {
      return error
    }

    if (this.isMongoCastError(error)) {
      return new DashboardDomainError(
        'DASHBOARD_INVALID_DATABASE_ID',
        'Invalid dashboard database id',
      )
    }

    if (this.isMongoValidationError(error)) {
      return new DashboardDomainError(
        'DASHBOARD_VALIDATION_FAILED',
        'Invalid dashboard data',
      )
    }

    return null
  }

  private static isMongoCastError(error: unknown): boolean {
    return this.getErrorName(error) === 'CastError'
  }

  private static isMongoValidationError(error: unknown): boolean {
    return this.getErrorName(error) === 'ValidationError'
  }

  private static getErrorName(error: unknown): string | null {
    if (!error || typeof error !== 'object') {
      return null
    }

    const mongoError = error as MongoErrorLike

    return typeof mongoError.name === 'string' ? mongoError.name : null
  }
}
