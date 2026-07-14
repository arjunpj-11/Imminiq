import type {
  AwardCommunityCoinsInput,
  AwardCommunityCoinsResult,
  ICommunityCoinLedger,
} from '../../domain/services/community-coin-ledger.interface';
import { CommunityUserModel } from '../repositories/shared/mongo-community.models';
import type { MongoUserRecord } from '../repositories/shared/mongo-community.types';

export class MongoCommunityCoinLedger implements ICommunityCoinLedger {
  async awardCoins(data: AwardCommunityCoinsInput): Promise<AwardCommunityCoinsResult> {
    const user = await CommunityUserModel.findByIdAndUpdate(
      data.userId,
      { $inc: { coins: data.amount } },
      { new: true }
    ).lean<MongoUserRecord>();

    return {
      awarded: Boolean(user),
      balance: Number(user?.coins ?? 0),
    };
  }
}

export const mongoCommunityCoinLedger = new MongoCommunityCoinLedger();
