export function SchoolIdentityForm() {
  return (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <span className="material-symbols-outlined text-primary">badge</span>
        <h3 className="text-slate-900 dark:text-white text-xl font-bold">School Identity</h3>
      </div>
      
      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <p className="text-slate-900 dark:text-slate-200 text-sm font-bold leading-normal">School Legal Name</p>
          <input 
            className="w-full rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-12 px-4 text-base" 
            placeholder="e.g. St. James International Academy" 
            type="text" 
            defaultValue="St. Mary's Primary School"
          />
        </label>
        
        <label className="flex flex-col gap-2">
          <p className="text-slate-900 dark:text-slate-200 text-sm font-bold leading-normal">Affiliation / Registration Number</p>
          <input 
            className="w-full rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-12 px-4 text-base" 
            placeholder="e.g. REG-2023-0045" 
            type="text" 
            defaultValue="AFF-992384-B"
          />
        </label>
        
        <div className="pt-2 flex flex-col gap-3">
          <p className="text-slate-900 dark:text-slate-200 text-sm font-bold leading-normal">School Logo</p>
          <div className="flex items-center gap-6 p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="size-24 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-inner shrink-0">
              {/* Fallback to initials if no image is provided */}
              <span className="text-3xl font-bold text-slate-300">SM</span>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p className="text-slate-900 dark:text-white text-sm font-bold">Official School Crest</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-2">512x512px (PNG or JPG) recommended</p>
              <div className="flex gap-2">
                <button type="button" className="text-primary text-xs font-bold uppercase tracking-wider flex items-center hover:underline">
                  <span className="material-symbols-outlined text-sm mr-1">upload</span> Change Logo
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button type="button" className="text-red-500 text-xs font-bold uppercase tracking-wider flex items-center hover:underline">
                  <span className="material-symbols-outlined text-sm mr-1">delete</span> Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}