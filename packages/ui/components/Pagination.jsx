export function Pagination() {
  return (
    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
      <p className="text-xs text-slate-500 font-medium">Showing 1 to 5 of 248 records</p>
      <div className="flex gap-2">
        <button className="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 disabled:opacity-50" disabled>
          <span className="material-symbols-outlined text-base">chevron_left</span>
        </button>
        <button className="size-8 flex items-center justify-center rounded bg-primary text-white font-bold text-xs">1</button>
        <button className="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs hover:bg-slate-100 dark:hover:bg-slate-700">2</button>
        <button className="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs hover:bg-slate-100 dark:hover:bg-slate-700">3</button>
        <button className="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
          <span className="material-symbols-outlined text-base">chevron_right</span>
        </button>
      </div>
    </div>
  );
}