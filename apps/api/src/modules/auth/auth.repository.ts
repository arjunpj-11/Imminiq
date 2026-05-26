import { mongoAuthRepository } from './infrastructure/repositories/mongo-auth.repository'

/**
 * Temporary compatibility shim.
 * New code should depend on domain contracts and wire concrete repositories
 * through auth.service.ts.
 */
export const authRepository = mongoAuthRepository
