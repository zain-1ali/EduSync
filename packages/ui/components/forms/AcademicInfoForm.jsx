export function AcademicInfoForm({ onNext, onPrev }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
      <div className="border-b border-slate-200 dark:border-slate-800 px-8 py-6">
        <h2 className="text-slate-900 dark:text-white text-[20px] font-bold">Academic Enrollment Details</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Provide the student's admission and class assignment information.</p>
      </div>
      
      <form className="p-8 flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-slate-900 dark:text-slate-200 text-sm font-semibold">Admission Number</label>
            <input className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 px-4 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. ADM-2023-001" type="text"/>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-slate-900 dark:text-slate-200 text-sm font-semibold">Admission Date</label>
            <input className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 px-4 focus:outline-none focus:ring-2 focus:ring-primary" type="date"/>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-slate-900 dark:text-slate-200 text-sm font-semibold">Class / Grade</label>
            <select className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 px-4 focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select Class</option>
              <option value="1">Grade 1</option>
              <option value="2">Grade 2</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-slate-900 dark:text-slate-200 text-sm font-semibold">Section</label>
            <select className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 px-4 focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select Section</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-slate-900 dark:text-slate-200 text-sm font-semibold">Roll Number</label>
            <input className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 px-4 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. 15" type="number"/>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-slate-200 dark:border-slate-700 mt-4">
          <button type="button" onClick={onPrev} className="flex items-center gap-2 px-6 h-12 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Previous Step</span>
          </button>
          <button type="button" onClick={onNext} className="flex items-center gap-2 px-8 h-12 rounded-lg bg-primary text-white font-bold shadow-md hover:bg-blue-700 transition-all">
            <span>Next: Parent Details</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </form>
    </div>
  );
}