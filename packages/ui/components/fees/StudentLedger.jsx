import { Link } from 'react-router-dom';
import { formatDate, formatMoney, paymentDisplayStatus, receiptPath } from './ledger';

const STATUS_CLASS = {
  paid: 'text-emerald-600',
  partial: 'text-amber-600',
  overdue: 'text-rose-600',
  open: 'text-slate-500',
};

export function StudentLedger({
  lines,
  payments,
  currency,
  selectedIds,
  onToggle,
  onToggleAll,
  canManage,
  onReverse,
  onVoid,
  onSetup,
}) {
  const openLines = lines.filter((line) => line.outstanding > 0);
  const allSelected = openLines.length > 0 && openLines.every((line) => selectedIds.includes(line.id));

  return (
    <div className="flex flex-col gap-6">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="text-lg font-black">Fee ledger</h2>
          <p className="text-xs text-slate-500">Balances are calculated from charges and payments.</p>
        </div>
        {lines.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-bold">No charges on this ledger</p>
            <p className="mt-1 text-sm text-slate-500">Assign a fee structure to create a charge for this student.</p>
            {canManage && (
              <button type="button" onClick={onSetup} className="mt-4 h-10 rounded-lg bg-primary px-4 text-sm font-bold text-white">
                Set up fees
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50">
                <tr>
                  <th className="p-4">
                    <input type="checkbox" checked={allSelected} onChange={(event) => onToggleAll(event.target.checked)} aria-label="Select all outstanding charges" disabled={!canManage || openLines.length === 0} />
                  </th>
                  <th className="p-4">Charge</th>
                  <th>Due</th>
                  <th>Net</th>
                  <th>Paid</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lines.map((line) => (
                  <tr key={line.id}>
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(line.id)}
                        disabled={!canManage || line.outstanding <= 0}
                        onChange={() => onToggle(line.id)}
                        aria-label={`Select ${line.description}`}
                      />
                    </td>
                    <td className="p-4">
                      <p className="font-bold">{line.description}</p>
                      {line.discountAmount > 0 && <p className="text-xs text-slate-500">Discount {formatMoney(line.discountAmount, currency)}</p>}
                    </td>
                    <td>{formatDate(line.dueDate)}</td>
                    <td>{formatMoney(line.net, currency)}</td>
                    <td>{formatMoney(line.paid, currency)}</td>
                    <td className="font-bold">{formatMoney(line.outstanding, currency)}</td>
                    <td className={`text-xs font-black uppercase ${STATUS_CLASS[line.displayStatus]}`}>{line.displayStatus}</td>
                    <td className="pr-4 text-right">
                      {canManage && line.paid === 0 && (
                        <button type="button" onClick={() => onVoid(line)} className="text-sm font-bold text-rose-600">Void</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="border-b border-slate-200 px-5 py-4 text-lg font-black dark:border-slate-800">Receipt history</h2>
        {payments.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No payments recorded for this student.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {[...payments].sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt))).map((payment) => {
              const label = paymentDisplayStatus(payment, payments);
              return (
                <li key={payment.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold">{payment.receiptNumber || 'Receipt pending'} · {formatMoney(payment.amount, payment.currency || currency)}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(payment.paidAt)} · {payment.method} · {label}
                      {payment.syncStatus === 'pending' ? ' · sync pending' : ''}
                    </p>
                    {payment.kind === 'reversal' && payment.reversalReason && <p className="text-sm text-slate-500">Reason: {payment.reversalReason}</p>}
                  </div>
                  <div className="flex gap-3">
                    <Link to={receiptPath(payment.id)} className="text-sm font-bold text-primary">View receipt</Link>
                    {canManage && label === 'Posted' && (
                      <button type="button" onClick={() => onReverse(payment)} className="text-sm font-bold text-rose-600">Reverse</button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
