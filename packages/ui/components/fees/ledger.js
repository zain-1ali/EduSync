export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', needsReference: false, referenceLabel: '' },
  { id: 'cheque', label: 'Cheque', needsReference: true, referenceLabel: 'Cheque number' },
  { id: 'bank', label: 'Bank transfer', needsReference: true, referenceLabel: 'Transfer reference' },
  { id: 'online', label: 'Online', needsReference: true, referenceLabel: 'Transaction reference' },
];

const SMALL = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export function roundMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function formatMoney(value, currency = 'USD') {
  const amount = roundMoney(value);
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  return !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

export function formatDate(value) {
  if (!value) return '—';
  if (!isIsoDate(value)) return String(value);
  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

export function classLabel(student) {
  return [student?.className, student?.sectionName].filter(Boolean).join(' · ') || 'Unassigned';
}

export function isOpenCharge(charge) {
  return Boolean(charge) && !charge.deletedAt && charge.status !== 'void' && charge.kind !== 'void';
}

export function reversalTargets(payments) {
  return new Set(
    (payments || [])
      .filter((payment) => payment && !payment.deletedAt && payment.kind === 'reversal' && payment.reversesPaymentId && payment.status !== 'void')
      .map((payment) => payment.reversesPaymentId)
  );
}

export function isEffectivePayment(payment, payments) {
  if (!payment || payment.deletedAt || payment.kind === 'reversal') return false;
  if (payment.status === 'void' || payment.status === 'reversed') return false;
  return !reversalTargets(payments).has(payment.id);
}

export function paymentDisplayStatus(payment, payments) {
  if (!payment) return 'Unknown';
  if (payment.kind === 'reversal') return 'Reversal';
  if (!isEffectivePayment(payment, payments)) return 'Reversed';
  return 'Posted';
}

export function allocatedToCharge(chargeId, payments) {
  const reversed = reversalTargets(payments);
  return roundMoney(
    (payments || [])
      .filter((payment) => {
        if (!payment || payment.deletedAt || payment.kind === 'reversal') return false;
        if (payment.status === 'void' || payment.status === 'reversed') return false;
        return !reversed.has(payment.id);
      })
      .flatMap((payment) => payment.allocations || [])
      .filter((allocation) => allocation.chargeId === chargeId)
      .reduce((sum, allocation) => sum + roundMoney(allocation.amount), 0)
  );
}

export function canVoidCharge(charge, payments) {
  return isOpenCharge(charge) && allocatedToCharge(charge.id, payments) === 0;
}

export function studentLedger(studentId, charges, payments, today = todayISO()) {
  const studentPayments = (payments || []).filter((payment) => payment.studentId === studentId && !payment.deletedAt);
  const lines = (charges || [])
    .filter((charge) => charge.studentId === studentId && isOpenCharge(charge))
    .map((charge) => {
      const net = roundMoney(Math.max(0, roundMoney(charge.amount) - roundMoney(charge.discountAmount)));
      const paid = roundMoney(Math.min(net, allocatedToCharge(charge.id, studentPayments)));
      const outstanding = roundMoney(net - paid);
      const overdue = outstanding > 0 && Boolean(charge.dueDate) && charge.dueDate < today;
      let displayStatus = 'open';
      if (outstanding <= 0) displayStatus = 'paid';
      else if (overdue) displayStatus = 'overdue';
      else if (paid > 0) displayStatus = 'partial';
      return { ...charge, net, paid, outstanding, overdue, displayStatus };
    })
    .sort((left, right) => String(left.dueDate).localeCompare(String(right.dueDate)) || String(left.id).localeCompare(String(right.id)));
  const outstanding = roundMoney(lines.reduce((sum, line) => sum + line.outstanding, 0));
  const overdueAmount = roundMoney(lines.filter((line) => line.overdue).reduce((sum, line) => sum + line.outstanding, 0));
  return { lines, outstanding, overdueAmount, payments: studentPayments };
}

export function accountStatus(ledger) {
  if (!ledger?.lines?.length) return 'none';
  if (ledger.overdueAmount > 0) return 'overdue';
  if (ledger.outstanding > 0) return 'pending';
  return 'paid';
}

export function allocateAmount(lines, amount) {
  let remaining = roundMoney(amount);
  const allocations = [];
  const ordered = [...(lines || [])].sort(
    (left, right) => String(left.dueDate).localeCompare(String(right.dueDate)) || String(left.id).localeCompare(String(right.id))
  );
  for (const line of ordered) {
    if (remaining <= 0) break;
    const applied = roundMoney(Math.min(remaining, roundMoney(line.outstanding)));
    if (applied <= 0) continue;
    allocations.push({
      chargeId: line.id,
      description: line.description || line.name || 'Charge',
      amount: applied,
    });
    remaining = roundMoney(remaining - applied);
  }
  return { allocations, unallocated: remaining };
}

export function validatePayment({ studentId, amount, paidAt, method, reference, notes, selectedLines }) {
  const errors = {};
  if (!studentId) errors.studentId = 'Select a student.';
  if (!selectedLines?.length) errors.charges = 'Select at least one outstanding charge.';
  const numeric = roundMoney(amount);
  if (amount === '' || amount === null || amount === undefined) errors.amount = 'Enter the amount received.';
  else if (numeric <= 0) errors.amount = 'Amount must be greater than zero.';
  const selectedOutstanding = roundMoney((selectedLines || []).reduce((sum, line) => sum + roundMoney(line.outstanding), 0));
  if (!errors.amount && numeric > selectedOutstanding) errors.amount = 'Amount cannot exceed the selected outstanding balance.';
  if (!isIsoDate(paidAt)) errors.paidAt = 'Enter a valid payment date.';
  else if (paidAt > todayISO()) errors.paidAt = 'Payment date cannot be in the future.';
  if (!PAYMENT_METHODS.some((item) => item.id === method)) errors.method = 'Choose a payment method.';
  const methodMeta = PAYMENT_METHODS.find((item) => item.id === method);
  if (methodMeta?.needsReference && !String(reference || '').trim()) errors.reference = `Enter the ${methodMeta.referenceLabel.toLowerCase()}.`;
  if (String(reference || '').trim().length > 80) errors.reference = 'Reference must be 80 characters or fewer.';
  if (String(notes || '').trim().length > 240) errors.notes = 'Notes must be 240 characters or fewer.';
  return { ok: Object.keys(errors).length === 0, errors, amount: numeric, selectedOutstanding };
}

export function buildPaymentRecord({
  student,
  amount,
  paidAt,
  method,
  reference,
  notes,
  selectedLines,
  idempotencyKey,
  receiptNumber,
  recordedBy,
  schoolSnapshot,
  currency = 'USD',
}) {
  const numeric = roundMoney(amount);
  const { allocations } = allocateAmount(selectedLines, numeric);
  return {
    studentId: student.id,
    studentName: student.name,
    admissionNumber: student.admissionNumber || '',
    className: student.className || '',
    sectionName: student.sectionName || '',
    kind: 'payment',
    status: 'posted',
    amount: numeric,
    paidAt,
    method,
    reference: String(reference || '').trim(),
    notes: String(notes || '').trim(),
    allocations,
    idempotencyKey,
    receiptNumber,
    recordedBy: recordedBy || '',
    currency,
    amountInWords: amountInWords(numeric, currency),
    schoolSnapshot: schoolSnapshot || null,
  };
}

export function findByIdempotencyKey(payments, key) {
  if (!key) return null;
  return (payments || []).find((payment) => payment && !payment.deletedAt && payment.idempotencyKey === key) || null;
}

export function resolvePaymentWrite(payments, idempotencyKey, record) {
  const existing = findByIdempotencyKey(payments, idempotencyKey);
  if (existing) return { action: 'reuse', payment: existing };
  return { action: 'create', payment: record };
}

export function nextReceiptNumber(payments, paidAt) {
  const year = String(paidAt || todayISO()).slice(0, 4);
  const pattern = new RegExp(`^RCP-${year}-(\\d+)$`);
  const max = (payments || []).reduce((highest, payment) => {
    const match = String(payment.receiptNumber || '').match(pattern);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `RCP-${year}-${String(max + 1).padStart(4, '0')}`;
}

export function validateReversal(payment, payments, reason) {
  const errors = {};
  if (!payment) errors.payment = 'Payment was not found.';
  else if (payment.kind === 'reversal') errors.payment = 'A reversal cannot be reversed from this screen.';
  else if (!isEffectivePayment(payment, payments)) errors.payment = 'This payment is already reversed.';
  if (!String(reason || '').trim()) errors.reason = 'Enter a reason for the reversal.';
  else if (String(reason).trim().length > 240) errors.reason = 'Reason must be 240 characters or fewer.';
  return { ok: Object.keys(errors).length === 0, errors };
}

export function buildReversalRecord(payment, { reason, recordedBy, idempotencyKey }) {
  const currency = payment.currency || 'USD';
  return {
    studentId: payment.studentId,
    studentName: payment.studentName || '',
    admissionNumber: payment.admissionNumber || '',
    className: payment.className || '',
    sectionName: payment.sectionName || '',
    kind: 'reversal',
    status: 'posted',
    amount: roundMoney(payment.amount),
    paidAt: todayISO(),
    originalPaidAt: payment.paidAt || '',
    method: payment.method,
    reference: payment.reference || '',
    notes: '',
    reversalReason: String(reason || '').trim(),
    reversesPaymentId: payment.id,
    reversesReceiptNumber: payment.receiptNumber || '',
    allocations: (payment.allocations || []).map((allocation) => ({ ...allocation })),
    idempotencyKey,
    receiptNumber: `REV-${payment.receiptNumber || String(payment.id).slice(0, 8)}`,
    recordedBy: recordedBy || '',
    currency,
    amountInWords: amountInWords(payment.amount, currency),
    schoolSnapshot: payment.schoolSnapshot || null,
  };
}

export function feeStructureKey(structureId, studentId, period) {
  return `${structureId}:${studentId}:${period}`;
}

export function validateFeeStructure(input) {
  const errors = {};
  const name = String(input.name || '').trim();
  if (!name) errors.name = 'Enter a fee name.';
  else if (name.length > 120) errors.name = 'Fee name must be 120 characters or fewer.';
  if (!input.academicYearId) errors.academicYearId = 'Choose an academic year.';
  const amount = roundMoney(input.amount);
  if (input.amount === '' || input.amount === null || input.amount === undefined) errors.amount = 'Enter the fee amount.';
  else if (amount <= 0) errors.amount = 'Amount must be greater than zero.';
  if (!['one-time', 'monthly'].includes(input.frequency)) errors.frequency = 'Choose a frequency.';
  return { ok: Object.keys(errors).length === 0, errors, amount, name };
}

export function validateChargeAssignment({ structure, studentIds, dueDate, discountAmount, period }) {
  const errors = {};
  if (!structure) errors.structure = 'Choose a fee structure.';
  else if (structure.status !== 'active') errors.structure = 'Activate this fee structure before assigning it.';
  if (!studentIds?.length) errors.students = 'Choose at least one student.';
  if (!isIsoDate(dueDate)) errors.dueDate = 'Enter a valid due date.';
  const billingPeriod = String(period || '').trim();
  if (!billingPeriod) errors.period = 'Enter the billing period, such as 2026-10.';
  else if (billingPeriod.length > 40) errors.period = 'Billing period must be 40 characters or fewer.';
  const discount = roundMoney(discountAmount || 0);
  if (discount < 0) errors.discountAmount = 'Discount cannot be negative.';
  if (structure && discount > roundMoney(structure.amount)) errors.discountAmount = 'Discount cannot exceed the fee amount.';
  return { ok: Object.keys(errors).length === 0, errors, discount, period: billingPeriod };
}

export function buildCharge({ structure, student, dueDate, discountAmount, period }) {
  const billingPeriod = String(period).trim();
  return {
    studentId: student.id,
    studentName: student.name,
    classId: student.classId || '',
    className: student.className || '',
    sectionId: student.sectionId || '',
    sectionName: student.sectionName || '',
    academicYearId: structure.academicYearId,
    feeStructureId: structure.id,
    description: `${structure.name} (${billingPeriod})`,
    category: structure.category || 'General',
    amount: roundMoney(structure.amount),
    discountAmount: roundMoney(discountAmount),
    dueDate,
    period: billingPeriod,
    status: 'open',
    kind: 'charge',
    idempotencyKey: feeStructureKey(structure.id, student.id, billingPeriod),
  };
}

export function defaulterRows({ students, charges, payments, filters = {}, today = todayISO() }) {
  const query = String(filters.query || '').trim().toLowerCase();
  const threshold = filters.threshold === '' || filters.threshold === null || filters.threshold === undefined
    ? null
    : roundMoney(filters.threshold);
  return (students || [])
    .filter((student) => student && !student.deletedAt && student.status !== 'withdrawn')
    .map((student) => {
      const ledger = studentLedger(student.id, charges, payments, today);
      const lastPayment = ledger.payments
        .filter((payment) => isEffectivePayment(payment, ledger.payments))
        .sort((left, right) => String(right.paidAt).localeCompare(String(left.paidAt)))[0];
      const overdueLines = ledger.lines.filter((line) => line.overdue);
      return {
        student,
        outstanding: ledger.outstanding,
        overdueAmount: ledger.overdueAmount,
        lastPaymentAt: lastPayment?.paidAt || '',
        academicYearIds: [...new Set(overdueLines.map((line) => line.academicYearId).filter(Boolean))],
        overdueLines,
      };
    })
    .filter((row) => row.overdueAmount > 0)
    .filter((row) => {
      if (filters.academicYearId && !row.academicYearIds.includes(filters.academicYearId)) return false;
      if (filters.classIds?.length && !filters.classIds.includes(row.student.classId)) return false;
      if (query) {
        const haystack = `${row.student.name} ${row.student.admissionNumber || ''} ${row.student.className || ''}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (threshold !== null && row.outstanding <= threshold) return false;
      return true;
    })
    .sort((left, right) => right.outstanding - left.outstanding || left.student.name.localeCompare(right.student.name));
}

export function dayActivity(payments, date) {
  const items = (payments || []).filter((payment) => payment && !payment.deletedAt && payment.paidAt === date);
  const collected = items.filter((payment) => payment.kind !== 'reversal');
  const reversals = items.filter((payment) => payment.kind === 'reversal');
  const gross = roundMoney(collected.reduce((sum, payment) => sum + roundMoney(payment.amount), 0));
  const reversedTotal = roundMoney(reversals.reduce((sum, payment) => sum + roundMoney(payment.amount), 0));
  return { collected, reversals, gross, reversedTotal, net: roundMoney(gross - reversedTotal) };
}

export function toCsv(rows) {
  const escape = (value) => {
    let text = String(value ?? '');
    if (/^[=+\-@]/.test(text)) text = `'${text}`;
    if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  };
  return rows.map((row) => row.map(escape).join(',')).join('\r\n');
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function spellBelow1000(value) {
  const number = Math.trunc(value);
  if (number < 20) return SMALL[number];
  if (number < 100) {
    const ten = TENS[Math.trunc(number / 10)];
    const rest = number % 10;
    return rest ? `${ten}-${SMALL[rest]}` : ten;
  }
  const hundreds = `${SMALL[Math.trunc(number / 100)]} hundred`;
  const rest = number % 100;
  return rest ? `${hundreds} ${spellBelow1000(rest)}` : hundreds;
}

function spellInteger(value) {
  let remainder = Math.trunc(Math.abs(value));
  if (remainder === 0) return 'zero';
  const scales = [
    [1000000000, 'billion'],
    [1000000, 'million'],
    [1000, 'thousand'],
  ];
  const parts = [];
  for (const [scale, label] of scales) {
    if (remainder >= scale) {
      parts.push(`${spellBelow1000(Math.trunc(remainder / scale))} ${label}`);
      remainder %= scale;
    }
  }
  if (remainder) parts.push(spellBelow1000(remainder));
  return parts.join(' ');
}

export function amountInWords(value, currency = 'USD') {
  const centsTotal = Math.max(0, Math.round(roundMoney(value) * 100));
  const whole = Math.trunc(centsTotal / 100);
  const cents = centsTotal % 100;
  const major = currency === 'USD' ? 'dollars' : currency;
  const words = cents
    ? `${spellInteger(whole)} ${major} and ${spellInteger(cents)} cents`
    : `${spellInteger(whole)} ${major}`;
  return `${words.charAt(0).toUpperCase()}${words.slice(1)} only`;
}

function objectValue(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export function readSchoolProfile(settings) {
  const byKey = new Map();
  for (const record of settings || []) {
    if (!record || record.deletedAt || !record.key) continue;
    byKey.set(record.key, record.value !== undefined ? record.value : record);
  }
  const identity = objectValue(byKey.get('schoolIdentity') || byKey.get('identity'));
  const contact = objectValue(byKey.get('contact'));
  const receipt = objectValue(byKey.get('receipt'));
  const flat = (key) => {
    const value = byKey.get(key);
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') return value.value || value[key] || '';
    return '';
  };
  return {
    name: identity.schoolName || identity.name || flat('schoolName') || 'School',
    address: contact.address || flat('address') || '',
    phone: contact.phone || flat('phone') || '',
    email: contact.email || flat('email') || '',
    affiliation: identity.affiliation || flat('affiliation') || '',
    website: contact.website || flat('website') || '',
    header: receipt.header || receipt.headerText || flat('receiptHeader') || '',
    footer: receipt.footer || receipt.footerText || flat('receiptFooter') || '',
    logo: identity.logo || identity.logoDataUrl || flat('logo') || '',
    currency: identity.currency || flat('currency') || 'USD',
  };
}

export function safeImageSrc(value) {
  const text = String(value || '');
  if (text.startsWith('data:image/') || text.startsWith('https://') || text.startsWith('http://')) return text;
  return '';
}

export function receiptPath(paymentId, { duplicate = false } = {}) {
  const params = new URLSearchParams();
  if (duplicate) params.set('duplicate', '1');
  const query = params.toString();
  return `/fees/payments/${encodeURIComponent(paymentId)}/receipt${query ? `?${query}` : ''}`;
}

export function wrapLine(text, width = 80) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const piece = word.length > width ? word.slice(0, width) : word;
    const next = current ? `${current} ${piece}` : piece;
    if (next.length > width && current) {
      lines.push(current);
      current = piece;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

export function receiptPlainText({ school, payment, student, duplicate, reversal }) {
  const person = student || {};
  const currency = payment.currency || school?.currency || 'USD';
  const items = payment.allocations?.length
    ? payment.allocations
    : [{ description: payment.kind === 'reversal' ? 'Reversal' : 'Fee payment', amount: payment.amount }];
  const lines = [
    school?.name || 'School',
    [school?.address, school?.phone].filter(Boolean).join(' | '),
    school?.affiliation ? `Affiliation ${school.affiliation}` : '',
    school?.website || '',
    school?.header || '',
    payment.kind === 'reversal' ? 'PAYMENT REVERSAL' : 'FEE RECEIPT',
    duplicate ? 'DUPLICATE COPY' : 'ORIGINAL',
    `Receipt: ${payment.receiptNumber || payment.id}`,
    `Date: ${payment.paidAt || ''}`,
    `Student: ${payment.studentName || person.name || ''}`,
    `Class: ${classLabel({
      className: payment.className || person.className,
      sectionName: payment.sectionName || person.sectionName,
    })}`,
    `Admission: ${payment.admissionNumber || person.admissionNumber || ''}`,
    `Method: ${payment.method || ''}`,
    payment.reference ? `Reference: ${payment.reference}` : '',
    ...items.map((item, index) => `${index + 1}. ${item.description || 'Charge'}  ${roundMoney(item.amount).toFixed(2)}`),
    `Total: ${roundMoney(payment.amount).toFixed(2)} ${currency}`,
    payment.amountInWords || amountInWords(payment.amount, currency),
  ];
  if (payment.kind === 'reversal') {
    lines.push(`Reverses: ${payment.reversesReceiptNumber || payment.reversesPaymentId || ''}`);
    if (payment.reversalReason) lines.push(`Reason: ${payment.reversalReason}`);
  }
  if (reversal) lines.push(`Reversed by: ${reversal.receiptNumber || reversal.id}`);
  if (school?.footer) lines.push(school.footer);
  return lines.filter((line) => line !== '');
}

function pdfEscape(text) {
  return String(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export function buildSimplePdf(lines) {
  const wrapped = (lines || []).flatMap((line) => wrapLine(String(line).replace(/[^\x20-\x7E]/g, '?'), 85)).slice(0, 48);
  const stream = wrapped
    .map((line, index) => `BT /F1 11 Tf 48 ${760 - index * 15} Td (${pdfEscape(line)}) Tj ET`)
    .join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Count 1 /Kids [3 0 R] >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

export function downloadBlob(filename, content, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function printHtmlDocument(title, bodyHtml) {
  const popup = window.open('', '_blank', 'width=900,height=700');
  if (!popup) throw new Error('Pop-ups are blocked. Allow pop-ups to print.');
  popup.document.open();
  popup.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
    <style>
      body { font-family: Georgia, sans-serif; color: #111; margin: 24px; }
      h1 { font-size: 20px; margin: 0 0 4px; }
      p, li { font-size: 14px; }
      article { break-after: page; margin-bottom: 32px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; border-bottom: 1px solid #ccc; padding: 6px 4px; font-size: 13px; }
    </style></head><body>${bodyHtml}</body></html>`);
  popup.document.close();
  popup.focus();
  popup.print();
}

export function defaulterNoticeHtml({ school, rows }) {
  return (rows || []).map((row) => {
    const items = (row.overdueLines || []).map((line) => (
      `<li>${escapeHtml(line.description)} — due ${escapeHtml(formatDate(line.dueDate))} — ${escapeHtml(formatMoney(line.outstanding, school?.currency || 'USD'))}</li>`
    )).join('');
    return `<article>
      <h1>${escapeHtml(school?.name || 'School')}</h1>
      <p>Fee payment notice</p>
      <p><strong>${escapeHtml(row.student.name)}</strong><br>Admission ${escapeHtml(row.student.admissionNumber || '—')}<br>${escapeHtml(classLabel(row.student))}</p>
      <p>Outstanding balance: ${escapeHtml(formatMoney(row.outstanding, school?.currency || 'USD'))}</p>
      <ul>${items}</ul>
      <p>Please clear this balance at the school office. This notice was prepared from the local fee ledger.</p>
    </article>`;
  }).join('');
}

export function collectionReportHtml({ school, date, activity, currency = 'USD' }) {
  const renderRows = (items, type) => items.map((payment) => (
    `<tr><td>${escapeHtml(type)}</td><td>${escapeHtml(payment.receiptNumber)}</td><td>${escapeHtml(payment.studentName)}</td><td>${escapeHtml(payment.method)}</td><td>${escapeHtml(formatMoney(payment.amount, currency))}</td></tr>`
  )).join('');
  const body = `${renderRows(activity.collected, 'Payment')}${renderRows(activity.reversals, 'Reversal')}`;
  return `<h1>${escapeHtml(school?.name || 'School')}</h1>
    <p>Fee collections for ${escapeHtml(formatDate(date))}</p>
    <p>Gross ${escapeHtml(formatMoney(activity.gross, currency))} · Reversals ${escapeHtml(formatMoney(activity.reversedTotal, currency))} · Net ${escapeHtml(formatMoney(activity.net, currency))}</p>
    <table><thead><tr><th>Type</th><th>Receipt</th><th>Student</th><th>Method</th><th>Amount</th></tr></thead><tbody>${body || '<tr><td colspan="5">No payments</td></tr>'}</tbody></table>`;
}

export function latestTimestamp(records) {
  return (records || []).reduce((latest, record) => {
    const value = record?.updatedAt || record?.createdAt || '';
    return value > latest ? value : latest;
  }, '');
}

export function monthPeriod(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}`;
}

export function monthDueDate(period) {
  const [year, month] = String(period || '').split('-').map(Number);
  if (!year || !month) return '';
  const last = new Date(year, month, 0);
  const day = String(last.getDate()).padStart(2, '0');
  return `${year}-${String(month).padStart(2, '0')}-${day}`;
}

export function classFeeHeads(structures, classId) {
  return (structures || [])
    .filter(
      (item) =>
        item &&
        !item.deletedAt &&
        item.status === 'active' &&
        item.classId === classId &&
        item.frequency === 'monthly'
    )
    .map((item) => ({
      id: item.id,
      name: item.name || '',
      amount: item.amount === 0 || item.amount ? String(item.amount) : '',
    }));
}

export function feeHeadTotals(heads) {
  const monthly = roundMoney((heads || []).reduce((sum, head) => sum + (head.amount === '' ? 0 : roundMoney(head.amount)), 0));
  return { monthly, annual: roundMoney(monthly * 12) };
}

export function validateClassFeeHeads(heads, { academicYearId } = {}) {
  const errors = {};
  if (!academicYearId) {
    errors.form = 'This class needs an academic year before fees can be saved. Set the year in Academics.';
  }
  const seen = new Map();
  (heads || []).forEach((head, index) => {
    const name = String(head.name || '').trim();
    const row = {};
    if (!name) row.name = 'Enter a fee head name.';
    else if (name.length > 120) row.name = 'Fee name must be 120 characters or fewer.';
    else {
      const key = name.toLowerCase();
      if (seen.has(key)) {
        row.name = 'This fee head is already in the list.';
        errors[seen.get(key)] = { ...(errors[seen.get(key)] || {}), name: row.name };
      } else {
        seen.set(key, index);
      }
    }
    if (head.amount === '' || head.amount === null || head.amount === undefined) row.amount = 'Enter the monthly amount.';
    else if (roundMoney(head.amount) <= 0) row.amount = 'Amount must be greater than zero.';
    if (Object.keys(row).length) errors[index] = { ...(errors[index] || {}), ...row };
  });
  return { ok: !errors.form && !Object.keys(errors).some((key) => key !== 'form'), errors };
}

export function relativeTime(value, now = Date.now()) {
  if (!value) return 'not yet';
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return 'not yet';
  const minutes = Math.round((now - then) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute(s) ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} hour(s) ago`;
  return new Date(value).toLocaleString();
}
