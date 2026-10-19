import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ACCESS_LEVELS, MODULES } from '@school/contracts';
import { useAuth } from '../auth/AuthProvider';
import { AddStaffDrawer } from '../components/staff/AddStaffDrawer';
import { useLocalCollection } from '../data/useLocalCollection';
import { Layout } from '../Layout';
import { StatusDialog } from '../staff/StatusDialog';
import {
  STAFF_ROLE_OPTIONS,
  STAFF_STATUS_OPTIONS,
  filterStaff,
  staffDisplayName,
  staffInitials,
  staffMetrics,
  staffRoleLabel,
  staffStatusLabel,
  withStatusChange,
} from '../staff/staffModel';

const PAGE_SIZE = 8;

function statusClass(status) {
  if (status === 'active') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
  if (status === 'on_leave') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
  if (status === 'terminated') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
}

export function StaffDirectoryPage() {
  const { hasAccess } = useAuth();
  const canManage = hasAccess(MODULES.STAFF, ACCESS_LEVELS.MANAGE);
  const staff = useLocalCollection('staff');
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);

  const metrics = staffMetrics(staff.data);
  const filtered = useMemo(() => filterStaff(staff.data, { query, role, status }), [staff.data, query, role, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE) || 1);
  const safePage = Math.min(page, pageCount);
  const start = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);
  const pendingSync = staff.data.filter((item) => item.syncStatus === 'pending').length;
  const filtersActive = Boolean(query || role || status);

  const changeStatus = async (nextStatus, note) => {
    await staff.update(statusTarget.id, withStatusChange(statusTarget, nextStatus, note));
    setStatusTarget(null);
  };

  return (
    <Layout title="Staff Directory">
      <div className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-10">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="mb-2 text-4xl font-black tracking-tight">Staff directory</h1>
            <p className="font-medium text-slate-500">HR records for administrators, instructors, and support staff. Logins are managed separately.</p>
            <p className="mt-1 text-sm text-slate-500">{pendingSync} staff change(s) waiting to sync.</p>
          </div>
          {canManage && (
            <button type="button" onClick={() => setAdding(true)} className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-white shadow-md">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                person_add
              </span>
              Add new staff
            </button>
          )}
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            ['Total staff', metrics.totalStaff, 'groups'],
            ['Active instructors', metrics.activeInstructors, 'school'],
            ['On leave', metrics.onLeaveCount, 'event_busy'],
          ].map(([label, value, icon]) => (
            <div key={label} className="flex items-center gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <span className="material-symbols-outlined text-3xl" aria-hidden="true">
                  {icon}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
                <span className="text-2xl font-black">{staff.isLoading && staff.data.length === 0 ? '—' : value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center">
          <div className="w-full md:flex-1">
            <label className="sr-only" htmlFor="staff-search">
              Search staff by name, ID, or email
            </label>
            <input
              id="staff-search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name, ID, or email"
              className="h-11 w-full rounded-lg bg-slate-50 px-4 font-medium outline-none focus:ring-2 focus:ring-primary/50 dark:bg-slate-800"
            />
          </div>
          <label className="sr-only" htmlFor="staff-role-filter">
            Filter by HR role
          </label>
          <select
            id="staff-role-filter"
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setPage(1);
            }}
            className="h-11 rounded-lg bg-slate-50 px-4 font-semibold dark:bg-slate-800"
          >
            <option value="">All HR roles</option>
            {STAFF_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="staff-status-filter">
            Filter by status
          </label>
          <select
            id="staff-status-filter"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="h-11 rounded-lg bg-slate-50 px-4 font-semibold dark:bg-slate-800"
          >
            <option value="">All statuses</option>
            {STAFF_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {!staff.repository ? (
            <p className="p-12 text-center text-slate-500">Staff records are unavailable until you are signed in to a school.</p>
          ) : staff.isLoading && staff.data.length === 0 ? (
            <p className="p-12 text-center text-slate-500" role="status">
              Loading staff records…
            </p>
          ) : staff.error && staff.data.length === 0 ? (
            <div className="p-12 text-center" role="alert">
              <p className="font-semibold text-red-600">{staff.error.message}</p>
              <button type="button" onClick={staff.refresh} className="mt-3 font-bold text-primary">
                Try again
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-bold">{filtersActive ? 'No staff members match these filters.' : 'No staff records yet.'}</p>
              <p className="mt-1 text-sm text-slate-500">
                {filtersActive ? 'Clear a filter or search for a different name.' : 'Add a staff member to start the directory.'}
              </p>
              {!filtersActive && canManage && (
                <button type="button" onClick={() => setAdding(true)} className="mt-4 h-11 rounded-lg bg-primary px-5 font-bold text-white">
                  Add new staff
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <caption className="sr-only">Staff directory</caption>
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    {['Employee', 'ID', 'HR role', 'Contact', 'Status', 'Sync', 'Actions'].map((heading) => (
                      <th key={heading} scope="col" className="border-b border-slate-200 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:border-slate-800">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {visible.map((member) => {
                    const name = staffDisplayName(member);
                    return (
                      <tr key={member.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                              {staffInitials(member)}
                            </div>
                            <div>
                              <Link to={`/staff/${member.id}`} className="block font-bold hover:text-primary">
                                {name}
                              </Link>
                              <span className="block text-xs text-slate-500">{member.specialization || member.highestEducation || 'Staff'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm font-bold">{member.employeeId || '—'}</td>
                        <td className="px-6 py-4 text-sm font-semibold">{staffRoleLabel(member.role)}</td>
                        <td className="px-6 py-4 text-xs">
                          <span className="block font-medium">{member.email || '—'}</span>
                          <span className="block text-slate-500">{member.phone || '—'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${statusClass(member.status)}`}>
                            {staffStatusLabel(member.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-black uppercase text-slate-500">{member.syncStatus || 'local'}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Link to={`/staff/${member.id}`} className="rounded-lg px-3 py-2 text-sm font-bold text-primary" aria-label={`View ${name}`}>
                              View
                            </Link>
                            {canManage && (
                              <Link to={`/staff/${member.id}?edit=1`} className="rounded-lg px-3 py-2 text-sm font-bold" aria-label={`Edit ${name}`}>
                                Edit
                              </Link>
                            )}
                            {canManage && (
                              <button type="button" onClick={() => setStatusTarget(member)} className="rounded-lg px-3 py-2 text-sm font-bold" aria-label={`Update status for ${name}`}>
                                Status
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <footer className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row">
            <span className="text-xs font-medium text-slate-500">
              Showing {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button type="button" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} aria-label="Previous page" className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-bold disabled:opacity-40 dark:border-slate-700">
                Previous
              </button>
              <span className="text-sm font-bold">
                {safePage} / {pageCount}
              </span>
              <button type="button" disabled={safePage >= pageCount} onClick={() => setPage(safePage + 1)} aria-label="Next page" className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-bold disabled:opacity-40 dark:border-slate-700">
                Next
              </button>
            </div>
          </footer>
        </div>
      </div>
      {adding && <AddStaffDrawer onClose={() => setAdding(false)} />}
      {statusTarget && <StatusDialog staff={statusTarget} onClose={() => setStatusTarget(null)} onConfirm={changeStatus} />}
    </Layout>
  );
}
