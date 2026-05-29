import { z } from 'zod';
import { applyDateRule } from '../../../src/validation/rules/dateRules';

describe('applyDateRule', () => {
  describe('before rule', () => {
    it('passes for date before', () => {
      const schema = applyDateRule(z.date(), { ruleName: 'before', params: { value: '2025-01-01' }, customMessage: '' });
      expect(schema.safeParse(new Date('2024-01-01')).success).toBe(true);
    });

    it('fails for date after', () => {
      const schema = applyDateRule(z.date(), { ruleName: 'before', params: { value: '2025-01-01' }, customMessage: '' });
      expect(schema.safeParse(new Date('2026-01-01')).success).toBe(false);
    });
  });
});
