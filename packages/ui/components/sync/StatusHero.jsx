import { use } from "react";
import { useNavigate } from "react-router-dom";

export function StatusHero() {
    const navigate=useNavigate();
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center shadow-sm">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-6">
        <span className="material-symbols-outlined text-4xl">wifi_off</span>
      </div>
      <h1 className="text-slate-900 dark:text-white text-3xl font-bold mb-2">Current Mode: Offline</h1>
      <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-md mx-auto">
        Your data is safely stored locally. There are <strong>14 student records and fee entries</strong> waiting to sync with the server.
      </p>
      
      <div className="flex flex-col items-center gap-4">
        <button onClick={()=>navigate("/sync/conflicts")} className="flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]">
          <span className="material-symbols-outlined">sync</span>
          <span>Sync Now</span>
        </button>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
          Last successful sync: 2 hours ago
        </p>
      </div>
    </div>
  );
}