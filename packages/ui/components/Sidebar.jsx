import { Link, NavLink } from 'react-router-dom';

export function Sidebar() {
  
  // This helper function automatically checks if the link matches the current URL
  const getNavClasses = ({ isActive }) => {
    const baseClasses = "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors";
    
    if (isActive) {
      // Active State (Blue Background, Primary Text)
      return `${baseClasses} bg-primary/10 text-primary font-semibold`;
    } else {
      // Inactive State (Gray Text, Hover effect)
      return `${baseClasses} text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium`;
    }
  };

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex flex-col gap-8 h-full">
        
        {/* EduSync Brand */}
        <div className="flex items-center gap-3">
          <div className="text-primary">
            <svg fill="none" height="32" viewBox="0 0 48 48" width="32" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">EduSync</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Clerk Portal</p>
          </div>
        </div>

        {/* Navigation - NOW USING NavLink! */}
        <nav className="flex flex-col gap-2 flex-grow">
          <NavLink to="/dashboard" className={getNavClasses}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm">Dashboard</span>
          </NavLink>
          
          <NavLink to="/students" className={getNavClasses}>
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm">Students</span>
          </NavLink>
          
          <NavLink to="/fees" className={getNavClasses}>
            <span className="material-symbols-outlined">payments</span>
            <span className="text-sm">Fees</span>
          </NavLink>
  <NavLink to="/academics" className={getNavClasses}>
        <span class="material-symbols-outlined">school</span>
<span class="text-sm ">Academics</span>
          </NavLink>

                <NavLink to="/user-management" className={getNavClasses}>
      <span className="material-symbols-outlined">badge</span>
<p className="text-sm font-medium">User Management</p>
          </NavLink>

          <NavLink to="/sync" className={getNavClasses}>
<span className="material-symbols-outlined" >sync</span>
<p className="text-sm font-medium">Sync Status</p>
          </NavLink>
          
          <NavLink to="/staff" className={getNavClasses}>
         <span className="material-symbols-outlined">supervisor_account</span>
            <span className="text-sm">Staff</span>
          </NavLink>

           <NavLink to="/import" className={getNavClasses}>
       <span class="material-symbols-outlined group-hover:text-slate-900 transition-colors">upload_file</span>
<span class="font-semibold text-sm">Import Data</span>
          </NavLink>

            <NavLink to="/settings" className={getNavClasses}>
      <span class="material-symbols-outlined">settings</span>
<span class="text-sm font-medium">Settings</span>
          </NavLink>


     
        </nav>

        {/* User Profile */}
        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-cover bg-center border border-slate-200" style={{ backgroundImage: "url('https://ui-avatars.com/api/?name=Sarah+Jenkins&background=f1f5f9&color=0f172a')" }}></div>
            <div className="flex flex-col">
              <p className="text-sm font-semibold truncate">Sarah Jenkins</p>
              {/* Keep this as a standard Link because it just logs out, it doesn't need an 'active' state */}
              <Link to="/login" className="text-xs text-slate-500 hover:text-rose-500 transition-colors">Log Out</Link>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}