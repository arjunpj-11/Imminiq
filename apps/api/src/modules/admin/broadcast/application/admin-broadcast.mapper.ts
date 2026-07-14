import type { AdminPage } from '../../shared/domain';
import type {
  AdminBroadcast,
  AdminBroadcastResult,
} from '../domain/entities/admin-broadcast.entity';
import type { AdminBroadcastDTO, AdminBroadcastResultDTO } from './admin-broadcast.dto';

export interface IAdminBroadcastMapper {
  toDTO(entity: AdminBroadcast): AdminBroadcastDTO;
  toResultDTO(result: AdminBroadcastResult): AdminBroadcastResultDTO;
  toPageDTO(page: AdminPage<AdminBroadcast>): AdminPage<AdminBroadcastDTO>;
}

export class AdminBroadcastMapper implements IAdminBroadcastMapper {
  toDTO(entity: AdminBroadcast): AdminBroadcastDTO {
    return { ...entity };
  }
  toResultDTO(result: AdminBroadcastResult): AdminBroadcastResultDTO {
    return { ...result };
  }
  toPageDTO(page: AdminPage<AdminBroadcast>): AdminPage<AdminBroadcastDTO> {
    return {
      ...page,
      items: page.items.map((item) => this.toDTO(item)),
      pagination: { ...page.pagination },
      ...(page.stats ? { stats: { ...page.stats } } : {}),
    };
  }
}
