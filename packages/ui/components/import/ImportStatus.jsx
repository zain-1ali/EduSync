export function ImportStatus({ status, progress, currentRecord, totalRecords, onComplete }) {
  if (status === 'review') return null;

  if (status === 'importing') {
    return (
      <div className="mt-8 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary animate-spin">sync</span>
            <p className="text-slate-900 dark:text-white font-bold">Importing to local storage...</p>
          </div>
          <span className="text-primary font-bold">{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Processing record {currentRecord} of {totalRecords}...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="mt-12 flex flex-col items-center justify-center p-12 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border-2 border-dashed border-emerald-200 dark:border-emerald-800/50 text-center animate-in fade-in zoom-in duration-500">
        <div className="size-20 rounded-full bg-emerald-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-500/30">
          <span className="material-symbols-outlined text-4xl">check_circle</span>
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Import Successful!</h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8">
          {totalRecords} records have been successfully saved to your offline database.
        </p>
        <button 
          onClick={onComplete}
          className="flex min-w-[200px] cursor-pointer items-center justify-center rounded-lg h-12 px-8 bg-primary text-white text-base font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-transform"
        >
          View Student List
        </button>
      </div>
    );
  }

  return null;
}