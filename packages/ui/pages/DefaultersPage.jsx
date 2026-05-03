import { DefaulterFilters } from "../components/defaulters/DefaulterFilters";
import { DefaulterList } from "../components/defaulters/DefaulterList";
import { Layout } from "../Layout";


export function DefaultersPage() {
  return (
    <Layout title="Fee Defaulters">
      {/* Master Container: flex flex-col to push footer down, flex-1 to fill space */}
      <div className="flex flex-col flex-1 max-w-[1400px] mx-auto w-full p-6 md:p-8 gap-8">
        
        {/* Main Content Split: Filters on Left, List on Right */}
        <div className="flex flex-col lg:flex-row items-start gap-8 w-full">
          <DefaulterFilters />
          <DefaulterList />
        </div>

        {/* Sync Tooltip Footer (Pushed to bottom) */}
        <div className="flex justify-center mt-auto pt-4">
          <div className="flex flex-wrap justify-center items-center gap-2 px-4 py-2 bg-slate-200/50 dark:bg-slate-800/80 rounded-full text-[10px] text-slate-500 dark:text-slate-400 font-medium text-center">
            <span className="material-symbols-outlined text-sm">history</span>
            LAST LOCAL SAVE: 2 MINUTES AGO
            <span className="hidden sm:inline text-slate-300 dark:text-slate-600 mx-1">|</span>
            ALL CHANGES ARE SAVED LOCALLY AND WILL SYNC WHEN ONLINE
          </div>
        </div>

      </div>
    </Layout>
  );
}