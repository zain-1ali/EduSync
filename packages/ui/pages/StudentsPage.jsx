import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocalCollection } from '../data/useLocalCollection';
import { Layout } from '../Layout';

export function StudentsPage() {
  const { data: students, isLoading, error } = useLocalCollection('students');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const filtered = useMemo(
    () =>
      students.filter((student) => {
        const matchesQuery = `${student.name} ${student.admissionNumber || ''}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchesQuery && (!status || student.status === status);
      }),
    [students, query, status]
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const headerActions = (
    <Link to="/students/add" className="h-10 px-5 bg-primary text-white rounded-lg font-bold text-sm flex items-center gap-2">
      <span className="material-symbols-outlined text-lg">person_add</span>
      Add student
    </Link>
  );

  return (
    <Layout title="Students" headerActions={headerActions}>
      <div className="flex-1 p-6 md:p-8 max-w-[1200px] mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-black">Student directory</h1>
          <p className="text-slate-500">Records remain available locally and synchronize in the background.</p>
        </div>
        <div className="mb-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col sm:flex-row gap-3">
          <input
            value={query}
            onChange={(event) => { setQuery(event.target.value); setPage(1); }}
            placeholder="Search name or admission number…"
            className="flex-1 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 px-4"
          />
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-11 rounded-lg bg-slate-100 dark:bg-slate-800 px-4">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="withdrawn">Withdrawn</option>
            <option value="graduated">Graduated</option>
          </select>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          {isLoading ? (
            <p className="p-10 text-center text-slate-500">Loading local student records…</p>
          ) : error ? (
            <p className="p-10 text-center text-red-600">{error.message}</p>
          ) : visible.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-bold">No students found</p>
              <p className="text-sm text-slate-500 mt-1">Add a student or change the current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500">
                  <tr><th className="p-4">Student</th><th>Admission no.</th><th>Class / section</th><th>Guardian</th><th>Sync</th><th></th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {visible.map((student) => (
                    <tr key={student.id}>
                      <td className="p-4 font-bold">{student.name}</td>
                      <td>{student.admissionNumber || '—'}</td>
                      <td>{[student.className, student.sectionName].filter(Boolean).join(' / ') || 'Unassigned'}</td>
                      <td>{student.guardianName || '—'}</td>
                      <td><span className="text-xs font-black uppercase text-slate-500">{student.syncStatus}</span></td>
                      <td className="pr-4 text-right"><Link to={`/students/${student.id}`} className="text-primary font-bold">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <footer className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span className="text-sm text-slate-500">{filtered.length} record(s)</span>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="h-9 px-3 rounded border disabled:opacity-40">Previous</button>
              <span className="text-sm font-bold">{page} / {pageCount}</span>
              <button disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)} className="h-9 px-3 rounded border disabled:opacity-40">Next</button>
            </div>
          </footer>
        </div>
      </div>
    </Layout>
  );
}