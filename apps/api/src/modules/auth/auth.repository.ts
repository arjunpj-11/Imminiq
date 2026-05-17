import { mongoAuthRepository } from './infrastructure/repositories/mongo-auth.repository'

/**
 * Compatibility export:
 * Existing modules that import `authRepository` from `./auth.repository`
 * keep working while the implementation now lives in infrastructure.
 */
export const authRepository = mongoAuthRepository
