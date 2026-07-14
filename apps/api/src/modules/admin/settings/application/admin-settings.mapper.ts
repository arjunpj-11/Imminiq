import type { AdminSettings } from '../domain/entities/admin-settings.entity';
import type { AdminSettingsDTO } from './admin-settings.dto';

export interface IAdminSettingsMapper {
  toDTO(entity: AdminSettings): AdminSettingsDTO;
}

export class AdminSettingsMapper implements IAdminSettingsMapper {
  toDTO(entity: AdminSettings): AdminSettingsDTO {
    return { ...entity };
  }
}
