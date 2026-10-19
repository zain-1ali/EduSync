import { describe, expect, it } from 'vitest';
import { financialError } from './syncService.js';

describe('financial sync invariants', () => {
  it('rejects deleting payments', () => {
    expect(
      financialError({ entityType: 'payments', operation: 'delete', payload: null }, null)?.code
    ).toBe('FINANCIAL_DELETE_FORBIDDEN');
  });

  it('rejects changing immutable payment totals', () => {
    const current = {
      data: {
        studentId: 'student-1',
        amount: 100,
        receiptNumber: 'R-1',
        paidAt: '2026-10-17',
      },
    };
    const error = financialError(
      {
        entityType: 'payments',
        operation: 'update',
        payload: { ...current.data, amount: 200 },
      },
      current
    );
    expect(error?.code).toBe('IMMUTABLE_PAYMENT_FIELDS');
  });
});
