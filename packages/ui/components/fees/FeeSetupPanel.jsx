import { useState } from 'react';
import { FieldError, fieldClass } from './FinanceStates';
import { formatMoney } from './ledger';

const emptyStructure = { name: '', academicYearId: '', classId: '', category: 'Tuition', amount: '', frequency: 'monthly' };
const emptyAssignment = { structureId: '', target: 'student', classId: '', period: '', dueDate: '', discountAmount: '' };

export function FeeSetupPanel({
  open,
  onToggle,
  years,
  programs,
  structures,
  students,
  selectedStudent,
  canManage,
  onCreateStructure,
  onToggleStructure,
  onAssign,
}) {
  const [structureForm, setStructureForm] = useState(emptyStructure);
  const [assignment, setAssignment] = useState(emptyAssignment);
  const [structureErrors, setStructureErrors] = useState({});
  const [assignmentErrors, setAssignmentErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const activeStructures = structures.filter((item) => item.status === 'active');

  const createStructure = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const result = await onCreateStructure(structureForm);
      setStructureErrors(result.errors || {});
      if (!result.errors) {
        setStructureForm(emptyStructure);
        setMessage(result.message);
      }
    } catch (error) {
      setMessage(error.message || 'The fee structure could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const assign = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const structure = structures.find((item) => item.id === assignment.structureId);
      const classId = assignment.target === 'class' ? assignment.classId || structure?.classId : '';
      const targets = assignment.target === 'student'
        ? (selectedStudent ? [selectedStudent] : [])
        : students.filter((student) => student.classId === classId && student.status !== 'withdrawn' && student.status !== 'graduated');
      const result = await onAssign({ ...assignment, classId, targets, structure });
      setAssignmentErrors(result.errors || {});
      if (!result.errors) setMessage(result.message);
    } catch (error) {
      setMessage(error.message || 'The charges could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between px-5 py-4 text-left" aria-expanded={open}>
        <span>
          <span className="block text-lg font-black">Fee setup</span>
          <span className="text-sm text-slate-500">{structures.length} structure(s) stored on this device</span>
        </span>
        <span className="material-symbols-outlined">{open ? 'expand_less' : 'expand_more'}</span>
      </button>
      {open && (
        <div className="flex flex-col gap-6 border-t border-slate-200 p-5 dark:border-slate-800">
          {message && <p className="text-sm font-semibold text-primary" role="status">{message}</p>}
          {!canManage && <p className="text-sm text-slate-500">Fee setup is read-only for your account.</p>}
          {years.length === 0 && (
            <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Add an academic year in Academics before creating a fee structure.
            </p>
          )}
          {canManage && (
            <form onSubmit={createStructure} className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <label className="flex flex-col gap-1 text-sm font-bold">
                Fee name
                <input className={`${fieldClass} h-10`} value={structureForm.name} onChange={(event) => setStructureForm({ ...structureForm, name: event.target.value })} />
                <FieldError>{structureErrors.name}</FieldError>
              </label>
              <label className="flex flex-col gap-1 text-sm font-bold">
                Academic year
                <select className={`${fieldClass} h-10`} value={structureForm.academicYearId} onChange={(event) => setStructureForm({ ...structureForm, academicYearId: event.target.value })}>
                  <option value="">Choose year</option>
                  {years.map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}
                </select>
                <FieldError>{structureErrors.academicYearId}</FieldError>
              </label>
              <label className="flex flex-col gap-1 text-sm font-bold">
                Class (optional)
                <select className={`${fieldClass} h-10`} value={structureForm.classId} onChange={(event) => setStructureForm({ ...structureForm, classId: event.target.value })}>
                  <option value="">Any class</option>
                  {programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-bold">
                Category
                <input className={`${fieldClass} h-10`} list="fee-categories" value={structureForm.category} onChange={(event) => setStructureForm({ ...structureForm, category: event.target.value })} />
                <datalist id="fee-categories">
                  {['Tuition', 'Transport', 'Library', 'Laboratory', 'Examination'].map((category) => <option key={category} value={category} />)}
                </datalist>
              </label>
              <label className="flex flex-col gap-1 text-sm font-bold">
                Amount
                <input className={`${fieldClass} h-10`} type="number" min="0" step="0.01" value={structureForm.amount} onChange={(event) => setStructureForm({ ...structureForm, amount: event.target.value })} />
                <FieldError>{structureErrors.amount}</FieldError>
              </label>
              <label className="flex flex-col gap-1 text-sm font-bold">
                Frequency
                <select className={`${fieldClass} h-10`} value={structureForm.frequency} onChange={(event) => setStructureForm({ ...structureForm, frequency: event.target.value })}>
                  <option value="monthly">Monthly</option>
                  <option value="one-time">One time</option>
                </select>
                <FieldError>{structureErrors.frequency}</FieldError>
              </label>
              <div className="md:col-span-2 xl:col-span-3">
                <button type="submit" disabled={busy || years.length === 0} className="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-white disabled:opacity-50">Save fee structure</button>
              </div>
            </form>
          )}

          {structures.length === 0 ? (
            <p className="text-sm text-slate-500">No fee structures yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
              {structures.map((structure) => {
                const year = years.find((item) => item.id === structure.academicYearId);
                const program = programs.find((item) => item.id === structure.classId);
                return (
                  <li key={structure.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold">{structure.name} · {formatMoney(structure.amount)}</p>
                      <p className="text-xs text-slate-500">{structure.category || 'General'} · {structure.frequency} · {year?.name || 'Year not set'} · {program?.name || 'Any class'} · {structure.status}</p>
                    </div>
                    {canManage && (
                      <button type="button" onClick={() => onToggleStructure(structure)} className="text-sm font-bold text-primary">
                        {structure.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {canManage && (
            <form onSubmit={assign} className="grid grid-cols-1 gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 md:grid-cols-2 xl:grid-cols-3">
              <h3 className="text-base font-black md:col-span-2 xl:col-span-3">Assign charges</h3>
              <label className="flex flex-col gap-1 text-sm font-bold">
                Fee structure
                <select className={`${fieldClass} h-10`} value={assignment.structureId} onChange={(event) => setAssignment({ ...assignment, structureId: event.target.value })}>
                  <option value="">Choose structure</option>
                  {activeStructures.map((structure) => <option key={structure.id} value={structure.id}>{structure.name}</option>)}
                </select>
                <FieldError>{assignmentErrors.structure}</FieldError>
              </label>
              <label className="flex flex-col gap-1 text-sm font-bold">
                Assign to
                <select className={`${fieldClass} h-10`} value={assignment.target} onChange={(event) => setAssignment({ ...assignment, target: event.target.value })}>
                  <option value="student">Selected student{selectedStudent ? `: ${selectedStudent.name}` : ''}</option>
                  <option value="class">Entire class</option>
                </select>
                <FieldError>{assignmentErrors.students}</FieldError>
              </label>
              {assignment.target === 'class' && (
                <label className="flex flex-col gap-1 text-sm font-bold">
                  Class
                  <select className={`${fieldClass} h-10`} value={assignment.classId} onChange={(event) => setAssignment({ ...assignment, classId: event.target.value })}>
                    <option value="">Choose class</option>
                    {programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
                  </select>
                </label>
              )}
              <label className="flex flex-col gap-1 text-sm font-bold">
                Billing period
                <input className={`${fieldClass} h-10`} value={assignment.period} onChange={(event) => setAssignment({ ...assignment, period: event.target.value })} placeholder="2026-10" />
                <FieldError>{assignmentErrors.period}</FieldError>
              </label>
              <label className="flex flex-col gap-1 text-sm font-bold">
                Due date
                <input className={`${fieldClass} h-10`} type="date" value={assignment.dueDate} onChange={(event) => setAssignment({ ...assignment, dueDate: event.target.value })} />
                <FieldError>{assignmentErrors.dueDate}</FieldError>
              </label>
              <label className="flex flex-col gap-1 text-sm font-bold">
                Discount
                <input className={`${fieldClass} h-10`} type="number" min="0" step="0.01" value={assignment.discountAmount} onChange={(event) => setAssignment({ ...assignment, discountAmount: event.target.value })} placeholder="0" />
                <FieldError>{assignmentErrors.discountAmount}</FieldError>
              </label>
              <div className="md:col-span-2 xl:col-span-3">
                <button type="submit" disabled={busy} className="h-10 rounded-lg border border-primary px-4 text-sm font-bold text-primary disabled:opacity-50">Assign charges</button>
                <p className="mt-2 text-xs text-slate-500">The same student, fee, and period is saved once. Use a new period to bill it again.</p>
              </div>
            </form>
          )}
        </div>
      )}
    </section>
  );
}
