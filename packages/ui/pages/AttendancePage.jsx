import { useMemo, useState } from 'react';
import { useLocalCollection } from '../data/useLocalCollection';
import { Layout } from '../Layout';

export function AttendancePage() {
  const students = useLocalCollection('students');
  const sections = useLocalCollection('sections');
  const attendance = useLocalCollection('attendance');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [sectionId, setSectionId] = useState('');
  const [marks, setMarks] = useState({});
  const [reasons, setReasons] = useState({});
  const [message, setMessage] = useState('');
  const roster = useMemo(
    () => students.data.filter((student) => student.sectionId === sectionId && student.status === 'active'),
    [students.data, sectionId]
  );

  const mark = (studentId, status) => {
    setMarks((current) => ({ ...current, [studentId]: status }));
  };

  const save = async () => {
    setMessage('');
    for (const student of roster) {
      const existing = attendance.data.find(
        (item) => item.studentId === student.id && item.sectionId === sectionId && item.date === date
      );
      const value = {
        studentId: student.id,
        studentName: student.name,
        sectionId,
        date,
        status: marks[student.id] || existing?.status || 'present',
        reason: reasons[student.id] ?? existing?.reason ?? '',
      };
      if (existing) await attendance.update(existing.id, value);
      else await attendance.create(value);
    }
    setMessage(`${roster.length} attendance record(s) saved locally.`);
  };

  return (
    <Layout title="Attendance">
      <div className="max-w-5xl mx-auto w-full p-6 md:p-8 space-y-6">
        <header><h1 className="text-3xl font-black">Daily attendance</h1><p className="text-slate-500">Mark attendance even when this device is offline.</p></header>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col sm:flex-row gap-3">
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-11 rounded-lg bg-slate-100 dark:bg-slate-800 px-4" />
          <select value={sectionId} onChange={(event) => { setSectionId(event.target.value); setMarks({}); setReasons({}); }} className="h-11 flex-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-4"><option value="">Select section</option>{sections.data.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}</select>
          <button disabled={!sectionId || roster.length === 0} onClick={() => setMarks(Object.fromEntries(roster.map((student) => [student.id, 'present'])))} className="h-11 px-4 rounded-lg border border-primary text-primary font-bold disabled:opacity-40">Mark all present</button>
        </div>
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          {!sectionId ? <p className="p-10 text-center text-slate-500">Select a section to load its roster.</p> : roster.length === 0 ? <p className="p-10 text-center text-slate-500">No active students are enrolled in this section.</p> : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {roster.map((student) => {
                const existing = attendance.data.find((item) => item.studentId === student.id && item.date === date);
                const value = marks[student.id] || existing?.status || 'present';
                return <li key={student.id} className="p-4 flex flex-col gap-3"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p className="font-bold">{student.name}</p><p className="text-xs text-slate-500">{student.admissionNumber}</p></div><div className="flex flex-wrap gap-2">{['present','absent','late','leave'].map((status) => <button type="button" key={status} onClick={() => mark(student.id, status)} className={`h-9 px-3 rounded-lg text-xs font-bold capitalize ${value === status ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{status}</button>)}</div></div>{value !== 'present' && <label className="text-xs font-bold">Reason<input value={reasons[student.id] ?? existing?.reason ?? ''} onChange={(event) => setReasons((current) => ({ ...current, [student.id]: event.target.value }))} className="ml-3 h-9 min-w-64 rounded-lg bg-slate-100 px-3 dark:bg-slate-800" placeholder="Optional note" /></label>}</li>;
              })}
            </ul>
          )}
          {roster.length > 0 && <footer className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between"><p className="text-sm text-slate-500" role="status">{message}</p><button onClick={save} className="h-11 px-6 rounded-lg bg-primary text-white font-bold">Save attendance</button></footer>}
        </section>
      </div>
    </Layout>
  );
}
