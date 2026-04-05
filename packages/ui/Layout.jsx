import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";


export function Layout({ title, headerActions, children }) {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex font-display transition-colors duration-200">
      <Sidebar />
      
      <main className="flex-1 flex flex-col">
        {/* Pass the title and actions down to the Header */}
        <Header title={title} headerActions={headerActions} />
        
        {/* Render the specific page content here */}
        <div className="flex-grow flex flex-col">
          {children}
        </div>

        {/* Global Footer */}
        <footer className="px-8 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">© 2026 EduSync Offline-First Edition. All local changes are encrypted.</p>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">database</span> Local Storage: 1.2GB Free</span>
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">bolt</span> Performance: Optimal</span>
          </div>
        </footer>
      </main>
    </div>
  );
}