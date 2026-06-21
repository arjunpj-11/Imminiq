import type { RestrictedUserStatus } from '../value-objects/restricted-user-status.vo'

export type RestrictedModerationUserEntityProps = {
  id: string
  status: RestrictedUserStatus
}

export class RestrictedModerationUserEntity {
  readonly id: string
  readonly status: RestrictedUserStatus

  constructor(props: RestrictedModerationUserEntityProps) {
    this.id = props.id
    this.status = props.status
  }
}
