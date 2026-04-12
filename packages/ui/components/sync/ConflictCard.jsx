export function ConflictCard({ type, title, subtitle, icon, headerClass, fields, buttonText, buttonIcon, onSelect }) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm flex-1">
      
      {/* Dynamic Header */}
      <div className={`px-6 py-4 border-b border-slate-200 dark:border-slate-800 ${headerClass}`}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">{icon}</span>
          <h3 className="text-slate-900 dark:text-white font-bold">{title}</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold">
          {subtitle}
        </p>
      </div>

      {/* Dynamic Data Fields */}
      <div className="p-6 flex flex-col gap-6">
        {fields.map((field, index) => (
          <div 
            key={index} 
            className={`flex flex-col gap-1 ${field.isConflict ? 'p-3 -mx-3 rounded-lg bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500' : ''}`}
          >
            <span className={`text-xs font-semibold uppercase tracking-tighter ${field.isConflict ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`}>
              {field.label}
            </span>
            <p className={`text-base ${field.isConflict ? 'font-bold text-red-700 dark:text-red-300' : 'font-medium text-slate-900 dark:text-white'}`}>
              {field.value}
            </p>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div className="p-6 pt-0 mt-auto">
        <button 
          onClick={onSelect}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-lg bg-primary text-white text-base font-bold transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">{buttonIcon}</span>
          {buttonText}
        </button>
      </div>
    </div>
  );
}