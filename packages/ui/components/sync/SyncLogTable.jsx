export function SyncLogTable() {
  const logs = [
    { time: '14:15:22', action: 'Update Student Record: #ST-9021', size: '4.2 KB', status: 'Pending', statusColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
    { time: '14:10:05', action: 'Fee Collection: Grade 4 (Term 1)', size: '1.8 KB', status: 'Pending', statusColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
    { time: '12:30:11', action: 'System Sync (Global)', size: '12.5 MB', status: 'Successful', statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    { time: '11:05:44', action: 'New Admission: Sarah Jenkins', size: '85 KB', status: 'Successful', statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h3 className="text-lg font-bold">Recent Activity</h3>
        <button className="text-primary text-sm font-semibold hover:underline">Download full log</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-semibold uppercase">
              <th className="px-6 py-3">Time</th>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3 text-center">Size</th>
              <th className="px-6 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {logs.map((log, index) => (
              <tr key={index}>
                <td className="px-6 py-4 text-sm font-medium">{log.time}</td>
                <td className="px-6 py-4 text-sm">{log.action}</td>
                <td className="px-6 py-4 text-sm text-center">{log.size}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.statusColor}`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}