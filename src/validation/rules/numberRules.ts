import { z } from 'zod';
import { IValidationRule } from '../../types';

const NUMBER_RULES = {
  REQUIRED: 'required',
  OPTIONAL: 'optional',
  MIN: 'min',
  MAX: 'max',
  GT: 'gt',
  GTE: 'gte',
  LT: 'lt',
  LTE: 'lte',
  INT: 'int',
  POSITIVE: 'positive',
  NONNEGATIVE: 'nonnegative',
  NEGATIVE: 'negative',
  NONPOSITIVE: 'nonpositive',
  SAFE: 'safe',
  MULTIPLE_OF: 'multipleOf',
  IN: 'in',
  NULLABLE: 'nullable',
} as const;

function requireNumberParam(rule: IValidationRule, ruleName: string): number {
  const value = rule.params.value;
  if (typeof value !== 'number') {
    throw new Error(`Rule "${ruleName}" requires a number value parameter`);
  }
  return value;
}

export function applyNumberRule(
  schema: z.ZodNumber | z.ZodOptional<z.ZodNumber>,
  rule: IValidationRule
): z.ZodType {
  const messageStr = rule.customMessage || undefined;
  const num = schema as z.ZodNumber;

  switch (rule.ruleName) {
    case NUMBER_RULES.REQUIRED:
      return schema;

    case NUMBER_RULES.OPTIONAL:
      return num.optional();

    case NUMBER_RULES.MIN:
      return num.min(requireNumberParam(rule, 'min'), messageStr);

    case NUMBER_RULES.MAX:
      return num.max(requireNumberParam(rule, 'max'), messageStr);

    case NUMBER_RULES.GT:
      return num.gt(requireNumberParam(rule, 'gt'), messageStr);

    case NUMBER_RULES.GTE:
      return num.gte(requireNumberParam(rule, 'gte'), messageStr);

    case NUMBER_RULES.LT:
      return num.lt(requireNumberParam(rule, 'lt'), messageStr);

    case NUMBER_RULES.LTE:
      return num.lte(requireNumberParam(rule, 'lte'), messageStr);

    case NUMBER_RULES.INT:
      return num.int(messageStr);

    case NUMBER_RULES.POSITIVE:
      return num.positive(messageStr);

    case NUMBER_RULES.NONNEGATIVE:
      return num.nonnegative(messageStr);

    case NUMBER_RULES.NEGATIVE:
      return num.negative(messageStr);

    case NUMBER_RULES.NONPOSITIVE:
      return num.nonpositive(messageStr);

    case NUMBER_RULES.SAFE:
      return num.safe(messageStr);

    case NUMBER_RULES.MULTIPLE_OF:
      return num.multipleOf(requireNumberParam(rule, 'multipleOf'), messageStr);

    case NUMBER_RULES.IN: {
      const allowedValues = rule.params.values;
      if (!Array.isArray(allowedValues)) {
        throw new Error('Rule "in" requires an array of numbers parameter');
      }
      return num.refine((v) => allowedValues.includes(v), messageStr);
    }

    case NUMBER_RULES.NULLABLE:
      return schema.nullable();

    default:
      throw new Error(`Unknown number rule: ${rule.ruleName}`);
  }
}
