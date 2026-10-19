import { useState } from 'react';
import { DialogShell } from './useDialogBehavior';
import {
  STAFF_STATUS_OPTIONS,
  staffDisplayName,
  staffStatusLabel,
  validateStatusChange,
} from './staffModel';

export function StatusDialog({ staff, onClose, onConfirm }) {
  const alternatives = STAFF_STATUS_OPTIONS.filter((option) => option.value !== staff.status);
  const [nextStatus, setNextStatus] = useState(alternatives[0]?.value || staff.status);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const problem = validateStatusChange(staff.status, nextStatus, note);
    if (problem) {
      setError(problem);
      return;
    }
    setPending(true);
    setError('');
    try {
      await onConfirm(nextStatus, note.trim());
    } catch (nextError) {
      setError(nextError.message || 'The status could not be saved.');
      setPending(false);
    }
  };

  return (
    <DialogShell
      title={`Update status for ${staffDisplayName(staff)}`}
      description={`Current status: ${staffStatusLabel(staff.status)}. The reason is stored in this person's status history.`}
      onClose={onClose}
      canClose={!pending}
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-bold">New status</span>
          <select
            data-initial-focus
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value)}
            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-800"
          >
            {STAFF_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} disabled={option.value === staff.status}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-bold">Reason</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            aria-required="true"
            rows={3}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
          <span className="text-xs text-slate-500">At least 5 characters.</span>
        </label>
        {error && (
          <p role="alert" className="text-sm font-semibold text-red-600">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="h-11 rounded-lg border border-slate-300 px-4 font-bold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="h-11 rounded-lg bg-primary px-4 font-bold text-white disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save status'}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

export function ReasonDialog({ title, description, confirmLabel, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (reason.trim().length < 5) {
      setError('Enter a reason of at least 5 characters.');
      return;
    }
    setPending(true);
    setError('');
    try {
      await onConfirm(reason.trim());
    } catch (nextError) {
      setError(nextError.message || 'The change could not be saved.');
      setPending(false);
    }
  };

  return (
    <DialogShell title={title} description={description} onClose={onClose} canClose={!pending}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-bold">Reason</span>
          <textarea
            data-initial-focus
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            aria-required="true"
            rows={3}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm font-semibold text-red-600">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="h-11 rounded-lg border border-slate-300 px-4 font-bold disabled:opacity-50"
          >
            Cancel
          </button>
          <button type="submit" disabled={pending} className="h-11 rounded-lg bg-primary px-4 font-bold text-white disabled:opacity-50">
            {pending ? 'Saving…' : confirmLabel}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}
