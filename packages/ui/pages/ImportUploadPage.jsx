import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImportStepper } from '../components/import/ImportStepper';
import { useLocalData } from '../data/LocalDataProvider';
import { parseImportFile } from '../import/parseImportFile';
import { Layout } from '../Layout';


export function ImportUploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const navigate = useNavigate();
  const { db } = useLocalData();

  const handleContinue = async () => {
    setError('');
    setIsParsing(true);
    try {
      const parsed = await parseImportFile(selectedFile);
      const job = {
        id: crypto.randomUUID(),
        fileName: selectedFile.name,
        headers: parsed.headers,
        rows: parsed.rows,
        mapping: {},
        status: 'mapping',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.importJobs.add(job);
      navigate(`/import/map?job=${job.id}`);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsParsing(false);
    }
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

        <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
            <label className="min-h-56 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-8 cursor-pointer hover:border-primary">
              <span className="material-symbols-outlined text-5xl text-primary">upload_file</span>
              <span className="font-black mt-3">{selectedFile ? selectedFile.name : 'Select CSV or XLSX file'}</span>
              <span className="text-sm text-slate-500 mt-1">The file is parsed on this device.</span>
              <input type="file" accept=".csv,.xlsx" className="sr-only" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />
            </label>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
              <span className="material-symbols-outlined text-green-600">verified_user</span>
              <div className="flex-1">
                <p className="text-green-800 dark:text-green-300 text-sm font-bold">Privacy Guaranteed</p>
                <p className="text-green-700 dark:text-green-400 text-xs mt-0.5">This tool processes your file locally. Your school data never leaves this computer.</p>
              </div>
            </div>
            {error && <p className="text-red-600 font-semibold" role="alert">{error}</p>}
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 flex justify-end gap-4 border-t border-slate-200 dark:border-slate-800 pt-8 px-4">
          <button onClick={() => navigate('/students')} className="px-6 py-2 text-slate-500 dark:text-slate-400 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            Cancel Import
          </button>
          
          <button 
            disabled={!selectedFile || isParsing}
            onClick={handleContinue}
            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-sm transition-all ${selectedFile ? 'bg-primary text-white hover:bg-primary/90 shadow-lg active:scale-95' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'}`}
          >
            {isParsing ? 'Parsing…' : 'Continue to Mapping'}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

      </div>
    </Layout>
  );
}