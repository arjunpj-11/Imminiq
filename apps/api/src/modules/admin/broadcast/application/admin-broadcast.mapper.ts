import type { AdminPage } from '../../shared';
import type {
  AdminBroadcast,
  AdminBroadcastResult,
} from '../domain/entities/admin-broadcast.entity';
import type { IAdminBroadcastDTO, IAdminBroadcastResultDTO } from './admin-broadcast.dto';

export interface IAdminBroadcastMapper {
  toDTO(entity: AdminBroadcast): IAdminBroadcastDTO;
  toResultDTO(result: AdminBroadcastResult): IAdminBroadcastResultDTO;
  toPageDTO(page: AdminPage<AdminBroadcast>): AdminPage<IAdminBroadcastDTO>;
}

export class AdminBroadcastMapper implements IAdminBroadcastMapper {
  toDTO(entity: AdminBroadcast): IAdminBroadcastDTO {
    return { ...entity };
  }
  toResultDTO(result: AdminBroadcastResult): IAdminBroadcastResultDTO {
    return { ...result };
  }
  toPageDTO(page: AdminPage<AdminBroadcast>): AdminPage<IAdminBroadcastDTO> {
    return {
      ...page,
      items: page.items.map((item) => this.toDTO(item)),
      pagination: { ...page.pagination },
      ...(page.stats ? { stats: { ...page.stats } } : {}),
    };
  }
}
