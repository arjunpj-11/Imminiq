import type { AdminSettings } from '../domain/entities/admin-settings.entity';
import type { IAdminSettingsDTO } from './admin-settings.dto';

export interface IAdminSettingsMapper {
  toDTO(entity: AdminSettings): IAdminSettingsDTO;
}

export class AdminSettingsMapper implements IAdminSettingsMapper {
  toDTO(entity: AdminSettings): IAdminSettingsDTO {
    return { ...entity };
  }
}
