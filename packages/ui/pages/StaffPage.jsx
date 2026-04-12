import { Layout } from '../Layout';
import { PermissionsPanel } from '../staff/PermissionsPanel';
import { StaffList } from '../staff/StaffList';


export function StaffPage() {
  return (
    <Layout title="User Management">
      {/* We use Flex and Gap here to force flawless layout without hardcoded margins */}
      <div className="p-6 md:p-8 w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row items-start gap-8">
        
        {/* Left Side: Select Staff Member */}
        <StaffList />
        
        {/* Right Side: Toggles and Permissions */}
        <PermissionsPanel />

      </div>
    </Layout>
  );
}