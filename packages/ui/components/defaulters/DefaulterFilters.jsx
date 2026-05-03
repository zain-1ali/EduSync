export function DefaulterFilters() {
  return (
    <aside className="w-full lg:w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex-shrink-0 flex flex-col p-6 sticky top-6">
      <div className="flex flex-col gap-6">
        
        <div className="flex flex-col gap-1">
          <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-normal">Filters</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">Narrow down the list</p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Year</label>
            <select className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary h-10 px-3">
              <option>2023 - 2024</option>
              <option>2022 - 2023</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class Filter</label>
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-2">
              <label className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary cursor-pointer transition-colors">
                <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary size-4 border-primary/30" />
                <span className="text-sm font-medium">All Classes</span>
              </label>
              <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                <input type="checkbox" className="rounded text-primary focus:ring-primary size-4 border-slate-300 dark:border-slate-700" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Grade 10-A</span>
              </label>
              <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                <input type="checkbox" className="rounded text-primary focus:ring-primary size-4 border-slate-300 dark:border-slate-700" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Grade 9-B</span>
              </label>
              <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                <input type="checkbox" className="rounded text-primary focus:ring-primary size-4 border-slate-300 dark:border-slate-700" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Grade 8-C</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dues Threshold</label>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-500 font-medium">Greater than $500</span>
              <input type="range" min="0" max="5000" step="100" className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
          <button className="w-full flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold tracking-[0.015em] hover:bg-primary/90 transition-all active:scale-95">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Apply Filters
          </button>
          <button className="w-full text-slate-500 dark:text-slate-400 text-xs font-medium py-2 hover:text-primary transition-colors underline decoration-slate-300 dark:decoration-slate-600 underline-offset-4">
            Clear all filters
          </button>
        </div>

      </div>
    </aside>
  );
}