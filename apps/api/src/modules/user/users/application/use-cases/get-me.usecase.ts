import type { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UsersApplicationError } from '../users-application.error';
import type { MyProfileViewDTO } from '../users.dto';
import type { IUsersMapper } from '../users.mapper';

type GetMeRepository = IUserRepository & IUserProfileRepository;

export interface IGetMeUseCase {
  execute(userId: string): Promise<MyProfileViewDTO>;
}

export class GetMeUseCase implements IGetMeUseCase {
  constructor(
    private readonly _usersRepository: GetMeRepository,
    private readonly _usersMapper: IUsersMapper
  ) {}

  async execute(userId: string) {
    const user = await this._usersRepository.findById(userId);

    if (!user) {
      throw UsersApplicationError.userNotFound();
    }

    const profile = await this._usersRepository.ensureForUser({
      userId: user.id,
    });

    return {
      user: this._usersMapper.toUserView(user),
      profile: this._usersMapper.toProfileView(profile),
    };
  }
}
