import { z } from 'zod';
import { applyBooleanRule } from '../../../src/validation/rules/booleanRules';

describe('applyBooleanRule', () => {
  describe('isTrue rule', () => {
    it('passes for true', () => {
      const schema = applyBooleanRule(z.boolean(), { ruleName: 'isTrue', params: {}, customMessage: '' });
      expect(schema.safeParse(true).success).toBe(true);
    });

    it('fails for false', () => {
      const schema = applyBooleanRule(z.boolean(), { ruleName: 'isTrue', params: {}, customMessage: '' });
      expect(schema.safeParse(false).success).toBe(false);
    });
  });
});
