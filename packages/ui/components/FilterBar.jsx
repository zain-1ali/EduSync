export function FilterBar() {
  return (
    <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl mb-6 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <span className="material-symbols-outlined text-lg">filter_alt</span>
        Filter By:
      </div>
      <div className="flex gap-3">
        <button className="flex h-9 items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-4 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          Class: All
          <span className="material-symbols-outlined text-base">expand_more</span>
        </button>
        <button className="flex h-9 items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-4 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          Section: All
          <span className="material-symbols-outlined text-base">expand_more</span>
        </button>
        <button className="flex h-9 items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-4 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          Session: 2026-27
          <span className="material-symbols-outlined text-base">expand_more</span>
        </button>
      </div>
      <button className="ml-auto text-sm text-primary font-semibold hover:underline">Clear Filters</button>
    </div>
  );
}