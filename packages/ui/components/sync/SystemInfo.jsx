export function SystemInfo() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-slate-100 dark:bg-slate-800/50 rounded-xl gap-4">
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-slate-500">info</span>
        <div>
          <p className="text-sm font-bold">Reliability Tip</p>
          <p className="text-xs text-slate-500">Sync your data at least once every 24 hours to ensure server-side backups are current.</p>
        </div>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">System Version</p>
        <p className="text-sm font-medium">v2.4.1-Stable</p>
      </div>
    </div>
  );
}