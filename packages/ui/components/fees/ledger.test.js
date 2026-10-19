import { describe, expect, it } from 'vitest';
import {
  allocateAmount,
  amountInWords,
  buildCharge,
  buildPaymentRecord,
  buildReversalRecord,
  buildSimplePdf,
  dayActivity,
  defaulterNoticeHtml,
  defaulterRows,
  nextReceiptNumber,
  readSchoolProfile,
  receiptPath,
  receiptPlainText,
  resolvePaymentWrite,
  studentLedger,
  toCsv,
  classFeeHeads,
  feeHeadTotals,
  monthDueDate,
  validateClassFeeHeads,
  validatePayment,
  validateReversal,
} from './ledger.js';

const charge = {
  id: 'c1',
  studentId: 's1',
  amount: 100,
  discountAmount: 10,
  dueDate: '2026-10-01',
  status: 'open',
  description: 'Tuition (2026-10)',
  academicYearId: 'y1',
};

describe('fee ledger', () => {
  it('uses a stable payment-id receipt route', () => {
    expect(receiptPath('payment 1')).toBe('/fees/payments/payment%201/receipt');
  });

  it('derives the outstanding balance from charges, discounts, and allocations', () => {
    const payment = {
      id: 'p1',
      studentId: 's1',
      kind: 'payment',
      status: 'posted',
      amount: 40,
      allocations: [{ chargeId: 'c1', amount: 40 }],
    };
    const ledger = studentLedger('s1', [charge], [payment], '2026-10-17');
    expect(ledger.lines[0].net).toBe(90);
    expect(ledger.lines[0].paid).toBe(40);
    expect(ledger.outstanding).toBe(50);
    expect(ledger.lines[0].displayStatus).toBe('overdue');
  });

  it('allocates a partial payment to the earliest due charge', () => {
    const lines = [
      { id: 'later', dueDate: '2026-11-01', outstanding: 30, description: 'Later' },
      { id: 'earlier', dueDate: '2026-10-01', outstanding: 20, description: 'Earlier' },
    ];
    expect(allocateAmount(lines, 25)).toEqual({
      allocations: [
        { chargeId: 'earlier', description: 'Earlier', amount: 20 },
        { chargeId: 'later', description: 'Later', amount: 5 },
      ],
      unallocated: 0,
    });
  });

  it('restores the balance from a reversal record without changing the original payment', () => {
    const payment = {
      id: 'p1',
      studentId: 's1',
      kind: 'payment',
      status: 'posted',
      amount: 40,
      receiptNumber: 'RCP-2026-0001',
      currency: 'USD',
      allocations: [{ chargeId: 'c1', description: 'Tuition (2026-10)', amount: 40 }],
    };
    const reversal = buildReversalRecord(payment, {
      reason: 'Recorded twice',
      recordedBy: 'Ada',
      idempotencyKey: 'reversal:p1',
    });
    expect(payment.status).toBe('posted');
    expect(reversal.kind).toBe('reversal');
    expect(reversal.reversesPaymentId).toBe('p1');
    expect(studentLedger('s1', [charge], [payment, reversal], '2026-10-17').outstanding).toBe(90);
    expect(validateReversal(payment, [payment, reversal], 'again').ok).toBe(false);
  });

  it('reuses a payment with the same idempotency key', () => {
    const existing = { id: 'p1', idempotencyKey: 'key-1', receiptNumber: 'RCP-2026-0004' };
    expect(resolvePaymentWrite([existing], 'key-1', { id: 'new' })).toEqual({ action: 'reuse', payment: existing });
    expect(resolvePaymentWrite([existing], 'key-2', { id: 'new' }).action).toBe('create');
  });

  it('rejects overpayment, future dates, and a cheque without a reference', () => {
    const selectedLines = [{ id: 'c1', outstanding: 50 }];
    expect(validatePayment({
      studentId: 's1', amount: 80, paidAt: '2020-01-01', method: 'cash', selectedLines,
    }).errors.amount).toMatch(/cannot exceed/);
    expect(validatePayment({
      studentId: 's1', amount: 20, paidAt: '2999-01-01', method: 'cash', selectedLines,
    }).errors.paidAt).toMatch(/future/);
    expect(validatePayment({
      studentId: 's1', amount: 20, paidAt: '2020-01-01', method: 'cheque', reference: ' ', selectedLines,
    }).ok).toBe(false);
  });

  it('numbers receipts from the highest receipt in that year', () => {
    expect(nextReceiptNumber([{ receiptNumber: 'RCP-2026-0002' }, { receiptNumber: 'RCP-2025-0099' }], '2026-10-01')).toBe('RCP-2026-0003');
  });

  it('builds an idempotent charge for one structure, student, and period', () => {
    const structure = { id: 'fee-1', name: 'Tuition', amount: 100, academicYearId: 'y1', category: 'Tuition', status: 'active' };
    const student = { id: 's1', name: 'Aarav Sharma', className: 'Grade 4' };
    const first = buildCharge({ structure, student, dueDate: '2026-10-05', discountAmount: 0, period: '2026-10' });
    const second = buildCharge({ structure, student, dueDate: '2026-10-05', discountAmount: 0, period: '2026-10' });
    expect(first.idempotencyKey).toBe(second.idempotencyKey);
    expect(first.description).toBe('Tuition (2026-10)');
  });

  it('lists overdue accounts and applies class and threshold filters', () => {
    const students = [
      { id: 's1', name: 'Aarav <Sharma>', classId: 'c10', className: 'Grade 10', status: 'active', admissionNumber: 'A-1' },
      { id: 's2', name: 'Meera Patel', classId: 'c2', className: 'Grade 2', status: 'active' },
    ];
    const charges = [
      charge,
      { ...charge, id: 'c2', studentId: 's2', dueDate: '2026-10-20', amount: 30, discountAmount: 0 },
    ];
    const rows = defaulterRows({ students, charges, payments: [], filters: {}, today: '2026-10-17' });
    expect(rows.map((row) => row.student.id)).toEqual(['s1']);
    expect(defaulterRows({
      students, charges, payments: [], filters: { classIds: ['c2'] }, today: '2026-10-17',
    })).toHaveLength(0);
    expect(defaulterRows({
      students, charges, payments: [], filters: { threshold: 100 }, today: '2026-10-17',
    })).toHaveLength(0);
    expect(defaulterNoticeHtml({ school: { name: 'North School', currency: 'USD' }, rows })).toContain('Aarav &lt;Sharma&gt;');
    expect(defaulterNoticeHtml({ school: { name: 'North School' }, rows })).not.toContain('<Sharma>');
  });

  it('keeps same-day reversals in the daily cashbook', () => {
    const activity = dayActivity([
      { id: 'p1', kind: 'payment', paidAt: '2026-10-17', amount: 50 },
      { id: 'r1', kind: 'reversal', paidAt: '2026-10-17', amount: 50, reversesPaymentId: 'p1' },
      { id: 'p2', kind: 'payment', paidAt: '2026-10-16', amount: 20 },
    ], '2026-10-17');
    expect(activity.gross).toBe(50);
    expect(activity.reversedTotal).toBe(50);
    expect(activity.net).toBe(0);
  });

  it('snapshots the receipt from the payment instead of live mock data', () => {
    const payment = buildPaymentRecord({
      student: { id: 's1', name: 'Aarav Sharma', admissionNumber: 'A-1', className: 'Grade 4', sectionName: 'B' },
      amount: 40,
      paidAt: '2026-10-01',
      method: 'cash',
      reference: '',
      notes: '',
      selectedLines: [{ id: 'c1', dueDate: '2026-10-01', outstanding: 90, description: 'Tuition (2026-10)' }],
      idempotencyKey: 'key-1',
      receiptNumber: 'RCP-2026-0008',
      currency: 'USD',
      schoolSnapshot: { name: 'North School', footer: 'Keep this copy.' },
    });
    const text = receiptPlainText({ school: payment.schoolSnapshot, payment, duplicate: true });
    expect(text.join('\n')).toContain('North School');
    expect(text.join('\n')).toContain('RCP-2026-0008');
    expect(text.join('\n')).toContain('DUPLICATE COPY');
    expect(buildSimplePdf(text).startsWith('%PDF-1.4')).toBe(true);
  });

  it('reads tenant receipt branding and escapes spreadsheet formulas', () => {
    const profile = readSchoolProfile([
      { key: 'schoolIdentity', value: { schoolName: 'North School', currency: 'USD' } },
      { key: 'receipt', value: { footer: 'Fees are recorded locally.' } },
    ]);
    expect(profile.name).toBe('North School');
    expect(profile.footer).toBe('Fees are recorded locally.');
    expect(toCsv([['=cmd', 'safe']])).toBe("'=cmd,safe");
    expect(amountInWords(450, 'USD')).toBe('Four hundred fifty dollars only');
  });

  it('totals monthly class fee heads and keeps saved heads for one class', () => {
    expect(monthDueDate('2026-02')).toBe('2026-02-28');
    expect(feeHeadTotals([{ amount: '1200' }, { amount: '150' }, { amount: '100' }, { amount: '50' }])).toEqual({
      monthly: 1500,
      annual: 18000,
    });
    const heads = classFeeHeads(
      [
        { id: 'a', classId: 'grade-1', status: 'active', frequency: 'monthly', name: 'Tuition Fee', amount: 1200 },
        { id: 'b', classId: 'grade-1', status: 'inactive', frequency: 'monthly', name: 'Old Fee', amount: 10 },
        { id: 'c', classId: 'grade-2', status: 'active', frequency: 'monthly', name: 'Tuition Fee', amount: 900 },
      ],
      'grade-1'
    );
    expect(heads).toEqual([{ id: 'a', name: 'Tuition Fee', amount: '1200' }]);
    expect(validateClassFeeHeads([{ name: 'Tuition', amount: '' }], { academicYearId: 'y1' }).ok).toBe(false);
    expect(validateClassFeeHeads([{ name: 'Tuition', amount: '1200' }, { name: 'tuition', amount: '10' }], { academicYearId: 'y1' }).ok).toBe(false);
    expect(validateClassFeeHeads([], { academicYearId: 'y1' }).ok).toBe(true);
  });
});
