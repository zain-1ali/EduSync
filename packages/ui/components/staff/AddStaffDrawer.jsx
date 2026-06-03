import { useState } from 'react';
import { useAddStaff } from '../../api/hooks/useStaff';
// import { useAddStaff } from '../api/hooks/useStaff';

export function AddStaffDrawer({ isOpen, onClose }) {
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false); // NEW: Success state
  
  const { mutate: addStaff, isPending } = useAddStaff();

  // Reset states when the drawer closes completely
  const handleClose = () => {
    setErrorMessage('');
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    addStaff(data, {
      onSuccess: () => {
        // 1. Show the success UI
        setIsSuccess(true);
        
        // 2. Wait 1.5 seconds, then close the drawer automatically
        setTimeout(() => {
          handleClose();
        }, 1500);
      },
      onError: (error) => {
        setErrorMessage(error.response?.data?.message || 'Failed to add staff member.');
      }
    });
  };

  return (
    <>
      {/* Modal Overlay Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity" 
        onClick={handleClose}
      ></div>

      {/* Slide-over Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        
        {/* If Successful, show the confirmation screen */}
        {isSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="size-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-sm shadow-emerald-500/20">
              <span className="material-symbols-outlined text-5xl">how_to_reg</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Staff Added!</h2>
            <p className="text-slate-500 dark:text-slate-400">
              The new staff member has been successfully added to your institution's records.
            </p>
          </div>
        ) : (
          /* Otherwise, show the normal form */
          <>
            <header className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Add New Staff Member</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter employee details and assign system roles.</p>
              </div>
              <button 
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
              >
                <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">close</span>
              </button>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
                <div className="p-6 space-y-10">
                  
                  {errorMessage && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined">error</span>
                      {errorMessage}
                    </div>
                  )}

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
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="firstName">First Name</label>
                        <input required className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-2.5 px-4 text-sm transition-all" id="firstName" name="firstName" placeholder="e.g. Jonathan" type="text"/>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="lastName">Last Name</label>
                        <input required className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-2.5 px-4 text-sm transition-all" id="lastName" name="lastName" placeholder="e.g. Wick" type="text"/>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="employeeId">Employee ID</label>
                      <input required className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-2.5 px-4 text-sm transition-all" id="employeeId" name="employeeId" placeholder="EMP-001" type="text"/>
                    </div>
                  </section>

                  {/* Group 2: Contact Details */}
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">Contact Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">Email Address</label>
                        <input required className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-2.5 px-4 text-sm transition-all" id="email" name="email" placeholder="j.wick@slate-edu.com" type="email"/>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="phone">Phone Number</label>
                        <input required className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-2.5 px-4 text-sm transition-all" id="phone" name="phone" placeholder="+1 (555) 000-0000" type="tel"/>
                      </div>
                    </div>
                  </section>

                  {/* Group 3: Qualifications */}
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">Background & Expertise</h3>
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="highestEducation">Highest Education</label>
                      <input className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-2.5 px-4 text-sm transition-all" id="highestEducation" name="highestEducation" placeholder="Masters in Computer Science" type="text"/>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="specialization">Specialization / Expertise</label>
                      <textarea className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-2.5 px-4 text-sm transition-all" id="specialization" name="specialization" placeholder="Mathematics, Physics, Web Development" rows="2"></textarea>
                    </div>
                  </section>

                  {/* Group 4: System Access */}
                  <section className="space-y-4 pb-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">Role Assignment</h3>
                    <div className="flex flex-col relative">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="role">HR Role</label>
                      <select required className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-2.5 pl-4 pr-10 text-sm transition-all appearance-none" id="role" name="role" defaultValue="">
                        <option value="" disabled>Select a role...</option>
                        <option value="administrator">Administrator</option>
                        <option value="instructor">Instructor</option>
                        <option value="support staff">Support Staff</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-[38px] pointer-events-none text-slate-400">expand_more</span>
                    </div>
                  </section>
                </div>
              </div>

              <footer className="px-6 py-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3 shrink-0">
                <button 
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isPending}
                  className="px-8 py-2.5 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      Save Staff Member
                    </>
                  )}
                </button>
              </footer>
            </form>
          </>
        )}
      </div>
    </>
  );
}