export type UserPrivacySettingsEntityProps = {
  showProfile: boolean
  showStats: boolean
  showTrackers: boolean
  showActivity: boolean
}

export class UserPrivacySettingsEntity {
  readonly showProfile: boolean
  readonly showStats: boolean
  readonly showTrackers: boolean
  readonly showActivity: boolean

  constructor(props: UserPrivacySettingsEntityProps) {
    this.showProfile = props.showProfile
    this.showStats = props.showStats
    this.showTrackers = props.showTrackers
    this.showActivity = props.showActivity
  }
}
