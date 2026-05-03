export function FlaggedRecords({ records }) {
  if (!records || records.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2 pt-2">
        <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">Flagged Records</h2>
        <button className="text-primary text-sm font-bold hover:underline">Import All as Drafts</button>
      </div>
      
      <div className="flex flex-col gap-3">
        {records.map((record, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 gap-4 shadow-sm">
            
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0">
                <span className="material-symbols-outlined">{record.icon || 'warning'}</span>
              </div>
              <div className="flex flex-col">
                <p className="text-slate-900 dark:text-white font-bold">Row #{record.row}: {record.name}</p>
                <p className="text-amber-600 dark:text-amber-400 text-sm">{record.issue}</p>
              </div>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <button className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Import as Draft
              </button>
              <button className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                Fix Now
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}