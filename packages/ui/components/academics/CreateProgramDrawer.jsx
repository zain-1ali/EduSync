export function CreateProgramDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
      ></div>
      
      {/* Panel */}
      <section className="relative w-full max-w-[450px] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <header className="sticky top-0 bg-white dark:bg-slate-900 px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create New Program</h2>
            <p className="text-xs text-slate-500 font-medium">Define a high-level course, grade, or bootcamp.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <section className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Program Name</label>
            <input className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-900 transition-all border-none" placeholder="e.g. Data Science Immersive" type="text" />
          </section>

          <section className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Standard Duration</label>
            <div className="relative">
              <select className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-900 transition-all border-none">
                <option>1 Academic Year</option>
                <option>6 Months</option>
                <option>12 Weeks</option>
                <option>Custom</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">expand_more</span>
            </div>
          </section>

          <section className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Description</label>
            <textarea className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-900 transition-all border-none resize-none" placeholder="Briefly describe the learning outcomes and target audience..." rows="3"></textarea>
          </section>

          <section className="space-y-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">palette</span>
              Visual Identity
            </h3>
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Theme Color</label>
              <div className="flex gap-3">
                <button className="w-8 h-8 rounded-full bg-primary ring-2 ring-offset-2 ring-primary dark:ring-offset-slate-900"></button>
                <button className="w-8 h-8 rounded-full bg-emerald-600 hover:ring-2 ring-offset-2 ring-emerald-600 transition-all"></button>
                <button className="w-8 h-8 rounded-full bg-amber-500 hover:ring-2 ring-offset-2 ring-amber-500 transition-all"></button>
                <button className="w-8 h-8 rounded-full bg-rose-600 hover:ring-2 ring-offset-2 ring-rose-600 transition-all"></button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Program Icon</label>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-3xl">book</span>
                </div>
                <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">edit</span> Change Icon
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="sticky bottom-0 bg-white dark:bg-slate-900 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-lg">
            Cancel
          </button>
          <button className="px-5 py-2.5 text-sm font-bold bg-primary text-white hover:opacity-90 active:scale-95 transition-all rounded-lg shadow-md shadow-primary/20">
            Create Program
          </button>
        </footer>
      </section>
    </div>
  );
}