import { PrintSidebar } from "../components/print/PrintSidebar";
import { ReceiptDocument } from "../components/print/ReceiptDocument";


export function PrintReceiptPage() {
  
  // MOCK DATA: In a real app, you would fetch this based on an ID in the URL!
  const receiptData = {
    school: {
      name: "Greenwood International School",
      address: "123 Education Lane, Springfield",
      phone: "+1 555-0102",
      affiliation: "987654321",
      website: "www.greenwood.edu"
    },
    receipt: {
      number: "#FR-2026-8842",
      date: "Oct 27, 2026",
      amountInWords: "Four Hundred and Fifty Dollars Only"
    },
    student: {
      name: "Aarav Sharma",
      grade: "Grade 4 - B",
      admissionNo: "GIS-2023-1024"
    },
    fees: [
      { id: 1, description: "Monthly Tuition Fee (October 2026)", amount: 350.00 },
      { id: 2, description: "Library Maintenance Fee", amount: 25.00 },
      { id: 3, description: "Science Lab Fee", amount: 75.00 }
    ]
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      
      {/* Custom Print Header (Hidden on Print) */}
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-3 shrink-0 print:hidden sticky top-0 z-50">
        <div className="flex items-center gap-4 text-primary">
          <span className="material-symbols-outlined text-3xl">receipt_long</span>
          <h2 className="text-lg font-bold">Receipt Generator</h2>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-slate-500">Preview Mode: A4 Split (A5 Each)</span>
          <div className="flex gap-3">
            <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-5 text-sm font-bold transition-colors hover:bg-slate-200 dark:hover:bg-slate-700">
              <span className="material-symbols-outlined text-base">picture_as_pdf</span>
              Download PDF
            </button>
            <button onClick={handlePrint} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-white px-5 text-sm font-bold shadow-md hover:bg-primary/90 transition-all active:scale-95">
              <span className="material-symbols-outlined text-base">print</span>
              Print Receipt
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden print:overflow-visible">
        
        {/* Left Sidebar */}
        <PrintSidebar />
        
        {/* Center Document Area */}
        <main className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible flex justify-center bg-slate-50 dark:bg-[#0a0f16] print:bg-white">
          <ReceiptDocument data={receiptData} />
        </main>

      </div>
    </div>
  );
}