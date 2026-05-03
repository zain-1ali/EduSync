import { ContactInfoForm } from "../components/settings/ContactInfoForm";
import { ReceiptCustomizationForm } from "../components/settings/ReceiptCustomizationForm";
import { SchoolIdentityForm } from "../components/settings/SchoolIdentityForm";
import { Layout } from "../Layout";

export function SettingsPage() {
  
  // Header Actions (Top Buttons)
  const settingsHeaderActions = (
    <div className="flex gap-3">
      <button className="hidden sm:flex items-center justify-center rounded-lg h-10 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold tracking-[0.015em] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
        <span className="material-symbols-outlined mr-2 text-[18px]">visibility</span>
        Preview Receipt
      </button>
      <button className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold tracking-[0.015em] shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors active:scale-95">
        Save Settings
      </button>
    </div>
  );

  return (
    <Layout title="School Branding & Identity" headerActions={settingsHeaderActions}>
      
      {/* Master Container with Flex Gap 8 */}
      <div className="max-w-[1200px] mx-auto px-6 py-8 w-full flex flex-col gap-8">
        
        {/* Sub-Headline */}
        <div className="flex flex-col gap-1 -mt-2">
          <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
            Manage how your school appears on official documents and receipts.
          </p>
        </div>

        {/* Top Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SchoolIdentityForm />
          <ContactInfoForm />
        </div>

        {/* Bottom Full-Width Section */}
        <ReceiptCustomizationForm />

        {/* Footer Actions (Bottom Buttons) */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-lg">info</span>
            <span>Settings are stored locally and will sync once online.</span>
          </div>
          
          <div className="flex w-full sm:w-auto gap-4">
            <button className="flex-1 sm:flex-none px-6 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Discard
            </button>
            <button className="flex-1 sm:flex-none px-10 py-3 rounded-lg bg-primary text-white text-sm font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95">
              Save All Settings
            </button>
          </div>
        </div>
        
      </div>
    </Layout>
  );
}