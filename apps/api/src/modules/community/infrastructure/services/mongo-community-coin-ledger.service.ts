import type {
  AwardCommunityCoinsInput,
  AwardCommunityCoinsResult,
  CommunityCoinLedgerContract,
} from '../../domain/services/community-coin-ledger.service.interface'
import { CommunityUserModel } from '../repositories/shared/mongo-community.models'
import type { MongoUserRecord } from '../repositories/shared/mongo-community.types'

export class MongoCommunityCoinLedgerService
  implements CommunityCoinLedgerContract
{
  async awardCoins(
    data: AwardCommunityCoinsInput,
  ): Promise<AwardCommunityCoinsResult> {
    const user = await CommunityUserModel.findByIdAndUpdate(
      data.userId,
      { $inc: { coins: data.amount } },
      { new: true },
    ).lean<MongoUserRecord>()

    return {
      awarded: Boolean(user),
      balance: Number(user?.coins ?? 0),
    }
  }
}

export const mongoCommunityCoinLedgerService =
  new MongoCommunityCoinLedgerService()
