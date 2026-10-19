import { useMemo, useState } from 'react';
import { useLocalCollection } from '../data/useLocalCollection';
import { Layout } from '../Layout';

export function GradesPage() {
  const assessments = useLocalCollection('assessments');
  const grades = useLocalCollection('grades');
  const students = useLocalCollection('students');
  const sections = useLocalCollection('sections');
  const subjects = useLocalCollection('subjects');
  const [assessmentId, setAssessmentId] = useState('');
  const [marks, setMarks] = useState({});
  const [message, setMessage] = useState('');
  const assessment = assessments.data.find((item) => item.id === assessmentId);
  const roster = useMemo(
    () => students.data.filter((student) => student.sectionId === assessment?.sectionId),
    [students.data, assessment]
  );

  const createAssessment = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const record = await assessments.create({ ...values, maxMarks: Number(values.maxMarks), status: 'draft' });
    setAssessmentId(record.id);
    form.reset();
  };

  const saveMarks = async () => {
    if (assessment?.status === 'locked') return;
    for (const student of roster) {
      const existing = grades.data.find((item) => item.assessmentId === assessmentId && item.studentId === student.id);
      const score = Number(marks[student.id] ?? existing?.score ?? 0);
      const value = { assessmentId, studentId: student.id, studentName: student.name, score, maxMarks: assessment.maxMarks };
      if (existing) await grades.update(existing.id, value);
      else await grades.create(value);
    }
    setMessage('Marks saved locally.');
  };

  const setAssessmentStatus = async (status) => {
    await assessments.update(assessment.id, { status });
    setMessage(`Assessment ${status}.`);
  };

  return (
    <Layout title="Grades">
      <div className="max-w-5xl mx-auto w-full p-6 md:p-8 space-y-6">
        <header><h1 className="text-3xl font-black">Assessments and grades</h1><p className="text-slate-500">Create an assessment and enter marks for its class roster.</p></header>
        <form onSubmit={createAssessment} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          <input name="name" required placeholder="Midterm" className="h-10 rounded bg-slate-100 dark:bg-slate-800 px-3" />
          <select name="sectionId" required className="h-10 rounded bg-slate-100 dark:bg-slate-800 px-3"><option value="">Section</option>{sections.data.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select>
          <select name="subjectId" required className="h-10 rounded bg-slate-100 dark:bg-slate-800 px-3"><option value="">Subject</option>{subjects.data.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select>
          <input name="maxMarks" required type="number" min="1" placeholder="Max marks" className="h-10 rounded bg-slate-100 dark:bg-slate-800 px-3" />
          <button className="h-10 rounded bg-primary text-white font-bold">Create</button>
        </form>
        <select value={assessmentId} onChange={(event) => setAssessmentId(event.target.value)} className="h-11 w-full rounded-lg bg-slate-100 dark:bg-slate-800 px-4"><option value="">Select assessment</option>{assessments.data.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        {assessment && <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <header className="flex justify-between gap-3 border-b p-4"><span className="font-bold">{assessment.name}</span><span className="text-xs font-black uppercase text-slate-500">{assessment.status}</span></header>
          {roster.length === 0 ? <p className="p-8 text-center text-slate-500">No students in this assessment section.</p> : <ul className="divide-y divide-slate-100 dark:divide-slate-800">{roster.map((student) => { const existing = grades.data.find((item) => item.assessmentId === assessmentId && item.studentId === student.id); return <li key={student.id} className="p-4 flex items-center justify-between gap-4"><span className="font-bold">{student.name}</span><label className="flex items-center gap-2"><input disabled={assessment.status === 'locked'} type="number" min="0" max={assessment.maxMarks} value={marks[student.id] ?? existing?.score ?? ''} onChange={(event) => setMarks((current) => ({ ...current, [student.id]: event.target.value }))} className="h-10 w-24 rounded bg-slate-100 dark:bg-slate-800 px-3 disabled:opacity-50" /><span>/ {assessment.maxMarks}</span></label></li>; })}</ul>}
          <footer className="p-4 border-t flex flex-wrap justify-between gap-3"><p role="status" className="text-sm text-slate-500">{message}</p><div className="flex gap-2"><button disabled={assessment.status === 'locked'} onClick={saveMarks} className="h-10 px-5 rounded bg-primary text-white font-bold disabled:opacity-40">Save marks</button>{assessment.status !== 'locked' && <button onClick={() => setAssessmentStatus('locked')} className="h-10 px-5 rounded border border-primary text-primary font-bold">Lock results</button>}</div></footer>
        </section>}
      </div>
    </Layout>
  );
}
