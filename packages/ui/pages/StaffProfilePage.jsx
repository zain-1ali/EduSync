import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ACCESS_LEVELS, MODULES } from '@school/contracts';
import { getApiError } from '../api/getApiError';
import { useInviteUser, useLinkUserStaff, useUsers } from '../api/hooks/useUsers';
import { useAuth } from '../auth/AuthProvider';
import { useLocalCollection } from '../data/useLocalCollection';
import { Layout } from '../Layout';
import { AccountLinkPanel } from '../staff/AccountLinkPanel';
import { EditStaffForm } from '../staff/EditStaffForm';
import { PayrollNotice } from '../staff/PayrollNotice';
import { StatusDialog } from '../staff/StatusDialog';
import { TeachingPanel } from '../staff/TeachingPanel';
import {
  describeAllocations,
  formatDate,
  formatTimestamp,
  linkPatch,
  linkedUser,
  scheduleConflicts,
  staffAllocations,
  staffDisplayName,
  staffInitials,
  staffRoleLabel,
  staffStatusLabel,
  unlinkPatch,
  userKey,
  withStatusChange,
} from '../staff/staffModel';

const TABS = [
  ['personal', 'Personal'],
  ['employment', 'Employment'],
  ['teaching', 'Teaching'],
  ['account', 'Account'],
];

function statusClass(status) {
  if (status === 'active') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
  if (status === 'on_leave') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
  if (status === 'terminated') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
}

function DetailCard({ title, rows }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 text-lg font-bold">{title}</h3>
      <dl className="space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-sm text-slate-500">{label}</dt>
            <dd className="text-right text-sm font-semibold">{value || '—'}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function StaffProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { hasAccess } = useAuth();
  const canManage = hasAccess(MODULES.STAFF, ACCESS_LEVELS.MANAGE);
  const canManageUsers = hasAccess(MODULES.USERS, ACCESS_LEVELS.MANAGE);
  const canAllocate = hasAccess(MODULES.ACADEMICS, ACCESS_LEVELS.MANAGE);
  const staff = useLocalCollection('staff');
  const allocations = useLocalCollection('allocations');
  const subjects = useLocalCollection('subjects');
  const sections = useLocalCollection('sections');
  const programs = useLocalCollection('programs');
  const usersQuery = useUsers();
  const invite = useInviteUser();
  const linkUserStaff = useLinkUserStaff();
  const [tab, setTab] = useState('personal');
  const [statusOpen, setStatusOpen] = useState(false);

  const record = staff.data.find((item) => item.id === id) || null;
  const editing = params.get('edit') === '1' && canManage && Boolean(record);
  const users = usersQuery.data || [];
  const described = describeAllocations(staffAllocations(allocations.data, id), {
    subjects: subjects.data,
    sections: sections.data,
    programs: programs.data,
  });
  const teachingLoading =
    (allocations.isLoading && allocations.data.length === 0) ||
    (subjects.isLoading && subjects.data.length === 0) ||
    !allocations.repository;
  const teachingError = allocations.error?.message || subjects.error?.message || '';

  const leave = () => {
    if (editing && !window.confirm('Discard unsaved staff changes?')) return;
    navigate('/staff');
  };

  const saveDetails = async (draft) => {
    await staff.update(record.id, draft);
    setParams({});
  };

  const saveStatus = async (status, note) => {
    await staff.update(record.id, withStatusChange(record, status, note));
    setStatusOpen(false);
  };

  const releaseOtherLinks = async (account) => {
    const key = userKey(account);
    const others = staff.data.filter((item) => item.linkedUserId === key && item.id !== record.id);
    for (const other of others) {
      await staff.update(other.id, unlinkPatch());
    }
  };

  const rememberLink = async (account) => {
    await releaseOtherLinks(account);
    await staff.update(record.id, linkPatch(account));
  };

  const onInvite = async (form) => {
    const synced = record.syncStatus === 'synced';
    const result = await invite.mutateAsync({
      name: form.name,
      email: form.email,
      role: form.role,
      permissions: {},
      ...(synced ? { staffId: record.id } : {}),
    });
    const account = result.data?.user;
    if (!userKey(account)) throw new Error('The invitation did not return an account id, so it was not linked.');
    try {
      await rememberLink(account);
    } catch (error) {
      throw new Error(`The login was created, but it could not be linked on this staff record. ${error.message}`);
    }
    const deliveryFailed = result.data?.invitation?.status === 'failed';
    const delivery = deliveryFailed
      ? 'The login was created, but the invitation email could not be sent.'
      : 'Invitation sent and linked on this staff record.';
    return synced ? delivery : `${delivery} Save the link on the server after this staff record syncs.`;
  };

  const onLink = async (account) => {
    let serverNote = '';
    try {
      await linkUserStaff.mutateAsync({ userId: userKey(account), staffId: record.id });
    } catch (error) {
      if (error?.response?.data?.error?.code === 'STAFF_ACCOUNT_EXISTS') throw error;
      serverNote = getApiError(error);
    }
    await rememberLink(account);
    if (serverNote) return `Linked on this device. The server did not store it yet: ${serverNote}`;
    return 'Login linked to this staff record.';
  };

  const onUnlink = async () => {
    const account = linkedUser(users, record);
    if (account) await linkUserStaff.mutateAsync({ userId: userKey(account), staffId: null });
    await staff.update(record.id, unlinkPatch());
    return 'Login unlinked. The user account was not deleted.';
  };

  let body;
  if (!staff.repository) {
    body = <p className="p-12 text-center text-slate-500">Staff records are unavailable until you are signed in to a school.</p>;
  } else if (staff.isLoading && !record) {
    body = (
      <p className="p-12 text-center text-slate-500" role="status">
        Loading staff profile…
      </p>
    );
  } else if (staff.error && !record) {
    body = (
      <div className="p-12 text-center" role="alert">
        <p className="font-semibold text-red-600">{staff.error.message}</p>
        <button type="button" onClick={staff.refresh} className="mt-3 font-bold text-primary">
          Try again
        </button>
      </div>
    );
  } else if (!record) {
    body = (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-black">Staff member not found</h1>
        <p className="mt-2 text-slate-500">This record is not in the local directory.</p>
        <Link to="/staff" className="mt-4 inline-flex font-bold text-primary">
          Back to directory
        </Link>
      </div>
    );
  } else {
    const name = staffDisplayName(record);
    const emergency = [record.emergencyContactName, record.emergencyContactRelationship, record.emergencyContactPhone]
      .filter(Boolean)
      .join(' · ');
    body = (
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-8 p-6 lg:p-10">
        <button type="button" onClick={leave} className="self-start text-sm font-bold text-primary">
          Back to directory
        </button>
        <header className="flex flex-col items-start justify-between gap-6 border-b border-slate-200 pb-6 dark:border-slate-800 lg:flex-row lg:items-end">
          <div className="flex items-center gap-6">
            {record.photoDataUrl ? (
              <img src={record.photoDataUrl} alt="" className="h-24 w-24 rounded-xl border border-slate-200 object-cover dark:border-slate-800" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-primary/10 text-2xl font-black text-primary">{staffInitials(record)}</div>
            )}
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight">{name}</h1>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                  {staffRoleLabel(record.role)}
                </span>
                <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${statusClass(record.status)}`}>
                  {staffStatusLabel(record.status)}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500">
                {record.employeeId || 'No employee ID'} · Joined {formatDate(record.joinedOn)} · {record.campus || 'Campus not set'} · Sync {record.syncStatus || 'local'}
              </p>
            </div>
          </div>
          {canManage && !editing && (
            <div className="flex w-full gap-3 lg:w-auto">
              <button type="button" onClick={() => setParams({ edit: '1' })} className="h-11 flex-1 rounded-lg bg-primary px-4 font-bold text-white lg:flex-none">
                Edit details
              </button>
              <button type="button" onClick={() => setStatusOpen(true)} className="h-11 flex-1 rounded-lg border border-slate-300 px-4 font-bold lg:flex-none">
                Update status
              </button>
            </div>
          )}
        </header>

        {editing ? (
          <EditStaffForm key={record.id} record={record} records={staff.data} onCancel={() => setParams({})} onSubmit={saveDetails} />
        ) : (
          <>
            <div role="tablist" aria-label="Staff profile sections" className="flex gap-6 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
              {TABS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  id={`staff-tab-${value}`}
                  aria-selected={tab === value}
                  aria-controls={`staff-panel-${value}`}
                  tabIndex={tab === value ? 0 : -1}
                  onClick={() => setTab(value)}
                  onKeyDown={(event) => {
                    const index = TABS.findIndex(([item]) => item === tab);
                    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
                    event.preventDefault();
                    const next = event.key === 'ArrowRight' ? (index + 1) % TABS.length : (index - 1 + TABS.length) % TABS.length;
                    setTab(TABS[next][0]);
                    event.currentTarget.parentElement?.querySelectorAll('[role="tab"]')[next]?.focus();
                  }}
                  className={`pb-3 text-sm font-bold ${tab === value ? 'border-b-2 border-primary text-primary' : 'text-slate-500'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div role="tabpanel" id="staff-panel-personal" aria-labelledby="staff-tab-personal" hidden={tab !== 'personal'}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <DetailCard
                  title="Personal information"
                  rows={[
                    ['Full name', name],
                    ['Date of birth', formatDate(record.dateOfBirth)],
                    ['Email', record.email],
                    ['Phone', record.phone],
                    ['Address', record.address],
                    ['Emergency contact', emergency],
                  ]}
                />
                <PayrollNotice />
              </div>
            </div>

            <div role="tabpanel" id="staff-panel-employment" aria-labelledby="staff-tab-employment" hidden={tab !== 'employment'}>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <DetailCard
                  title="Employment"
                  rows={[
                    ['HR role', staffRoleLabel(record.role)],
                    ['Contract', record.contractType],
                    ['Joined', formatDate(record.joinedOn)],
                    ['Campus', record.campus],
                    ['Highest education', record.highestEducation],
                    ['Specialization', record.specialization],
                  ]}
                />
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="mb-4 text-lg font-bold">Status history</h3>
                  {Array.isArray(record.statusHistory) && record.statusHistory.length > 0 ? (
                    <ol className="space-y-3">
                      {[...record.statusHistory].reverse().map((entry, index) => (
                        <li key={`${entry.at}-${index}`} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                          <p className="font-bold">{staffStatusLabel(entry.status)}</p>
                          <p className="text-sm text-slate-500">{entry.note || 'No reason recorded'}</p>
                          <p className="text-xs text-slate-400">{formatTimestamp(entry.at)}</p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-sm text-slate-500">No status changes are recorded.</p>
                  )}
                </section>
              </div>
            </div>

            <div role="tabpanel" id="staff-panel-teaching" aria-labelledby="staff-tab-teaching" hidden={tab !== 'teaching'}>
              <TeachingPanel
                items={described}
                isLoading={teachingLoading}
                error={teachingError}
                canAllocate={canAllocate}
                conflicts={scheduleConflicts(described)}
              />
            </div>

            <div role="tabpanel" id="staff-panel-account" aria-labelledby="staff-tab-account" hidden={tab !== 'account'}>
              <AccountLinkPanel
                key={record.id}
                staff={record}
                users={users}
                usersLoading={usersQuery.isLoading}
                usersError={usersQuery.isError}
                canManageUsers={canManageUsers}
                onInvite={onInvite}
                onLink={onLink}
                onUnlink={onUnlink}
              />
              {linkedUser(users, record) && canManageUsers && (
                <p className="mt-4 text-sm text-slate-500">Open user management to change module permissions for the linked login.</p>
              )}
            </div>
          </>
        )}
        {statusOpen && <StatusDialog staff={record} onClose={() => setStatusOpen(false)} onConfirm={saveStatus} />}
      </div>
    );
  }

  return <Layout title="Staff Profile">{body}</Layout>;
}
