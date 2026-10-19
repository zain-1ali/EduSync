import { formatMoney } from './ledger';

const STATUS_LABEL = { overdue: 'OVERDUE', pending: 'PENDING', paid: 'PAID', none: 'NO FEES' };
const STATUS_CLASS = {
  overdue: 'bg-rose-100 text-rose-700 border-rose-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  none: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function FeeStudentList({
  rows,
  currency,
  query,
  onQuery,
  status,
  onStatus,
  selectedId,
  onSelect,
  onRefresh,
  refreshing,
  emptyTitle,
  emptyBody,
}) {
  const tabs = [
    ['all', 'ALL'],
    ['pending', 'PENDING'],
    ['overdue', 'OVERDUE'],
  ];

  return (
    <div className="flex w-full flex-shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:w-96">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-4 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold">Select Student</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Search the local ledger before recording a payment</p>
        </div>
        <label className="flex h-11 items-center overflow-hidden rounded-lg bg-slate-100 px-3 dark:bg-slate-800">
          <span className="material-symbols-outlined text-[20px] text-slate-500">search</span>
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            aria-label="Search students"
            className="w-full border-none bg-transparent px-3 text-sm focus:outline-none focus:ring-0 placeholder:text-slate-400"
            placeholder="Search name, admission number, or class"
          />
        </label>
      </div>
      <div className="flex gap-1 border-b border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-950/50" role="tablist" aria-label="Balance status">
        {tabs.map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={status === value}
            onClick={() => onStatus(value)}
            className={`flex-1 rounded py-1.5 text-xs font-bold ${status === value ? 'bg-primary text-white' : 'font-medium hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex max-h-[500px] flex-grow flex-col overflow-y-auto">
        {rows.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-bold">{emptyTitle}</p>
            <p className="mt-1 text-sm text-slate-500">{emptyBody}</p>
          </div>
        ) : rows.map((row) => {
          const active = row.student.id === selectedId;
          return (
            <button
              key={row.student.id}
              type="button"
              onClick={() => onSelect(row.student.id)}
              className={`flex items-center gap-4 border-b border-slate-100 px-4 py-4 text-left transition-colors dark:border-slate-800 ${active ? 'border-l-4 border-l-primary bg-primary/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <div className={`flex size-12 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-500 dark:bg-slate-700 ${active ? '' : 'opacity-60'}`}>
                {(row.student.name || '?').charAt(0)}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-bold ${active ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{row.student.name}</p>
                  <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${STATUS_CLASS[row.status]}`}>{STATUS_LABEL[row.status]}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {[row.student.className, row.student.sectionName].filter(Boolean).join(' · ') || 'Unassigned'} · {row.student.admissionNumber || 'No admission number'}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {formatMoney(row.outstanding, currency)}
                  {row.pendingSync ? ' · sync pending' : ''}
                </p>
              </div>
              {active && <span className="material-symbols-outlined text-primary">chevron_right</span>}
            </button>
          );
        })}
      </div>
      <div className="border-t border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900">
        <button type="button" onClick={onRefresh} disabled={refreshing} className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 py-2.5 text-sm font-bold transition-colors hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:hover:bg-slate-700">
          <span className="material-symbols-outlined text-[18px]">sync</span>
          {refreshing ? 'Refreshing…' : 'Refresh List'}
        </button>
      </div>
    </div>
  );
}
