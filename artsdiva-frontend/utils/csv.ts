export interface CsvColumn<T> {
  // A stable identifier for the column — only read directly off the row
  // when no `value` accessor is given, so it need not be a real key of T
  // (derived/nested columns like contactInfo.email always pass `value`).
  key: string;
  label: string;
  value?: (row: T) => string | number | null | undefined;
}

function escapeCell(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCell(c.label)).join(",");
  const lines = rows.map((row) =>
    columns
      .map((c) => escapeCell(c.value ? c.value(row) : (row as Record<string, unknown>)[c.key]))
      .join(",")
  );
  return [header, ...lines].join("\r\n");
}

export function downloadCsv(filename: string, csvString: string): void {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
