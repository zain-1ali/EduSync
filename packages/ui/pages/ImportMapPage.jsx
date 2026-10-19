import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLocalData } from '../data/LocalDataProvider';
import { Layout } from '../Layout';

const targetFields = [
  ['name', 'Student name'],
  ['admissionNumber', 'Admission number'],
  ['dateOfBirth', 'Date of birth'],
  ['gender', 'Gender'],
  ['className', 'Class'],
  ['sectionName', 'Section'],
  ['guardianName', 'Guardian name'],
  ['guardianPhone', 'Guardian phone'],
  ['guardianEmail', 'Guardian email'],
];

function suggest(header) {
  const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '');
  return (
    targetFields.find(([key, label]) =>
      [key, label].some(
        (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized
      )
    )?.[0] || ''
  );
}

export function ImportMapPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { db } = useLocalData();
  const jobId = params.get('job');
  const [job, setJob] = useState(null);
  const [mapping, setMapping] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!db || !jobId) return;
    db.importJobs.get(jobId).then((record) => {
      setJob(record || null);
      if (record) {
        setMapping(
          Object.keys(record.mapping || {}).length
            ? record.mapping
            : Object.fromEntries(record.headers.map((header) => [header, suggest(header)]))
        );
      }
    });
  }, [db, jobId]);

  const selectedTargets = useMemo(() => Object.values(mapping), [mapping]);
  const missingRequired = ['name', 'admissionNumber'].filter(
    (field) => !selectedTargets.includes(field)
  );

  const save = async (status = 'mapping') => {
    if (!job) return;
    await db.importJobs.update(job.id, {
      mapping,
      status,
      updatedAt: new Date().toISOString(),
    });
  };

  const continueToReview = async () => {
    setError('');
    if (missingRequired.length) {
      setError('Map both Student name and Admission number before continuing.');
      return;
    }
    await save('review');
    navigate(`/import/review?job=${job.id}`);
  };

  return (
    <Layout title="Data Import">
      <div className="max-w-4xl w-full mx-auto px-4 py-8">
        <h1 className="text-3xl font-black">Map file columns</h1>
        <p className="text-slate-500 mt-1">
          Match columns in {job?.fileName || 'your file'} to EduSync student fields.
        </p>
        {!job ? (
          <div className="mt-8 rounded-xl border p-10 text-center text-slate-500">
            {jobId ? 'Import draft not found or still loading.' : 'No import draft was selected.'}
          </div>
        ) : (
          <>
            <div className="mt-6 divide-y rounded-xl border border-slate-200 dark:border-slate-800">
              {job.headers.map((header) => (
                <label
                  key={header}
                  className="grid gap-2 p-4 md:grid-cols-2 md:items-center"
                >
                  <span className="font-bold">{header}</span>
                  <select
                    value={mapping[header] || ''}
                    onChange={(event) =>
                      setMapping((current) => ({ ...current, [header]: event.target.value }))
                    }
                    className="rounded-lg border border-slate-300 bg-white p-2 dark:bg-slate-900"
                  >
                    <option value="">Do not import</option>
                    {targetFields.map(([value, label]) => (
                      <option
                        key={value}
                        value={value}
                        disabled={
                          selectedTargets.includes(value) && mapping[header] !== value
                        }
                      >
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <div className="mt-6 overflow-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    {job.headers.map((header) => (
                      <th key={header} className="p-3">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {job.rows.slice(0, 3).map((row) => (
                    <tr key={row._row} className="border-t dark:border-slate-800">
                      {job.headers.map((header) => (
                        <td key={header} className="p-3">{String(row[header] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {error && <p role="alert" className="mt-4 font-semibold text-red-600">{error}</p>}
            <div className="mt-8 flex flex-wrap justify-between gap-3 border-t pt-6">
              <button className="rounded-lg px-5 py-2 font-bold" onClick={() => navigate('/import')}>
                Back to Upload
              </button>
              <div className="flex gap-3">
                <button className="rounded-lg bg-slate-200 px-5 py-2 font-bold dark:bg-slate-800" onClick={() => save()}>
                  Save Draft
                </button>
                <button className="rounded-lg bg-primary px-5 py-2 font-bold text-white" onClick={continueToReview}>
                  Continue to Review
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}