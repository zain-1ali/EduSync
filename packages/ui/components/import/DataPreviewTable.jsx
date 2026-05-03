export function DataPreviewTable() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50">
        <span className="material-symbols-outlined text-slate-400">visibility</span>
        <h2 className="text-slate-900 dark:text-white text-base font-bold">Data Preview (First 3 Rows)</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse bg-white dark:bg-slate-900">
          <thead>
            <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <th className="px-4 py-3">admission_no</th>
              <th className="px-4 py-3">FullName</th>
              <th className="px-4 py-3">Contact_No</th>
              <th className="px-4 py-3">Grade_Section</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <tr className="text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-4 py-3 font-mono">ADM-2023-001</td>
              <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-200">John Smith</td>
              <td className="px-4 py-3">+1 555-0123</td>
              <td className="px-4 py-3">Grade 5-A</td>
            </tr>
            <tr className="text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-4 py-3 font-mono">ADM-2023-002</td>
              <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-200">Sarah Parker</td>
              <td className="px-4 py-3">+1 555-0124</td>
              <td className="px-4 py-3">Grade 5-B</td>
            </tr>
            <tr className="text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-4 py-3 font-mono">ADM-2023-003</td>
              <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-200">David Miller</td>
              <td className="px-4 py-3">+1 555-0125</td>
              <td className="px-4 py-3">Grade 4-A</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}