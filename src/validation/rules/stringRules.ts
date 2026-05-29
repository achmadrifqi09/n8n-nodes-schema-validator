import { z } from 'zod';
import { IValidationRule } from '../../types';

const STRING_RULES = {
  REQUIRED: 'required',
  OPTIONAL: 'optional',
  MIN: 'min',
  MAX: 'max',
  LENGTH: 'length',
  EMAIL: 'email',
  URL: 'url',
  UUID: 'uuid',
  CUID2: 'cuid2',
  STARTS_WITH: 'startsWith',
  ENDS_WITH: 'endsWith',
  INCLUDES: 'includes',
  REGEX: 'regex',
  LOWERCASE: 'lowercase',
  UPPERCASE: 'uppercase',
  TRIM: 'trim',
  ALPHA: 'alpha',
  ALPHANUMERIC: 'alphanumeric',
  NUMERIC: 'numeric',
  IPV4: 'ipv4',
  IPV6: 'ipv6',
  CIDRV4: 'cidrv4',
  CIDRV6: 'cidrv6',
  DATETIME: 'datetime',
  DATE: 'date',
  TIME: 'time',
  BASE64: 'base64',
  IN: 'in',
  NOT_IN: 'notIn',
  NULLABLE: 'nullable',
} as const;

function requireNumberParam(rule: IValidationRule, ruleName: string): number {
  const value = rule.params.value;
  if (typeof value !== 'number') {
    throw new Error(`Rule "${ruleName}" requires a number value parameter`);
  }
  return value;
}

function requireStringParam(rule: IValidationRule, ruleName: string): string {
  const value = rule.params.value;
  if (typeof value !== 'string') {
    throw new Error(`Rule "${ruleName}" requires a string value parameter`);
  }
  return value;
}

function requireStringArrayParam(rule: IValidationRule, ruleName: string): unknown[] {
  const values = rule.params.values;
  if (!Array.isArray(values)) {
    throw new Error(`Rule "${ruleName}" requires an array of strings parameter`);
  }
  return values;
}

function parseRegex(pattern: unknown, flags: unknown): RegExp {
  if (typeof pattern !== 'string') {
    throw new Error('Rule "regex" requires a string pattern parameter');
  }
  try {
    return new RegExp(pattern, typeof flags === 'string' ? flags : undefined);
  } catch (error: unknown) {
    throw new Error(`Invalid regex pattern: ${(error as Error).message}`);
  }
}

export function applyStringRule(
  schema: z.ZodString | z.ZodOptional<z.ZodString>,
  rule: IValidationRule
): z.ZodType {
  const messageStr = rule.customMessage || undefined;
  const messageObj = rule.customMessage ? { message: rule.customMessage } : undefined;
  const str = schema as z.ZodString;

  switch (rule.ruleName) {
    case STRING_RULES.REQUIRED:
      return str.min(1, messageStr);

    case STRING_RULES.OPTIONAL:
      return str.optional();

    case STRING_RULES.MIN:
      return str.min(requireNumberParam(rule, 'min'), messageStr);

    case STRING_RULES.MAX:
      return str.max(requireNumberParam(rule, 'max'), messageStr);

    case STRING_RULES.LENGTH:
      return str.length(requireNumberParam(rule, 'length'), messageStr);

    case STRING_RULES.EMAIL:
      return str.pipe(z.email(messageStr));

    case STRING_RULES.URL:
      return str.pipe(z.url(messageStr));

    case STRING_RULES.UUID:
      return str.pipe(z.uuid(messageStr));

    case STRING_RULES.CUID2:
      return str.pipe(z.cuid2(messageStr));

    case STRING_RULES.STARTS_WITH:
      return str.startsWith(requireStringParam(rule, 'startsWith'), messageStr);

    case STRING_RULES.ENDS_WITH:
      return str.endsWith(requireStringParam(rule, 'endsWith'), messageStr);

    case STRING_RULES.INCLUDES:
      return str.includes(requireStringParam(rule, 'includes'), messageObj);

    case STRING_RULES.REGEX:
      return str.regex(parseRegex(rule.params.pattern, rule.params.flags), messageStr);

    case STRING_RULES.LOWERCASE:
      return str.toLowerCase().refine((v) => v === v.toLowerCase(), messageStr);

    case STRING_RULES.UPPERCASE:
      return str.toUpperCase().refine((v) => v === v.toUpperCase(), messageStr);

    case STRING_RULES.TRIM:
      return str.trim();

    case STRING_RULES.ALPHA:
      return str.regex(/^[a-zA-Z]+$/, messageStr);

    case STRING_RULES.ALPHANUMERIC:
      return str.regex(/^[a-zA-Z0-9]+$/, messageStr);

    case STRING_RULES.NUMERIC:
      return str.regex(/^[0-9]+$/, messageStr);

    case STRING_RULES.IPV4:
      return str.pipe(z.ipv4(messageStr));

    case STRING_RULES.IPV6:
      return str.pipe(z.ipv6(messageStr));

    case STRING_RULES.CIDRV4:
      return str.pipe(z.cidrv4(messageStr));

    case STRING_RULES.CIDRV6:
      return str.pipe(z.cidrv6(messageStr));

    case STRING_RULES.DATETIME: {
      const hasOffset = rule.params.offset === true;
      const precision = typeof rule.params.precision === 'number' ? rule.params.precision : undefined;
      return str.pipe(z.iso.datetime({ offset: hasOffset, precision, error: messageStr }));
    }

    case STRING_RULES.DATE:
      return str.pipe(z.iso.date(messageStr));

    case STRING_RULES.TIME: {
      const precision = typeof rule.params.precision === 'number' ? rule.params.precision : undefined;
      return str.pipe(z.iso.time({ precision, error: messageStr }));
    }

    case STRING_RULES.BASE64:
      return str.pipe(z.base64(messageStr));

    case STRING_RULES.IN: {
      const allowedValues = requireStringArrayParam(rule, 'in');
      return str.refine((v) => allowedValues.includes(v), messageStr);
    }

    case STRING_RULES.NOT_IN: {
      const disallowedValues = requireStringArrayParam(rule, 'notIn');
      return str.refine((v) => !disallowedValues.includes(v), messageStr);
    }

    case STRING_RULES.NULLABLE:
      return schema.nullable();

    default:
      throw new Error(`Unknown string rule: ${rule.ruleName}`);
  }
}
