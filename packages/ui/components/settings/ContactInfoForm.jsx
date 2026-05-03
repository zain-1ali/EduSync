export function ContactInfoForm() {
  return (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <span className="material-symbols-outlined text-primary">contact_mail</span>
        <h3 className="text-slate-900 dark:text-white text-xl font-bold">Contact Information</h3>
      </div>
      
      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <p className="text-slate-900 dark:text-slate-200 text-sm font-bold leading-normal">Office Address</p>
          <textarea 
            className="w-full rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-base resize-none" 
            rows="2"
            defaultValue="123 Education Lane, Springfield, IL 62704, United States"
          ></textarea>
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="flex flex-col gap-2">
            <p className="text-slate-900 dark:text-slate-200 text-sm font-bold leading-normal">Primary Phone</p>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">call</span>
              <input 
                className="w-full rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-12 pl-10 pr-4 text-base" 
                type="tel" 
                defaultValue="+1 (555) 001-9872"
              />
            </div>
          </label>
          <label className="flex flex-col gap-2">
            <p className="text-slate-900 dark:text-slate-200 text-sm font-bold leading-normal">Official Email</p>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">mail</span>
              <input 
                className="w-full rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-12 pl-10 pr-4 text-base" 
                type="email" 
                defaultValue="admin@stmarys.edu"
              />
            </div>
          </label>
        </div>
        
        <label className="flex flex-col gap-2">
          <p className="text-slate-900 dark:text-slate-200 text-sm font-bold leading-normal">Website URL</p>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">language</span>
            <input 
              className="w-full rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-12 pl-10 pr-4 text-base" 
              type="url" 
              defaultValue="www.stmarys.edu"
            />
          </div>
        </label>
      </div>
    </section>
  );
}