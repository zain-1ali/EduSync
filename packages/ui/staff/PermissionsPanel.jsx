import { useState } from 'react';
import { ACCESS_LEVELS } from '@school/contracts';
import {
  EDITABLE_MODULES,
  MODULE_DETAILS,
  accessLabel,
  effectiveLevel,
  formatTimestamp,
  isFixedAccessAccount,
  permissionState,
  staffDisplayName,
  staffRoleLabel,
} from './staffModel';

export function PermissionsPanel({
  user,
  onSave,
  onChangeStatus,
  onRevokeSessions,
  isSaving,
  isRevoking,
  message,
  isSelf,
  staffOptions = [],
  linkedStaffId = '',
  staffUnavailable = false,
  onLinkStaff,
  linkPending = false,
  onDirtyChange,
}) {
  const saved = permissionState(user);
  const [permissions, setPermissions] = useState(saved);
  const fixedAdmin = isFixedAccessAccount(user);
  const dirty = !fixedAdmin && JSON.stringify(permissions) !== JSON.stringify(saved);

  const updateLevel = (moduleName, value) => {
    const next = { ...permissions, [moduleName]: value };
    setPermissions(next);
    onDirtyChange?.(!fixedAdmin && JSON.stringify(next) !== JSON.stringify(saved));
  };

  const reset = () => {
    setPermissions(saved);
    onDirtyChange?.(false);
  };

  const save = async () => {
    try {
      await onSave(permissions);
      onDirtyChange?.(false);
    } catch {
      onDirtyChange?.(true);
    }
  };

  return (
    <section className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 dark:border-slate-800 xl:flex-row xl:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary">{String(user.role || '').replaceAll('_', ' ')}</p>
          <h2 className="text-2xl font-black">{user.name}</h2>
          <p className="text-sm text-slate-500">
            {user.email} · {String(user.status || '').replaceAll('_', ' ')} · Last login {formatTimestamp(user.lastLoginAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRevokeSessions}
            disabled={isRevoking}
            className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-bold disabled:opacity-50 dark:border-slate-700"
          >
            {isRevoking ? 'Revoking…' : 'Revoke sessions'}
          </button>
          <button
            type="button"
            onClick={onChangeStatus}
            disabled={isSelf}
            className="h-10 rounded-lg border border-amber-300 px-4 text-sm font-bold text-amber-700 disabled:opacity-50 dark:text-amber-400"
          >
            {user.status === 'active' ? 'Lock account' : 'Activate account'}
          </button>
        </div>
      </header>

      <div className="space-y-5 p-6">
        {isSelf && <p className="text-sm text-slate-500">You cannot change your own account status.</p>}
        {fixedAdmin ? (
          <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
            School administrators always have full tenant access. These module controls stay at Manage.
          </p>
        ) : (
          <p className="text-sm text-slate-500">
            Choose None, View, or Manage for each module. Saving replaces this account's stored access. Default role access is applied only when the account is invited without custom permissions.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {EDITABLE_MODULES.map((moduleName) => {
            const detail = MODULE_DETAILS[moduleName];
            const selectId = `permission-${user._id || user.id}-${moduleName}`;
            return (
              <div key={moduleName} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <label className="flex items-start justify-between gap-4" htmlFor={selectId}>
                  <span>
                    <span className="block font-bold">{detail?.label || moduleName}</span>
                    <span className="mt-1 block text-xs text-slate-500">{detail?.description}</span>
                  </span>
                  <select
                    id={selectId}
                    value={fixedAdmin ? ACCESS_LEVELS.MANAGE : permissions[moduleName]}
                    disabled={fixedAdmin}
                    onChange={(event) => updateLevel(moduleName, event.target.value)}
                    className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold dark:bg-slate-800"
                  >
                    {Object.values(ACCESS_LEVELS).map((level) => (
                      <option key={level} value={level}>
                        {accessLabel(level)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            );
          })}
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Effective access</h3>
          <ul className="mt-2 grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
            {EDITABLE_MODULES.map((moduleName) => (
              <li key={moduleName}>
                {MODULE_DETAILS[moduleName]?.label}: {accessLabel(fixedAdmin ? ACCESS_LEVELS.MANAGE : effectiveLevel({ ...user, permissions }, moduleName))}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <h3 className="font-bold">Linked staff record</h3>
          <p className="mt-1 text-sm text-slate-500">Linking associates this login with an HR person. It does not copy the HR role into permissions.</p>
          {staffUnavailable ? (
            <p className="mt-3 text-sm text-slate-500">Staff records are unavailable until this account is signed in to a school.</p>
          ) : (
            <label className="mt-3 block space-y-1.5" htmlFor={`staff-link-${user._id || user.id}`}>
              <span className="text-sm font-semibold">Staff member</span>
              <select
                id={`staff-link-${user._id || user.id}`}
                value={linkedStaffId}
                disabled={linkPending}
                onChange={(event) => onLinkStaff?.(event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="">Not linked</option>
                {staffOptions.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staffDisplayName(staff)} · {staff.employeeId || 'No ID'} · {staffRoleLabel(staff.role)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>

      <footer className="flex flex-col items-start justify-between gap-4 border-t border-slate-200 p-5 sm:flex-row sm:items-center dark:border-slate-800">
        <div>
          {dirty && (
            <p role="status" className="text-sm font-bold text-amber-700 dark:text-amber-300">
              Unsaved permission changes
            </p>
          )}
          {message && (
            <p role="status" className="text-sm text-slate-600 dark:text-slate-300">
              {message}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={reset} disabled={!dirty || isSaving} className="h-11 rounded-lg border border-slate-300 px-4 font-bold disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={fixedAdmin || !dirty || isSaving} className="h-11 rounded-lg bg-primary px-6 font-bold text-white disabled:opacity-50">
            {isSaving ? 'Saving…' : 'Save permissions'}
          </button>
        </div>
      </footer>
    </section>
  );
}
