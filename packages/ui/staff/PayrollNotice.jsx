import { PAYROLL_AVAILABLE } from './staffModel';

export function PayrollNotice() {
  return (
    <section aria-labelledby="payroll-heading" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 id="payroll-heading" className="mb-3 flex items-center gap-2 text-lg font-bold">
        <span className="material-symbols-outlined text-slate-400" aria-hidden="true">
          account_balance
        </span>
        Payroll
      </h3>
      {PAYROLL_AVAILABLE ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Payroll tools are enabled, but no payroll ledger is connected for this staff record.
        </p>
      ) : (
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          Payroll is not available in this version. Salary, bank details, tax identifiers, and payslips are not collected or shown.
        </p>
      )}
    </section>
  );
}
