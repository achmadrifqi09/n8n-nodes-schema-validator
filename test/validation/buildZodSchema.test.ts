import { buildZodSchema } from '../../src/validation/buildZodSchema';
import { IFieldConfig } from '../../src/types';

describe('buildZodSchema', () => {
  it('builds a schema with multiple fields', () => {
    const config: IFieldConfig[] = [
      {
        fieldName: 'name',
        fieldType: 'string',
        rules: [{ ruleName: 'required', params: {}, customMessage: '' }],
      },
      {
        fieldName: 'age',
        fieldType: 'number',
        rules: [{ ruleName: 'min', params: { value: 18 }, customMessage: '' }],
      },
    ];

    const schema = buildZodSchema(config);
    expect(schema.safeParse({ name: 'Alice', age: 20 }).success).toBe(true);
    expect(schema.safeParse({ name: '', age: 20 }).success).toBe(false);
  });

  it('handles cross-field rules', () => {
    const config: IFieldConfig[] = [
      {
        fieldName: 'password',
        fieldType: 'string',
        rules: [{ ruleName: 'confirmed', params: {}, customMessage: '' }],
      },
      {
        fieldName: 'password_confirmation',
        fieldType: 'string',
        rules: [],
      },
    ];

    const schema = buildZodSchema(config);
    expect(schema.safeParse({ password: 'abc', password_confirmation: 'abc' }).success).toBe(true);
    expect(schema.safeParse({ password: 'abc', password_confirmation: 'def' }).success).toBe(false);
  });
});
