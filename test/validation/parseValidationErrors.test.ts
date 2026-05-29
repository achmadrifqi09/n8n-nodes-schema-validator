import { ZodError } from 'zod';
import { parseValidationErrors } from '../../src/validation/parseValidationErrors';

describe('parseValidationErrors', () => {
  it('should parse invalid_type error', () => {
    const error = new ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        path: ['fieldA'],
        message: 'Expected string, received number',
      },
    ]);
    const parsed = parseValidationErrors(error);
    expect(parsed[0]).toEqual({
      field: 'fieldA',
      rule: 'type',
      message: 'Expected string, received number',
    });
  });

  it('should parse custom error from superRefine', () => {
    const error = new ZodError([
      {
        code: 'custom',
        message: 'Passwords must match',
        path: ['password_confirmation'],
        params: { rule: 'confirmed' },
      },
    ]);
    const parsed = parseValidationErrors(error);
    expect(parsed[0]).toEqual({
      field: 'password_confirmation',
      rule: 'confirmed',
      message: 'Passwords must match',
    });
  });
});
