/**
 * Export data as CSV and trigger browser download.
 */
export function exportCSV(
  data: Record<string, unknown>[],
  filename: string,
  columns?: { key: string; label: string }[]
) {
  if (data.length === 0) return;

  const keys = columns
    ? columns.map((c) => c.key)
    : Object.keys(data[0]);

  const headers = columns
    ? columns.map((c) => c.label)
    : keys;

  const rows = data.map((row) =>
    keys.map((key) => {
      const val = row[key];
      if (val === null || val === undefined) return '';
      const str = String(val);
      // Escape quotes and wrap if contains comma/quote/newline
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
