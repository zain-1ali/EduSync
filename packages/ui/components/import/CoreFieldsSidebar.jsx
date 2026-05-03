export function CoreFieldsSidebar() {
  const coreFields = [
    "Student Name", "Admission Number", "Class / Grade", "Parent Contact", "Date of Birth"
  ];

  return (
    <div className="space-y-6">
      {/* Required Fields List */}
      <div className="rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col gap-4">
        <h2 className="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">list_alt</span>
          Core System Fields
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          For the best experience, include these headers. Records missing these fields will be safely imported as 'Drafts' to be completed later.
        </p>
        
        <ul className="flex flex-col gap-3 mt-2">
          {coreFields.map((field, idx) => (
            <li key={idx} className="flex items-center gap-3 text-sm">
              <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{field}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Help Card */}
      <div className="rounded-xl bg-primary p-6 text-white shadow-lg flex flex-col gap-2">
        <span className="material-symbols-outlined text-3xl opacity-80 mb-1">help</span>
        <h4 className="font-bold">Need Help?</h4>
        <p className="text-sm opacity-90 mb-2">Watch our 2-minute video on how to prepare your Excel sheets for the system.</p>
        <button className="inline-flex items-center gap-2 text-sm font-bold underline hover:opacity-100 transition-opacity self-start">
          View Tutorial
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </button>
      </div>
    </div>
  );
}