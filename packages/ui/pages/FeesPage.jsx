import { ACCESS_LEVELS, MODULES } from '@school/contracts';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { FeePaymentForm } from '../components/fees/FeePaymentForm';
import { FeeSetupPanel } from '../components/fees/FeeSetupPanel';
import { FeeStudentList } from '../components/fees/FeeStudentList';
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, SyncBanners } from '../components/fees/FinanceStates';
import {
  accountStatus,
  allocateAmount,
  buildCharge,
  buildPaymentRecord,
  buildReversalRecord,
  canVoidCharge,
  collectionReportHtml,
  dayActivity,
  downloadBlob,
  formatDate,
  formatMoney,
  nextReceiptNumber,
  PAYMENT_METHODS,
  printHtmlDocument,
  readSchoolProfile,
  receiptPath,
  resolvePaymentWrite,
  roundMoney,
  studentLedger,
  todayISO,
  toCsv,
  validateChargeAssignment,
  validateFeeStructure,
  validatePayment,
  validateReversal,
} from '../components/fees/ledger';
import { StudentLedger } from '../components/fees/StudentLedger';
import { useLocalData } from '../data/LocalDataProvider';
import { useLocalCollection } from '../data/useLocalCollection';
import { Layout } from '../Layout';

export function FeesPage() {
  const { user, hasAccess } = useAuth();
  const local = useLocalData();
  const students = useLocalCollection('students');
  const structures = useLocalCollection('feeStructures');
  const charges = useLocalCollection('charges');
  const payments = useLocalCollection('payments');
  const settings = useLocalCollection('settings');
  const years = useLocalCollection('academicYears');
  const programs = useLocalCollection('programs');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const canManage = hasAccess(MODULES.FEES, ACCESS_LEVELS.MANAGE);
  const savedPayments = useRef(new Map());
  const setupRef = useRef(null);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(() => params.get('studentId') || '');
  const [chargeSelection, setChargeSelection] = useState(null);
  const [paidAt, setPaidAt] = useState(todayISO());
  const [amount, setAmount] = useState('');
  const [amountTouched, setAmountTouched] = useState(false);
  const [method, setMethod] = useState('cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(() => globalThis.crypto.randomUUID());
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [reportDate, setReportDate] = useState(todayISO());

  const profile = readSchoolProfile(settings.data);
  const currency = profile.currency || 'USD';
  const student = students.data.find((item) => item.id === selectedId) || null;
  const ledger = useMemo(
    () => (student ? studentLedger(student.id, charges.data, payments.data) : { lines: [], outstanding: 0, overdueAmount: 0, payments: [] }),
    [student, charges.data, payments.data]
  );
  const openLines = ledger.lines.filter((line) => line.outstanding > 0);
  const selectedChargeIds = chargeSelection ?? openLines.map((line) => line.id);
  const selectedLines = openLines.filter((line) => selectedChargeIds.includes(line.id));
  const selectedOutstanding = roundMoney(selectedLines.reduce((sum, line) => sum + line.outstanding, 0));
  const enteredAmount = amountTouched ? amount : (selectedOutstanding > 0 ? selectedOutstanding.toFixed(2) : '');
  const paymentValue = roundMoney(enteredAmount);
  const amountFits = paymentValue > 0 && paymentValue <= selectedOutstanding;
  const remaining = amountFits ? roundMoney(ledger.outstanding - paymentValue) : ledger.outstanding;
  const dirty = Boolean(student) && (notes.trim() !== '' || reference.trim() !== '' || method !== 'cash' || amountTouched || chargeSelection !== null);
  const activity = useMemo(() => dayActivity(payments.data, reportDate), [payments.data, reportDate]);

  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const visibleStudents = useMemo(() => students.data
    .filter((item) => !item.deletedAt)
    .map((item) => {
      const account = studentLedger(item.id, charges.data, payments.data);
      const pendingSync = [...charges.data, ...payments.data].some((record) => record.studentId === item.id && record.syncStatus === 'pending');
      return { student: item, status: accountStatus(account), outstanding: account.outstanding, pendingSync };
    })
    .filter((row) => {
      const haystack = `${row.student.name} ${row.student.admissionNumber || ''} ${row.student.className || ''}`.toLowerCase();
      if (query && !haystack.includes(query.trim().toLowerCase())) return false;
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      return true;
    }), [students.data, charges.data, payments.data, query, statusFilter]);

  const retry = () => {
    students.refresh();
    charges.refresh();
    payments.refresh();
    structures.refresh();
    settings.refresh();
    years.refresh();
    programs.refresh();
  };

  const applyStudent = (id) => {
    setSelectedId(id);
    setChargeSelection(null);
    setAmount('');
    setAmountTouched(false);
    setMethod('cash');
    setReference('');
    setNotes('');
    setPaidAt(todayISO());
    setErrors({});
    setIdempotencyKey(globalThis.crypto.randomUUID());
  };

  const selectStudent = (id) => {
    if (dirty && id !== selectedId) {
      setDialog({ type: 'discard', nextId: id });
      return;
    }
    applyStudent(id);
  };

  const refreshList = async () => {
    setRefreshing(true);
    setMessage('');
    try {
      await Promise.all([students.refresh(), charges.refresh(), payments.refresh(), structures.refresh()]);
      setMessage('Student balances refreshed from this device.');
    } catch (error) {
      setMessage(error.message || 'The list could not be refreshed.');
    } finally {
      setRefreshing(false);
    }
  };

  const openSetup = () => {
    setSetupOpen(true);
    setupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const createStructure = async (input) => {
    const validation = validateFeeStructure(input);
    if (!validation.ok) return { errors: validation.errors };
    const program = programs.data.find((item) => item.id === input.classId);
    await structures.create({
      name: validation.name,
      academicYearId: input.academicYearId,
      classId: input.classId || '',
      className: program?.name || '',
      category: String(input.category || '').trim() || 'General',
      amount: validation.amount,
      frequency: input.frequency,
      status: 'active',
    });
    return { message: 'Fee structure saved locally and queued for sync.' };
  };

  const toggleStructure = async (structure) => {
    try {
      await structures.update(structure.id, { status: structure.status === 'active' ? 'inactive' : 'active' });
      setMessage(structure.status === 'active' ? 'Fee structure deactivated. Existing charges were kept.' : 'Fee structure activated.');
    } catch (error) {
      setMessage(error.message || 'The fee structure could not be updated.');
    }
  };

  const assignCharges = async ({ structure, targets, dueDate, discountAmount, period, target, classId }) => {
    if (target === 'class' && !classId) return { errors: { students: 'Choose a class.' } };
    if (target === 'student' && targets.length === 0) return { errors: { students: 'Select a student from the list first.' } };
    if (target === 'class' && targets.length === 0) return { errors: { students: 'No active students are in that class.' } };
    const validation = validateChargeAssignment({
      structure,
      studentIds: targets.map((item) => item.id),
      dueDate,
      discountAmount,
      period,
    });
    if (!validation.ok) return { errors: validation.errors };
    let created = 0;
    let skipped = 0;
    for (const person of targets) {
      const draft = buildCharge({
        structure,
        student: person,
        dueDate,
        discountAmount: validation.discount,
        period: validation.period,
      });
      if (charges.data.some((charge) => charge.idempotencyKey === draft.idempotencyKey)) {
        skipped += 1;
        continue;
      }
      await charges.create(draft);
      created += 1;
    }
    if (created === 0) return { message: 'Those charges already exist for this period. No duplicate charges were created.' };
    return { message: `${created} charge(s) saved locally.${skipped ? ` ${skipped} already existed.` : ''} Queued for sync.` };
  };

  const openPaymentConfirm = (event) => {
    event.preventDefault();
    if (!canManage) {
      setErrors({ form: 'You do not have permission to record payments.' });
      return;
    }
    const validation = validatePayment({
      studentId: student?.id,
      amount: enteredAmount,
      paidAt,
      method,
      reference,
      notes,
      selectedLines,
    });
    const allocation = allocateAmount(selectedLines, validation.amount);
    if (validation.ok && allocation.unallocated > 0) validation.errors.amount = 'Amount could not be allocated to the selected charges.';
    setErrors(validation.errors);
    if (!validation.ok || allocation.unallocated > 0) return;
    setDialog({ type: 'payment' });
  };

  const recordPayment = async () => {
    if (busy || !student || !canManage) return;
    const validation = validatePayment({
      studentId: student.id,
      amount: enteredAmount,
      paidAt,
      method,
      reference,
      notes,
      selectedLines,
    });
    if (!validation.ok) {
      setErrors(validation.errors);
      setDialog(null);
      return;
    }
    setBusy(true);
    try {
      const known = [...payments.data, ...savedPayments.current.values()];
      const decision = resolvePaymentWrite(known, idempotencyKey, null);
      if (decision.action === 'reuse') {
        setDialog(null);
        navigate(receiptPath(decision.payment.id));
        return;
      }
      const record = buildPaymentRecord({
        student,
        amount: validation.amount,
        paidAt,
        method,
        reference,
        notes,
        selectedLines,
        idempotencyKey,
        receiptNumber: nextReceiptNumber(payments.data, paidAt),
        recordedBy: user?.name || user?.email || '',
        schoolSnapshot: readSchoolProfile(settings.data),
        currency,
      });
      const saved = await payments.create(record);
      savedPayments.current.set(idempotencyKey, saved);
      setDialog(null);
      navigate(receiptPath(saved.id));
    } catch (error) {
      setErrors({ form: error.message || 'The payment could not be saved.' });
      setDialog(null);
    } finally {
      setBusy(false);
    }
  };

  const reversePayment = async () => {
    const payment = dialog?.payment;
    const validation = validateReversal(payment, payments.data, dialog?.reason);
    if (!validation.ok) {
      setDialog((current) => ({ ...current, errors: validation.errors }));
      return;
    }
    const key = `reversal:${payment.id}`;
    if (resolvePaymentWrite(payments.data, key, null).action === 'reuse') {
      setMessage('This payment already has a reversal record.');
      setDialog(null);
      return;
    }
    setBusy(true);
    try {
      await payments.create(buildReversalRecord(payment, {
        reason: dialog.reason,
        recordedBy: user?.name || user?.email || '',
        idempotencyKey: key,
      }));
      setAmountTouched(false);
      setMessage('Reversal saved locally. The original payment was kept.');
      setDialog(null);
    } catch (error) {
      setDialog((current) => ({ ...current, errors: { form: error.message || 'The reversal could not be saved.' } }));
    } finally {
      setBusy(false);
    }
  };

  const voidCharge = async () => {
    const charge = dialog?.charge;
    const reason = String(dialog?.reason || '').trim();
    if (!reason) {
      setDialog((current) => ({ ...current, errors: { reason: 'Enter a reason for voiding this charge.' } }));
      return;
    }
    if (!canVoidCharge(charge, payments.data)) {
      setDialog((current) => ({ ...current, errors: { form: 'Reverse allocated payments before voiding this charge.' } }));
      return;
    }
    setBusy(true);
    try {
      await charges.update(charge.id, { status: 'void', voidReason: reason, voidedAt: new Date().toISOString() });
      setChargeSelection(null);
      setAmountTouched(false);
      setMessage('Charge voided. The record was kept and no longer adds to the balance.');
      setDialog(null);
    } catch (error) {
      setDialog((current) => ({ ...current, errors: { form: error.message || 'The charge could not be voided.' } }));
    } finally {
      setBusy(false);
    }
  };

  const exportReport = () => {
    try {
      const rows = [
        ['Type', 'Receipt', 'Student', 'Admission number', 'Date', 'Method', 'Reference', 'Amount', 'Sync status'],
        ...activity.collected.map((payment) => ['Payment', payment.receiptNumber, payment.studentName, payment.admissionNumber, payment.paidAt, payment.method, payment.reference, payment.amount, payment.syncStatus]),
        ...activity.reversals.map((payment) => ['Reversal', payment.receiptNumber, payment.studentName, payment.admissionNumber, payment.paidAt, payment.method, payment.reference, payment.amount, payment.syncStatus]),
        [],
        ['Gross', activity.gross],
        ['Reversals', activity.reversedTotal],
        ['Net', activity.net],
      ];
      downloadBlob(`fee-collections-${reportDate}.csv`, `\uFEFF${toCsv(rows)}`, 'text/csv;charset=utf-8');
      const count = activity.collected.length + activity.reversals.length;
      setMessage(count ? `Exported ${count} row(s) for ${formatDate(reportDate)}.` : `No payments were recorded on ${formatDate(reportDate)}. An empty report was exported.`);
    } catch (error) {
      setMessage(error.message || 'The report could not be exported.');
    }
  };

  const printReport = () => {
    try {
      printHtmlDocument(`Collections ${reportDate}`, collectionReportHtml({ school: profile, date: reportDate, activity, currency }));
    } catch (error) {
      setMessage(error.message || 'The report could not be printed.');
    }
  };

  if (!local.repositories) {
    return (
      <Layout title="Fee Management">
        <EmptyState title="School account required" body="Fee records are stored separately for each school. Sign in with a school account to use the ledger." />
      </Layout>
    );
  }

  const blocked = [students, charges, payments].find((collection) => collection.error && collection.data.length === 0);
  if (blocked) {
    return (
      <Layout title="Fee Management">
        <ErrorState message={blocked.error.message} onRetry={retry} />
      </Layout>
    );
  }

  const waiting = [students, charges, payments].every((collection) => collection.isLoading && collection.data.length === 0 && !collection.error);
  if (waiting) {
    return (
      <Layout title="Fee Management">
        <LoadingState />
      </Layout>
    );
  }

  const refreshError = [students, charges, payments, structures].find((collection) => collection.error);
  const allocationPreview = allocateAmount(selectedLines, enteredAmount);
  const headerActions = (
    <button type="button" onClick={exportReport} className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
      <span className="material-symbols-outlined text-lg">download</span>
      Export Daily Report
    </button>
  );

  return (
    <Layout title="Fee Management" headerActions={headerActions}>
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 p-6 md:p-8">
        <div>
          <h1 className="text-3xl font-black">Fee ledger</h1>
          <p className="text-slate-500">Balances are calculated from local charges and payments. A saved payment keeps its receipt number if you submit it again.</p>
          <Link to="/fees/configuration" className="mt-2 inline-flex text-sm font-bold text-primary">Configure class fees</Link>
          {message && <p className="mt-2 text-sm font-semibold text-primary" role="status">{message}</p>}
        </div>
        <SyncBanners status={local.status} />
        {refreshError && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
            <span>Some financial records could not be refreshed. {refreshError.error.message}</span>
            <button type="button" onClick={retry} className="font-bold underline">Retry</button>
          </div>
        )}
        <div ref={setupRef}>
          <FeeSetupPanel
            open={setupOpen}
            onToggle={() => setSetupOpen((current) => !current)}
            years={years.data}
            programs={programs.data}
            structures={structures.data}
            students={students.data}
            selectedStudent={student}
            canManage={canManage}
            onCreateStructure={createStructure}
            onToggleStructure={toggleStructure}
            onAssign={assignCharges}
          />
        </div>
        <div className="flex flex-col items-start gap-8 lg:flex-row">
          <FeeStudentList
            rows={visibleStudents}
            currency={currency}
            query={query}
            onQuery={setQuery}
            status={statusFilter}
            onStatus={setStatusFilter}
            selectedId={selectedId}
            onSelect={selectStudent}
            onRefresh={refreshList}
            refreshing={refreshing}
            emptyTitle={students.data.length === 0 ? 'No students on this device' : 'No students match'}
            emptyBody={students.data.length === 0 ? 'Add students from the student directory, then assign their fees here.' : 'Try another name, admission number, or status.'}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            {!student && selectedId && (
              <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <EmptyState title="Student not found" body="That student is not in the local directory." action={<button type="button" onClick={() => applyStudent('')} className="h-10 rounded-lg border px-4 text-sm font-bold">Clear selection</button>} />
              </div>
            )}
            {!student && !selectedId && (
              <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <EmptyState title="Select a student" body="The ledger and payment form open after you choose a student." />
              </div>
            )}
            {student && (
              <>
                <StudentLedger
                  lines={ledger.lines}
                  payments={ledger.payments}
                  currency={currency}
                  selectedIds={selectedChargeIds}
                  onToggle={(id) => {
                    const next = new Set(selectedChargeIds);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    setChargeSelection([...next]);
                    setAmountTouched(false);
                  }}
                  onToggleAll={(checked) => {
                    setChargeSelection(checked ? openLines.map((line) => line.id) : []);
                    setAmountTouched(false);
                  }}
                  canManage={canManage}
                  onReverse={(payment) => setDialog({ type: 'reversal', payment, reason: '', errors: {} })}
                  onVoid={(charge) => setDialog({ type: 'void', charge, reason: '', errors: {} })}
                  onSetup={openSetup}
                />
                <FeePaymentForm
                  student={student}
                  currency={currency}
                  outstanding={ledger.outstanding}
                  paymentAmount={enteredAmount}
                  remaining={remaining}
                  selectedCount={selectedLines.length}
                  paidAt={paidAt}
                  onPaidAt={setPaidAt}
                  amount={enteredAmount}
                  onAmount={(value) => { setAmountTouched(true); setAmount(value); }}
                  method={method}
                  onMethod={(value) => {
                    setMethod(value);
                    if (!PAYMENT_METHODS.find((item) => item.id === value)?.needsReference) setReference('');
                    setErrors((current) => ({ ...current, method: undefined, reference: undefined }));
                  }}
                  reference={reference}
                  onReference={setReference}
                  notes={notes}
                  onNotes={setNotes}
                  errors={errors}
                  canManage={canManage}
                  online={local.status.online !== false}
                  pendingSync={[...charges.data, ...payments.data].some((record) => record.studentId === student.id && record.syncStatus === 'pending')}
                  busy={busy}
                  onSubmit={openPaymentConfirm}
                />
              </>
            )}
          </div>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-black">Daily collections</h2>
              <p className="text-sm text-slate-500">Receipts and reversals recorded on the selected date. Net is gross receipts minus reversals posted that day.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm font-bold">
                <span className="mr-2">Report date</span>
                <input type="date" value={reportDate} onChange={(event) => setReportDate(event.target.value)} className="h-10 rounded-lg bg-slate-100 px-3 dark:bg-slate-800" />
              </label>
              <button type="button" onClick={printReport} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold dark:border-slate-700">Print</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 px-5 py-4 text-sm">
            <p>Gross <span className="block text-xl font-black">{formatMoney(activity.gross, currency)}</span></p>
            <p>Reversals <span className="block text-xl font-black">{formatMoney(activity.reversedTotal, currency)}</span></p>
            <p>Net <span className="block text-xl font-black">{formatMoney(activity.net, currency)}</span></p>
          </div>
          {activity.collected.length + activity.reversals.length === 0 ? (
            <p className="px-5 pb-6 text-sm text-slate-500">No collections or reversals on {formatDate(reportDate)}.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50">
                  <tr><th className="p-4">Type</th><th>Receipt</th><th>Student</th><th>Method</th><th>Amount</th><th>Sync</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[...activity.collected.map((payment) => ({ ...payment, type: 'Payment' })), ...activity.reversals.map((payment) => ({ ...payment, type: 'Reversal' }))].map((payment) => (
                    <tr key={payment.id}>
                      <td className="p-4 font-bold">{payment.type}</td>
                      <td><button type="button" className="font-bold text-primary" onClick={() => navigate(receiptPath(payment.id))}>{payment.receiptNumber}</button></td>
                      <td>{payment.studentName}</td>
                      <td className="capitalize">{payment.method}</td>
                      <td>{formatMoney(payment.amount, payment.currency || currency)}</td>
                      <td className="uppercase text-slate-500">{payment.syncStatus || 'pending'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {dialog?.type === 'payment' && (
        <ConfirmDialog title="Record this payment?" confirmLabel="Save payment" busy={busy} onCancel={() => setDialog(null)} onConfirm={recordPayment}>
          <p>{student?.name} · {formatMoney(paymentValue, currency)} · {method} · {formatDate(paidAt)}</p>
          <ul className="list-disc pl-5">
            {allocationPreview.allocations.map((item) => (
              <li key={item.chargeId}>{item.description}: {formatMoney(item.amount, currency)}</li>
            ))}
          </ul>
          <p>Remaining ledger balance: {formatMoney(remaining, currency)}.</p>
          {local.status.online === false && <p>This device is offline. The payment is stored locally and will sync later.</p>}
          <p>Saving again reopens this same receipt instead of creating a second payment.</p>
        </ConfirmDialog>
      )}
      {dialog?.type === 'reversal' && (
        <ConfirmDialog title="Reverse payment" confirmLabel="Save reversal" busy={busy} confirmDisabled={!dialog.reason?.trim()} onCancel={() => setDialog(null)} onConfirm={reversePayment}>
          <p>Receipt {dialog.payment.receiptNumber} stays in the ledger. A reversal record puts the allocated amount back on the balance.</p>
          <label className="flex flex-col gap-1 font-bold text-slate-700 dark:text-slate-200">
            Reason
            <textarea value={dialog.reason} onChange={(event) => setDialog({ ...dialog, reason: event.target.value, errors: {} })} className="h-24 rounded-lg border border-slate-200 bg-slate-50 p-3 font-medium dark:border-slate-700 dark:bg-slate-800" />
          </label>
          {dialog.errors?.reason && <p className="font-medium text-rose-600" role="alert">{dialog.errors.reason}</p>}
          {dialog.errors?.payment && <p className="font-medium text-rose-600" role="alert">{dialog.errors.payment}</p>}
          {dialog.errors?.form && <p className="font-medium text-rose-600" role="alert">{dialog.errors.form}</p>}
        </ConfirmDialog>
      )}
      {dialog?.type === 'void' && (
        <ConfirmDialog title="Void charge" confirmLabel="Void charge" busy={busy} confirmDisabled={!dialog.reason?.trim()} onCancel={() => setDialog(null)} onConfirm={voidCharge}>
          <p>{dialog.charge.description} will remain stored, but it will no longer add to the outstanding balance.</p>
          <label className="flex flex-col gap-1 font-bold text-slate-700 dark:text-slate-200">
            Reason
            <textarea value={dialog.reason} onChange={(event) => setDialog({ ...dialog, reason: event.target.value, errors: {} })} className="h-24 rounded-lg border border-slate-200 bg-slate-50 p-3 font-medium dark:border-slate-700 dark:bg-slate-800" />
          </label>
          {dialog.errors?.reason && <p className="font-medium text-rose-600" role="alert">{dialog.errors.reason}</p>}
          {dialog.errors?.form && <p className="font-medium text-rose-600" role="alert">{dialog.errors.form}</p>}
        </ConfirmDialog>
      )}
      {dialog?.type === 'discard' && (
        <ConfirmDialog title="Discard payment details?" confirmLabel="Discard details" onCancel={() => setDialog(null)} onConfirm={() => { const nextId = dialog.nextId; setDialog(null); applyStudent(nextId); }}>
          <p>The amount, reference, and selected charges for this student have not been saved.</p>
        </ConfirmDialog>
      )}
    </Layout>
  );
}
