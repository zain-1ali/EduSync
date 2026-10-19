import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiError } from '../api/getApiError';
import {
  ACCOUNT_ROLE_OPTIONS,
  EDITABLE_MODULES,
  MODULE_DETAILS,
  accessLabel,
  effectiveLevel,
  isFixedAccessAccount,
  linkedUser,
  staffDisplayName,
  staffRoleLabel,
  suggestedAccountRole,
  suggestedUser,
} from './staffModel';

const inputClass =
  'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-800';

export function AccountLinkPanel({ staff, users, usersLoading, usersError, canManageUsers, onInvite, onLink, onUnlink }) {
  const linked = linkedUser(users, staff);
  const suggestion = suggestedUser(users, staff);
  const hasStoredLink = Boolean(staff.linkedUserId || staff.accountEmail);
  const [form, setForm] = useState({
    name: staffDisplayName(staff),
    email: staff.email || '',
    role: suggestedAccountRole(staff.role),
  });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectionTouched, setSelectionTouched] = useState(false);
  const chosenUserId = selectionTouched ? selectedUserId : suggestion?._id || suggestion?.id || '';
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const run = async (action) => {
    setPending(true);
    setError('');
    setMessage('');
    try {
      const result = await action();
      if (typeof result === 'string' && result) setMessage(result);
    } catch (nextError) {
      setError(getApiError(nextError, nextError.message));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-black">Login account</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {staffRoleLabel(staff.role)} is this person's HR job. A login is optional. Roles and permissions belong to the user account, not to the HR record.
        </p>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          School administrator is full account access. It is not granted by the HR role.
        </p>

        {usersLoading && <p className="mt-4 text-sm text-slate-500">Loading login accounts…</p>}
        {usersError && (
          <p role="alert" className="mt-4 text-sm font-semibold text-red-600">
            Login accounts could not be loaded.
            {staff.accountEmail ? ` This record points at ${staff.accountEmail}.` : ' No login is stored on this record.'}
          </p>
        )}

        {linked ? (
          <div className="mt-5 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
            <p className="font-bold">{linked.name}</p>
            <p className="text-sm text-slate-500">
              {linked.email} · {String(linked.role || '').replaceAll('_', ' ')} · {String(linked.status || '').replaceAll('_', ' ')}
            </p>
            {String(linked.staffId || '') === String(staff.id) ? (
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">Linked on the user account</p>
            ) : (
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">Linked on this device</p>
            )}
            {canManageUsers && String(linked.staffId || '') !== String(staff.id) && (
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => onLink(linked))}
                className="mt-3 h-10 rounded-lg border border-slate-300 px-4 text-sm font-bold disabled:opacity-50"
              >
                Save link on the server
              </button>
            )}
            <PermissionSummary user={linked} />
            <div className="mt-4 flex flex-wrap gap-2">
              {canManageUsers && (
                <Link to="/user-management" className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-bold text-white">
                  Manage permissions
                </Link>
              )}
              {canManageUsers && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(onUnlink)}
                  className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-bold disabled:opacity-50"
                >
                  Unlink login
                </button>
              )}
            </div>
          </div>
        ) : hasStoredLink ? (
          <div className="mt-5 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
            <p className="font-bold">{staff.accountEmail || 'Linked login'}</p>
            <p className="mt-1 text-sm text-slate-500">This staff record stores a login link, but that account is not in the loaded list.</p>
            {canManageUsers && (
              <button
                type="button"
                disabled={pending}
                onClick={() => run(onUnlink)}
                className="mt-4 h-10 rounded-lg border border-slate-300 px-4 text-sm font-bold disabled:opacity-50"
              >
                Unlink login
              </button>
            )}
          </div>
        ) : (
          <p className="mt-5 text-sm font-semibold">No login is linked to this staff record.</p>
        )}

        {!canManageUsers && (
          <p className="mt-4 text-sm text-slate-500">Inviting a login or editing permissions requires user-management access.</p>
        )}
        {message && (
          <p role="status" className="mt-4 text-sm font-semibold text-primary">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}
      </section>

      {canManageUsers && !linked && !hasStoredLink && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <form
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            onSubmit={(event) => {
              event.preventDefault();
              const chosen = users.find((user) => (user._id || user.id) === chosenUserId);
              if (!chosen) {
                setError('Choose an existing login to link.');
                return;
              }
              run(() => onLink(chosen));
            }}
          >
            <h3 className="font-black">Link an existing login</h3>
            <label className="mt-4 block space-y-1.5" htmlFor="link-existing-user">
              <span className="text-sm font-semibold">Account</span>
              <select
                id="link-existing-user"
                value={chosenUserId}
                onChange={(event) => {
                  setSelectionTouched(true);
                  setSelectedUserId(event.target.value);
                }}
                className={inputClass}
              >
                <option value="">Select a login</option>
                {users.map((user) => (
                  <option key={user._id || user.id} value={user._id || user.id}>
                    {user.name} · {user.email}
                  </option>
                ))}
              </select>
            </label>
            {suggestion && (
              <p className="mt-3 text-sm text-slate-500">
                {suggestion.name} uses the same email as this staff record. Linking does not change their permissions.
              </p>
            )}
            <button type="submit" disabled={pending || usersLoading} className="mt-4 h-11 rounded-lg bg-primary px-5 font-bold text-white disabled:opacity-50">
              {pending ? 'Linking…' : 'Link login'}
            </button>
          </form>

          <form
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            onSubmit={(event) => {
              event.preventDefault();
              run(() => onInvite(form));
            }}
          >
            <h3 className="font-black">Invite a new login</h3>
            <p className="mt-2 text-sm text-slate-500">
              The invitation uses the account role's default permissions unless an administrator customizes them afterward.
            </p>
            <div className="mt-4 space-y-3">
              <label className="block space-y-1.5" htmlFor="invite-name">
                <span className="text-sm font-semibold">Full name</span>
                <input id="invite-name" required minLength={2} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} />
              </label>
              <label className="block space-y-1.5" htmlFor="invite-email">
                <span className="text-sm font-semibold">Email</span>
                <input id="invite-email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={inputClass} />
              </label>
              <label className="block space-y-1.5" htmlFor="invite-role">
                <span className="text-sm font-semibold">Account role</span>
                <select id="invite-role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className={inputClass}>
                  {ACCOUNT_ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button type="submit" disabled={pending} className="mt-4 h-11 rounded-lg bg-primary px-5 font-bold text-white disabled:opacity-50">
              {pending ? 'Inviting…' : 'Send invitation'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function PermissionSummary({ user }) {
  if (isFixedAccessAccount(user)) {
    return <p className="mt-3 text-sm font-semibold">This account has full school access. Module permissions cannot narrow it.</p>;
  }
  return (
    <ul className="mt-3 grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
      {EDITABLE_MODULES.map((moduleName) => (
        <li key={moduleName} className="flex justify-between gap-3 rounded-md bg-white px-2 py-1 dark:bg-slate-900">
          <span>{MODULE_DETAILS[moduleName]?.label || moduleName}</span>
          <span className="font-bold">{accessLabel(effectiveLevel(user, moduleName))}</span>
        </li>
      ))}
    </ul>
  );
}
