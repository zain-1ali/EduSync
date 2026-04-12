import { ConflictBanner } from "../components/sync/ConflictBanner";
import { ConflictCard } from "../components/sync/ConflictCard";
import { Layout } from "../Layout";


export function SyncConflictPage() {
  
  // Data for the Local Card
  const localFields = [
    { label: "Student Name", value: "James Wilson", isConflict: false },
    { label: "Primary Address", value: "442 Oak Lane, North Wing, Apt 4B", isConflict: true },
    { label: "Phone Number", value: "(555) 123-4567", isConflict: false },
    { label: "Current Fee Balance", value: "$1,250.00", isConflict: true },
  ];

  // Data for the Cloud Card
  const cloudFields = [
    { label: "Student Name", value: "James Wilson", isConflict: false },
    { label: "Primary Address", value: "442 Oak Lane, Suite 402", isConflict: true },
    { label: "Phone Number", value: "(555) 123-4567", isConflict: false },
    { label: "Current Fee Balance", value: "$1,400.00", isConflict: true },
  ];

  return (
    <Layout title="Sync Management">
      {/* Container with flex gap-8 instead of margins */}
      <div className="flex flex-col gap-8 max-w-[1000px] mx-auto w-full p-6 md:p-8 flex-1">
        
        {/* Banner */}
        <ConflictBanner studentId="#4402" />

        {/* Headline */}
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-slate-900 dark:text-white tracking-tight text-3xl font-extrabold leading-tight">
            Resolve Data Conflict
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
            James Wilson (Grade 10-B) • Last successfully synced 4 hours ago
          </p>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ConflictCard 
            title="Local Version"
            subtitle="Saved on this computer"
            icon="laptop_mac"
            headerClass="bg-slate-100 dark:bg-slate-800"
            fields={localFields}
            buttonText="Keep Local Version"
            buttonIcon="check_circle"
            onSelect={() => console.log('Kept Local')}
          />
          
          <ConflictCard 
            title="Cloud Version"
            subtitle="Synced from Server"
            icon="cloud_done"
            headerClass="bg-primary/10 dark:bg-primary/20 border-b-primary/20"
            fields={cloudFields}
            buttonText="Keep Cloud Version"
            buttonIcon="cloud_upload"
            onSelect={() => console.log('Kept Cloud')}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 mt-auto">
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
            <span className="font-bold text-slate-700 dark:text-slate-300">Note:</span> Choosing a version will overwrite the other data immediately across the system once synchronization resumes.
          </p>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-5 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Review Later
            </button>
            <button className="flex-1 md:flex-none px-5 h-10 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
              Cancel Sync
            </button>
          </div>
        </div>

      </div>
    </Layout>
  );
}