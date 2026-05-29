/**
 * The supported data types a field can be declared as.
 */
export type FieldType = 'string' | 'number' | 'boolean' | 'array' | 'date';

/**
 * A single validation rule as parsed from the n8n UI configuration.
 */
export interface IValidationRule {
  /** The rule identifier */
  ruleName: string;
  /** Parsed JSON object containing rule-specific parameters */
  params: Record<string, unknown>;
  /** Optional override for the default error message */
  customMessage: string;
}

/**
 * The full configuration for one field in the schema
 */
export interface IFieldConfig {
  /** Dot-notation path to the value in the input JSON */
  fieldName: string;
  /** The expected data type of the field */
  fieldType: FieldType;
  /** Ordered list of rules to apply to this field */
  rules: IValidationRule[];
}

/**
 * A single structured validation error for one field.
 */
export interface IValidationError {
  /** The dot-notation field name */
  field: string;
  /** The rule name that caused the failure */
  rule: string;
  /** The human-readable error message */
  message: string;
}

/**
 * The result of validating one input item.
 */
export interface IValidationResult {
  passed: boolean;
  errors: IValidationError[];
}
