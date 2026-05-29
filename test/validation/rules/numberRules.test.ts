import { z } from 'zod';
import { applyNumberRule } from '../../../src/validation/rules/numberRules';

describe('applyNumberRule', () => {
  describe('min rule', () => {
    it('passes for a value >= min', () => {
      const schema = applyNumberRule(z.number(), { ruleName: 'min', params: { value: 5 }, customMessage: '' });
      expect(schema.safeParse(5).success).toBe(true);
      expect(schema.safeParse(6).success).toBe(true);
    });

    it('fails for a value < min', () => {
      const schema = applyNumberRule(z.number(), { ruleName: 'min', params: { value: 5 }, customMessage: '' });
      expect(schema.safeParse(4).success).toBe(false);
    });
  });
});
