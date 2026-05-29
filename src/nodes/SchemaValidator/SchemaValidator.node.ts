import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeConnectionTypes,
} from 'n8n-workflow';
import { IFieldConfig, FieldType, IValidationRule } from '../../types';
import { buildZodSchema } from '../../validation/buildZodSchema';
import { parseValidationErrors } from '../../validation/parseValidationErrors';
import { getNestedValue } from '../../utils/getNestedValue';

export class SchemaValidator implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Schema Validator',
    name: 'schemaValidator',
    icon: 'file:schema-validator.svg',
    group: ['transform'],
    version: 1,
    description: 'Validates input data against a configurable schema with support for strings, numbers, booleans, arrays, dates, email, URL, regex, and more.',
    defaults: {
      name: 'Schema Validator',
    },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main, NodeConnectionTypes.Main],
    outputNames: ['Valid', 'Invalid'],
    properties: [
      {
        displayName: 'Validation Mode',
        name: 'validationMode',
        type: 'options',
        default: 'abortEarly',
        description: 'Whether to stop at the first error or collect all errors across all fields.',
        options: [
          {
            name: 'Abort Early (first error)',
            value: 'abortEarly',
          },
          {
            name: 'Collect All Errors',
            value: 'collectAll',
          },
        ],
      },
      {
        displayName: 'Include Original Input in Output',
        name: 'outputOriginalData',
        type: 'boolean',
        default: true,
        description: 'Whether the original input JSON is included in the output payload alongside validation results.',
      },
      {
        displayName: 'Schema Fields',
        name: 'schema',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        placeholder: 'Add Field',
        description: 'Define each field you want to validate.',
        default: {},
        options: [
          {
            name: 'fields',
            displayName: 'Fields',
            values: [
              {
                displayName: 'Field Name',
                name: 'fieldName',
                type: 'string',
                default: '',
                placeholder: 'e.g. user.email',
                description: 'The key path to the value in the input JSON. Use dot notation for nested fields (e.g., user.profile.age).',
                required: true,
              },
              {
                displayName: 'Field Type',
                name: 'fieldType',
                type: 'options',
                default: 'string',
                description: 'The expected data type of the field. This determines which rules are available.',
                options: [
                  { name: 'String', value: 'string' },
                  { name: 'Number', value: 'number' },
                  { name: 'Boolean', value: 'boolean' },
                  { name: 'Array', value: 'array' },
                  { name: 'Date', value: 'date' },
                ],
              },
              {
                displayName: 'Rules',
                name: 'rules',
                type: 'fixedCollection',
                typeOptions: {
                  multipleValues: true,
                },
                placeholder: 'Add Rule',
                description: 'One or more validation rules to apply to this field.',
                default: {},
                options: [
                  {
                    name: 'ruleList',
                    displayName: 'Rule List',
                    values: [
                      {
                        displayName: 'Rule Name',
                        name: 'ruleName',
                        type: 'string',
                        default: 'required',
                        placeholder: 'e.g. required, min, email, regex',
                        description: 'The rule identifier. See documentation for all supported rules per field type.',
                      },
                      {
                        displayName: 'Rule Parameters (JSON)',
                        name: 'ruleParams',
                        type: 'string',
                        default: '{}',
                        placeholder: '{"value": 5}',
                        description: 'Optional parameters for the rule as a JSON object. Leave as {} if the rule has no parameters.',
                      },
                      {
                        displayName: 'Custom Error Message',
                        name: 'customMessage',
                        type: 'string',
                        default: '',
                        placeholder: 'This field is required.',
                        description: 'Optional. Override the default error message for this rule. Leave empty to use the default message.',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const validItems: INodeExecutionData[] = [];
    const invalidItems: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const item = items[i];
        if (!item.json) {
          continue;
        }

        const validationMode = this.getNodeParameter('validationMode', i) as string;
        const outputOriginalData = this.getNodeParameter('outputOriginalData', i) as boolean;
        
        const fieldConfigs = getSchemaConfig(this, i);
        const zodSchema = buildZodSchema(fieldConfigs);
        const extractedData = extractDataForValidation(item.json, fieldConfigs);

        const errors = validateData(validationMode, extractedData, zodSchema, fieldConfigs);

        routeValidationResult(item, errors, outputOriginalData, validItems, invalidItems);
      } catch (error) {
        handleExecutionError(this, error);
      }
    }

    return [validItems, invalidItems];
  }
}

function getSchemaConfig(context: IExecuteFunctions, itemIndex: number): IFieldConfig[] {
  const schemaConfig = context.getNodeParameter('schema.fields', itemIndex, []) as Array<{
    fieldName: string;
    fieldType: string;
    rules?: {
      ruleList?: Array<{
        ruleName: string;
        ruleParams: string;
        customMessage: string;
      }>;
    };
  }>;

  return schemaConfig.map((field) => {
    if (!field.fieldName || field.fieldName.trim() === '') {
      throw new NodeOperationError(context.getNode(), "Schema configuration error: A field entry has an empty 'Field Name'. Please provide a dot-notation path for every field.");
    }

    const rules: IValidationRule[] = [];
    if (field.rules?.ruleList) {
      for (const rule of field.rules.ruleList) {
        let parsedParams: Record<string, unknown>;
        try {
          parsedParams = JSON.parse(rule.ruleParams || '{}') as Record<string, unknown>;
        } catch {
          throw new NodeOperationError(
            context.getNode(),
            `Schema configuration error: Field '${field.fieldName}', rule '${rule.ruleName}' has invalid JSON in 'Rule Parameters'. Got: '${rule.ruleParams}'`
          );
        }

        rules.push({
          ruleName: rule.ruleName,
          params: parsedParams,
          customMessage: rule.customMessage || '',
        });
      }
    }

    return {
      fieldName: field.fieldName,
      fieldType: field.fieldType as FieldType,
      rules,
    };
  });
}

function isWebhookPayload(data: Record<string, unknown>): boolean {
  return (
    typeof data.body === 'object' &&
    data.body !== null &&
    'headers' in data &&
    'params' in data &&
    'query' in data
  );
}

function resolveDataSource(itemJson: Record<string, unknown>): Record<string, unknown> {
  if (isWebhookPayload(itemJson)) {
    return itemJson.body as Record<string, unknown>;
  }
  return itemJson;
}

function extractDataForValidation(itemJson: Record<string, unknown>, fieldConfigs: IFieldConfig[]): Record<string, unknown> {
  const dataSource = resolveDataSource(itemJson);
  const extractedData: Record<string, unknown> = {};
  for (const config of fieldConfigs) {
    extractedData[config.fieldName] = getNestedValue(dataSource, config.fieldName);
  }
  return extractedData;
}

function validateData(
  validationMode: string,
  extractedData: Record<string, unknown>,
  zodSchema: import('zod').ZodType,
  fieldConfigs: IFieldConfig[]
): import('../../types').IValidationError[] | null {
  if (validationMode === 'abortEarly') {
    for (const config of fieldConfigs) {
      const singleZodSchema = buildZodSchema([config]);
      
      const singleExtractedData: Record<string, unknown> = {};
      singleExtractedData[config.fieldName] = extractedData[config.fieldName];

      const result = singleZodSchema.safeParse(singleExtractedData);
      if (!result.success) {
        const errors = parseValidationErrors(result.error);
        if (errors.length > 0) {
          return [errors[0]];
        }
      }
    }

    const crossResult = zodSchema.safeParse(extractedData);
    if (!crossResult.success) {
      const errors = parseValidationErrors(crossResult.error);
      return errors.length > 0 ? [errors[0]] : null;
    }

    return null;
  }

  const result = zodSchema.safeParse(extractedData);
  if (!result.success) {
    return parseValidationErrors(result.error);
  }

  return null;
}

function routeValidationResult(
  item: INodeExecutionData,
  errors: import('../../types').IValidationError[] | null,
  outputOriginalData: boolean,
  validItems: INodeExecutionData[],
  invalidItems: INodeExecutionData[]
): void {
  const resultData = outputOriginalData ? { ...item.json } : {};

  if (errors && errors.length > 0) {
    resultData.__validationStatus = 'failed';
    resultData.__validationErrors = errors;
    invalidItems.push({ ...item, json: resultData });
    return;
  }

  resultData.__validationStatus = 'passed';
  validItems.push({ ...item, json: resultData });
}

function handleExecutionError(context: IExecuteFunctions, error: unknown): never {
  if (error instanceof NodeOperationError) {
    throw error;
  }
  
  let errorMessage = 'Unknown error';
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  throw new NodeOperationError(context.getNode(), `Schema configuration error: ${errorMessage}`);
}

