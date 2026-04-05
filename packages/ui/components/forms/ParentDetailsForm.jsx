export function ParentDetailsForm({ onPrev }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 px-8 py-5">
        <h2 className="text-xl font-bold leading-tight tracking-tight">Guardian Information</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please provide contact details for parents or legal guardians.</p>
      </div>
      
      <form className="p-8 flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Father's Full Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">person</span>
              <input className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="John Doe Sr." type="text"/>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mother's Full Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">person_3</span>
              <input className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Jane Doe" type="text"/>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Primary Contact <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">call</span>
              <input className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="+1 (555) 000-0000" type="tel"/>
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-4 items-start">
          <span className="material-symbols-outlined text-primary">info</span>
          <div>
            <p className="text-sm font-medium text-primary">Local Storage Sync</p>
            <p className="text-xs text-primary/80 mt-1">This record will be saved to your device immediately. It will automatically sync to the school server when an internet connection is detected.</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={onPrev} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            Previous Step
          </button>
          <button type="button" className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary text-white font-bold hover:bg-blue-700 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
            <span className="material-symbols-outlined">save</span>
            Save Student Record
          </button>
        </div>
      </form>
    </div>
  );
}