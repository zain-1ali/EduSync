import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { useLocalData } from './data/LocalDataProvider';


export function Layout({ title, headerActions, children }) {
  const { status } = useLocalData();

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex font-display transition-colors duration-200">
      <Sidebar />
      
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Pass the title and actions down to the Header */}
        <Header title={title} headerActions={headerActions} />
        
        {/* Render the specific page content here */}
        <div className="flex min-w-0 flex-grow flex-col">
          {children}
        </div>

        {/* Global Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50 md:px-8">
          <p className="text-xs text-slate-500 dark:text-slate-400">© 2026 EduSync Local-First Edition.</p>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">database</span> {status.pending} local change(s) pending</span>
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">wifi</span> {status.online ? 'Online' : 'Offline'}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}