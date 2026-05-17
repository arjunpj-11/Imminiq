import type { DashboardRepository } from '../../domain/repositories/dashboard.repository.interface'

export class GetFriendsHubUseCase {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(userId: string, limit?: number): Promise<unknown[]> {
    return this.dashboardRepository.getFriendsHub(userId, limit)
  }
}
