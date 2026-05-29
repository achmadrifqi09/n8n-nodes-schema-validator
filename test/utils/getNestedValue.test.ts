import { getNestedValue } from '../../src/utils/getNestedValue';

describe('getNestedValue', () => {
  it('should get top-level key', () => {
    const obj = { a: 1 };
    expect(getNestedValue(obj, 'a')).toBe(1);
  });

  it('should get two-level nested key', () => {
    const obj = { a: { b: 2 } };
    expect(getNestedValue(obj, 'a.b')).toBe(2);
  });

  it('should get three-level nested key', () => {
    const obj = { a: { b: { c: 3 } } };
    expect(getNestedValue(obj, 'a.b.c')).toBe(3);
  });

  it('should return undefined if key does not exist', () => {
    const obj = { a: 1 };
    expect(getNestedValue(obj, 'b')).toBeUndefined();
  });

  it('should return undefined for intermediate null value', () => {
    const obj = { a: null };
    expect(getNestedValue(obj, 'a.b')).toBeUndefined();
  });

  it('should return the full object for empty path string', () => {
    const obj = { a: 1 };
    expect(getNestedValue(obj, '')).toBe(obj);
  });
});
