export function formatNumber(
  toFormat: string | number,
  separator = ","
): string {
  return String(toFormat).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}
