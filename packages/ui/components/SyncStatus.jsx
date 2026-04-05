export function SyncStatus() {
  return (
    <div className="mt-8 flex items-center justify-center">
      <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full flex items-center gap-2">
        <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
        <p className="text-xs font-semibold text-green-700 dark:text-green-400">All local changes are synced. System is stable.</p>
      </div>
    </div>
  );
}