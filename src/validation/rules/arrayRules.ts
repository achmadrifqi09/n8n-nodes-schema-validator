import { z } from 'zod';
import { IValidationRule } from '../../types';

const ARRAY_RULES = {
  REQUIRED: 'required',
  OPTIONAL: 'optional',
  MIN: 'min',
  MAX: 'max',
  LENGTH: 'length',
  NONEMPTY: 'nonempty',
  UNIQUE: 'unique',
  NULLABLE: 'nullable',
} as const;

function requireNumberParam(rule: IValidationRule, ruleName: string): number {
  const value = rule.params.value;
  if (typeof value !== 'number') {
    throw new Error(`Rule "${ruleName}" requires a number value parameter`);
  }
  return value;
}

function hasNoDuplicates(items: unknown[]): boolean {
  const serialized = items.map((item) => JSON.stringify(item));
  return new Set(serialized).size === items.length;
}

export function applyArrayRule(
  schema: z.ZodArray<z.ZodUnknown> | z.ZodOptional<z.ZodArray<z.ZodUnknown>>,
  rule: IValidationRule
): z.ZodType {
  const messageStr = rule.customMessage || undefined;
  const arr = schema as z.ZodArray<z.ZodUnknown>;

  switch (rule.ruleName) {
    case ARRAY_RULES.REQUIRED:
      return schema;

    case ARRAY_RULES.OPTIONAL:
      return arr.optional();

    case ARRAY_RULES.MIN:
      return arr.min(requireNumberParam(rule, 'min'), messageStr);

    case ARRAY_RULES.MAX:
      return arr.max(requireNumberParam(rule, 'max'), messageStr);

    case ARRAY_RULES.LENGTH:
      return arr.length(requireNumberParam(rule, 'length'), messageStr);

    case ARRAY_RULES.NONEMPTY:
      return arr.nonempty(messageStr);

    case ARRAY_RULES.UNIQUE:
      return arr.refine(hasNoDuplicates, messageStr);

    case ARRAY_RULES.NULLABLE:
      return schema.nullable();

    default:
      throw new Error(`Unknown array rule: ${rule.ruleName}`);
  }
}
