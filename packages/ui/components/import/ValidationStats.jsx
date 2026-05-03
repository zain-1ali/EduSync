export function ValidationStats({ readyCount, draftCount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
      
      {/* Ready to Import Card */}
      <div className="flex flex-col gap-3 rounded-xl p-6 border-2 border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/10">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <span className="material-symbols-outlined">check_circle</span>
          <p className="text-sm font-bold uppercase tracking-wider">Ready to Import</p>
        </div>
        <p className="text-slate-900 dark:text-white tracking-tight text-4xl font-black leading-tight">
          {readyCount}
        </p>
        <p className="text-emerald-700 dark:text-emerald-500 text-sm font-medium">
          Valid records ready for your database.
        </p>
      </div>

      {/* Incomplete Records Card */}
      <div className="flex flex-col gap-3 rounded-xl p-6 border-2 border-amber-500/20 bg-amber-50/50 dark:bg-amber-900/10">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <span className="material-symbols-outlined">warning</span>
          <p className="text-sm font-bold uppercase tracking-wider">Incomplete Records</p>
        </div>
        <p className="text-slate-900 dark:text-white tracking-tight text-4xl font-black leading-tight">
          {draftCount}
        </p>
        <p className="text-amber-700 dark:text-amber-500 text-sm font-medium">
          {draftCount} records will be imported as Drafts due to missing data.
        </p>
      </div>

    </div>
  );
}