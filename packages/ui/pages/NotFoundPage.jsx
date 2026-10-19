import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function NotFoundPage() {
  const { pathname } = useLocation();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Page not found · EduSync';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-slate-100">
      <main className="flex-1 flex items-center justify-center p-6">
        <section
          aria-labelledby="not-found-heading"
          className="w-full max-w-md bg-white dark:bg-slate-900 border border-[#e7ecf3] dark:border-slate-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-8 text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">404</p>
          <h1 id="not-found-heading" className="mt-2 text-3xl font-bold tracking-tight text-[#0d131b] dark:text-white">
            Page not found
          </h1>
          <p className="mt-3 text-sm text-[#4c6c9a] dark:text-slate-400">
            <span className="break-all font-medium text-slate-700 dark:text-slate-200">{pathname}</span>
            {' '}is not a page in EduSync. Return to the dashboard, or sign in again.
          </p>
          <nav aria-label="Recovery options" className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center h-11 px-5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              Go to dashboard
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center h-11 px-5 rounded-lg border border-[#cfd9e7] dark:border-slate-700 text-sm font-bold text-[#0d131b] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              Go to login
            </Link>
          </nav>
        </section>
      </main>
    </div>
  );
}
