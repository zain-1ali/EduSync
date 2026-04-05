import { RecentActivityTable } from '../components/RecentActivityTable';
import { StatsCards } from '../components/StatsCard';
import { Layout } from '../Layout';

export function DashboardPage() {
  // Define what the Dashboard wants in the header (The Search Bar)
  const dashboardSearch = (
    <div className="relative w-64">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
      <input className="w-full pl-10 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Search records..." type="text"/>
    </div>
  );

  return (
    <Layout title="Overview" headerActions={dashboardSearch}>
      {/* Everything inside here is passed to Layout as "children" */}
      <div className="p-8 flex flex-col gap-8 flex-grow">
        <StatsCards />
        <RecentActivityTable />
      </div>
    </Layout>
  );
}