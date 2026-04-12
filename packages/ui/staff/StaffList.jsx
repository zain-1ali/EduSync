export function StaffList() {
  const staffMembers = [
    { id: 1, initials: 'SJ', name: 'Sarah Jenkins', role: 'Senior Clerk', active: true, time: 'Active 2h ago', locked: false },
    { id: 2, initials: 'JW', name: 'James Wilson', role: 'Admin', active: false, time: 'Active 5m ago', locked: false },
    { id: 3, initials: 'MG', name: 'Maria Garcia', role: 'Clerk', active: false, time: 'Active Yesterday', locked: false },
    { id: 4, initials: 'RC', name: 'Robert Chen', role: 'Clerk', active: false, time: 'Account Locked', locked: true },
  ];

  return (
    <div className="w-full lg:w-80 flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col overflow-hidden">
      
      {/* Header & Search */}
      <div className="p-5 flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold leading-tight">Staff Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">Manage access for 12 school users</p>
        </div>
        
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input 
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
            placeholder="Search staff..." 
            type="text"
          />
        </div>
        
        <button className="w-full bg-primary text-white rounded-lg h-10 px-4 text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95">
          <span className="material-symbols-outlined !text-sm">person_add</span>
          Create New User
        </button>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1 max-h-[600px]">
        {staffMembers.map((staff) => (
          <div key={staff.id} className={`group cursor-pointer p-3 rounded-lg border transition-colors ${staff.active ? 'bg-primary/10 border-primary/20' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'} ${staff.locked ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3">
              <div className={`size-10 rounded-full flex items-center justify-center font-bold text-sm ${staff.active ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>
                {staff.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${staff.active ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                  {staff.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${staff.active ? 'bg-primary/20 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {staff.role}
                  </span>
                </div>
              </div>
              {staff.active && <span className="material-symbols-outlined text-primary !text-lg">chevron_right</span>}
            </div>
            <p className={`text-[10px] mt-2 flex items-center gap-1 ${staff.locked ? 'text-red-500 font-bold uppercase' : 'text-slate-500 dark:text-slate-400'}`}>
              {!staff.locked && staff.active && <span className="material-symbols-outlined !text-[12px]">schedule</span>}
              {staff.time}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}