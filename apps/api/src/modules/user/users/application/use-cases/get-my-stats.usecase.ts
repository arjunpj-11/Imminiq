import type { IUsersProfileDataReader } from '../services/users-profile-data.service';
import type { ProfileStatsViewDTO } from '../users.dto';

export interface IGetMyStatsUseCase {
  execute(userId: string): Promise<ProfileStatsViewDTO>;
}

export class GetMyStatsUseCase implements IGetMyStatsUseCase {
  constructor(private readonly _profileDataReader: IUsersProfileDataReader) {}

  async execute(userId: string) {
    return this._profileDataReader.getStats(userId);
  }
}
