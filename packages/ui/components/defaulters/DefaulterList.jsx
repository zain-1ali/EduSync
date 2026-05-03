export function DefaulterList() {
  const defaulters = [
    { id: "ID-7429", name: "Michael Henderson", grade: "Grade 10-A", dues: "$1,450.00", lastPayment: "Oct 12, 2026", selected: true },
    { id: "ID-8102", name: "Sarah Jenkins", grade: "Grade 10-A", dues: "$890.00", lastPayment: "Nov 05, 2026", selected: false },
    { id: "ID-6291", name: "David Thompson", grade: "Grade 9-B", dues: "$2,100.00", lastPayment: "Aug 22, 2026", selected: false },
    { id: "ID-9034", name: "Elena Rodriguez", grade: "Grade 8-C", dues: "$540.00", lastPayment: "Sep 30, 2026", selected: false },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6">
      
      {/* Page Heading & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Defaulters List</h1>
            <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">ACTION REQUIRED</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">Manage and track students with outstanding fee balances.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex flex-col items-end border-r border-slate-200 dark:border-slate-700 pr-6">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Defaulters</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">124 <span className="text-sm font-medium text-slate-400">Students</span></p>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Outstanding Total</p>
            <p className="text-2xl font-black text-red-600">$12,450.00</p>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 px-3">
          <div className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary size-5 border-primary/30" />
            <span className="text-sm font-bold text-primary">1 Selected</span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-primary/20"></div>
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm active:scale-95">
              <span className="material-symbols-outlined text-lg">chat</span>
              Send SMS Reminder
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors active:scale-95">
              <span className="material-symbols-outlined text-lg">print</span>
              Print Notices
            </button>
          </div>
        </div>
        <div className="flex gap-2 self-end sm:self-auto px-3 sm:px-0">
          <button className="p-2 text-slate-400 hover:text-primary transition-colors" title="Export selection">
            <span className="material-symbols-outlined">download</span>
          </button>
          <button className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Clear selection">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 w-12 text-center">
                  <input type="checkbox" className="rounded text-primary focus:ring-primary size-4 border-slate-300 dark:border-slate-700" />
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Student ID</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Student Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Class</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Total Dues</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Last Payment</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {defaulters.map((student, idx) => (
                <tr key={idx} className={`transition-colors ${student.selected ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                  <td className="p-4 text-center">
                    <input type="checkbox" defaultChecked={student.selected} className={`rounded text-primary focus:ring-primary size-4 ${student.selected ? 'border-primary/30' : 'border-slate-300 dark:border-slate-700'}`} />
                  </td>
                  <td className="p-4 text-sm font-mono text-slate-500 whitespace-nowrap">{student.id}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{student.name}</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">{student.grade}</td>
                  <td className="p-4 text-sm font-black text-red-600 whitespace-nowrap">{student.dues}</td>
                  <td className="p-4 text-sm text-slate-500 whitespace-nowrap">{student.lastPayment}</td>
                  <td className="p-4">
                    <button className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-lg">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 mt-auto">
          <p className="text-xs text-slate-500 font-medium tracking-tight">Showing 1-4 of 124 students</p>
          <div className="flex gap-2">
            <button className="flex items-center justify-center size-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-primary transition-colors disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button className="flex items-center justify-center size-8 rounded border border-slate-200 dark:border-slate-700 bg-primary text-white font-bold text-xs">1</button>
            <button className="flex items-center justify-center size-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-primary transition-colors text-xs">2</button>
            <button className="flex items-center justify-center size-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-primary transition-colors text-xs">3</button>
            <button className="flex items-center justify-center size-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}