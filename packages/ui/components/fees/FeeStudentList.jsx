export function FeeStudentList() {
  const students = [
    { id: '1024', name: 'Aarav Sharma', grade: 'Grade 4-B', status: 'PENDING', statusColor: 'bg-amber-100 text-amber-700 border-amber-200', active: true },
    { id: '1105', name: 'Ishani Gupta', grade: 'Grade 2-A', status: 'PAID', statusColor: 'bg-emerald-100 text-emerald-700 border-emerald-200', active: false },
    { id: '0954', name: 'Rohan Das', grade: 'Grade 10-C', status: 'OVERDUE', statusColor: 'bg-rose-100 text-rose-700 border-rose-200', active: false },
    { id: '1088', name: 'Meera Patel', grade: 'Grade 5-A', status: 'PENDING', statusColor: 'bg-amber-100 text-amber-700 border-amber-200', active: false },
  ];

  return (
    <div className="w-full lg:w-96 flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col overflow-hidden">
      
      {/* Search Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold">Select Student</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Search to record a payment</p>
        </div>
        
        <div className="flex w-full items-center rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden h-11 px-3">
          <span className="material-symbols-outlined text-[20px] text-slate-500">search</span>
          <input 
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm px-3 placeholder:text-slate-400" 
            placeholder="Search name, ID or grade..."
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-2 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
        <button className="flex-1 text-xs font-bold py-1.5 rounded bg-primary text-white">ALL</button>
        <button className="flex-1 text-xs font-medium py-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">PENDING</button>
        <button className="flex-1 text-xs font-medium py-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">OVERDUE</button>
      </div>

      {/* List Items */}
      <div className="flex flex-col flex-grow overflow-y-auto max-h-[500px]">
        {students.map((student) => (
          <div key={student.id} className={`flex items-center gap-4 px-4 py-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors ${student.active ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <div className={`size-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 ${!student.active && 'opacity-60'}`}>
              {student.name.charAt(0)}
            </div>
            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-start">
                <p className={`text-sm font-bold ${student.active ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{student.name}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${student.statusColor}`}>
                  {student.status}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{student.grade} • ID: {student.id}</p>
            </div>
            {student.active && <span className="material-symbols-outlined text-primary">chevron_right</span>}
          </div>
        ))}
      </div>

      {/* Footer Refresh */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
        <button className="w-full py-2.5 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-sm font-bold rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-700">
          <span className="material-symbols-outlined text-[18px]">sync</span>
          Refresh List
        </button>
      </div>

    </div>
  );
}