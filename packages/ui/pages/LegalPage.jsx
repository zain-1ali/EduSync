import { Link, useParams } from 'react-router-dom';

const content = {
  terms: {
    title: 'Terms of Service',
    body: 'Use EduSync only for school records you are authorized to manage. Your organization remains responsible for account access, data accuracy, retention, backups, and compliance with applicable law.',
  },
  privacy: {
    title: 'Privacy Notice',
    body: 'EduSync stores signed-in school data in a tenant- and user-specific local database and synchronizes it with the configured school service. Contact your school administrator for access, correction, retention, or deletion requests.',
  },
  support: {
    title: 'Support',
    body: 'For account, access, synchronization, or data questions, contact your school administrator. Include the time of the problem and the affected record, but do not send passwords or confidential student data by email.',
  },
};

export function LegalPage() {
  const { document } = useParams();
  const selected = content[document] || content.support;
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-16 dark:bg-slate-950">
      <article className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-black">{selected.title}</h1>
        <p className="mt-5 leading-7 text-slate-600 dark:text-slate-300">{selected.body}</p>
        <Link className="mt-8 inline-block font-bold text-primary" to="/login">Back to sign in</Link>
      </article>
    </main>
  );
}
