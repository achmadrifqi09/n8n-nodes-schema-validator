import { z } from 'zod';
import { IValidationRule } from '../../types';

const DATE_RULES = {
  REQUIRED: 'required',
  OPTIONAL: 'optional',
  BEFORE: 'before',
  AFTER: 'after',
  BEFORE_OR_EQUAL: 'beforeOrEqual',
  AFTER_OR_EQUAL: 'afterOrEqual',
  NULLABLE: 'nullable',
} as const;

function requireDateStringParam(rule: IValidationRule, ruleName: string): Date {
  const value = rule.params.value;
  if (typeof value !== 'string') {
    throw new Error(`Rule "${ruleName}" requires a string value parameter`);
  }
  return new Date(value);
}

export function applyDateRule(
  schema: z.ZodDate | z.ZodOptional<z.ZodDate>,
  rule: IValidationRule
): z.ZodType {
  const messageStr = rule.customMessage || undefined;
  const date = schema as z.ZodDate;

  switch (rule.ruleName) {
    case DATE_RULES.REQUIRED:
      return schema;

    case DATE_RULES.OPTIONAL:
      return date.optional();

    case DATE_RULES.BEFORE:
      return date.max(requireDateStringParam(rule, 'before'), messageStr);

    case DATE_RULES.AFTER:
      return date.min(requireDateStringParam(rule, 'after'), messageStr);

    case DATE_RULES.BEFORE_OR_EQUAL:
      return date.max(requireDateStringParam(rule, 'beforeOrEqual'), messageStr);

    case DATE_RULES.AFTER_OR_EQUAL:
      return date.min(requireDateStringParam(rule, 'afterOrEqual'), messageStr);

    case DATE_RULES.NULLABLE:
      return schema.nullable();

    default:
      throw new Error(`Unknown date rule: ${rule.ruleName}`);
  }
}
