/**
 * Safely convert a value (string | number | Decimal | null | undefined) to a number.
 * Prisma Decimal fields come back as strings over JSON.
 */
export function toNum(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

/**
 * Format a cost value to a fixed number of decimal places.
 */
export function fmtCost(value: unknown, decimals = 4): string {
  return `$${toNum(value).toFixed(decimals)}`;
}
