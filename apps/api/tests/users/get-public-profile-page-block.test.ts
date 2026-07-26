import { describe, expect, it, vi } from 'vitest';

import { GetPublicProfilePageUseCase } from '../../src/modules/user/users/application/use-cases/get-public-profile-page.usecase';
import { UserEntity } from '../../src/modules/user/users/domain/entities/user.entity';

describe('GetPublicProfilePageUseCase block privacy', () => {
  it('does not expose a profile when either user has blocked the other', async () => {
    const target = new UserEntity({
      id: '507f1f77bcf86cd799439011',
      fullName: 'Blocked User',
      username: 'blocked-user',
      role: 'user',
      status: 'active',
      emailVerified: true,
      phoneVerified: false,
      onboardingCompleted: true,
      coins: 0,
      xp: 0,
      level: 1,
      teacherXp: 0,
      teacherLevel: 1,
      streakCount: 0,
      avatarUrl: 'https://cdn.example/avatar.jpg',
      provider: 'local',
      referralCode: 'BLOCKED',
    });
    const repository = {
      findByUsername: vi.fn().mockResolvedValue(target),
      hasBlockBetween: vi.fn().mockResolvedValue(true),
    };
    const useCase = new GetPublicProfilePageUseCase(repository as never, {} as never, {} as never);

    await expect(
      useCase.execute('blocked-user', '507f191e810c19729de860ea', {
        page: 1,
        limit: 12,
      })
    ).rejects.toMatchObject({
      code: 'PUBLIC_PROFILE_NOT_AVAILABLE',
    });
    expect(repository.hasBlockBetween).toHaveBeenCalledWith('507f191e810c19729de860ea', target.id);
  });
});
