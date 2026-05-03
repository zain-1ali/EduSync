export function MissingFieldsPanel() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/50 overflow-hidden shadow-sm flex flex-col">
      <div className="p-4 border-b border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 flex items-center gap-2">
        <span className="material-symbols-outlined text-red-500">error</span>
        <h2 className="text-slate-900 dark:text-white text-base font-bold">Action Needed: Missing Core Fields</h2>
      </div>
      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Your file is missing the <strong className="text-slate-900 dark:text-white">Gender</strong> field. Set a default value for all imported records.
        </p>
        <select className="w-full md:w-auto min-w-[240px] rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary dark:text-slate-200">
          <option value="" disabled selected>Select default (e.g., Unknown)</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>
    </div>
  );
}