import type {
  SecurityAttemptPolicyName,
  SecurityAttemptScope,
} from '../security.types'

export interface ISecurityAttemptStore {
  isBlocked(scope: SecurityAttemptScope, identifier: string): Promise<boolean>
  recordFailure(
    scope: SecurityAttemptScope,
    identifier: string,
    policyName: SecurityAttemptPolicyName,
  ): Promise<{ blocked: boolean }>
  clear(scope: SecurityAttemptScope, identifier: string): Promise<void>
}
