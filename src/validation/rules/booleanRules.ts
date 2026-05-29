import { z } from 'zod';
import { IValidationRule } from '../../types';

const BOOLEAN_RULES = {
  REQUIRED: 'required',
  OPTIONAL: 'optional',
  IS_TRUE: 'isTrue',
  IS_FALSE: 'isFalse',
  NULLABLE: 'nullable',
} as const;

export function applyBooleanRule(
  schema: z.ZodBoolean | z.ZodOptional<z.ZodBoolean>,
  rule: IValidationRule
): z.ZodType {
  const messageStr = rule.customMessage || undefined;
  const bool = schema as z.ZodBoolean;

  switch (rule.ruleName) {
    case BOOLEAN_RULES.REQUIRED:
      return schema;

    case BOOLEAN_RULES.OPTIONAL:
      return bool.optional();

    case BOOLEAN_RULES.IS_TRUE:
      return bool.refine((v) => v === true, messageStr);

    case BOOLEAN_RULES.IS_FALSE:
      return bool.refine((v) => v === false, messageStr);

    case BOOLEAN_RULES.NULLABLE:
      return schema.nullable();

    default:
      throw new Error(`Unknown boolean rule: ${rule.ruleName}`);
  }
}
