export function PersonalDetailsForm({ onNext }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">badge</span>
          Basic Information
        </h3>
      </div>
      
      <form className="p-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Profile Picture Upload */}
          <div className="md:col-span-2 flex items-center gap-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="size-24 rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-3xl">add_a_photo</span>
              <span className="text-[10px] font-bold uppercase mt-1">Upload</span>
            </div>
            <div>
              <p className="font-medium mb-1">Student Photograph</p>
              <p className="text-sm text-slate-500">Max size 2MB. JPG or PNG format.</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name <span className="text-red-500">*</span></label>
            <input className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 text-base px-4 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Johnathan Smith" type="text"/>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date of Birth <span className="text-red-500">*</span></label>
            <input className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 text-base px-4 focus:outline-none focus:ring-2 focus:ring-primary" type="date"/>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gender <span className="text-red-500">*</span></label>
            <select className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 text-base px-4 focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Blood Group</label>
            <select className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 text-base px-4 focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="O+">O+</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Residential Address <span className="text-red-500">*</span></label>
            <textarea className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-base px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Street name, City, State, Zip Code" rows="3"></textarea>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between mt-4">
          <button type="button" className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400 mr-2">
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span className="text-xs">Fields with * are mandatory</span>
            </div>
            <button type="button" onClick={onNext} className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
              Next Step
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}