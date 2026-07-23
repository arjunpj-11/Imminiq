export type CsvCell = string | number | boolean | null | undefined;

const FORMULA_PREFIX = /^[\t\r\n ]*[=+\-@]/;

const neutralizeSpreadsheetFormula = (text: string) =>
  FORMULA_PREFIX.test(text) ? `'${text}` : text;

const escapeCsvCell = (value: CsvCell) => {
  const raw = value == null ? '' : String(value);
  const text = neutralizeSpreadsheetFormula(raw);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export const downloadCsv = (filename: string, rows: CsvCell[][]) => {
  const csv = rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
