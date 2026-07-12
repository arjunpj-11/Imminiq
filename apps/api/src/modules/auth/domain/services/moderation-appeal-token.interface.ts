export interface IModerationAppealToken {
  create(userId: string, identifier: string): string
}
