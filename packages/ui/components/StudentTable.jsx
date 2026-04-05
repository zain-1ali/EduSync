export function StudentTable({ students }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Student ID</th>
            <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Class</th>
            <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Father's Name</th>
            <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {students.map((student, index) => (
            <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <td className="px-6 py-4 text-sm font-medium text-primary">{student.id}</td>
              <td className="px-6 py-4 text-sm font-semibold">{student.name}</td>
              <td className="px-6 py-4 text-sm">{student.grade}</td>
              <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{student.father}</td>
              <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                <div className="flex justify-end gap-4">
                  <button className="text-primary hover:underline font-semibold">Edit</button>
                  <button className="text-primary hover:underline font-semibold">View Ledger</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}