import { FieldError, fieldClass } from './FinanceStates';
import { PAYMENT_METHODS, classLabel, formatMoney } from './ledger';

export function FeePaymentForm({
  student,
  currency,
  outstanding,
  paymentAmount,
  remaining,
  selectedCount,
  paidAt,
  onPaidAt,
  amount,
  onAmount,
  method,
  onMethod,
  reference,
  onReference,
  notes,
  onNotes,
  errors,
  canManage,
  online,
  pendingSync,
  busy,
  onSubmit,
}) {
  const methodMeta = PAYMENT_METHODS.find((item) => item.id === method) || PAYMENT_METHODS[0];
  const parsedAmount = Number(paymentAmount);
  const hasAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-6">
          <div className="flex size-16 items-center justify-center rounded-xl bg-slate-100 text-xl font-bold text-slate-400 dark:bg-slate-800">
            {(student.name || '?').charAt(0)}
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">{student.name}</h1>
            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">badge</span> {student.admissionNumber || 'No admission number'}</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">school</span> {classLabel(student)}</span>
            </div>
            {pendingSync && <p className="text-xs font-bold uppercase text-amber-600">Pending synchronization</p>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Outstanding balance</p>
          <p className={`text-3xl font-bold ${outstanding > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>{formatMoney(outstanding, currency)}</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-8 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="flex items-center gap-2 border-b border-slate-100 pb-4 text-xl font-bold dark:border-slate-800">
          <span className="material-symbols-outlined text-primary">payments</span>
          Payment Details
        </h3>
        {!canManage && (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300" role="status">
            You can view this ledger. Recording or reversing money requires fee management permission.
          </p>
        )}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Transaction date</span>
            <input className={`${fieldClass} h-12`} type="date" value={paidAt} max={new Date().toISOString().slice(0, 10)} onChange={(event) => onPaidAt(event.target.value)} disabled={!canManage} />
            <FieldError>{errors.paidAt}</FieldError>
          </label>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Selected charges</span>
            <p className="flex h-12 items-center rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-800">
              {selectedCount} outstanding charge(s) selected
            </p>
            <FieldError>{errors.charges}</FieldError>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Amount received</span>
            <input
              className={`${fieldClass} h-14 text-2xl font-bold text-primary`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              autoComplete="off"
              value={amount}
              onChange={(event) => onAmount(event.target.value)}
              disabled={!canManage}
            />
            <FieldError>{errors.amount}</FieldError>
          </label>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Payment mode</span>
            <div className="grid h-auto grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800" role="group" aria-label="Payment mode">
              {PAYMENT_METHODS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={method === item.id}
                  disabled={!canManage}
                  onClick={() => onMethod(item.id)}
                  className={`rounded-md px-2 py-2 text-sm font-bold ${method === item.id ? 'bg-white text-primary shadow-sm dark:bg-slate-700' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <FieldError>{errors.method}</FieldError>
          </div>
          {methodMeta.needsReference && (
            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{methodMeta.referenceLabel}</span>
              <input className={`${fieldClass} h-12`} value={reference} onChange={(event) => onReference(event.target.value)} disabled={!canManage} autoComplete="off" />
              <FieldError>{errors.reference}</FieldError>
            </label>
          )}
          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Notes (optional)</span>
            <input className={`${fieldClass} h-12`} value={notes} onChange={(event) => onNotes(event.target.value)} disabled={!canManage} placeholder="Optional note stored on the receipt" />
            <FieldError>{errors.notes}</FieldError>
          </label>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="text-slate-500">Current balance: <span className="font-bold text-slate-900 dark:text-white">{formatMoney(outstanding, currency)}</span></span>
            <span className="text-slate-500">This payment: <span className="font-bold text-primary">{hasAmount ? formatMoney(paymentAmount, currency) : '—'}</span></span>
          </div>
          <div className="text-center sm:text-right">
            <span className="text-xs font-bold uppercase text-slate-400">Remaining balance</span>
            <span className="block text-2xl font-bold">{formatMoney(remaining, currency)}</span>
          </div>
        </div>
        <FieldError>{errors.form}</FieldError>
        <div className="flex flex-col gap-4 pt-2">
          <button type="submit" disabled={!canManage || busy || outstanding <= 0} className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50">
            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            <span className="text-lg font-bold">{busy ? 'Saving payment…' : 'Record Payment & Print Receipt'}</span>
          </button>
          <p className="flex items-center justify-center gap-1 text-center text-xs font-medium text-slate-400">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            {online ? 'The payment is saved on this device first, then queued for sync.' : 'Offline: the payment is saved on this device and will sync later. Retrying will not create a second receipt.'}
          </p>
        </div>
      </form>
    </div>
  );
}
