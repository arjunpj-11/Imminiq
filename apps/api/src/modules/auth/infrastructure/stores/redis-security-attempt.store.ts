import {
  SECURITY_ATTEMPT_POLICIES,
  securityAttemptCache,
} from '../../../../infrastructure/cache/security-attempt.cache'

import type {
  SecurityAttemptPolicyName,
  SecurityAttemptScope,
  ISecurityAttemptStore,
} from '../../domain/services/security-attempt-store.interface'

export class RedisSecurityAttemptStore
  implements ISecurityAttemptStore {
  async isBlocked(
    scope: SecurityAttemptScope,
    identifier: string
  ): Promise<boolean> {
    return securityAttemptCache.isBlocked(scope, identifier)
  }

  async getRetryAfterSeconds(
    scope: SecurityAttemptScope,
    identifier: string
  ): Promise<number> {
    return securityAttemptCache.getRetryAfterSeconds(scope, identifier)
  }

  async recordFailure(
    scope: SecurityAttemptScope,
    identifier: string,
    policyName: SecurityAttemptPolicyName
  ): Promise<{
    blocked: boolean
  }> {
    return securityAttemptCache.recordFailure(
      scope,
      identifier,
      SECURITY_ATTEMPT_POLICIES[policyName]
    )
  }

  async clear(
    scope: SecurityAttemptScope,
    identifier: string
  ): Promise<void> {
    await securityAttemptCache.clear(scope, identifier)
  }
}

export const redisSecurityAttemptStore = new RedisSecurityAttemptStore()
