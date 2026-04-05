export function PrintSidebar() {
  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-6 print:hidden">
      <h3 className="text-xs font-bold uppercase text-slate-400">Printer Settings</h3>
      
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Paper Size</label>
          <select className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary h-10 px-3 outline-none">
            <option>A4 (Split A5)</option>
            <option>Half Letter</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2 py-2">
          <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary size-4" />
          <span className="text-sm">Include School Logo</span>
        </div>
        
        <div className="flex items-center gap-2">
          <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary size-4" />
          <span className="text-sm">Black & White Only</span>
        </div>
      </div>

      <div className="mt-auto p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-xl">info</span>
          <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
            Ensure "Background Graphics" is enabled in your browser print dialog.
          </p>
        </div>
      </div>
    </div>
  );
}