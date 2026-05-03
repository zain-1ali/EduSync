import { useState } from 'react';

export function UploadDropzone({ onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div className="flex flex-col rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Drop Zone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`m-6 border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${isDragging ? 'border-primary bg-primary/10' : 'border-primary/30 dark:border-primary/50 bg-primary/5 dark:bg-primary/10 hover:border-primary hover:bg-primary/10'}`}
      >
        <div className="size-16 bg-primary/20 dark:bg-primary/30 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
          <span className="material-symbols-outlined text-primary text-4xl">
            {fileName ? 'task' : 'upload_file'}
          </span>
        </div>
        <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-2">
          {fileName ? fileName : 'Drag and drop file here'}
        </h3>
        <p className="text-slate-500 text-sm mb-6 max-w-xs">
          Supports .xlsx, .xls, and .csv formats. Max file size 10MB.
        </p>
        <button className="h-12 px-6 rounded-lg bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 transition-colors active:scale-95">
          Select File from Computer
        </button>
      </div>

      {/* Additional Actions */}
      <div className="px-6 pb-6 pt-2 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-2 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3 py-4">
          <span className="material-symbols-outlined text-primary">info</span>
          <p className="text-slate-500 text-sm font-medium">Need the correct format?</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border-2 border-primary/20 text-primary rounded-lg text-sm font-bold hover:bg-primary/10 transition-colors">
          <span className="material-symbols-outlined text-base">download</span>
          Download Sample Template
        </button>
      </div>
    </div>
  );
}