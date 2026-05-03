export function VerticalImportStepper() {
  return (
    <div className="space-y-6 lg:w-[280px] shrink-0">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-6">Progress</h3>
        <div className="grid grid-cols-[32px_1fr] gap-x-3">
          
          {/* Step 1 Done */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-green-600 dark:text-green-500">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div className="w-[2px] bg-green-200 dark:bg-green-900/50 h-8"></div>
          </div>
          <div className="flex flex-col pb-6">
            <p className="text-slate-900 dark:text-white text-sm font-bold">Upload File</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs">students_export_v2.csv</p>
          </div>
          
          {/* Step 2 Active */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-primary">
              <span className="material-symbols-outlined">settings_suggest</span>
            </div>
            <div className="w-[2px] bg-slate-200 dark:bg-slate-800 h-8 grow"></div>
          </div>
          <div className="flex flex-col pb-6">
            <p className="text-primary text-sm font-bold">Map Fields</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Currently active</p>
          </div>
          
          {/* Step 3 Pending */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-slate-300 dark:text-slate-700">
              <span className="material-symbols-outlined">analytics</span>
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-slate-400 dark:text-slate-600 text-sm font-medium">Review & Import</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Final validation</p>
          </div>
        </div>
      </div>

      {/* Auto-match Info Box */}
      <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4">
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-primary">info</span>
          <div>
            <p className="text-slate-900 dark:text-white text-sm font-bold">Auto-match successful</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">We automatically matched 8 out of 10 columns based on header names.</p>
          </div>
        </div>
      </div>
    </div>
  );
}