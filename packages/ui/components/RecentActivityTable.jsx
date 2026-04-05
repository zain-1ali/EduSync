import { useNavigate } from "react-router-dom";

export function RecentActivityTable() {
  const transactions = [
    { id: 1, date: "2026-10-24", name: "John Doe", grade: "Grade 5", amount: "$250", status: "Paid" },
    { id: 2, date: "2026-10-24", name: "Jane Smith", grade: "Grade 8", amount: "$300", status: "Paid" },
    { id: 3, date: "2026-10-23", name: "Mike Ross", grade: "Grade 3", amount: "$250", status: "Pending" },
    { id: 4, date: "2026-10-23", name: "Rachel Zane", grade: "Grade 10", amount: "$500", status: "Paid" },
    { id: 5, date: "2026-10-23", name: "Harvey Specter", grade: "Grade 12", amount: "$600", status: "Paid" },
  ];

  const navigate = useNavigate();

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-lg font-bold">Recent Activity</h3>
        <button className="text-primary text-sm font-semibold hover:underline">View All Transactions</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Grade</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-500">{tx.date}</td>
                <td className="px-6 py-4 text-sm font-semibold">{tx.name}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium">{tx.grade}</span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{tx.amount}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${tx.status === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'}`}>
                    <span className={`size-1.5 rounded-full ${tx.status === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={()=>navigate("/fees/print")} className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-sm">print</span>
                    Print Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}