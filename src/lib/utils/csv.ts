/**
 * Client-safe RFC-4180 compliant CSV generator.
 */
export function convertToCsv(data: Record<string, any>): string {
  const items: any[] = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
  if (items.length === 0) return '';

  // Collect all unique keys across all items
  const headerSet = new Set<string>();
  for (const item of items) {
    if (typeof item === 'object' && item !== null) {
      Object.keys(item).forEach((k) => headerSet.add(k));
    }
  }

  const headers = Array.from(headerSet);
  if (headers.length === 0) return '';

  const lines = [headers.join(',')];

  for (const item of items) {
    const row = headers.map((h) => {
      const val = item[h];
      if (val === null || val === undefined) return '""';
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    lines.push(row.join(','));
  }

  return lines.join('\n');
}
