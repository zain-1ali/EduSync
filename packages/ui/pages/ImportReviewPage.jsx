import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLocalData } from '../data/LocalDataProvider';
import { Layout } from '../Layout';

export function ImportReviewPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { db, repositories } = useLocalData();
  const jobId = params.get('job');
  const [job, setJob] = useState(null);
  const [existingAdmissions, setExistingAdmissions] = useState(new Set());
  const [skippedRows, setSkippedRows] = useState(new Set());
  const [status, setStatus] = useState('review');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!db || !jobId) return;
    Promise.all([db.importJobs.get(jobId), repositories.students.list()])
      .then(([record, students]) => {
        setJob(record || null);
        setExistingAdmissions(
          new Set(students.map((student) => String(student.admissionNumber).toLowerCase()))
        );
      })
      .catch((nextError) => setError(nextError.message));
  }, [db, jobId, repositories]);

  const evaluatedRows = useMemo(() => {
    if (!job) return [];
    const seen = new Set(existingAdmissions);
    return job.rows.map((source) => {
      const student = Object.fromEntries(
        Object.entries(job.mapping)
          .filter(([, target]) => target)
          .map(([header, target]) => [target, String(source[header] ?? '').trim()])
      );
      const issues = [];
      if (!student.name) issues.push('Student name is required');
      if (!student.admissionNumber) issues.push('Admission number is required');
      const admissionKey = student.admissionNumber?.toLowerCase();
      if (admissionKey && seen.has(admissionKey)) issues.push('Duplicate admission number');
      if (admissionKey) seen.add(admissionKey);
      if (
        student.guardianEmail &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.guardianEmail)
      ) {
        issues.push('Guardian email is invalid');
      }
      return { source, student, issues };
    });
  }, [existingAdmissions, job]);

  const validRows = evaluatedRows.filter(
    ({ source, issues }) => !issues.length && !skippedRows.has(source._row)
  );
  const invalidRows = evaluatedRows.filter(({ issues }) => issues.length);

  const commit = async () => {
    setError('');
    setStatus('importing');
    try {
      const records = await repositories.students.bulkCreate(
        validRows.map(({ student }) => ({ ...student, status: 'active' }))
      );
      await db.importJobs.update(job.id, {
        status: 'completed',
        importedCount: records.length,
        skippedCount: evaluatedRows.length - records.length,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setStatus('success');
    } catch (nextError) {
      setError(nextError.message);
      setStatus('review');
    }
  };

  return (
    <Layout title="Data Import">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
        <h1 className="text-3xl font-black">Validate and import</h1>
        {!job ? (
          <p className="rounded-xl border p-10 text-center text-slate-500">
            {error || 'Import draft not found or still loading.'}
          </p>
        ) : status === 'success' ? (
          <div className="rounded-xl border border-green-300 bg-green-50 p-8 text-center dark:bg-green-950/30">
            <h2 className="text-2xl font-black text-green-800 dark:text-green-300">
              Imported {validRows.length} students
            </h2>
            <p className="mt-2 text-sm text-green-700 dark:text-green-400">
              Records were saved locally and queued for synchronization.
            </p>
            <button className="mt-6 rounded-lg bg-primary px-5 py-2 font-bold text-white" onClick={() => navigate('/students')}>
              View Students
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Rows" value={evaluatedRows.length} />
              <Stat label="Ready" value={validRows.length} />
              <Stat label="Flagged" value={invalidRows.length} />
            </div>
            {invalidRows.length > 0 && (
              <section className="rounded-xl border border-amber-300">
                <h2 className="border-b p-4 text-lg font-black">Flagged rows</h2>
                <ul className="divide-y">
                  {invalidRows.map(({ source, student, issues }) => (
                    <li key={source._row} className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div>
                        <p className="font-bold">Row {source._row}: {student.name || 'Unnamed student'}</p>
                        <p className="text-sm text-amber-700">{issues.join('; ')}</p>
                      </div>
                      <label className="flex items-center gap-2 text-sm font-bold">
                        <input
                          type="checkbox"
                          checked={skippedRows.has(source._row)}
                          onChange={(event) =>
                            setSkippedRows((current) => {
                              const next = new Set(current);
                              if (event.target.checked) next.add(source._row);
                              else next.delete(source._row);
                              return next;
                            })
                          }
                        />
                        Skip row
                      </label>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {error && <p role="alert" className="font-semibold text-red-600">{error}</p>}
            <div className="flex flex-wrap justify-between border-t pt-6">
              <button className="rounded-lg px-5 py-2 font-bold" onClick={() => navigate(`/import/map?job=${job.id}`)}>
                Back to Mapping
              </button>
              <button
                className="rounded-lg bg-primary px-5 py-2 font-bold text-white disabled:opacity-50"
                disabled={!validRows.length || status === 'importing'}
                onClick={commit}
              >
                {status === 'importing' ? 'Importing…' : `Import ${validRows.length} valid rows`}
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}