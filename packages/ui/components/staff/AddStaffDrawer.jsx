import { useEffect, useRef, useState } from 'react';
import { useLocalCollection } from '../../data/useLocalCollection';
import { StaffFields } from '../../staff/StaffFields';
import { EMPTY_STAFF_FORM, buildStaffRecord, validateStaffInput } from '../../staff/staffModel';

export function AddStaffDrawer({ onClose }) {
  const staff = useLocalCollection('staff');
  const [form, setForm] = useState(EMPTY_STAFF_FORM);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isSuccess) return undefined;
    const timer = window.setTimeout(() => onCloseRef.current(), 1200);
    return () => window.clearTimeout(timer);
  }, [isSuccess]);

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateStaffInput(form, staff.data);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!staff.repository) {
      setErrorMessage('Staff records are unavailable until you are signed in to a school.');
      return;
    }
    setPending(true);
    setErrorMessage('');
    try {
      await staff.create({
        ...buildStaffRecord(form),
        status: 'active',
        statusHistory: [{ status: 'active', note: 'Record created', at: new Date().toISOString() }],
      });
      setIsSuccess(true);
    } catch (error) {
      setErrorMessage(error.message || 'The staff member could not be saved.');
      setPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-slate-900/60" aria-label="Close add staff" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-staff-title"
        className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl dark:bg-slate-900"
      >
        {isSuccess ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <h2 id="add-staff-title" className="text-2xl font-black">
              Staff added
            </h2>
            <p className="mt-2 text-slate-500">The record is saved on this device and queued for sync.</p>
          </div>
        ) : (
          <>
            <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              <div>
                <h2 id="add-staff-title" className="text-xl font-bold">
                  Add staff member
                </h2>
                <p className="mt-1 text-sm text-slate-500">Create the HR record. A login can be invited from the profile.</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <span className="material-symbols-outlined" aria-hidden="true">
                  close
                </span>
              </button>
            </header>
            <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6">
                {errorMessage && (
                  <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-600">
                    {errorMessage}
                  </p>
                )}
                <StaffFields
                  form={form}
                  errors={errors}
                  idPrefix="add-staff"
                  onChange={(name, value) => setForm((current) => ({ ...current, [name]: value }))}
                />
              </div>
              <footer className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5 dark:border-slate-800">
                <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-5 py-2.5 font-bold">
                  Cancel
                </button>
                <button type="submit" disabled={pending} className="rounded-lg bg-primary px-6 py-2.5 font-bold text-white disabled:opacity-60">
                  {pending ? 'Saving…' : 'Save staff member'}
                </button>
              </footer>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
