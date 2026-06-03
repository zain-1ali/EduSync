import { usePendingSchools, useApproveSchool } from '../api/hooks/useAdmin';

export function DevAdminPage() {
  const { data: schools, isLoading, isError } = usePendingSchools();
  const { mutate: approveSchool, isPending: isApproving } = useApproveSchool();

  const handleApprove = (schoolId, schoolName) => {
    if (window.confirm(`Are you sure you want to approve ${schoolName} and send the setup email?`)) {
      approveSchool(schoolId, {
        onSuccess: () => alert('School approved and email sent!'),
        onError: (err) => alert(`Error: ${err.response?.data?.message || err.message}`)
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 font-display">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-8 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-red-500 font-bold text-sm mb-2 uppercase tracking-widest">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              Development Mode
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Platform Admin</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Review and approve incoming school registrations.</p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg shadow-sm flex items-center gap-3">
            <span className="text-sm font-bold text-slate-500">Pending Requests</span>
            <span className="bg-primary text-white text-xs font-black px-2 py-0.5 rounded-full">
              {schools?.length || 0}
            </span>
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20 text-slate-400">
            <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
          </div>
        ) : isError ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg font-bold border border-red-200">
            Failed to load pending schools. Is the backend running?
          </div>
        ) : schools?.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center flex flex-col items-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4">inbox</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">All caught up!</h3>
            <p className="text-slate-500 mt-1">There are no pending school registrations right now.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800">Institution</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800">Applicant</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800">Details</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800">Applied On</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {schools.map((school) => (
                  <tr key={school._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="block font-bold text-slate-900 dark:text-white text-sm">{school.schoolName}</span>
                      <span className="block text-xs text-slate-500 mt-0.5">{school.city}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block font-bold text-slate-700 dark:text-slate-300 text-sm">{school.applicantName}</span>
                      <span className="block text-xs text-slate-500 mt-0.5">{school.applicantEmail}</span>
                      <span className="block text-xs text-slate-500 mt-0.5">{school.applicantMobile}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Est. Students: {school.estimatedStudents}</span>
                      <span className="block text-xs text-slate-500 mt-0.5">Role: {school.applicantDesignation}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {new Date(school.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleApprove(school._id, school.schoolName)}
                        disabled={isApproving}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Approve & Provision
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}