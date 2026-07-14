import { describe, expect, it, vi } from 'vitest';

import { ListTrackerDomainsUseCase } from '../../src/modules/user/trackers/application/use-cases/list-tracker-domains.usecase';
import { publishTrackerSchema } from '../../src/modules/user/trackers/presentation/trackers.schema';

describe('tracker publishing domains', () => {
  it('accepts a manually entered domain during publishing', () => {
    expect(publishTrackerSchema.parse({ domain: '  English  ' }).domain).toBe('English');
  });

  it('rejects empty and excessively long custom domains', () => {
    expect(() => publishTrackerSchema.parse({ domain: '   ' })).toThrow();
    expect(() => publishTrackerSchema.parse({ domain: 'a'.repeat(81) })).toThrow();
  });

  it('trims the search and always asks the repository for at most ten domains', async () => {
    const listDomains = vi.fn().mockResolvedValue(['English']);
    const useCase = new ListTrackerDomainsUseCase({ listDomains });

    await expect(useCase.execute('  eng  ')).resolves.toEqual(['English']);
    expect(listDomains).toHaveBeenCalledWith('eng', 10);
  });
});
