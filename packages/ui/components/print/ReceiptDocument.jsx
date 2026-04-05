import { ReceiptHalf } from './ReceiptHalf';

export function ReceiptDocument({ data }) {
  return (
    <div className="bg-white text-black border border-slate-200 shadow-xl print:border-none print:shadow-none mx-auto flex flex-col p-8" style={{ width: '210mm', minHeight: '297mm' }}>
      
      {/* Top Half: Office Copy */}
      <ReceiptHalf copyType="OFFICE COPY" {...data} />

      {/* The Cut Line (Hidden when actually printing) */}
      <div className="my-12 border-t-2 border-dashed border-black relative print:hidden">
        <div className="absolute -top-3 right-5 bg-white px-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-black">content_cut</span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-black">Cut Here</span>
        </div>
      </div>

      {/* Bottom Half: Student Copy (pushed to bottom using mt-auto) */}
      <div className="mt-auto">
        <ReceiptHalf copyType="STUDENT COPY" {...data} />
      </div>

    </div>
  );
}