import { useState, useEffect, useRef } from 'react';
import { Layout } from '../Layout';
import { CreateProgramDrawer } from '../components/academics/CreateProgramDrawer';
import { CreateBatchDrawer } from '../components/academics/CreateBatchDrawer';
import { AllocateTeacherDrawer } from '../components/academics/AllocateTeacherDrawer';

export function AcademicsPage() {
  // Drawer States
  const [isProgramDrawerOpen, setIsProgramDrawerOpen] = useState(false);
  const [isBatchDrawerOpen, setIsBatchDrawerOpen] = useState(false);
  const [isAllocationDrawerOpen, setIsAllocationDrawerOpen] = useState(false);
  
  // State to track which dropdown menu is currently open (stores the ID)
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Close dropdowns if the user clicks anywhere else on the screen
  const pageRef = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pageRef.current && !pageRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleAction = (action) => {
    setActiveDropdown(null); // Close menu
    if (action === 'edit_program') setIsProgramDrawerOpen(true);
    if (action === 'edit_batch') setIsBatchDrawerOpen(true);
    if (action === 'allocate_subject') setIsAllocationDrawerOpen(true);
  };

  return (
    <Layout title="Academics">
      <div className="flex-1 max-w-[1200px] mx-auto px-6 py-10 w-full" ref={pageRef}>
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Academics & Programs</h1>
            <p className="text-slate-500 text-base">Manage your courses, classes, and student cohorts.</p>
          </div>
          <button 
            onClick={() => setIsProgramDrawerOpen(true)}
            className="bg-primary text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-sm hover:bg-primary/90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">add_circle</span>
            + Create New Program
          </button>
        </div>

        {/* ... Stats Grid stays exactly the same ... */}

        {/* Program Cards Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Card 1: K-12 Example */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            
            {/* PROGRAM HEADER WITH 3-DOT MENU */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase">K-12 Education</span>
                  <span className="text-slate-500 text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">schedule</span> 1 Year
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Grade 10 (O-Levels)</h3>
              </div>
              
              {/* Program Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => toggleDropdown('prog_1')}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
                >
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
                {activeDropdown === 'prog_1' && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-10 py-2">
                    <button onClick={() => handleAction('edit_program')} className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">edit</span> Edit Program
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">delete</span> Delete Program
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 space-y-4 flex-1">
              
              {/* BATCH A WITH 3-DOT MENU */}
              <div className="group relative bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Section A</h4>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">ACTIVE</span>
                  </div>
                  
                  {/* Batch Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => toggleDropdown('batch_1')}
                      className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                    </button>
                    {activeDropdown === 'batch_1' && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-10 py-2">
                        <button onClick={() => handleAction('edit_batch')} className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">edit</span> Edit Batch
                        </button>
                        <button onClick={() => handleAction('allocate_subject')} className="w-full text-left px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">person_add</span> Allocate Subjects
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">25 / 30 students</span>
                    <span className="text-slate-900 dark:text-white">83% Full</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '83%' }}></div>
                  </div>
                </div>
              </div>

              {/* Add Batch Button */}
              <button 
                onClick={() => setIsBatchDrawerOpen(true)}
                className="w-full py-4 mt-2 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 rounded-lg text-slate-500 hover:text-primary font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">add</span>
                + Add New Batch/Section
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Slide-over Drawers */}
      <CreateProgramDrawer isOpen={isProgramDrawerOpen} onClose={() => setIsProgramDrawerOpen(false)} />
      <CreateBatchDrawer isOpen={isBatchDrawerOpen} onClose={() => setIsBatchDrawerOpen(false)} />
      <AllocateTeacherDrawer isOpen={isAllocationDrawerOpen} onClose={() => setIsAllocationDrawerOpen(false)} />
      
    </Layout>
  );
}