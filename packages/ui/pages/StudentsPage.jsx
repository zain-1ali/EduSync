import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../Layout.jsx';
import { FilterBar } from '../components/FilterBar.jsx';
import { StudentTable } from '../components/StudentTable.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { SyncStatus } from '../components/SyncStatus.jsx';


export function StudentsPage() {

    const navigate = useNavigate();
  // Page-specific Header Actions
  const studentHeaderActions = (
    <div className="flex items-center gap-4">
      <div className="relative w-64">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
        <input 
          className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
          placeholder="Search by name or ID..." 
          type="text"
        />
      </div>
      <button onClick={()=>navigate("/students/add")} className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
        <span className="material-symbols-outlined text-lg">person_add</span>
        Add New Student
      </button>
    </div>
  );

  // Data to pass to the table component
  const students = [
    { id: "#STU-2026-001", name: "Arjun Sharma", grade: "Class 8 - Sec A", father: "Rajesh Sharma" },
    { id: "#STU-2026-042", name: "Priya Verma", grade: "Class 8 - Sec B", father: "Anil Verma" },
    { id: "#STU-2026-118", name: "Rohan Das", grade: "Class 7 - Sec A", father: "Sanjay Das" },
    { id: "#STU-2026-005", name: "Sana Khan", grade: "Class 9 - Sec C", father: "Irshad Khan" },
    { id: "#STU-2026-089", name: "Vikram Singh", grade: "Class 10 - Sec A", father: "Mahendra Singh" },
  ];

  return (
    <Layout title="Student Management" headerActions={studentHeaderActions}>
      <div className="p-8 max-w-[1200px] w-full mx-auto flex flex-col gap-6">
        
        {/* Breadcrumbs & Title */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <Link to="/dashboard" className="text-slate-500 hover:text-primary transition-colors">Dashboard</Link>
          <span className="text-slate-500">/</span>
          <span className="font-medium">Student List</span>
        </div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Student Directory</h1>
        </div>

        {/* Page Components */}
        <FilterBar />
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <StudentTable students={students} />
          <Pagination />
        </div>

        <SyncStatus />
      </div>
    </Layout>
  );
}