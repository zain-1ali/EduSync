export function AddStaffDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40" 
        onClick={onClose}
      ></div>

      {/* Slide-over Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        
        {/* Section 1: Panel Header */}
        <header className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Add New Staff Member</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter employee details and assign system roles.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
          >
            <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">close</span>
          </button>
        </header>

        {/* Section 2: Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
          <div className="p-6 space-y-10">
            
            {/* Profile Photo */}
            <div className="flex items-center gap-6">
              <div className="size-20 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                <span className="material-symbols-outlined text-slate-400 text-3xl">person</span>
              </div>
              <div className="space-y-1">
                <button type="button" className="text-primary font-bold text-sm hover:underline flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">upload</span>
                  + Upload Photo
                </button>
                <p className="text-xs text-slate-400">JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>

            {/* Group 1: Basic Information */}
            <section className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">Personal Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="first_name">First Name</label>
                  <input className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-2.5 px-4 text-sm transition-all" id="first_name" name="first_name" placeholder="e.g. Jonathan" type="text"/>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="last_name">Last Name</label>
                  <input className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-2.5 px-4 text-sm transition-all" id="last_name" name="last_name" placeholder="e.g. Wick" type="text"/>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="employee_id">Employee ID</label>
                <input className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-2.5 px-4 text-sm transition-all" id="employee_id" name="employee_id" placeholder="EMP-001" type="text"/>
              </div>
            </section>

            {/* Group 2: Contact Details */}
            <section className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">Email Address</label>
                  <input className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-2.5 px-4 text-sm transition-all" id="email" name="email" placeholder="j.wick@slate-edu.com" type="email"/>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="phone">Phone Number</label>
                  <input className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-2.5 px-4 text-sm transition-all" id="phone" name="phone" placeholder="+1 (555) 000-0000" type="tel"/>
                </div>
              </div>
            </section>

            {/* Group 3: Qualifications */}
            <section className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">Background & Expertise</h3>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="education">Highest Education</label>
                <input className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-2.5 px-4 text-sm transition-all" id="education" name="education" placeholder="Masters in Computer Science" type="text"/>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="expertise">Specialization / Expertise</label>
                <textarea className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-2.5 px-4 text-sm transition-all" id="expertise" name="expertise" placeholder="Mathematics, Physics, Web Development" rows="2"></textarea>
              </div>
            </section>

            {/* Group 4: System Access */}
            <section className="space-y-4 pb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">Role Assignment</h3>
              <div className="flex flex-col relative">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="role">System Role</label>
                <select className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-2.5 pl-4 pr-10 text-sm transition-all appearance-none" id="role" name="role">
                  <option value="">Select a role...</option>
                  <option value="admin">Administrator</option>
                  <option value="instructor">Instructor</option>
                  <option value="support">Support Staff</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-[38px] pointer-events-none text-slate-400">expand_more</span>
              </div>
              
              <div className="flex items-center gap-3 py-3 px-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/10">
                <input defaultChecked className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer" id="welcome_email" name="welcome_email" type="checkbox"/>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer" htmlFor="welcome_email">Send welcome email with login instructions</label>
              </div>
            </section>
          </div>
        </div>

        {/* Section 3: Panel Footer */}
        <footer className="px-6 py-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button className="px-8 py-2.5 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Staff Member
          </button>
        </footer>
      </div>
    </>
  );
}