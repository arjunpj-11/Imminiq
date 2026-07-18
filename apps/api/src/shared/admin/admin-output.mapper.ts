import type { AdminPage } from './admin.types';

export type AdminOutputDTO<T> = T;

export interface IAdminOutputMapper {
  toDTO<T extends object>(entity: T): AdminOutputDTO<T>;
  toPageDTO<T extends object>(page: AdminPage<T>): AdminPage<AdminOutputDTO<T>>;
  toResponseDTO<T extends object>(output: T): AdminOutputDTO<T>;
}

export class AdminOutputMapper implements IAdminOutputMapper {
  toDTO<T extends object>(entity: T): AdminOutputDTO<T> {
    return { ...entity };
  }

  toPageDTO<T extends object>(page: AdminPage<T>): AdminPage<AdminOutputDTO<T>> {
    return {
      items: page.items.map((item) => this.toDTO(item)),
      pagination: { ...page.pagination },
      ...(page.stats ? { stats: { ...page.stats } } : {}),
    };
  }

  toResponseDTO<T extends object>(output: T): AdminOutputDTO<T> {
    if (
      'items' in output &&
      Array.isArray(output.items) &&
      'pagination' in output &&
      typeof output.pagination === 'object' &&
      output.pagination !== null
    ) {
      return this.toPageDTO(output as AdminPage<object>) as AdminOutputDTO<T>;
    }
    return this.toDTO(output);
  }
}

export const adminOutputMapper = new AdminOutputMapper();
