import { describe, expect, it } from 'vitest';
import {
  escapeAdminExportSearch,
  safeAdminCsvValue,
} from '../../src/infrastructure/admin/mongo-admin-export.service';

describe('admin export security', () => {
  it.each(['=HYPERLINK("https://evil.invalid")', '+1+1', '-2+3', '@SUM(A1:A2)', '  =1+1'])(
    'neutralizes spreadsheet formula input: %s',
    (value) => {
      expect(safeAdminCsvValue(value)).toMatch(/^"'/);
    }
  );

  it('quotes embedded CSV delimiters and double quotes', () => {
    expect(safeAdminCsvValue('Learner, "One"')).toBe('"Learner, ""One"""');
  });

  it('escapes regular-expression operators in export searches', () => {
    expect(escapeAdminExportSearch('user.*(admin)+')).toBe('user\\.\\*\\(admin\\)\\+');
  });
});
