import { ACCESS_LEVELS, MODULES } from '@school/contracts';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  SyncBanners,
  fieldClass,
} from '../components/fees/FinanceStates';
import {
  buildCharge,
  classFeeHeads,
  feeHeadTotals,
  formatMoney,
  monthDueDate,
  monthPeriod,
  readSchoolProfile,
  relativeTime,
  validateClassFeeHeads,
} from '../components/fees/ledger';
import { useLocalData } from '../data/LocalDataProvider';
import { useLocalCollection } from '../data/useLocalCollection';
import { Layout } from '../Layout';

function newHead() {
  return { key: globalThis.crypto.randomUUID(), id: '', name: '', amount: '' };
}

function headSignature(heads) {
  return JSON.stringify(heads.map((head) => ({ id: head.id || '', name: head.name, amount: String(head.amount) })));
}

export function FeeConfigurationPage() {
  const { hasAccess } = useAuth();
  const local = useLocalData();
  const structures = useLocalCollection('feeStructures');
  const students = useLocalCollection('students');
  const charges = useLocalCollection('charges');
  const programs = useLocalCollection('programs');
  const sections = useLocalCollection('sections');
  const years = useLocalCollection('academicYears');
  const settings = useLocalCollection('settings');
  const canManage = hasAccess(MODULES.FEES, ACCESS_LEVELS.MANAGE);
  const currency = readSchoolProfile(settings.data).currency || 'USD';

  const classes = useMemo(
    () => programs.data.filter((item) => !item.deletedAt && item.status !== 'archived').sort((left, right) => left.name.localeCompare(right.name)),
    [programs.data]
  );
  const [classId, setClassId] = useState('');
  const [draft, setDraft] = useState([]);
  const [savedSignature, setSavedSignature] = useState('[]');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [copyFromId, setCopyFromId] = useState('');
  const [pendingClassId, setPendingClassId] = useState('');

  const selected = classes.find((item) => item.id === classId) || null;
  const savedHeads = useMemo(() => classFeeHeads(structures.data, classId), [structures.data, classId]);
  const savedKey = headSignature(savedHeads);
  const dirty = headSignature(draft) !== savedSignature;
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;
  const totals = feeHeadTotals(draft);
  const sectionCount = sections.data.filter((item) => !item.deletedAt && item.programId === classId).length;
  const year = years.data.find((item) => item.id === selected?.academicYearId);
  const groups = useMemo(() => {
    const buckets = new Map();
    for (const item of classes) {
      const label = years.data.find((entry) => entry.id === item.academicYearId)?.name || 'Classes';
      buckets.set(label, [...(buckets.get(label) || []), item]);
    }
    return [...buckets.entries()];
  }, [classes, years.data]);
  const copySources = classes.filter((item) => item.id !== classId && classFeeHeads(structures.data, item.id).length > 0);

  useEffect(() => {
    if (!classId && classes.length) setClassId(classes[0].id);
    if (classId && !classes.some((item) => item.id === classId)) setClassId(classes[0]?.id || '');
  }, [classes, classId]);

  useEffect(() => {
    if (dirtyRef.current) return;
    const next = savedHeads.map((head) => ({ ...head, key: head.id || globalThis.crypto.randomUUID() }));
    setDraft(next);
    setSavedSignature(headSignature(next));
    setErrors({});
    setCopyOpen(false);
  }, [classId, savedKey, savedHeads]);

  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const chooseClass = (nextId) => {
    if (nextId === classId) return;
    if (dirty) {
      setPendingClassId(nextId);
      return;
    }
    setMessage('');
    setClassId(nextId);
  };

  const updateHead = (key, patch) => {
    setDraft((current) => current.map((head) => (head.key === key ? { ...head, ...patch } : head)));
    setErrors({});
  };

  const copyHeads = () => {
    const source = classFeeHeads(structures.data, copyFromId);
    if (!source.length) return;
    setDraft(source.map((head) => ({ ...newHead(), name: head.name, amount: head.amount })));
    setCopyOpen(false);
    setErrors({});
    setMessage('Copied into this class. Save the configuration to keep it.');
  };

  const discard = () => {
    setDraft(savedHeads.map((head) => ({ ...head, key: head.id })));
    setErrors({});
    setMessage('Unsaved fee changes were discarded.');
  };

  const save = async () => {
    if (!canManage || !selected || busy) return;
    const validation = validateClassFeeHeads(draft, { academicYearId: selected.academicYearId });
    setErrors(validation.errors);
    if (!validation.ok) return;
    setBusy(true);
    setMessage('');
    try {
      const kept = new Set(draft.filter((head) => head.id).map((head) => head.id));
      const removed = structures.data.filter(
        (item) => item.classId === selected.id && item.frequency === 'monthly' && item.status === 'active' && !item.deletedAt && !kept.has(item.id)
      );
      const saved = [];
      for (const head of draft) {
        const payload = {
          name: head.name.trim(),
          amount: Number(head.amount),
          academicYearId: selected.academicYearId,
          classId: selected.id,
          className: selected.name,
          frequency: 'monthly',
          status: 'active',
          category: head.name.trim(),
        };
        saved.push(head.id ? await structures.update(head.id, payload) : await structures.create(payload));
      }
      for (const item of removed) await structures.update(item.id, { status: 'inactive' });

      const period = monthPeriod();
      const dueDate = monthDueDate(period);
      const targets = students.data.filter(
        (student) => !student.deletedAt && student.classId === selected.id && student.status !== 'withdrawn' && student.status !== 'graduated'
      );
      const nextDraft = saved.map((item) => ({ key: item.id, id: item.id, name: item.name, amount: String(item.amount) }));
      setDraft(nextDraft);
      setSavedSignature(headSignature(nextDraft));
      let created = 0;
      let unchanged = 0;
      for (const structure of saved) {
        for (const student of targets) {
          const charge = buildCharge({ structure, student, dueDate, discountAmount: 0, period });
          if (charges.data.some((item) => item.idempotencyKey === charge.idempotencyKey && !item.deletedAt)) {
            unchanged += 1;
            continue;
          }
          await charges.create(charge);
          created += 1;
        }
      }
      setMessage(
        targets.length
          ? `Saved ${selected.name}. ${created} new charge(s) for ${period}. ${unchanged} existing charge(s) for this month were left unchanged.`
          : `Saved ${selected.name}. No active students are in this class, so no charges were created.`
      );
    } catch (error) {
      setMessage(error.message || 'The fee configuration could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  if (!local.repositories) {
    return (
      <Layout title="Fee configuration">
        <EmptyState title="School account required" body="Class fees are stored separately for each school. Sign in with a school account to configure them." />
      </Layout>
    );
  }

  const blocked = [programs, structures].find((collection) => collection.error && collection.data.length === 0);
  if (blocked) {
    return (
      <Layout title="Fee configuration">
        <ErrorState message={blocked.error.message} onRetry={() => { programs.refresh(); structures.refresh(); }} />
      </Layout>
    );
  }
  if (programs.isLoading && programs.data.length === 0) {
    return (
      <Layout title="Fee configuration">
        <LoadingState label="Loading classes…" />
      </Layout>
    );
  }

  return (
    <Layout title="Fee configuration">
      <div className="mx-auto flex w-full min-w-0 max-w-[1400px] flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black">Class fee configuration</h1>
            <p className="text-slate-500">Monthly fee heads for each class. Saving bills students who do not already have that charge this month.</p>
          </div>
          <Link to="/fees" className="inline-flex h-10 items-center rounded-lg border border-slate-200 px-4 text-sm font-bold dark:border-slate-700">Open fee ledger</Link>
        </div>
        <SyncBanners status={local.status} />
        {message && <p className="text-sm font-semibold text-primary" role="status">{message}</p>}

        {classes.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <EmptyState
              title="No classes yet"
              body="Add a class in Academics, then come back to set its monthly fees."
              action={<Link to="/academics" className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-bold text-white">Open academics</Link>}
            />
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[15rem_minmax(0,1fr)]">
            <aside className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">school</span>
                <div>
                  <p className="font-black">Grade levels</p>
                  <p className="text-xs text-slate-500">Select a class to configure</p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {groups.map(([label, items]) => (
                  <div key={label}>
                    <p className="mb-2 px-2 text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</p>
                    <ul className="flex flex-col gap-1">
                      {items.map((item) => {
                        const active = item.id === classId;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => chooseClass(item.id)}
                              aria-current={active ? 'true' : undefined}
                              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-bold ${active ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                            >
                              <span className="material-symbols-outlined text-base">school</span>
                              <span className="min-w-0 flex-1 truncate">{item.name}</span>
                              {active && <span className="material-symbols-outlined text-base" aria-hidden="true">edit</span>}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </aside>

            {selected && (
              <div className="flex min-w-0 flex-col gap-4">
                <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="inline-flex items-center gap-1 text-xs font-bold text-primary"><span className="material-symbols-outlined text-sm">verified</span> Configuration mode</p>
                      <h2 className="mt-1 text-2xl font-black">Fee configuration: {selected.name}</h2>
                      <p className="text-sm text-slate-500">
                        Specify monthly billing components for {selected.name}
                        {sectionCount ? ` across ${sectionCount} section${sectionCount === 1 ? '' : 's'}` : ''}.
                        {year ? ` ${year.name}.` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={!canManage || copySources.length === 0}
                      onClick={() => { setCopyFromId(copySources[0]?.id || ''); setCopyOpen(true); }}
                      className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-bold disabled:opacity-50 dark:border-slate-700"
                    >
                      <span className="material-symbols-outlined text-base">content_copy</span>
                      Copy from another class
                    </button>
                  </div>
                  {copyOpen && (
                    <form
                      className="mt-4 flex flex-col gap-3 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-end dark:bg-slate-800"
                      onSubmit={(event) => { event.preventDefault(); copyHeads(); }}
                    >
                      <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-bold">
                        Source class
                        <select className={`${fieldClass} h-10`} value={copyFromId} onChange={(event) => setCopyFromId(event.target.value)}>
                          {copySources.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                      </label>
                      <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-white">Copy heads</button>
                      <button type="button" onClick={() => setCopyOpen(false)} className="h-10 rounded-lg px-4 text-sm font-bold">Cancel</button>
                    </form>
                  )}
                </section>

                <div className="grid min-w-0 grid-cols-1 items-start gap-4 2xl:grid-cols-[minmax(0,1fr)_18rem]">
                  <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500 dark:bg-slate-800/60">
                          <tr>
                            <th className="px-4 py-3">Fee head name</th>
                            <th className="px-4 py-3">Monthly amount</th>
                            <th className="px-4 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {draft.length === 0 && (
                            <tr>
                              <td colSpan={3} className="px-4 py-8 text-center text-slate-500">No fee heads for this class yet.</td>
                            </tr>
                          )}
                          {draft.map((head, index) => (
                            <tr key={head.key}>
                              <td className="px-4 py-3">
                                <input
                                  aria-label={`Fee head name ${index + 1}`}
                                  disabled={!canManage}
                                  value={head.name}
                                  onChange={(event) => updateHead(head.key, { name: event.target.value })}
                                  className={`${fieldClass} h-11`}
                                  placeholder="Tuition Fee"
                                />
                                {errors[index]?.name && <p className="mt-1 text-xs font-semibold text-rose-600" role="alert">{errors[index].name}</p>}
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  aria-label={`Monthly amount ${index + 1}`}
                                  disabled={!canManage}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={head.amount}
                                  onChange={(event) => updateHead(head.key, { amount: event.target.value })}
                                  className={`${fieldClass} h-11`}
                                />
                                {errors[index]?.amount && <p className="mt-1 text-xs font-semibold text-rose-600" role="alert">{errors[index].amount}</p>}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  disabled={!canManage}
                                  aria-label={`Remove ${head.name || 'fee head'}`}
                                  onClick={() => setDraft((current) => current.filter((item) => item.key !== head.key))}
                                  className="inline-flex size-10 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                                >
                                  <span className="material-symbols-outlined">delete</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {canManage && (
                      <button type="button" onClick={() => setDraft((current) => [...current, newHead()])} className="flex items-center gap-2 px-4 py-4 text-sm font-bold text-primary">
                        <span className="material-symbols-outlined text-base">add_circle</span>
                        Add new fee head
                      </button>
                    )}
                  </section>

                  <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                    <section className="rounded-xl bg-primary p-5 text-white shadow-sm">
                      <p className="text-sm font-semibold text-white/80">Total monthly fee</p>
                      <p className="mt-1 text-4xl font-black">{formatMoney(totals.monthly, currency)}</p>
                      <p className="mt-2 text-xs text-white/80">Automatically calculated from the active fee heads.</p>
                      <div className="mt-5 flex items-center justify-between border-t border-white/20 pt-4 text-sm">
                        <span className="font-bold tracking-wide">Annual total</span>
                        <span className="text-xl font-black">{formatMoney(totals.annual, currency)}</span>
                      </div>
                    </section>
                    <section className="rounded-xl border border-slate-200 bg-white p-5 text-sm dark:border-slate-800 dark:bg-slate-900">
                      <p className="mb-3 flex items-center gap-2 font-black"><span className="material-symbols-outlined text-base text-primary">info</span> Fee breakdown info</p>
                      <ul className="flex flex-col gap-3 text-slate-600 dark:text-slate-300">
                        <li>Changes made here apply to active students in {selected.name}{sectionCount ? ' across its sections' : ''}.</li>
                        <li>Existing charges for {monthPeriod()} are not changed when you save a new amount.</li>
                        <li>{local.status.online === false ? 'This device is offline. The configuration is stored locally.' : `Last sync ${relativeTime(local.status.lastSyncAt)}.`} Annual total is 12 times the monthly total.</li>
                      </ul>
                    </section>
                    <Link to="/legal/support" className="rounded-xl bg-slate-900 px-5 py-4 text-sm font-bold text-white">Need assistance?</Link>
                  </div>
                </div>

                {errors.form && <p className="text-sm font-semibold text-rose-600" role="alert">{errors.form}</p>}
                {!canManage && <p className="text-sm text-slate-500">Fee configuration is read-only for your account.</p>}
                <div className="flex flex-wrap justify-end gap-3">
                  <button type="button" onClick={discard} disabled={!canManage || !dirty || busy} className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-bold disabled:opacity-40 dark:border-slate-700">Discard changes</button>
                  <button type="button" onClick={save} disabled={!canManage || !dirty || busy} className="h-11 rounded-lg bg-primary px-5 text-sm font-bold text-white disabled:opacity-40">{busy ? 'Saving…' : 'Save configuration'}</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {pendingClassId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-labelledby="discard-class-title">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h2 id="discard-class-title" className="text-lg font-black">Discard unsaved fees?</h2>
            <p className="mt-2 text-sm text-slate-500">This class has fee changes that have not been saved.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setPendingClassId('')} className="h-10 rounded-lg px-4 text-sm font-bold">Stay</button>
              <button
                type="button"
                onClick={() => {
                  dirtyRef.current = false;
                  setDraft([]);
                  setSavedSignature('[]');
                  setClassId(pendingClassId);
                  setPendingClassId('');
                  setMessage('');
                }}
                className="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-white"
              >
                Discard and switch
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
