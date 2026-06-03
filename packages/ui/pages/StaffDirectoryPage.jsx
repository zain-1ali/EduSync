import { useState, useRef, useEffect } from 'react';
import { AddStaffDrawer } from '../components/staff/AddStaffDrawer';
import { Layout } from '../Layout';
import { useStaffList, useStaffStats, useUpdateStaffStatus } from '../api/hooks/useStaff';

export function StaffDirectoryPage() {
  // --- State for Filters & Search ---
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // --- State for UI ---
  const [isAddStaffDrawerOpen, setIsAddStaffDrawerOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // --- API Hooks ---
  // const { data: staffData = [], isLoading, isError } = useStaffList();

  const { data: staffData = [], isLoading,isError } = useStaffList({
  search: searchQuery,
  role: roleFilter,
  status: statusFilter
});

const { data: stats = { totalStaff: 0, activeInstructors: 0, onLeaveCount: 0 } } = useStaffStats();


  const { mutate: updateStatus } = useUpdateStaffStatus();

  // Close dropdowns if user clicks outside
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

  // --- Format Data & Calculate Metrics ---
  const formattedStaff = staffData.map((staff) => ({
    dbId: staff._id,
    id: staff.employeeId,
    name: `${staff.firstName} ${staff.lastName}`,
    title: staff.specialization || staff.highestEducation || 'Staff',
    role: staff.role, // 'administrator', 'instructor', 'support staff'
    email: staff.email,
    phone: staff.phone,
    rawStatus: staff.status, // 'active', 'inactive', 'on_leave'
    displayStatus: staff.status === 'on_leave' ? 'On Leave' : staff.status.charAt(0).toUpperCase() + staff.status.slice(1),
    initials: `${staff.firstName.charAt(0)}${staff.lastName.charAt(0)}`.toUpperCase()
  }));

  // const totalStaff = formattedStaff.length;
  // const activeInstructors = formattedStaff.filter(s => s.role === 'instructor' && s.rawStatus === 'active').length;
  // const onLeaveCount = formattedStaff.filter(s => s.rawStatus === 'on_leave').length;

  // --- Filtering Logic ---
  const filteredStaff = formattedStaff.filter((staff) => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) || staff.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter ? staff.role === roleFilter : true;
    const matchesStatus = statusFilter ? staff.rawStatus === statusFilter : true;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // --- Handlers ---
  const handleStatusChange = (dbId, newStatus) => {
    updateStatus({ id: dbId, status: newStatus });
    setActiveDropdown(null);
  };

  return (
    <Layout title="Staff Directory">
      <div className="flex-1 max-w-[1200px] mx-auto px-6 py-10 w-full" ref={pageRef}>
        
        {/* Section 1: Page Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2 leading-none">Staff Directory</h1>
            <p className="text-slate-500 font-medium">Manage all administrators, instructors, and support staff.</p>
          </div>
          <button 
            onClick={() => setIsAddStaffDrawerOpen(true)}
            className="bg-primary text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Add New Staff
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-5">
            <div className="bg-primary/10 p-3 rounded-lg text-primary">
              <span className="material-symbols-outlined text-3xl">groups</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Staff</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{isLoading ? '-' : stats.totalStaff}</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-5">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg text-purple-600 dark:text-purple-400">
              <span className="material-symbols-outlined text-3xl">school</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Active Instructors</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{isLoading ? '-' : stats.activeInstructors}</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-5">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg text-amber-600 dark:text-amber-400">
              <span className="material-symbols-outlined text-3xl">event_busy</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">On Leave</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{isLoading ? '-' : stats.onLeaveCount}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Action Bar (Search & Filters) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:outline-none" 
              placeholder="Search staff by name or ID..." 
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="flex-1 md:w-48 bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-300 font-semibold text-sm cursor-pointer focus:outline-none capitalize"
            >
              <option value="">Role: All</option>
              <option value="administrator">Administrator</option>
              <option value="instructor">Instructor</option>
              <option value="support staff">Support Staff</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 md:w-48 bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-300 font-semibold text-sm cursor-pointer focus:outline-none"
            >
              <option value="">Status: All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </div>

        {/* Section 3: Data Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-800">Employee</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-800">ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-800">System Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-800">Contact Info</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-800">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-800 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                      <span className="material-symbols-outlined animate-spin text-2xl">sync</span>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-red-500 font-medium">
                      Failed to load staff data.
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                      No staff members match your current filters.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff) => (
                    <tr key={staff.dbId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            {staff.initials}
                          </div>
                          <div>
                            <span className="block font-bold text-slate-900 dark:text-white">{staff.name}</span>
                            <span className="block text-xs text-slate-500">{staff.title}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">{staff.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">{staff.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs">
                          <span className="block text-slate-900 dark:text-white font-medium">{staff.email}</span>
                          <span className="block text-slate-500">{staff.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight ${
                          staff.rawStatus === 'active' 
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' 
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
                        }`}>
                          {staff.displayStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button 
                          onClick={() => setActiveDropdown(activeDropdown === staff.dbId ? null : staff.dbId)}
                          className="text-slate-400 hover:text-primary transition-colors p-1"
                        >
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>

                        {/* Action Dropdown Menu */}
                        {activeDropdown === staff.dbId && (
                          <div className="absolute right-8 top-10 mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-10 py-2 text-left">
                            <button className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px]">person</span> View Profile
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px]">edit</span> Edit Details
                            </button>
                            <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                            
                            {staff.rawStatus === 'active' ? (
                              <button 
                                onClick={() => handleStatusChange(staff.dbId, 'on_leave')}
                                className="w-full text-left px-4 py-2 text-sm font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[18px]">pause_circle</span> Mark on Leave
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleStatusChange(staff.dbId, 'active')}
                                className="w-full text-left px-4 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[18px]">play_circle</span> Mark Active
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500 font-medium">Showing {filteredStaff.length} entries</span>
            <div className="flex gap-2">
              <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="p-1.5 rounded-lg border border-primary bg-primary text-white font-bold text-xs px-3">1</button>
              <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddStaffDrawer isOpen={isAddStaffDrawerOpen} onClose={() => setIsAddStaffDrawerOpen(false)} />
    </Layout>
  );
}