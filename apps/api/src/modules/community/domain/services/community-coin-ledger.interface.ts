export type AwardCommunityCoinsInput = {
  userId: string
  sourceId: string
  reason: 'verification_majority_reward'
  amount: number
}

export type AwardCommunityCoinsResult = {
  awarded: boolean
  balance: number
}

export interface CommunityCoinLedgerContract {
  awardCoins(data: AwardCommunityCoinsInput): Promise<AwardCommunityCoinsResult>
}
