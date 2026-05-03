export function AllocateTeacherDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[450px] bg-white dark:bg-slate-900 shadow-xl flex flex-col border-l border-slate-200 dark:border-slate-800">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900 shrink-0">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Allocate Subject Teacher</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-red-500 transition-colors rounded-lg p-1 hover:bg-red-50 dark:hover:bg-red-900/30">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-primary mt-0.5">info</span>
          <div>
            <p className="text-sm font-semibold text-primary">Allocating for: Grade 10 - Section A</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Assign a teacher and set the weekly schedule for this subject.</p>
          </div>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-900 dark:text-white">Curriculum Subject</label>
            <div className="relative">
              <select className="block w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-lg py-3 pl-4 pr-10 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary appearance-none">
                <option value="">Select a subject...</option>
                <option value="physics" selected>Physics</option>
                <option value="math">Mathematics</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-900 dark:text-white">Primary Teacher</label>
            <div className="relative">
              <select className="block w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-lg py-3 pl-4 pr-10 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary appearance-none">
                <option value="">Select a teacher...</option>
                <option value="sdavis" selected>Ms. Sarah Davis</option>
                <option value="jdoe">Mr. John Doe</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>

          {/* NEW SCHEDULE FIELDS INJECTED HERE */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Class Schedule</h3>
            
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Active Days</label>
              <div className="flex gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => {
                  const isSelected = day === 'Mon' || day === 'Wed'; // Mock active states
                  return (
                    <button 
                      key={day} 
                      type="button" 
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${
                        isSelected 
                          ? 'bg-primary text-white border-primary' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Start Time</label>
                <input type="time" defaultValue="10:00" className="block w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-lg py-3 px-4 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">End Time</label>
                <input type="time" defaultValue="11:00" className="block w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-lg py-3 px-4 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
            </div>
          </div>

        </form>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3 shrink-0">
        <button onClick={onClose} className="px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          Cancel
        </button>
        <button className="px-4 py-2.5 text-sm font-bold text-white bg-primary rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check</span>
          Confirm Allocation
        </button>
      </div>
    </div>
  );
}