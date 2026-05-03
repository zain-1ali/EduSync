import { useState } from 'react';
import { Layout } from '../Layout';
import { ValidationStats } from '../components/import/ValidationStats';
import { FlaggedRecords } from '../components/import/FlaggedRecords';
import { ImportStatus } from '../components/import/ImportStatus';


export function ImportReviewPage() {
  // State Machine: 'review' -> 'importing' -> 'success'
  const [importStatus, setImportStatus] = useState('review');
  const [progress, setProgress] = useState(0);

  // Mock Data
  const flaggedData = [
    { row: 14, name: "John Doe", issue: "Missing 'Date of Birth' field.", icon: "person_off" },
    { row: 32, name: "Jane Smith", issue: "Invalid email format: 'jane.smith@school'", icon: "alternate_email" }
  ];

  const handleStartImport = () => {
    setImportStatus('importing');
    
    // Simulate import progress for demonstration
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => setImportStatus('success'), 500);
      }
    }, 500);
  };

  return (
    <Layout title="Data Import">
      <div className="flex flex-col max-w-[960px] w-full mx-auto px-4 py-8 gap-6 flex-1">
        
        {/* Breadcrumbs / Stepper */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-primary text-sm font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Select File
          </span>
          <span className="text-slate-400 text-sm font-medium">/</span>
          <span className="text-primary text-sm font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Map Fields
          </span>
          <span className="text-slate-400 text-sm font-medium">/</span>
          <span className="text-slate-900 dark:text-white text-sm font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">radio_button_checked</span>
            Validate & Finalize
          </span>
        </div>

        {/* Page Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Final Validation</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base">Review flagged records and confirm your import to the local database.</p>
          </div>
          
          {importStatus === 'review' && (
            <div className="flex gap-3 items-center">
              <button className="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Back to Mapping
              </button>
              <button 
                onClick={handleStartImport}
                className="flex min-w-[140px] items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors active:scale-95"
              >
                Start Import
              </button>
            </div>
          )}
        </div>

        {/* Only show Review Content if we haven't successfully finished */}
        {importStatus !== 'success' && (
          <>
            <ValidationStats readyCount={50} draftCount={2} />
            
            {/* Hide Flagged Records while the progress bar is running to keep UI clean */}
            {importStatus === 'review' && <FlaggedRecords records={flaggedData} />}
          </>
        )}

        {/* Progress Bar & Success States */}
        <ImportStatus 
          status={importStatus} 
          progress={progress} 
          currentRecord={Math.floor((progress / 100) * 52)} 
          totalRecords={52} 
          onComplete={() => console.log('Redirecting to Student List...')}
        />

        {/* Footer Database Info */}
        <div className="mt-auto flex items-center justify-center gap-3 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
          <span className="material-symbols-outlined text-slate-400">database</span>
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest">
            Offline-First Sync Active • Local Database Ready
          </p>
        </div>

      </div>
    </Layout>
  );
}