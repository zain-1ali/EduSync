export function StatsGrid() {
  const stats = [
    { label: 'Pending Uploads', value: '14', icon: 'upload_file', color: 'text-primary' },
    { label: 'System Health', value: 'Optimal', icon: 'check_circle', color: 'text-green-500' },
    { label: 'Database Size', value: '1.2 GB', icon: 'database', color: 'text-slate-900 dark:text-white', iconColor: 'text-slate-300 dark:text-slate-600' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
          <div className="flex items-end justify-between">
            <h3 className={`text-3xl font-bold ${stat.color}`}>{stat.value}</h3>
            <span className={`material-symbols-outlined text-3xl opacity-40 ${stat.iconColor || stat.color}`}>
              {stat.icon}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}