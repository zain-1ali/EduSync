export function PermissionsPanel() {
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      
      {/* Content Header */}
      <div className="p-8 pb-6 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-4">
        <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <span className="hover:text-primary cursor-pointer">Settings</span>
          <span className="material-symbols-outlined !text-base">chevron_right</span>
          <span className="hover:text-primary cursor-pointer">User Management</span>
          <span className="material-symbols-outlined !text-base">chevron_right</span>
          <span className="text-slate-900 dark:text-white font-bold">Edit Sarah Jenkins</span>
        </nav>
        
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black tracking-tight">Permissions & Access</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-lg text-sm">Modify access levels for Student Management, Fee Collection, and Reporting modules for Sarah Jenkins.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 h-10 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button className="px-6 h-10 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 shadow-sm flex items-center gap-2 transition-all active:scale-95">
              <span className="material-symbols-outlined !text-sm">save</span>
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="p-8 flex flex-col gap-8">
        
        {/* Module: Students */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <span className="material-symbols-outlined !text-lg">school</span>
            Student Management
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between shadow-sm">
              <div className="flex flex-col gap-0.5 pr-4">
                <p className="font-bold text-slate-900 dark:text-white">Add/Edit Student Records</p>
                <p className="text-xs text-slate-500">Allow user to register new students and update profiles.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between shadow-sm">
              <div className="flex flex-col gap-0.5 pr-4">
                <p className="font-bold text-slate-900 dark:text-white">Manage Attendance</p>
                <p className="text-xs text-slate-500">Access to daily attendance marking and modification.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Module: Financials */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <span className="material-symbols-outlined !text-lg">payments</span>
            Financials & Fee Collection
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between shadow-sm">
              <div className="flex flex-col gap-0.5 pr-4">
                <p className="font-bold text-slate-900 dark:text-white">Record Fee Payments</p>
                <p className="text-xs text-slate-500">Ability to accept payments and issue receipts.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between shadow-sm">
              <div className="flex flex-col gap-0.5 pr-4">
                <p className="font-bold text-slate-900 dark:text-white">View Financial Reports</p>
                <p className="text-xs text-slate-500">Access to daily summaries and revenue dashboards.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Module: System Integrity */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <span className="material-symbols-outlined !text-lg">lock</span>
            System Integrity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Destructive Action Styling */}
            <div className="p-5 rounded-xl border-2 border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 flex items-center justify-between shadow-sm">
              <div className="flex flex-col gap-0.5 pr-4">
                <p className="font-bold text-red-700 dark:text-red-400">Delete Records</p>
                <p className="text-xs text-red-600/70 dark:text-red-400/60">Destructive action. Use with caution.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
            
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between shadow-sm">
              <div className="flex flex-col gap-0.5 pr-4">
                <p className="font-bold text-slate-900 dark:text-white">Backup Data</p>
                <p className="text-xs text-slate-500">Allow local database export and manual syncing.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </section>

      </div>

      {/* Sticky Footer Action */}
      <div className="mt-auto p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 rounded-md">
            <span className="size-2 bg-amber-500 rounded-full animate-pulse"></span>
            Changes unsaved
          </div>
          <span className="hidden sm:inline">Last modified by Administrator (Today at 10:45 AM)</span>
        </div>
        <button className="w-full sm:w-auto px-8 h-12 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95">
          Save Permissions Profile
          <span className="material-symbols-outlined !text-lg">check_circle</span>
        </button>
      </div>
    </div>
  );
}