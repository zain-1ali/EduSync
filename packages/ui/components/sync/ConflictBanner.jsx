export function ConflictBanner({ studentId }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 p-5">
      <div className="flex items-center gap-4">
        <div className="bg-red-100 dark:bg-red-800 p-2 rounded-full flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-red-600 dark:text-red-400">sync_disabled</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-red-700 dark:text-red-400 text-base font-bold leading-tight">Sync Paused</p>
          <p className="text-red-600 dark:text-red-300/80 text-sm font-normal leading-normal">
            Data conflict detected for Student ID {studentId}. Action required to resume.
          </p>
        </div>
      </div>
      <button className="text-sm font-bold leading-normal tracking-[0.015em] flex items-center gap-2 text-red-700 dark:text-red-400 hover:underline shrink-0">
        View Sync Log
        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </button>
    </div>
  );
}