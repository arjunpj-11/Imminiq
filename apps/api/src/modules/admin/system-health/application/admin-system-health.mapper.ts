import type { AdminSystemHealth } from '../domain/entities/admin-system-health.entity';
import type { AdminSystemHealthDTO } from './admin-system-health.dto';

export interface IAdminSystemHealthMapper {
  toDTO(entity: AdminSystemHealth): AdminSystemHealthDTO;
}

export class AdminSystemHealthMapper implements IAdminSystemHealthMapper {
  toDTO(entity: AdminSystemHealth): AdminSystemHealthDTO {
    return {
      ...entity,
      services: {
        api: { ...entity.services.api },
        mongodb: { ...entity.services.mongodb },
        redis: { ...entity.services.redis },
      },
      memory: { ...entity.memory },
    };
  }
}
