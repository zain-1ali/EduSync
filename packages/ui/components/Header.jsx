export function Header({ title, headerActions }) {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between sticky top-0 z-10 gap-4">
      
      {/* 1. LEFT: Page Title (Forced to never wrap) */}
      <div className="flex items-center flex-shrink-0">
        <h2 className="text-xl font-bold tracking-tight whitespace-nowrap">{title}</h2>
      </div>
      
      {/* 2. MIDDLE: Dynamic Page Actions (Takes up available empty space) */}
      <div className="flex-1 flex items-center justify-start lg:justify-end px-2">
        {headerActions}
      </div>
      
      {/* 3. RIGHT: Global Status & Notifications (Forced to keep their shape) */}
      <div className="flex items-center gap-3 flex-shrink-0">
        
        {/* We hide the long status bars on smaller laptops so they don't crush the search bar */}
{ title ==="Overview" && (
   <div className="hidden xl:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg whitespace-nowrap">
        <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">System Status: Offline (Ready)</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg whitespace-nowrap">
        <span className="material-symbols-outlined text-slate-400 text-sm">sync</span>
        <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Last Sync: 10 mins ago</span>
        </div>
    </div>) }

        <button className="size-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </div>
      
    </header>
  );
}