import { ACCESS_LEVELS, MODULES } from '@school/contracts';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

function readStoredUser() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem('edusync_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function textValue(...candidates) {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return '';
}

function displayNameFromUser(user) {
  const direct = textValue(
    user?.name,
    user?.fullName,
    user?.full_name,
    user?.displayName,
    user?.display_name,
    user?.username
  );
  if (direct) return direct;

  const combined = [user?.firstName, user?.first_name, user?.lastName, user?.last_name]
    .filter((part) => typeof part === 'string' && part.trim())
    .join(' ')
    .trim();
  if (combined) return combined;

  return textValue(user?.email) || 'School User';
}

export function Sidebar() {
  const navigate = useNavigate();
  const { user, hasAccess, logout } = useAuth();
  const displayName = displayNameFromUser(user || readStoredUser());
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const handleLogout = async (event) => {
    event.preventDefault();
    await logout();
    navigate('/login');
  };

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
    <aside className="w-16 md:w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-2 md:p-6 flex flex-col gap-8 h-full">

        {/* EduSync Brand */}
        <div className="flex items-center gap-3">
          <div className="text-primary">
            <svg fill="none" height="32" viewBox="0 0 48 48" width="32" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
            </svg>
          </div>
          <div className="hidden md:flex flex-col">
            <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">EduSync</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Clerk Portal</p>
          </div>
        </div>

        {/* Navigation - NOW USING NavLink! */}
        <nav className="flex flex-col gap-2 flex-grow">
          {hasAccess(MODULES.DASHBOARD) && (
            <NavLink to="/dashboard" className={getNavClasses}>
              <span className="material-symbols-outlined">dashboard</span>
              <span className="hidden md:inline text-sm">Dashboard</span>
            </NavLink>
          )}

          {hasAccess(MODULES.STUDENTS) && (
            <NavLink to="/students" className={getNavClasses}>
              <span className="material-symbols-outlined">group</span>
              <span className="hidden md:inline text-sm">Students</span>
            </NavLink>
          )}

          {hasAccess(MODULES.ATTENDANCE, ACCESS_LEVELS.MANAGE) && (
            <NavLink to="/attendance" className={getNavClasses}>
              <span className="material-symbols-outlined">fact_check</span>
              <span className="hidden md:inline text-sm">Attendance</span>
            </NavLink>
          )}

          {hasAccess(MODULES.FEES) && (
            <>
              <NavLink to="/fees" end className={getNavClasses}>
                <span className="material-symbols-outlined">payments</span>
                <span className="hidden md:inline text-sm">Fees</span>
              </NavLink>
              <NavLink to="/fees/configuration" className={getNavClasses}>
                <span className="material-symbols-outlined">tune</span>
                <span className="hidden md:inline text-sm">Fee setup</span>
              </NavLink>
              <NavLink to="/defaulters" className={getNavClasses}>
                <span className="material-symbols-outlined">money_off</span>
                <span className="hidden md:inline text-sm">Defaulters</span>
              </NavLink>
            </>
          )}

          {hasAccess(MODULES.ACADEMICS) && (
            <>
              <NavLink to="/academics" className={getNavClasses}>
                <span className="material-symbols-outlined">school</span>
                <span className="hidden md:inline text-sm">Academics</span>
              </NavLink>
              {hasAccess(MODULES.ACADEMICS, ACCESS_LEVELS.MANAGE) && (
                <NavLink to="/grades" className={getNavClasses}>
                  <span className="material-symbols-outlined">grading</span>
                  <span className="hidden md:inline text-sm">Grades</span>
                </NavLink>
              )}
            </>
          )}

          {hasAccess(MODULES.USERS, ACCESS_LEVELS.MANAGE) && (
            <NavLink to="/user-management" className={getNavClasses}>
              <span className="material-symbols-outlined">badge</span>
              <span className="hidden md:inline text-sm font-medium">User Management</span>
            </NavLink>
          )}

          {hasAccess(MODULES.SYNC) && (
            <NavLink to="/sync" className={getNavClasses}>
              <span className="material-symbols-outlined">sync</span>
              <span className="hidden md:inline text-sm font-medium">Sync Status</span>
            </NavLink>
          )}

          {hasAccess(MODULES.STAFF) && (
            <NavLink to="/staff" className={getNavClasses}>
              <span className="material-symbols-outlined">supervisor_account</span>
              <span className="hidden md:inline text-sm">Staff</span>
            </NavLink>
          )}

          {hasAccess(MODULES.STUDENTS, ACCESS_LEVELS.MANAGE) && (
            <NavLink to="/import" className={getNavClasses}>
              <span className="material-symbols-outlined group-hover:text-slate-900 transition-colors">upload_file</span>
              <span className="hidden md:inline font-semibold text-sm">Import Data</span>
            </NavLink>
          )}

          {hasAccess(MODULES.SETTINGS, ACCESS_LEVELS.MANAGE) && (
            <NavLink to="/settings" className={getNavClasses}>
              <span className="material-symbols-outlined">settings</span>
              <span className="hidden md:inline text-sm font-medium">Settings</span>
            </NavLink>
          )}
        </nav>

        {/* User Profile */}
        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="size-10 rounded-full border border-slate-200 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black"
            >{initials}</div>
            <div className="hidden md:flex flex-col min-w-0">
              <p className="text-sm font-semibold truncate" title={displayName}>{displayName}</p>
              {/* Keep this as a standard Link because it just logs out, it doesn't need an 'active' state */}
              <Link to="/login" onClick={handleLogout} className="text-xs text-slate-500 hover:text-rose-500 transition-colors">Log Out</Link>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}
