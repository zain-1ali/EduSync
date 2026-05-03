export function ReceiptCustomizationForm() {
  return (
    <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <span className="material-symbols-outlined text-primary">receipt_long</span>
        <h3 className="text-slate-900 dark:text-white text-xl font-bold">Receipt Customization</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <p className="text-slate-900 dark:text-slate-200 text-sm font-bold leading-normal">Receipt Header Text</p>
              <span className="text-xs text-slate-400">Max 100 characters</span>
            </div>
            <textarea 
              className="w-full rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-base resize-none" 
              placeholder="e.g. 'Knowledge is Power' or 'Est. 1954'" 
              rows="3"
              defaultValue="Excellence in Education since 1985"
            ></textarea>
            <p className="text-xs text-slate-500 dark:text-slate-400">Appears just below the school logo on all printed receipts.</p>
          </label>
        </div>
        
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <p className="text-slate-900 dark:text-slate-200 text-sm font-bold leading-normal">Receipt Footer Text</p>
              <span className="text-xs text-slate-400">Max 250 characters</span>
            </div>
            <textarea 
              className="w-full rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-base resize-none" 
              placeholder="e.g. Terms, conditions, or a thank you note." 
              rows="3"
              defaultValue="Note: Fees once paid are non-refundable. Please keep this receipt for future reference. Thank you for choosing St. Mary's Primary School."
            ></textarea>
            <p className="text-xs text-slate-500 dark:text-slate-400">Appears at the bottom of the page. Ideal for legal disclaimers.</p>
          </label>
        </div>
      </div>
    </section>
  );
}