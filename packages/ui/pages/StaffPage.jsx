import { useState } from 'react';
import { getApiError } from '../api/getApiError';
import {
  useInviteUser,
  useLinkUserStaff,
  useRevokeUserSessions,
  useUpdatePermissions,
  useUpdateUserStatus,
  useUsers,
} from '../api/hooks/useUsers';
import { useAuth } from '../auth/AuthProvider';
import { useLocalCollection } from '../data/useLocalCollection';
import { Layout } from '../Layout';
import { PermissionsPanel } from '../staff/PermissionsPanel';
import { ReasonDialog } from '../staff/StatusDialog';
import { StaffList } from '../staff/StaffList';
import { ACCOUNT_ROLE_OPTIONS, linkPatch, staffDisplayName, unlinkPatch, userKey } from '../staff/staffModel';

function InviteUserForm({ staffOptions, onClose, onInvite }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'support_staff', staffId: '' });
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setPending(true);
    setMessage('');
    try {
      const result = await onInvite(form);
      setMessage(result);
    } catch (error) {
      setMessage(getApiError(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-primary/20 bg-primary/5 p-5 md:grid-cols-4">
      <label className="space-y-1 text-sm font-semibold">
        Full name
        <input required minLength={2} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-medium dark:bg-slate-900" />
      </label>
      <label className="space-y-1 text-sm font-semibold">
        Email
        <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-medium dark:bg-slate-900" />
      </label>
      <label className="space-y-1 text-sm font-semibold">
        Account role
        <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="mt-1 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-medium dark:bg-slate-900">
          {ACCOUNT_ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-sm font-semibold">
        Link staff record
        <select value={form.staffId} onChange={(event) => setForm({ ...form, staffId: event.target.value })} className="mt-1 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-medium dark:bg-slate-900">
          <option value="">Do not link</option>
          {staffOptions.map((member) => (
            <option key={member.id} value={member.id}>
              {staffDisplayName(member)}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-2 md:col-span-4">
        <button type="submit" disabled={pending} className="h-11 rounded-lg bg-primary px-5 font-bold text-white disabled:opacity-50">
          {pending ? 'Inviting…' : 'Send invitation'}
        </button>
        <button type="button" onClick={onClose} className="h-11 rounded-lg border border-slate-300 px-4 font-bold">
          Cancel
        </button>
      </div>
      <p className="text-sm text-slate-500 md:col-span-4">
        The account role chooses default permissions. It does not change the person's HR job role.
      </p>
      {message && (
        <p className="text-sm font-semibold md:col-span-4" role="status">
          {message}
        </p>
      )}
    </form>
  );
}

export function StaffPage() {
  const { user: currentUser } = useAuth();
  const usersQuery = useUsers();
  const staff = useLocalCollection('staff');
  const invite = useInviteUser();
  const updatePermissions = useUpdatePermissions();
  const updateStatus = useUpdateUserStatus();
  const revokeSessions = useRevokeUserSessions();
  const linkUserStaff = useLinkUserStaff();
  const users = usersQuery.data || [];
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [message, setMessage] = useState('');
  const [dirty, setDirty] = useState(false);
  const [reasonAction, setReasonAction] = useState(null);
  const [linkPending, setLinkPending] = useState(false);

  const filtered = users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase()));
  const explicit = users.find((user) => userKey(user) === selectedId);
  const selected = explicit || (selectedId ? null : filtered[0]) || null;
  const linkedStaff = selected
    ? staff.data.find((item) => item.linkedUserId === userKey(selected) || item.id === selected.staffId) || null
    : null;

  const choose = (id) => {
    if (dirty && !window.confirm('You have unsaved permission changes. Discard them?')) return;
    setSelectedId(id);
    setDirty(false);
    setMessage('');
  };

  const sendInvite = async (form) => {
    const member = staff.data.find((item) => item.id === form.staffId);
    const synced = member?.syncStatus === 'synced';
    const result = await invite.mutateAsync({
      name: form.name,
      email: form.email,
      role: form.role,
      permissions: {},
      ...(form.staffId && synced ? { staffId: form.staffId } : {}),
    });
    const account = result.data?.user;
    if (form.staffId) {
      if (!userKey(account)) {
        throw new Error('The login was created, but it did not include an id, so the staff record was not linked.');
      }
      try {
        const others = staff.data.filter((item) => item.linkedUserId === userKey(account) && item.id !== form.staffId);
        for (const other of others) await staff.update(other.id, unlinkPatch());
        await staff.update(form.staffId, linkPatch(account));
      } catch (error) {
        throw new Error(`The login was created, but it could not be linked to the staff record. ${error.message}`);
      }
    }
    const delivery = result.data?.invitation?.status === 'failed'
      ? 'User created, but invitation delivery failed.'
      : 'Invitation sent.';
    if (form.staffId && !synced) return `${delivery} The staff link is on this device until that record syncs.`;
    return form.staffId ? `${delivery} The staff record is linked.` : delivery;
  };

  const linkStaff = async (staffId) => {
    if (!selected) return;
    const account = selected;
    setLinkPending(true);
    setMessage('');
    try {
      const previous = staff.data.filter((item) => item.linkedUserId === userKey(account) || item.id === account.staffId);
      let serverNote = '';
      try {
        await linkUserStaff.mutateAsync({ userId: userKey(account), staffId: staffId || null });
      } catch (error) {
        if (error?.response?.data?.error?.code === 'STAFF_ACCOUNT_EXISTS') throw error;
        serverNote = getApiError(error);
      }
      for (const item of previous) {
        if (item.id !== staffId) await staff.update(item.id, unlinkPatch());
      }
      if (staffId) await staff.update(staffId, linkPatch(account));
      const localMessage = staffId
        ? 'Staff record linked to this account.'
        : previous.length > 0
          ? 'Staff record unlinked. The login was not deleted.'
          : 'No staff record is linked.';
      setMessage(serverNote ? `${localMessage} The server did not store it yet: ${serverNote}` : localMessage);
    } catch (error) {
      setMessage(getApiError(error));
    } finally {
      setLinkPending(false);
    }
  };

  return (
    <Layout title="User Management">
      <div className="mx-auto w-full max-w-[1400px] p-6 md:p-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-3xl font-black">Users and permissions</h1>
            <p className="text-slate-500">Invite school logins, link them to staff records, and set module access.</p>
          </div>
          <button type="button" onClick={() => setShowInvite(true)} className="h-11 rounded-lg bg-primary px-5 font-bold text-white">
            Invite user
          </button>
        </div>
        {showInvite && <InviteUserForm staffOptions={staff.data} onClose={() => setShowInvite(false)} onInvite={sendInvite} />}
        <div className="flex flex-col items-start gap-6 lg:flex-row">
          <StaffList
            users={filtered}
            selectedId={selected ? userKey(selected) : ''}
            onSelect={choose}
            query={query}
            onQueryChange={setQuery}
            isLoading={usersQuery.isLoading}
            isError={usersQuery.isError}
            errorMessage={usersQuery.error ? getApiError(usersQuery.error) : ''}
            onInvite={() => setShowInvite(true)}
            onRetry={() => usersQuery.refetch()}
          />
          {selected ? (
            <PermissionsPanel
              key={userKey(selected)}
              user={selected}
              message={message}
              isSaving={updatePermissions.isPending}
              isRevoking={revokeSessions.isPending}
              isSelf={userKey(currentUser) === userKey(selected)}
              staffOptions={staff.data}
              linkedStaffId={linkedStaff?.id || ''}
              staffUnavailable={!staff.repository}
              linkPending={linkPending}
              onLinkStaff={linkStaff}
              onDirtyChange={setDirty}
              onSave={async (permissions) => {
                try {
                  await updatePermissions.mutateAsync({ userId: userKey(selected), permissions });
                  setMessage('Permissions saved.');
                } catch (error) {
                  setMessage(getApiError(error));
                  throw error;
                }
              }}
              onRevokeSessions={async () => {
                try {
                  const result = await revokeSessions.mutateAsync(userKey(selected));
                  setMessage(`${result.count} session(s) revoked.`);
                } catch (error) {
                  setMessage(getApiError(error));
                }
              }}
              onChangeStatus={() =>
                setReasonAction({
                  userId: userKey(selected),
                  status: selected.status === 'active' ? 'locked' : 'active',
                  name: selected.name,
                })
              }
            />
          ) : (
            <div className="flex-1 rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
              {usersQuery.isLoading ? 'Loading users…' : 'Select a user to manage access.'}
            </div>
          )}
        </div>
      </div>
      {reasonAction && (
        <ReasonDialog
          title={reasonAction.status === 'locked' ? `Lock ${reasonAction.name}?` : `Activate ${reasonAction.name}?`}
          description="Active sessions end when an account is locked or disabled. The reason is stored in the audit history."
          confirmLabel={reasonAction.status === 'locked' ? 'Lock account' : 'Activate account'}
          onClose={() => setReasonAction(null)}
          onConfirm={async (reason) => {
            try {
              await updateStatus.mutateAsync({
                userId: reasonAction.userId,
                status: reasonAction.status,
                reason,
              });
              setMessage(`Account marked ${reasonAction.status}.`);
              setReasonAction(null);
            } catch (error) {
              throw new Error(getApiError(error));
            }
          }}
        />
      )}
    </Layout>
  );
}
