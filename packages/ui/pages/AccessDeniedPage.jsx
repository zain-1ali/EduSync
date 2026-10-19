import { Link } from 'react-router-dom';

export function AccessDeniedPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <section className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
        <span className="material-symbols-outlined text-5xl text-amber-500" aria-hidden="true">
          lock
        </span>
        <h1 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
          Access denied
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Your account does not have permission to open this area.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-white hover:bg-primary/90"
        >
          Return to dashboard
        </Link>
      </section>
    </main>
  );
}
