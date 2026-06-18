import type { UserSettingsData } from '../value-objects/user-settings-data.vo'

export type UserSettingsEntityProps = {
  id?: string
  userId: string
  settings: UserSettingsData
}

export class UserSettingsEntity {
  readonly id?: string
  readonly userId: string
  readonly settings: UserSettingsData

  constructor(props: UserSettingsEntityProps) {
    this.id = props.id
    this.userId = props.userId
    this.settings = props.settings
  }
}
