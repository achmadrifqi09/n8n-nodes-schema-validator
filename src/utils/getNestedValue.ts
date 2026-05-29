/**
 * Retrieves a value from a nested object using dot-notation path.
 *
 * @param obj - The source object to traverse
 * @param path - Dot-separated key path
 * @returns The value at the path, or undefined if any key is missing
 */
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  if (path === '') {
    return obj;
  }

  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}
