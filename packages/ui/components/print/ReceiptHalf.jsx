export function ReceiptHalf({ copyType, school, receipt, student, fees }) {
  // Calculate total dynamically
  const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-slate-200 rounded-lg flex items-center justify-center border border-slate-300 print:bg-slate-200">
            <span className="material-symbols-outlined text-3xl opacity-50 text-black">school</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-black">{school.name}</h1>
            <p className="text-xs text-black">{school.address} | Ph: {school.phone}</p>
            <p className="text-xs text-black">Affiliation No: {school.affiliation} | Website: {school.website}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`inline-block border-2 border-black px-4 py-1 font-bold text-sm ${copyType === 'OFFICE COPY' ? 'bg-black text-white print:bg-black print:text-white' : 'bg-white text-black'}`}>
            {copyType}
          </div>
          <p className="mt-2 text-xs font-semibold text-black">No: {receipt.number}</p>
          <p className="text-xs text-black">Date: {receipt.date}</p>
        </div>
      </div>

      {/* Student Info Grid */}
      <div className="grid grid-cols-3 gap-4 border-b border-black py-4">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-500 print:text-slate-600">Student Name</span>
          <span className="text-sm font-semibold text-black uppercase">{student.name}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-500 print:text-slate-600">Class / Section</span>
          <span className="text-sm font-semibold text-black uppercase">{student.grade}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-500 print:text-slate-600">Admission No.</span>
          <span className="text-sm font-semibold text-black uppercase">{student.admissionNo}</span>
        </div>
      </div>

      {/* Fee Table */}
      <div className="min-h-[120px]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-2 text-left text-xs uppercase w-12 text-black">Sr.</th>
              <th className="py-2 text-left text-xs uppercase text-black">Description</th>
              <th className="py-2 text-right text-xs uppercase w-32 text-black">Amount ($)</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((fee, index) => (
              <tr key={fee.id} className="border-b border-slate-300">
                <td className="py-2 text-sm text-black">{index + 1}</td>
                <td className="py-2 text-sm font-medium text-black">{fee.description}</td>
                <td className="py-2 text-right text-sm text-black">{fee.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="2" className="py-3 text-right font-bold text-sm uppercase text-black">Total Amount:</td>
              <td className="py-3 text-right font-bold text-lg border-b-2 border-black underline decoration-double underline-offset-4 text-black">
                {totalAmount.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="flex justify-between items-end mt-4">
        <div className="w-2/3">
          <p className="text-[10px] font-bold uppercase italic text-slate-500 print:text-slate-600">Amount in Words</p>
          <p className="text-xs font-semibold text-black uppercase">{receipt.amountInWords}</p>
          <p className="mt-4 text-[10px] italic text-black">
            {copyType === 'OFFICE COPY' ? '* This is a computer generated receipt. Signature not mandatory.' : '* Keep this copy for your records.'}
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className={`size-20 border-2 border-slate-300 rounded-full flex items-center justify-center opacity-20 border-dashed transform ${copyType === 'OFFICE COPY' ? '-rotate-12' : 'rotate-12'}`}>
            <span className="text-xs font-bold uppercase text-black">Paid Stamp</span>
          </div>
          <div className="w-40 border-t border-black pt-1 text-center">
            <span className="text-[10px] uppercase font-bold text-black">Authorized Signatory</span>
          </div>
        </div>
      </div>
    </div>
  );
}