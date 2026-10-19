import { ACCESS_LEVELS, MODULES } from '@school/contracts';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, SyncBanners } from '../components/fees/FinanceStates';
import {
  classLabel,
  defaulterNoticeHtml,
  defaulterRows,
  downloadBlob,
  formatDate,
  formatMoney,
  latestTimestamp,
  printHtmlDocument,
  readSchoolProfile,
  relativeTime,
  roundMoney,
  todayISO,
  toCsv,
} from '../components/fees/ledger';
import { useLocalData } from '../data/LocalDataProvider';
import { useLocalCollection } from '../data/useLocalCollection';
import { Layout } from '../Layout';

const FILTER_KEY = 'edusync.defaulterFilters';
const PAGE_SIZE = 8;
const TEMPLATES = [
  { id: 'overdue', label: 'Overdue balance', text: 'Your school fee balance is overdue. Please clear it at the school office.' },
  { id: 'final', label: 'Final notice', text: 'Final notice: outstanding school fees remain unpaid. Please contact the accounts office.' },
];
const emptyFilters = { query: '', academicYearId: '', classIds: [], threshold: '' };

function loadFilters() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(FILTER_KEY) || '');
    if (!parsed || typeof parsed !== 'object') return emptyFilters;
    return {
      query: typeof parsed.query === 'string' ? parsed.query : '',
      academicYearId: typeof parsed.academicYearId === 'string' ? parsed.academicYearId : '',
      classIds: Array.isArray(parsed.classIds) ? parsed.classIds.filter((id) => typeof id === 'string') : [],
      threshold: parsed.threshold === undefined || parsed.threshold === null ? '' : String(parsed.threshold),
    };
  } catch {
    return emptyFilters;
  }
}

export function DefaultersPage() {
  const { user, hasAccess } = useAuth();
  const local = useLocalData();
  const students = useLocalCollection('students');
  const charges = useLocalCollection('charges');
  const payments = useLocalCollection('payments');
  const settings = useLocalCollection('settings');
  const years = useLocalCollection('academicYears');
  const programs = useLocalCollection('programs');
  const notifications = useLocalCollection('notifications');
  const canManage = hasAccess(MODULES.FEES, ACCESS_LEVELS.MANAGE);
  const smsReady = Boolean(import.meta.env.VITE_SMS_PROVIDER);
  const storedFilters = useMemo(() => loadFilters(), []);
  const [draft, setDraft] = useState(storedFilters);
  const [applied, setApplied] = useState(storedFilters);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());
  const [message, setMessage] = useState('');
  const [exportState, setExportState] = useState('idle');
  const [dialog, setDialog] = useState(null);
  const profile = readSchoolProfile(settings.data);
  const currency = profile.currency || 'USD';

  const yearOptions = useMemo(() => {
    const known = new Map(years.data.map((year) => [year.id, year.name]));
    charges.data.forEach((charge) => {
      if (charge.academicYearId && !known.has(charge.academicYearId)) known.set(charge.academicYearId, charge.academicYearId);
    });
    return [...known].map(([id, name]) => ({ id, name }));
  }, [years.data, charges.data]);
  const classOptions = useMemo(() => {
    const known = new Map(programs.data.map((program) => [program.id, program.name]));
    students.data.forEach((student) => {
      if (student.classId && !known.has(student.classId)) known.set(student.classId, student.className || student.classId);
    });
    return [...known].map(([id, name]) => ({ id, name }));
  }, [programs.data, students.data]);
  const rows = useMemo(() => defaulterRows({
    students: students.data,
    charges: charges.data,
    payments: payments.data,
    filters: { ...applied, threshold: applied.threshold === '' ? '' : roundMoney(applied.threshold) },
    today: todayISO(),
  }), [students.data, charges.data, payments.data, applied]);
  const reminders = useMemo(() => notifications.data
    .filter((item) => item.type === 'fee.reminder')
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt))), [notifications.data]);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageIds = visible.map((row) => row.student.id);
  const pageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const outstandingTotal = roundMoney(rows.reduce((sum, row) => sum + row.outstanding, 0));
  const lastSave = latestTimestamp([...charges.data, ...payments.data]);

  const retry = () => {
    students.refresh();
    charges.refresh();
    payments.refresh();
    notifications.refresh();
  };

  const applyFilters = () => {
    setApplied(draft);
    setPage(1);
    sessionStorage.setItem(FILTER_KEY, JSON.stringify(draft));
    setMessage('Filters saved for this session.');
  };

  const clearFilters = () => {
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setPage(1);
    sessionStorage.removeItem(FILTER_KEY);
    setMessage('Filters cleared.');
  };

  const toggleClass = (id) => {
    setDraft((current) => ({
      ...current,
      classIds: current.classIds.includes(id) ? current.classIds.filter((item) => item !== id) : [...current.classIds, id],
    }));
  };

  const togglePage = () => {
    setSelected((current) => {
      const next = new Set(current);
      if (pageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const toggleRow = (id) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const chosenRows = () => (selected.size ? rows.filter((row) => selected.has(row.student.id)) : rows);

  const exportRows = async () => {
    const chosen = chosenRows();
    if (selected.size && chosen.length === 0) {
      setExportState('failed');
      setMessage('None of the selected students match the current filters.');
      return;
    }
    setExportState('working');
    try {
      await Promise.resolve();
      const csv = toCsv([
        ['Student', 'Admission number', 'Class', 'Outstanding', 'Overdue', 'Last payment'],
        ...chosen.map((row) => [row.student.name, row.student.admissionNumber, classLabel(row.student), row.outstanding, row.overdueAmount, row.lastPaymentAt]),
      ]);
      downloadBlob(`fee-defaulters-${todayISO()}.csv`, `\uFEFF${csv}`, 'text/csv;charset=utf-8');
      setExportState('done');
      setMessage(`Exported ${chosen.length} defaulter row(s).`);
    } catch (error) {
      setExportState('failed');
      setMessage(error.message || 'The export failed.');
    }
  };

  const printNotices = () => {
    const chosen = chosenRows();
    if (!chosen.length) {
      setMessage(selected.size ? 'None of the selected students match the current filters.' : 'There are no defaulters to print.');
      return;
    }
    try {
      printHtmlDocument('Fee notices', defaulterNoticeHtml({ school: profile, rows: chosen }));
      setMessage(`Prepared ${chosen.length} notice(s) for printing.`);
    } catch (error) {
      setMessage(error.message || 'The notices could not be printed.');
    }
  };

  const queueReminders = async () => {
    const chosen = rows.filter((row) => selected.has(row.student.id));
    if (!chosen.length) {
      setMessage('Select at least one defaulter in the current list.');
      setDialog(null);
      return;
    }
    let queued = 0;
    const failures = [];
    for (const row of chosen) {
      try {
        await notifications.create({
          type: 'fee.reminder',
          channel: 'sms',
          status: 'queued',
          userId: user?.id || user?._id || '',
          studentId: row.student.id,
          studentName: row.student.name,
          templateId: dialog.templateId,
          message: dialog.message,
          provider: import.meta.env.VITE_SMS_PROVIDER,
        });
        queued += 1;
      } catch (error) {
        failures.push(`${row.student.name}: ${error.message}`);
      }
    }
    setDialog(null);
    setMessage(failures.length
      ? `Queued ${queued} reminder(s). ${failures.length} failed. ${failures[0]}`
      : `Queued ${queued} reminder(s) locally. They stay queued until the SMS provider sends them.`);
  };

  if (!local.repositories) {
    return (
      <Layout title="Fee Defaulters">
        <EmptyState title="School account required" body="Defaulter balances are stored with each school's local ledger." />
      </Layout>
    );
  }

  const blocked = [students, charges, payments].find((collection) => collection.error && collection.data.length === 0);
  if (blocked) {
    return (
      <Layout title="Fee Defaulters">
        <ErrorState message={blocked.error.message} onRetry={retry} />
      </Layout>
    );
  }
  const waiting = [students, charges, payments].every((collection) => collection.isLoading && collection.data.length === 0 && !collection.error);
  if (waiting) {
    return (
      <Layout title="Fee Defaulters">
        <LoadingState label="Loading overdue balances…" />
      </Layout>
    );
  }

  return (
    <Layout title="Fee Defaulters">
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6 p-6 md:p-8">
        <SyncBanners status={local.status} />
        {message && <p className="text-sm font-semibold text-primary" role="status">{message}</p>}
        <div className="flex flex-col items-start gap-8 lg:flex-row">
          <aside className="flex w-full flex-shrink-0 flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-6 lg:w-72">
            <div>
              <h1 className="text-lg font-bold">Filters</h1>
              <p className="text-sm text-slate-500">Saved in this browser session</p>
            </div>
            <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              Search
              <input value={draft.query} onChange={(event) => setDraft({ ...draft, query: event.target.value })} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium normal-case dark:border-slate-700 dark:bg-slate-800" placeholder="Name or admission number" />
            </label>
            <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              Academic year
              <select value={draft.academicYearId} onChange={(event) => setDraft({ ...draft, academicYearId: event.target.value })} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium normal-case dark:border-slate-700 dark:bg-slate-800">
                <option value="">All years</option>
                {yearOptions.map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}
              </select>
            </label>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Class</span>
              <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
                <label className={`flex items-center gap-3 rounded-lg px-3 py-2 ${draft.classIds.length === 0 ? 'bg-primary/10 text-primary' : ''}`}>
                  <input type="checkbox" checked={draft.classIds.length === 0} onChange={() => setDraft({ ...draft, classIds: [] })} />
                  <span className="text-sm font-medium">All classes</span>
                </label>
                {classOptions.length === 0 && <p className="px-3 text-sm text-slate-500">No classes have been set up.</p>}
                {classOptions.map((item) => (
                  <label key={item.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <input type="checkbox" checked={draft.classIds.includes(item.id)} onChange={() => toggleClass(item.id)} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              Outstanding greater than
              <input type="number" min="0" step="1" value={draft.threshold} onChange={(event) => setDraft({ ...draft, threshold: event.target.value })} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium normal-case dark:border-slate-700 dark:bg-slate-800" placeholder="0" />
            </label>
            <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
              <button type="button" onClick={applyFilters} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-white">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Apply filters
              </button>
              <button type="button" onClick={clearFilters} className="py-2 text-xs font-medium text-slate-500 underline">Clear all filters</button>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <div className="flex flex-col justify-between gap-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-4xl font-black">Defaulters list</h1>
                <p className="text-slate-500">Students with at least one overdue charge. Totals follow the applied filters.</p>
              </div>
              <div className="flex gap-4">
                <div className="border-r border-slate-200 pr-6 text-right dark:border-slate-700">
                  <p className="text-xs font-bold uppercase text-slate-500">Total defaulters</p>
                  <p className="text-2xl font-black">{rows.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase text-slate-500">Outstanding total</p>
                  <p className="text-2xl font-black text-rose-600">{formatMoney(outstandingTotal, currency)}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/5 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 px-2">
                <span className="text-sm font-bold text-primary">{selected.size} selected</span>
                <button type="button" onClick={printNotices} className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-bold dark:bg-slate-800">
                  <span className="material-symbols-outlined text-lg">print</span>
                  Print notices
                </button>
                <button type="button" onClick={exportRows} disabled={exportState === 'working'} className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-bold disabled:opacity-50 dark:bg-slate-800">
                  <span className="material-symbols-outlined text-lg">download</span>
                  {exportState === 'working' ? 'Exporting…' : selected.size ? 'Export selected' : 'Export list'}
                </button>
                {selected.size > 0 && (
                  <button type="button" onClick={() => setSelected(new Set())} className="text-sm font-bold text-slate-500">Clear selection</button>
                )}
              </div>
              {smsReady && canManage ? (
                <button type="button" onClick={() => setDialog({ templateId: TEMPLATES[0].id, message: TEMPLATES[0].text })} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">
                  Queue SMS reminder
                </button>
              ) : (
                <p className="max-w-sm px-2 text-xs text-slate-500">
                  {smsReady ? 'You do not have permission to queue reminders.' : 'No SMS provider is configured. Reminders cannot be sent from this device.'}
                </p>
              )}
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {rows.length === 0 ? (
                <EmptyState title="No overdue balances" body="Students appear here when a charge is past its due date and still has a balance. Change the filters if a list was narrowed too far." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50">
                      <tr>
                        <th className="p-4"><input type="checkbox" checked={pageSelected} onChange={togglePage} aria-label="Select students on this page" /></th>
                        <th className="p-4">Admission no.</th>
                        <th>Student</th>
                        <th>Class</th>
                        <th>Total dues</th>
                        <th>Last payment</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {visible.map((row) => (
                        <tr key={row.student.id} className={selected.has(row.student.id) ? 'bg-primary/5' : ''}>
                          <td className="p-4"><input type="checkbox" checked={selected.has(row.student.id)} onChange={() => toggleRow(row.student.id)} aria-label={`Select ${row.student.name}`} /></td>
                          <td className="p-4 font-mono text-sm">{row.student.admissionNumber || '—'}</td>
                          <td className="font-bold">{row.student.name}</td>
                          <td>{classLabel(row.student)}</td>
                          <td className="font-black text-rose-600">{formatMoney(row.outstanding, currency)}</td>
                          <td>{formatDate(row.lastPaymentAt)}</td>
                          <td className="pr-4 text-right"><Link to={`/fees?studentId=${row.student.id}`} className="font-bold text-primary">Open ledger</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <footer className="flex items-center justify-between border-t border-slate-200 p-4 dark:border-slate-800">
                <span className="text-sm text-slate-500">{rows.length === 0 ? 'Showing 0 students' : `Showing ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(rows.length, safePage * PAGE_SIZE)} of ${rows.length}`}</span>
                <div className="flex items-center gap-2">
                  <button type="button" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} className="h-9 rounded border px-3 disabled:opacity-40">Previous</button>
                  <span className="text-sm font-bold">{safePage} / {pageCount}</span>
                  <button type="button" disabled={safePage >= pageCount} onClick={() => setPage(safePage + 1)} className="h-9 rounded border px-3 disabled:opacity-40">Next</button>
                </div>
              </footer>
            </div>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="font-black">Reminder history</h2>
              {!smsReady && <p className="mt-2 text-sm text-slate-500">SMS delivery needs a provider configuration. Queued reminders already stored on this device are listed below.</p>}
              {reminders.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No reminders have been queued on this device.</p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                  {reminders.slice(0, 8).map((reminder) => (
                    <li key={reminder.id} className="py-3 text-sm">
                      <p className="font-bold">{reminder.studentName || 'Student'} · {reminder.status || 'queued'}</p>
                      <p className="text-slate-500">{reminder.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
        <div className="mt-auto flex justify-center pt-4">
          <p className="flex flex-wrap items-center justify-center gap-2 rounded-full bg-slate-200/50 px-4 py-2 text-center text-[10px] font-medium text-slate-500 dark:bg-slate-800/80">
            <span className="material-symbols-outlined text-sm">history</span>
            Last local save: {relativeTime(lastSave)}
            <span className="mx-1 hidden text-slate-300 sm:inline">|</span>
            {local.status.online === false ? 'This device is offline. Changes will sync when the connection returns.' : 'Changes are saved locally and sync in the background.'}
          </p>
        </div>
      </div>
      {dialog && (
        <ConfirmDialog title="Queue SMS reminders?" confirmLabel="Queue reminders" confirmDisabled={!dialog.message?.trim()} onCancel={() => setDialog(null)} onConfirm={queueReminders}>
          <p>{selected.size} selected student(s) will get a locally queued reminder. This does not mark the message as delivered.</p>
          <label className="flex flex-col gap-1 font-bold">
            Template
            <select
              value={dialog.templateId}
              onChange={(event) => {
                const template = TEMPLATES.find((item) => item.id === event.target.value);
                setDialog({ templateId: template.id, message: template.text });
              }}
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 font-medium dark:border-slate-700 dark:bg-slate-800"
            >
              {TEMPLATES.map((template) => <option key={template.id} value={template.id}>{template.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 font-bold">
            Message
            <textarea value={dialog.message} onChange={(event) => setDialog({ ...dialog, message: event.target.value })} className="h-24 rounded-lg border border-slate-200 bg-slate-50 p-3 font-medium dark:border-slate-700 dark:bg-slate-800" />
          </label>
        </ConfirmDialog>
      )}
    </Layout>
  );
}
