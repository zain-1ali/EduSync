import { Link } from 'react-router-dom';

export const fieldClass = 'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary';

export function SyncBanners({ status }) {
  if (!status) return null;
  return (
    <div className="flex flex-col gap-3">
      {status.online === false && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200" role="status">
          This device is offline. Fee changes are saved locally and will sync when the connection returns.
        </p>
      )}
      {status.failed > 0 && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200" role="alert">
          {status.failed} local change(s) failed to sync.{' '}
          <Link to="/sync" className="font-bold underline">Review sync</Link>
        </p>
      )}
      {status.conflicts > 0 && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200" role="alert">
          A server conflict needs a decision before some records can sync.{' '}
          <Link to="/sync/conflicts" className="font-bold underline">Resolve conflicts</Link>
        </p>
      )}
    </div>
  );
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="p-10 text-center">
      <p className="font-bold text-slate-900 dark:text-white">{title}</p>
      {body && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{body}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = 'Loading local financial records…' }) {
  return <p className="p-10 text-center text-slate-500" role="status">{label}</p>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="p-10 text-center" role="alert">
      <p className="font-bold text-rose-600">Financial records could not be loaded</p>
      <p className="mt-1 text-sm text-slate-500">{message || 'Something went wrong on this device.'}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-4 h-10 rounded-lg bg-primary px-4 text-sm font-bold text-white">
          Retry
        </button>
      )}
    </div>
  );
}

export function FieldError({ children }) {
  if (!children) return null;
  return <p className="text-sm font-medium text-rose-600" role="alert">{children}</p>;
}

export function ConfirmDialog({ title, children, confirmLabel, onConfirm, onCancel, busy, confirmDisabled }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={onCancel} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="finance-confirm-title"
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="finance-confirm-title" className="text-xl font-black">{title}</h2>
        <div className="mt-3 flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">{children}</div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={busy} autoFocus className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold disabled:opacity-50 dark:border-slate-700">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={busy || confirmDisabled} className="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-white disabled:opacity-50">
            {busy ? 'Saving…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
