import { DataPreviewTable } from "../components/import/DataPreviewTable";
import { FieldMappingTable } from "../components/import/FieldMappingTable";
import { MissingFieldsPanel } from "../components/import/MissingFieldsPanel";
import { VerticalImportStepper } from "../components/import/VerticalImportStepper";
import { Layout } from "../Layout";

export function ImportMapPage() {
  return (
    <Layout title="Data Import">
      <div className="max-w-[1100px] w-full mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 text-sm font-medium">
          <span className="text-slate-500">Settings</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-500">Data Import</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-900 dark:text-white font-bold">Step 2: Map Fields</span>
        </div>

        {/* Page Heading */}
        <div className="flex flex-wrap justify-between items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">Map Your Data</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base">Match the columns from your uploaded file to the corresponding school record fields.</p>
          </div>
          <button className="flex items-center justify-center rounded-lg h-10 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined mr-2 text-sm">download</span>
            Download Template
          </button>
        </div>

        {/* Main Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Sidebar */}
          <VerticalImportStepper />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-6 w-full">
            <FieldMappingTable />
            <MissingFieldsPanel />
            <DataPreviewTable />
          </div>

        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between py-6 border-t border-slate-200 dark:border-slate-800 gap-4">
          <button className="px-6 h-10 rounded-lg text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto">
            Back to Upload
          </button>
          
          <div className="flex gap-4 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-6 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Save Draft
            </button>
            <button className="flex-1 sm:flex-none px-8 h-10 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center">
              Continue to Review
              <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Offline Note */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-500 pb-4">
          <div className="flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            Processed locally in your browser for maximum privacy and offline availability.
          </div>
        </div>

      </div>
    </Layout>
  );
}