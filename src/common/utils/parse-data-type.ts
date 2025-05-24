export function parseBoolean(value?: string): boolean | undefined {
  if (value === '0') return false;
  if (value === '1') return true;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}
