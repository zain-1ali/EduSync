import { useState } from 'react';
import { ImportStepper } from '../components/import/ImportStepper';
import { UploadDropzone } from '../components/import/UploadDropzone';
import { CoreFieldsSidebar } from '../components/import/CoreFieldsSidebar';
import { Layout } from '../Layout';


export function ImportUploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleContinue = () => {
    // In a real app, this would route to Step 2: /import/map
    console.log("Proceeding to mapping with file:", selectedFile.name);
  };

  return (
    <Layout title="Data Import">
      <div className="max-w-[1000px] w-full mx-auto px-4 py-8 flex flex-col">
        
        <ImportStepper currentStep={1} />
        
        {/* Header Section */}
        <div className="text-center mb-8 flex flex-col gap-2">
          <h1 className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold">Import School Records</h1>
          <p className="text-slate-500 text-base font-normal">
            Quickly add multiple students to your local database using an Excel or CSV file.
          </p>
        </div>

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left: Upload Area */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <UploadDropzone onFileSelect={setSelectedFile} />
            
            {/* Offline Privacy Notice */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
              <span className="material-symbols-outlined text-green-600">verified_user</span>
              <div className="flex-1">
                <p className="text-green-800 dark:text-green-300 text-sm font-bold">Privacy Guaranteed</p>
                <p className="text-green-700 dark:text-green-400 text-xs mt-0.5">This tool processes your file locally. Your school data never leaves this computer.</p>
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <CoreFieldsSidebar />
          
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 flex justify-end gap-4 border-t border-slate-200 dark:border-slate-800 pt-8 px-4">
          <button className="px-6 py-2 text-slate-500 dark:text-slate-400 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            Cancel Import
          </button>
          
          <button 
            disabled={!selectedFile}
            onClick={handleContinue}
            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-sm transition-all ${selectedFile ? 'bg-primary text-white hover:bg-primary/90 shadow-lg active:scale-95' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'}`}
          >
            Continue to Mapping
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

      </div>
    </Layout>
  );
}