export function StaffList({ users, selectedId, onSelect, query, onQueryChange, isLoading, isError, errorMessage, onInvite, onRetry }) {
  return (
    <div className="flex w-full flex-shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:w-80">
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
        <div>
          <h2 className="text-xl font-bold">School accounts</h2>
          <p className="mt-1 text-xs font-medium text-slate-500">{users.length} login {users.length === 1 ? 'account' : 'accounts'}</p>
        </div>
        <label className="sr-only" htmlFor="user-search">
          Search users
        </label>
        <input
          id="user-search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search by name or email"
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        <button type="button" onClick={onInvite} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-white">
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            person_add
          </span>
          Invite user
        </button>
      </div>
      <div className="flex max-h-[640px] flex-1 flex-col gap-1 overflow-y-auto p-3" role="listbox" aria-label="School accounts">
        {isLoading && <p className="p-4 text-sm text-slate-500">Loading users…</p>}
        {isError && (
          <div className="p-4 text-sm text-red-600" role="alert">
            <p>{errorMessage || 'Users could not be loaded.'}</p>
            {onRetry && (
              <button type="button" onClick={onRetry} className="mt-2 font-bold underline">
                Try again
              </button>
            )}
          </div>
        )}
        {!isLoading && !isError && users.length === 0 && <p className="p-4 text-sm text-slate-500">No users found.</p>}
        {users.map((user) => {
          const id = user._id || user.id;
          const selected = selectedId === id;
          return (
            <button
              type="button"
              role="option"
              aria-selected={selected}
              key={id}
              onClick={() => onSelect(id)}
              className={`rounded-lg border p-3 text-left ${selected ? 'border-primary/20 bg-primary/10' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <span className="block font-bold">{user.name}</span>
              <span className="mt-1 block text-xs text-slate-500">
                {String(user.role || '').replaceAll('_', ' ')} · {String(user.status || '').replaceAll('_', ' ')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
