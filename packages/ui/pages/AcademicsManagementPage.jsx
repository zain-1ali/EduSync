import { useState } from 'react';
import { useLocalCollection } from '../data/useLocalCollection';
import { Layout } from '../Layout';
import { WEEKDAYS, findTimetableConflict } from '../staff/staffModel';

const inputClass = 'h-10 rounded-lg bg-slate-100 dark:bg-slate-800 px-3';

export function AcademicsManagementPage() {
  const years = useLocalCollection('academicYears');
  const programs = useLocalCollection('programs');
  const sections = useLocalCollection('sections');
  const subjects = useLocalCollection('subjects');
  const allocations = useLocalCollection('allocations');
  const staff = useLocalCollection('staff');
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);

  const report = (text, isError = false) => {
    setMessage(text);
    setMessageIsError(isError);
  };
  const [allocationClassId, setAllocationClassId] = useState('');
  const classSections = sections.data.filter((item) => item.programId === allocationClassId);
  const classSubjects = subjects.data.filter((item) => item.programId === allocationClassId);

  const createFromForm = (collection, mapper) => async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    try {
      await collection.create(mapper(values));
      form.reset();
      report('Academic setup saved locally.');
    } catch (error) {
      report(error.message, true);
    }
  };

  const createAllocation = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const values = Object.fromEntries(formData);
    const days = formData.getAll('days').filter(Boolean);
    if (values.startTime >= values.endTime) {
      report('End time must be later than start time.', true);
      return;
    }
    if (days.length === 0) {
      report('Choose at least one day. The same teacher and subject can be allocated on more than one day.', true);
      return;
    }
    const section = sections.data.find((item) => item.id === values.sectionId);
    const subject = subjects.data.find((item) => item.id === values.subjectId);
    if (
      !allocationClassId ||
      section?.programId !== allocationClassId ||
      subject?.programId !== allocationClassId
    ) {
      report('Choose a section and subject from the selected class.', true);
      return;
    }
    const candidates = days.map((day) => ({
      sectionId: values.sectionId,
      subjectId: values.subjectId,
      staffId: values.staffId,
      day,
      startTime: values.startTime,
      endTime: values.endTime,
      room: values.room || '',
    }));
    for (const candidate of candidates) {
      const conflict = findTimetableConflict(allocations.data, candidate);
      if (!conflict) continue;
      const when = `${candidate.day} ${conflict.item.startTime}–${conflict.item.endTime}`;
      const text =
        conflict.reason === 'class'
          ? `This class already has a lesson on ${when}. Two teachers cannot teach it at the same time.`
          : conflict.reason === 'teacher'
            ? `This teacher already has a lesson on ${when}.`
            : `That room is already in use on ${when}.`;
      report(text, true);
      return;
    }
    try {
      await allocations.repository.bulkCreate(candidates);
      await allocations.refresh();
      form.reset();
      setAllocationClassId('');
      report(
        days.length > 1
          ? `Teaching allocation saved for ${days.join(', ')}.`
          : 'Teaching allocation saved locally.'
      );
    } catch (error) {
      report(error.message, true);
    }
  };

  return (
    <Layout title="Academics">
      <div className="max-w-6xl mx-auto w-full p-6 md:p-8 space-y-8">
        <header>
          <h1 className="text-3xl font-black">Academic setup</h1>
          <p className="text-slate-500">Create academic years, classes, sections, subjects, and teaching allocations.</p>
          {message && (
            <p className={`mt-2 text-sm font-semibold ${messageIsError ? 'text-red-600' : 'text-primary'}`} role={messageIsError ? 'alert' : 'status'}>
              {message}
            </p>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={createFromForm(years, (value) => ({ ...value, status: 'active' }))} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="font-black text-lg">Academic year</h2>
            <input name="name" required placeholder="2026–2027" className={`${inputClass} w-full`} />
            <div className="grid grid-cols-2 gap-3"><input name="startDate" type="date" required className={inputClass} /><input name="endDate" type="date" required className={inputClass} /></div>
            <button className="h-10 px-4 rounded-lg bg-primary text-white font-bold">Add year</button>
          </form>

          <form onSubmit={createFromForm(programs, (value) => ({ ...value, status: 'active' }))} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="font-black text-lg">Class / program</h2>
            <input name="name" required placeholder="Grade 10" className={`${inputClass} w-full`} />
            <select name="academicYearId" required className={`${inputClass} w-full`}><option value="">Academic year</option>{years.data.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
            <button className="h-10 px-4 rounded-lg bg-primary text-white font-bold">Add class</button>
          </form>

          <form onSubmit={createFromForm(sections, (value) => ({ ...value, capacity: Number(value.capacity) || null }))} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="font-black text-lg">Section</h2>
            <input name="name" required placeholder="Section A" className={`${inputClass} w-full`} />
            <select name="programId" required className={`${inputClass} w-full`}><option value="">Class</option>{programs.data.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
            <input name="capacity" type="number" min="1" placeholder="Capacity" className={`${inputClass} w-full`} />
            <button className="h-10 px-4 rounded-lg bg-primary text-white font-bold">Add section</button>
          </form>

          <form onSubmit={createFromForm(subjects, (value) => value)} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="font-black text-lg">Subject</h2>
            <div className="grid grid-cols-2 gap-3"><input name="name" required placeholder="Mathematics" className={inputClass} /><input name="code" required placeholder="MATH-10" className={inputClass} /></div>
            <select name="programId" required className={`${inputClass} w-full`}><option value="">Class</option>{programs.data.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
            <button className="h-10 px-4 rounded-lg bg-primary text-white font-bold">Add subject</button>
          </form>
        </div>

        <form onSubmit={createAllocation} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="font-black text-lg mb-4">Teaching allocation and timetable</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              aria-label="Class"
              value={allocationClassId}
              onChange={(event) => setAllocationClassId(event.target.value)}
              required
              className={inputClass}
            >
              <option value="">Class</option>
              {programs.data.map((item) => {
                const year = years.data.find((value) => value.id === item.academicYearId);
                return (
                  <option key={item.id} value={item.id}>
                    {year ? `${item.name} · ${year.name}` : item.name}
                  </option>
                );
              })}
            </select>
            <select key={`section-${allocationClassId}`} name="sectionId" aria-label="Section" required className={inputClass}>
              <option value="">{allocationClassId ? 'Section' : 'Select a class first'}</option>
              {classSections.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <select key={`subject-${allocationClassId}`} name="subjectId" aria-label="Subject" required className={inputClass}>
              <option value="">{allocationClassId ? 'Subject' : 'Select a class first'}</option>
              {classSubjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <select name="staffId" aria-label="Teacher" required className={inputClass}><option value="">Teacher</option>{staff.data.filter((item) => item.role === 'instructor').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
            <input name="startTime" aria-label="Start time" type="time" required className={inputClass} />
            <input name="endTime" aria-label="End time" type="time" required className={inputClass} />
            <fieldset className="sm:col-span-2 lg:col-span-4">
              <legend className="mb-2 text-sm font-bold">Days</legend>
              <div className="flex flex-wrap gap-3">
                {WEEKDAYS.map((day) => (
                  <label key={day} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold dark:bg-slate-800">
                    <input type="checkbox" name="days" value={day} />
                    {day}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="mt-3 flex gap-3"><input name="room" placeholder="Room" className={inputClass} /><button className="h-10 px-4 rounded-lg bg-primary text-white font-bold">Allocate teacher</button></div>
        </form>

        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <h2 className="p-5 font-black text-lg border-b border-slate-200 dark:border-slate-800">Current timetable allocations</h2>
          {allocations.data.length === 0 ? <p className="p-8 text-center text-slate-500">No teaching allocations yet.</p> : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {allocations.data.map((item) => {
                const subject = subjects.data.find((value) => value.id === item.subjectId);
                const section = sections.data.find((value) => value.id === item.sectionId);
                const program = programs.data.find((value) => value.id === section?.programId);
                const teacher = staff.data.find((value) => value.id === item.staffId);
                return <li key={item.id} className="p-4 flex flex-wrap justify-between gap-3"><span className="font-bold">{program?.name || 'Class'} · {section?.name || 'Section'} · {subject?.name || 'Subject'}</span><span className="text-sm text-slate-500">{teacher?.name || 'Unassigned'} · {item.day} {item.startTime}–{item.endTime} · {item.room || 'Room pending'}</span></li>;
              })}
            </ul>
          )}
        </section>
      </div>
    </Layout>
  );
}
