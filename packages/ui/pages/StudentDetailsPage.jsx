import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLocalData } from '../data/LocalDataProvider';
import { Layout } from '../Layout';

export function StudentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { repositories } = useLocalData();
  const [student, setStudent] = useState();

  useEffect(() => {
    repositories?.students.get(id).then(setStudent);
  }, [id, repositories]);

  if (!student) {
    return (
      <Layout title="Student Profile">
        <div className="p-12 text-center text-slate-500">Student record not found or still loading.</div>
      </Layout>
    );
  }

  const archive = async () => {
    if (!window.confirm('Archive this student record?')) return;
    await repositories.students.update(id, { status: 'withdrawn' });
    navigate('/students');
  };

  return (
    <Layout title="Student Profile">
      <div className="max-w-5xl mx-auto w-full p-6 md:p-8">
        <header className="flex flex-col md:flex-row justify-between gap-5 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <p className="text-sm font-black uppercase text-primary">{student.admissionNumber}</p>
            <h1 className="text-3xl font-black">{student.name}</h1>
            <p className="text-slate-500">{student.className} · {student.sectionName} · {student.status}</p>
          </div>
          <div className="flex gap-3">
            <Link to={`/students/${id}/edit`} className="h-11 px-5 rounded-lg bg-primary text-white font-bold flex items-center">Edit</Link>
            <button onClick={archive} className="h-11 px-5 rounded-lg border border-red-300 text-red-600 font-bold">Archive</button>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {[
            ['Personal details', [['Date of birth', student.dateOfBirth], ['Gender', student.gender], ['Blood group', student.bloodGroup], ['Address', student.address]]],
            ['Guardian', [['Name', student.guardianName], ['Relationship', student.guardianRelationship], ['Phone', student.guardianPhone], ['Email', student.guardianEmail]]],
            ['Enrollment', [['Admission date', student.admissionDate], ['Class', student.className], ['Section', student.sectionName], ['Roll number', student.rollNumber]]],
            ['Synchronization', [['Status', student.syncStatus], ['Version', student.version], ['Last changed', student.updatedAt]]],
          ].map(([title, fields]) => (
            <section key={title} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <h2 className="font-black text-lg mb-4">{title}</h2>
              <dl className="space-y-3">
                {fields.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4"><dt className="text-sm text-slate-500">{label}</dt><dd className="text-sm font-semibold text-right">{value || '—'}</dd></div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
}
