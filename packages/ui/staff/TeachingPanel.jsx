import { Link } from 'react-router-dom';
import { groupByDay, sessionLength, weeklyHours } from './staffModel';

export function TeachingPanel({ items, isLoading, error, canAllocate, conflicts = [] }) {
  if (isLoading) {
    return <p className="p-8 text-center text-slate-500">Loading teaching allocations…</p>;
  }
  if (error) {
    return (
      <p role="alert" className="p-8 text-center font-semibold text-red-600">
        {error}
      </p>
    );
  }
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
        <p className="font-bold">No classes are allocated</p>
        <p className="mt-1 text-sm text-slate-500">Teaching assignments are created in Academics and appear here for this staff member.</p>
        {canAllocate && (
          <Link to="/academics" className="mt-4 inline-flex h-11 items-center rounded-lg bg-primary px-5 font-bold text-white">
            Allocate a subject
          </Link>
        )}
      </div>
    );
  }

  const days = groupByDay(items);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Teaching allocations</h2>
          <p className="text-sm text-slate-500">
            {items.length} class {items.length === 1 ? 'assignment' : 'assignments'} · {weeklyHours(items)}h in the weekly template
          </p>
        </div>
        {canAllocate && (
          <Link to="/academics" className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white">
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              add
            </span>
            Allocate subject
          </Link>
        )}
      </div>

      {conflicts.length > 0 && (
        <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          {conflicts.map((conflict) => (
            <p key={`${conflict.day}-${conflict.current.id}`}>
              {conflict.day}: {conflict.previous.subjectName} overlaps {conflict.current.subjectName}.
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold">{item.subjectName}</h3>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {[item.programName, item.sectionName].filter(Boolean).join(' · ')}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              {item.day} · {item.startTime}–{item.endTime}
              {sessionLength(item.startTime, item.endTime) ? ` · ${sessionLength(item.startTime, item.endTime)}` : ''}
            </p>
            <p className={`mt-3 text-sm font-semibold ${item.room ? 'text-slate-700 dark:text-slate-200' : 'text-amber-700 dark:text-amber-300'}`}>
              {item.roomLabel}
            </p>
          </article>
        ))}
      </div>

      <section aria-labelledby="weekly-template-heading" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 id="weekly-template-heading" className="border-b border-slate-200 px-4 py-3 font-bold dark:border-slate-800">
          Weekly template
        </h3>
        <div className="grid grid-cols-1 divide-y divide-slate-200 md:grid-cols-5 md:divide-x md:divide-y-0 dark:divide-slate-800">
          {days.map((day) => (
            <div key={day.day} className="p-4">
              <h4 className="mb-3 text-center text-[11px] font-black uppercase tracking-widest text-slate-500">{day.day}</h4>
              {day.items.length === 0 ? (
                <p className="text-center text-sm text-slate-400">No classes</p>
              ) : (
                <div className="space-y-3">
                  {day.items.map((item) => (
                    <div key={item.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                      <p className="text-xs font-bold text-slate-500">
                        {item.startTime}–{item.endTime}
                      </p>
                      <p className="text-sm font-bold">{item.subjectName}</p>
                      <p className="text-xs text-slate-500">{item.sectionName}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
