import type { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import type { UserProfileUpdate } from '../../domain/value-objects/user-profile-update.vo';
import type { UpdateMyProfileInputDTO } from '../users.dto';
import { UsersApplicationError } from '../users-application.error';
import type { IUsersMapper } from '../users.mapper';

type UpdateMeRepository = IUserRepository & IUserProfileRepository;

export interface IUpdateMeUseCase {
  execute(
    userId: string,
    payload: UpdateMyProfileInputDTO
  ): Promise<{
    user: import('../users.dto').CurrentUserViewDTO;
    profile: import('../users.dto').EditableProfileViewDTO;
  }>;
}

export class UpdateMeUseCase implements IUpdateMeUseCase {
  constructor(
    private readonly _usersRepository: UpdateMeRepository,
    private readonly _usersMapper: IUsersMapper
  ) {}

  async execute(userId: string, payload: UpdateMyProfileInputDTO) {
    const user = await this._usersRepository.findById(userId);

    if (!user) {
      throw UsersApplicationError.userNotFound();
    }

    const normalizedPayload = this.normalizePayload(payload);
    const { fullName, ...profilePayload } = normalizedPayload;

    const hasProfileUpdates = Object.keys(profilePayload).length > 0;

    const updatedProfile = hasProfileUpdates
      ? await this._usersRepository.updateByUserId({
          userId: user.id,
          payload: profilePayload as UserProfileUpdate,
        })
      : await this._usersRepository.ensureForUser({
          userId: user.id,
        });

    if (!updatedProfile) {
      throw UsersApplicationError.profileUpdateFailed();
    }

    let resolvedUser = user;

    if (fullName && fullName !== user.fullName) {
      const updatedUser = await this._usersRepository.updateFullName({
        userId: user.id,
        fullName,
      });

      if (!updatedUser) {
        throw UsersApplicationError.userNameUpdateFailed();
      }

      resolvedUser = updatedUser;
    }

    return {
      user: this._usersMapper.toUserView(resolvedUser),
      profile: this._usersMapper.toProfileView(updatedProfile),
    };
  }

  private normalizePayload(payload: UpdateMyProfileInputDTO): UpdateMyProfileInputDTO {
    return {
      ...payload,
      ...(payload.fullName !== undefined ? { fullName: payload.fullName.trim() } : {}),
      ...(payload.skills !== undefined ? { skills: this.cleanTags(payload.skills) } : {}),
      ...(payload.interests !== undefined ? { interests: this.cleanTags(payload.interests) } : {}),
    };
  }

  private cleanTags(tags: string[]): string[] {
    return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
  }
}
