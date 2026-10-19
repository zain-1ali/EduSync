import { useEffect, useState } from 'react';
import { useLocalData } from '../data/LocalDataProvider';
import { useLocalCollection } from '../data/useLocalCollection';
import { useAuth } from '../auth/AuthProvider';

export function Header({ title, headerActions }) {
  const { status } = useLocalData();
  const { offlineSession } = useAuth();
  const notifications = useLocalCollection('notifications');
  const [showNotifications, setShowNotifications] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [storage, setStorage] = useState(null);
  const unread = notifications.data.filter((notification) => !notification.readAt);

  useEffect(() => {
    const showUpdate = () => setUpdateAvailable(true);
    window.addEventListener('edusync:update-available', showUpdate);
    return () => window.removeEventListener('edusync:update-available', showUpdate);
  }, []);

  useEffect(() => {
    globalThis.navigator?.storage?.estimate?.().then(({ usage, quota }) => {
      if (usage != null && quota) setStorage({ usage, quota });
    });
  }, [status.lastSyncAt, status.pending]);

  return (
    <header className="min-h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 flex items-center justify-between sticky top-0 z-10 gap-4">
      
      {/* 1. LEFT: Page Title (Forced to never wrap) */}
      <div className="flex items-center flex-shrink-0">
        <h2 className="text-xl font-bold tracking-tight whitespace-nowrap">{title}</h2>
      </div>
      
      {/* 2. MIDDLE: Dynamic Page Actions (Takes up available empty space) */}
      <div className="flex-1 flex items-center justify-start lg:justify-end px-2">
        {headerActions}
      </div>
      
      {/* 3. RIGHT: Global Status & Notifications (Forced to keep their shape) */}
      <div className="flex items-center gap-3 flex-shrink-0">
        
        <div className="hidden xl:flex items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap border ${status.online ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200'}`}>
        <span className="relative flex h-2 w-2">
            {status.online && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${status.online ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
        </span>
        <span className={`${status.online ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'} text-xs font-bold uppercase tracking-wider`}>
          {status.online ? 'Online' : 'Offline'} · {status.pending} pending
        </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg whitespace-nowrap">
        <span className={`material-symbols-outlined text-slate-400 text-sm ${status.running ? 'animate-spin' : ''}`}>sync</span>
        <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">
          {status.running ? 'Syncing' : status.lastSyncAt ? new Date(status.lastSyncAt).toLocaleTimeString() : 'Not synced'}
        </span>
        </div>
        {storage && (
          <span className="text-xs text-slate-500" title={`${Math.round(storage.usage / 1024 / 1024)} MB used of ${Math.round(storage.quota / 1024 / 1024)} MB available`}>
            {Math.round((storage.usage / storage.quota) * 100)}% storage
          </span>
        )}
    </div>

        {updateAvailable && (
          <button
            className="hidden rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white sm:block"
            onClick={() => window.edusyncApplyUpdate?.()}
          >
            Update available
          </button>
        )}
        {offlineSession && (
          <span className="hidden rounded-lg bg-amber-100 px-3 py-2 text-xs font-bold text-amber-800 sm:block" title="Password changes and permission updates require an online sign-in.">
            Offline session
          </span>
        )}
        <div className="relative">
        <button
          aria-label={`Notifications${unread.length ? `, ${unread.length} unread` : ''}`}
          aria-expanded={showNotifications}
          onClick={() => setShowNotifications((current) => !current)}
          className="relative size-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <span className="material-symbols-outlined">notifications</span>
          {unread.length > 0 && <span className="absolute right-1 top-1 size-2 rounded-full bg-red-500" />}
        </button>
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 max-w-[80vw] rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-2 font-black">Notifications</p>
            {notifications.isLoading ? <p className="text-sm text-slate-500">Loading…</p> :
              notifications.data.length === 0 ? <p className="text-sm text-slate-500">You are all caught up.</p> :
              <ul className="max-h-72 space-y-2 overflow-auto">
                {notifications.data.slice(0, 10).map((notification) => (
                  <li key={notification.id} className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800">
                    <p className="font-bold">{notification.title || 'EduSync update'}</p>
                    <p className="text-slate-500">{notification.message}</p>
                    {!notification.readAt && (
                      <button
                        type="button"
                        className="mt-2 text-xs font-bold text-primary"
                        onClick={() => notifications.update(notification.id, { readAt: new Date().toISOString() })}
                      >
                        Mark as read
                      </button>
                    )}
                  </li>
                ))}
              </ul>}
          </div>
        )}
        </div>
      </div>
      
    </header>
  );
}