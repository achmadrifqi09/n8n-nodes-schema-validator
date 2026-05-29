import { z } from 'zod';
import { applyStringRule } from '../../../src/validation/rules/stringRules';

describe('applyStringRule', () => {
  describe('email rule', () => {
    it('passes for a valid email address', () => {
      const schema = applyStringRule(z.string(), { ruleName: 'email', params: {}, customMessage: '' });
      expect(schema.safeParse('test@example.com').success).toBe(true);
    });

    it('fails for an invalid email address', () => {
      const schema = applyStringRule(z.string(), { ruleName: 'email', params: {}, customMessage: '' });
      expect(schema.safeParse('not-an-email').success).toBe(false);
    });

    it('uses the custom error message when provided', () => {
      const schema = applyStringRule(z.string(), { ruleName: 'email', params: {}, customMessage: 'Custom error' });
      const result = schema.safeParse('bad');
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Custom error');
      } else {
        fail('Expected error');
      }
    });
  });
});
