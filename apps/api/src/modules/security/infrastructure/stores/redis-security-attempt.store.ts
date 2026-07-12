import {
  SECURITY_ATTEMPT_POLICIES,
  securityAttemptCache,
} from '../../../../infrastructure/cache/security-attempt.cache'
import { SecurityDomainError } from '../../domain/security-domain.error'
import type { ISecurityAttemptStore } from '../../domain/services/security-attempt-store.interface'
import type {
  SecurityAttemptPolicyName,
  SecurityAttemptScope,
} from '../../domain/security.types'

export class RedisSecurityAttemptStore implements ISecurityAttemptStore {
  async isBlocked(
    scope: SecurityAttemptScope,
    identifier: string,
  ): Promise<boolean> {
    try {
      return await securityAttemptCache.isBlocked(scope, identifier)
    } catch {
      throw new SecurityDomainError(
        'SECURITY_ATTEMPT_LOOKUP_FAILED',
        'Security attempt state could not be read',
      )
    }
  }

  async recordFailure(
    scope: SecurityAttemptScope,
    identifier: string,
    policyName: SecurityAttemptPolicyName,
  ): Promise<{ blocked: boolean }> {
    try {
      return await securityAttemptCache.recordFailure(
        scope,
        identifier,
        SECURITY_ATTEMPT_POLICIES[policyName],
      )
    } catch {
      throw new SecurityDomainError(
        'SECURITY_ATTEMPT_RECORD_FAILED',
        'Security attempt failure could not be recorded',
      )
    }
  }

  async clear(scope: SecurityAttemptScope, identifier: string): Promise<void> {
    try {
      await securityAttemptCache.clear(scope, identifier)
    } catch {
      throw new SecurityDomainError(
        'SECURITY_ATTEMPT_CLEAR_FAILED',
        'Security attempt state could not be cleared',
      )
    }
  }
}

export const redisSecurityAttemptStore = new RedisSecurityAttemptStore()
