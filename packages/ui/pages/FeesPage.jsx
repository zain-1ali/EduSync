import { FeePaymentForm } from '../components/fees/FeePaymentForm';
import { FeeStudentList } from '../components/fees/FeeStudentList';
import { Layout } from '../Layout';


export function FeesPage() {
  // Add a nice "Export" button to the master header for this page
  const feeHeaderActions = (
    <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
      <span className="material-symbols-outlined text-lg">download</span>
      Export Daily Report
    </button>
  );

  return (
    <Layout title="Fee Management" headerActions={feeHeaderActions}>
      {/* We use Flex and Gap here to force flawless layout in Electron */}
      <div className="p-6 md:p-8 w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row items-start gap-8">
        
        {/* Left Side: Select Student */}
        <FeeStudentList />
        
        {/* Right Side: The Form */}
        <FeePaymentForm />

      </div>
    </Layout>
  );
}