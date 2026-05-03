import { useState } from 'react';

export function CreateBatchDrawer({ isOpen, onClose }) {
  // State to manage dynamic multiple subjects
  const [subjects, setSubjects] = useState(['']);

  const handleAddSubject = () => {
    setSubjects([...subjects, '']);
  };

  const handleRemoveSubject = (indexToRemove) => {
    setSubjects(subjects.filter((_, index) => index !== indexToRemove));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Panel */}
      <section className="relative w-full max-w-[450px] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col transform transition-transform">
        
        <header className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Create New Batch</h2>
            <p className="text-sm text-slate-500 font-medium">Set up a new cohort or class section.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Context Banner */}
          <div className="bg-primary/10 p-4 rounded-lg flex items-center border border-primary/20">
            <span className="material-symbols-outlined text-primary mr-3 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
            <span className="text-sm font-bold text-primary">Adding to Program: Full Stack Web Development</span>
          </div>

          <form className="space-y-6">
            
            {/* Batch Name */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Batch / Section Name</label>
              <input className="w-full h-12 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-primary focus:outline-none" placeholder="e.g. 2024 Fall Intensive" type="text" />
            </div>

            {/* Date Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Start Date</label>
                <input className="w-full h-12 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-primary focus:outline-none" type="date" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">End Date</label>
                <input className="w-full h-12 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-primary focus:outline-none" type="date" />
              </div>
            </div>

            {/* Max Capacity */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Maximum Capacity</label>
              <input className="w-full h-12 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-primary focus:outline-none" placeholder="40" type="number" />
              <p className="text-[11px] font-medium text-slate-500">Leave blank for unlimited.</p>
            </div>

            {/* RESTORED: Primary Instructor Selection */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Primary Instructor</label>
              <div className="w-full h-14 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-between cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                <div className="flex items-center space-x-3">
                  {/* Fallback avatar block since we don't have the image file locally */}
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs border border-primary/30">
                    SJ
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">Sarah Jenkins</span>
                </div>
                <span className="material-symbols-outlined text-slate-500">expand_more</span>
              </div>
            </div>

            {/* ADDED: Dynamic Curriculum Subjects */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Curriculum Subjects</label>
                <button 
                  type="button" 
                  onClick={handleAddSubject}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  Add Subject
                </button>
              </div>
              
              <div className="flex flex-col gap-3">
                {subjects.map((subject, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input 
                      className="flex-1 h-12 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-primary focus:outline-none" 
                      placeholder="e.g. Mathematics, React.js..." 
                      type="text" 
                    />
                    {subjects.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSubject(index)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors flex shrink-0"
                        title="Remove subject"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Batch Status */}
            <div className="space-y-3 pt-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Batch Status</label>
              <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button type="button" className="flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm transition-all">
                  Planned
                </button>
                <button type="button" className="flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all">
                  Enrolling
                </button>
                <button type="button" className="flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all">
                  Active
                </button>
              </div>
            </div>

          </form>
        </div>

        <footer className="p-6 border-t border-slate-200 dark:border-slate-800 flex space-x-4 bg-white dark:bg-slate-900 shrink-0">
          <button onClick={onClose} className="flex-1 h-12 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-95">
            Cancel
          </button>
          <button className="flex-1 h-12 rounded-lg bg-primary text-white text-sm font-black uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
            Create Batch
          </button>
        </footer>
      </section>
    </div>
  );
}