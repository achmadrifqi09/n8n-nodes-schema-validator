import { z } from 'zod';
import { IFieldConfig, IValidationRule, FieldType } from '../types';
import { applyStringRule } from './rules/stringRules';
import { applyNumberRule } from './rules/numberRules';
import { applyBooleanRule } from './rules/booleanRules';
import { applyArrayRule } from './rules/arrayRules';
import { applyDateRule } from './rules/dateRules';

const CROSS_FIELD_RULES = ['same', 'different', 'confirmed'] as const;
type CrossFieldRule = typeof CROSS_FIELD_RULES[number];

function isCrossFieldRule(ruleName: string): ruleName is CrossFieldRule {
  return (CROSS_FIELD_RULES as readonly string[]).includes(ruleName);
}

function createBaseFieldSchema(fieldType: FieldType): z.ZodType {
  switch (fieldType) {
    case 'string':  return z.string();
    case 'number':  return z.number();
    case 'boolean': return z.boolean();
    case 'array':   return z.array(z.unknown());
    case 'date':    return z.coerce.date();
    default:        return z.unknown();
  }
}

function applyRuleToSchema(
  schema: z.ZodType,
  rule: IValidationRule,
  fieldType: FieldType
): z.ZodType {
  switch (fieldType) {
    case 'string':  return applyStringRule(schema as z.ZodString, rule);
    case 'number':  return applyNumberRule(schema as z.ZodNumber, rule);
    case 'boolean': return applyBooleanRule(schema as z.ZodBoolean, rule);
    case 'array':   return applyArrayRule(schema as z.ZodArray<z.ZodUnknown>, rule);
    case 'date':    return applyDateRule(schema as z.ZodDate, rule);
    default:        return schema;
  }
}

function buildFieldSchema(config: IFieldConfig): z.ZodType {
  let schema = createBaseFieldSchema(config.fieldType);

  const optionalRule = config.rules.find((r) => r.ruleName === 'optional');
  if (optionalRule) {
    schema = applyRuleToSchema(schema, optionalRule, config.fieldType);
  }

  const regularRules = config.rules.filter(
    (r) => r.ruleName !== 'optional' && r.ruleName !== 'nullable' && !isCrossFieldRule(r.ruleName)
  );

  for (const rule of regularRules) {
    schema = applyRuleToSchema(schema, rule, config.fieldType);
  }

  const hasNullable = config.rules.some((r) => r.ruleName === 'nullable');
  if (hasNullable) {
    schema = schema.nullable();
  }

  return schema;
}

function resolveOtherFieldName(ruleName: string, fieldName: string, params: Record<string, unknown>): string {
  if (ruleName === 'confirmed') {
    return `${fieldName}_confirmation`;
  }
  return params.otherField as string;
}

function applyCrossFieldRule(
  baseSchema: z.ZodObject<z.ZodRawShape>,
  fieldName: string,
  rule: IValidationRule
): z.ZodObject<z.ZodRawShape> {
  const message = rule.customMessage || undefined;
  const otherField = resolveOtherFieldName(rule.ruleName, fieldName, rule.params);

  const isSameRule = rule.ruleName === 'same' || rule.ruleName === 'confirmed';

  const refined = baseSchema.superRefine((data, ctx) => {
    const valuesMatch = data[fieldName] === data[otherField];
    const shouldFail = isSameRule ? !valuesMatch : valuesMatch;

    if (shouldFail) {
      ctx.addIssue({
        code: 'custom',
        message,
        path: [fieldName],
        params: { rule: rule.ruleName },
      });
    }
  });

  return refined as unknown as z.ZodObject<z.ZodRawShape>;
}

export function buildZodSchema(fieldConfigs: IFieldConfig[]): z.ZodObject<z.ZodRawShape> {
  const shape: Record<string, z.ZodType> = {};

  for (const config of fieldConfigs) {
    shape[config.fieldName] = buildFieldSchema(config);
  }

  let schema = z.object(shape as z.ZodRawShape);

  for (const config of fieldConfigs) {
    const crossFieldRules = config.rules.filter((r) => isCrossFieldRule(r.ruleName));

    for (const rule of crossFieldRules) {
      schema = applyCrossFieldRule(schema, config.fieldName, rule);
    }
  }

  return schema;
}
