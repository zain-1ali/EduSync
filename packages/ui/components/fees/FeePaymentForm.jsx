export function FeePaymentForm() {
  return (
    <div className="flex-1 flex flex-col gap-6">
      
      {/* Student Info Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="size-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-400">
            A
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Aarav Sharma</h1>
            <div className="flex gap-4 text-slate-500 dark:text-slate-400 text-sm font-medium">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">badge</span> ID: 1024</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">school</span> Grade 4-B</span>
            </div>
          </div>
        </div>
        <div className="text-right flex flex-col gap-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Outstanding Balance</p>
          <p className="text-3xl font-bold text-rose-500">$450.00</p>
        </div>
      </div>

      {/* Main Payment Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-8">
        <h3 className="text-xl font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <span className="material-symbols-outlined text-primary">payments</span>
          Payment Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form Fields */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Transaction Date</label>
            <input className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary text-base" type="date" defaultValue="2026-10-27"/>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Payment for Month(s)</label>
            <select className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary text-base">
              <option>October 2026</option>
              <option>November 2026</option>
              <option>December 2026</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Amount Paid ($)</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">$</div>
              <input className="w-full h-14 pl-10 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary text-2xl font-bold text-primary" type="number" defaultValue="150.00"/>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Payment Mode</label>
            <div className="grid grid-cols-2 gap-2 h-14 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button className="flex items-center justify-center gap-2 bg-white dark:bg-slate-700 shadow-sm rounded-md font-bold text-primary transition-all">
                <span className="material-symbols-outlined">payments</span> Cash
              </button>
              <button className="flex items-center justify-center gap-2 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-md font-medium text-slate-500 dark:text-slate-400 transition-all">
                <span className="material-symbols-outlined">account_balance_wallet</span> Cheque
              </button>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Reference / Notes (Optional)</label>
            <input className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary text-base" placeholder="e.g. Receipt # or Cheque number" type="text"/>
          </div>
        </div>

        {/* Dynamic Summary Block */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm flex items-center flex-wrap justify-center gap-3">
            <span className="text-slate-500 dark:text-slate-400">Current Balance: <span className="font-bold text-slate-900 dark:text-white">$450.00</span></span>
            <span className="hidden sm:block text-slate-300 dark:text-slate-600">|</span>
            <span className="text-slate-500 dark:text-slate-400">This Payment: <span className="font-bold text-primary">$150.00</span></span>
          </div>
          <div className="text-center sm:text-right flex flex-col">
            <span className="text-xs uppercase font-bold text-slate-400">Remaining Balance</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">$300.00</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-4 pt-4">
          <button className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            <span className="text-lg font-bold">Record Payment & Print Receipt</span>
          </button>
          <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            Data will be synced securely to local storage.
          </p>
        </div>

      </div>
    </div>
  );
}