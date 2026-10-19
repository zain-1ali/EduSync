import { useState } from 'react';
import { StaffFields } from './StaffFields';
import { buildStaffRecord, formFromStaff, validateStaffInput } from './staffModel';

export function EditStaffForm({ record, records, onCancel, onSubmit }) {
  const [form, setForm] = useState(() => formFromStaff(record));
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateStaffInput(form, records, record.id);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setPending(true);
    setSaveError('');
    try {
      await onSubmit(buildStaffRecord(form));
    } catch (error) {
      setSaveError(error.message || 'The staff record could not be saved.');
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-6 text-xl font-black">Edit staff details</h2>
      <StaffFields form={form} errors={errors} idPrefix={`edit-${record.id}`} onChange={(name, value) => setForm((current) => ({ ...current, [name]: value }))} />
      {saveError && (
        <p role="alert" className="mt-4 font-semibold text-red-600">
          {saveError}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={pending} className="h-11 rounded-lg border border-slate-300 px-5 font-bold disabled:opacity-50">
          Cancel
        </button>
        <button type="submit" disabled={pending} className="h-11 rounded-lg bg-primary px-6 font-bold text-white disabled:opacity-50">
          {pending ? 'Saving…' : 'Save details'}
        </button>
      </div>
    </form>
  );
}
