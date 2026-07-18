import { describe, expect, it } from 'vitest';

import { AdminOutputMapper } from '../../src/shared/admin/admin-output.mapper';

describe('AdminOutputMapper', () => {
  it('creates a detached DTO for a single output entity', () => {
    const entity = { id: 'one', status: 'active' };
    const dto = new AdminOutputMapper().toResponseDTO(entity);

    expect(dto).toEqual(entity);
    expect(dto).not.toBe(entity);
  });

  it('detaches paginated items, pagination, and statistics', () => {
    const page = {
      items: [{ id: 'one' }],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      stats: { active: 1 },
    };
    const dto = new AdminOutputMapper().toResponseDTO(page);

    expect(dto).toEqual(page);
    expect(dto.items).not.toBe(page.items);
    expect(dto.items[0]).not.toBe(page.items[0]);
    expect(dto.pagination).not.toBe(page.pagination);
    expect(dto.stats).not.toBe(page.stats);
  });

  it('preserves array responses and detaches their entries', () => {
    const versions = [
      { id: 'version-two', version: 2 },
      { id: 'version-one', version: 1 },
    ];
    const dto = new AdminOutputMapper().toResponseDTO(versions);

    expect(Array.isArray(dto)).toBe(true);
    expect(dto).toEqual(versions);
    expect(dto).not.toBe(versions);
    expect(dto[0]).not.toBe(versions[0]);
  });
});
