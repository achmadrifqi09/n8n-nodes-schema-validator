import { z } from 'zod';
import { applyArrayRule } from '../../../src/validation/rules/arrayRules';

describe('applyArrayRule', () => {
  describe('unique rule', () => {
    it('passes for unique array', () => {
      const schema = applyArrayRule(z.array(z.unknown()), { ruleName: 'unique', params: {}, customMessage: '' });
      expect(schema.safeParse([1, 2, 3]).success).toBe(true);
    });

    it('fails for non-unique array', () => {
      const schema = applyArrayRule(z.array(z.unknown()), { ruleName: 'unique', params: {}, customMessage: '' });
      expect(schema.safeParse([1, 2, 2]).success).toBe(false);
    });
  });
});
