import { StatsGrid } from "../components/sync/StatsGrid";
import { StatusHero } from "../components/sync/StatusHero";
import { SyncLogTable } from "../components/sync/SyncLogTable";
import { SystemInfo } from "../components/sync/SystemInfo";
import { Layout } from "../Layout";


export function SyncPage() {
  return (
    <Layout title="Sync & System Status">
      {/* We use Flex Column and Gap-8 to force perfect vertical spacing in Electron */}
      <div className="p-8 max-w-5xl mx-auto w-full flex flex-col gap-8">
        <StatusHero />
        <StatsGrid />
        <SyncLogTable />
        <SystemInfo />
      </div>
    </Layout>
  );
}