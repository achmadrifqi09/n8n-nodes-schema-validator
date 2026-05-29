import { ZodError, z } from 'zod';
import { IValidationError } from '../types';

const ZOD_CODE_TO_RULE_MAP: Record<string, string> = {
  invalid_type: 'type',
  invalid_literal: 'literal',
  custom: 'custom',
  invalid_union: 'union',
  invalid_union_discriminator: 'union_discriminator',
  invalid_enum_value: 'in',
  unrecognized_keys: 'unrecognized_keys',
  invalid_arguments: 'invalid_arguments',
  invalid_return_type: 'invalid_return_type',
  invalid_date: 'date',
  invalid_string: 'string',
  too_small: 'min',
  too_big: 'max',
  invalid_intersection_types: 'intersection',
  not_multiple_of: 'multipleOf',
  not_finite: 'finite',
};

function isInvalidStringIssue(issue: z.core.$ZodIssue): issue is z.core.$ZodIssue & { validation: string } {
  return String(issue.code) === 'invalid_string' && 'validation' in issue;
}

function isLengthIssue(issue: z.core.$ZodIssue): issue is z.core.$ZodIssue & { type: string; exact: boolean } {
  return (issue.code === 'too_small' || issue.code === 'too_big') && 'type' in issue && 'exact' in issue;
}

function determineValidationRule(issue: z.core.$ZodIssue): string {
  if (issue.code === 'custom' && issue.params?.rule) {
    return String(issue.params.rule);
  }

  if (isInvalidStringIssue(issue)) {
    return typeof issue.validation === 'string' ? issue.validation : 'string';
  }

  if (isLengthIssue(issue)) {
    const isStringOrArray = issue.type === 'string' || issue.type === 'array';
    if (issue.exact && isStringOrArray) {
      return 'length';
    }
  }

  return ZOD_CODE_TO_RULE_MAP[issue.code] || 'invalid';
}

export function parseValidationErrors(zodError: ZodError): IValidationError[] {
  return zodError.issues.map((issue) => {
    return {
      field: issue.path.join('.'),
      rule: determineValidationRule(issue),
      message: issue.message,
    };
  });
}
