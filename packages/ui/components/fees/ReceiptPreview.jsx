import { classLabel, formatDate, formatMoney, safeImageSrc } from './ledger';

function ReceiptCopy({ copyType, school, payment, duplicate, showLogo, reversal }) {
  const currency = payment.currency || school.currency || 'USD';
  const items = payment.allocations?.length
    ? payment.allocations
    : [{ chargeId: payment.id, description: payment.kind === 'reversal' ? 'Payment reversal' : 'Fee payment', amount: payment.amount }];
  const logo = showLogo ? safeImageSrc(school.logo) : '';
  const grade = classLabel({
    className: payment.className,
    sectionName: payment.sectionName,
  });

  return (
    <section className="flex flex-col gap-4 text-black">
      <div className="flex items-start justify-between gap-4 border-b-2 border-black pb-3">
        <div className="flex items-center gap-4">
          {logo ? (
            <img src={logo} alt="" className="h-16 w-16 rounded-lg border border-slate-300 object-contain" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-slate-300 bg-slate-100">
              <span className="material-symbols-outlined text-3xl text-black opacity-50">school</span>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">{school.name || 'School'}</h2>
            {school.header && <p className="text-xs font-semibold">{school.header}</p>}
            <p className="text-xs">{[school.address, school.phone].filter(Boolean).join(' | ') || 'School contact details are not saved yet.'}</p>
            <p className="text-xs">{[school.affiliation && `Affiliation ${school.affiliation}`, school.website].filter(Boolean).join(' | ')}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`inline-block border-2 border-black px-3 py-1 text-sm font-bold ${copyType === 'OFFICE COPY' ? 'bg-black text-white' : 'bg-white text-black'}`}>{copyType}</div>
          {duplicate && <p className="mt-2 text-xs font-black uppercase">Duplicate copy</p>}
          {payment.kind === 'reversal' && <p className="mt-1 text-xs font-black uppercase">Reversal</p>}
          <p className="mt-2 text-xs font-semibold">No: {payment.receiptNumber || payment.id}</p>
          <p className="text-xs">Date: {formatDate(payment.paidAt)}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 border-b border-black py-3">
        <p><span className="block text-[10px] font-bold uppercase text-slate-600">Student</span><span className="text-sm font-semibold uppercase">{payment.studentName}</span></p>
        <p><span className="block text-[10px] font-bold uppercase text-slate-600">Class / section</span><span className="text-sm font-semibold uppercase">{grade}</span></p>
        <p><span className="block text-[10px] font-bold uppercase text-slate-600">Admission no.</span><span className="text-sm font-semibold uppercase">{payment.admissionNumber || '—'}</span></p>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-black text-xs uppercase">
            <th className="py-2 text-left">Sr.</th>
            <th className="py-2 text-left">Description</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={`${item.chargeId || index}`} className="border-b border-slate-300 text-sm">
              <td className="py-2">{index + 1}</td>
              <td className="py-2 font-medium">{item.description || 'Charge'}</td>
              <td className="py-2 text-right">{formatMoney(item.amount, currency)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} className="py-3 text-right text-sm font-bold uppercase">Total</td>
            <td className="py-3 text-right text-lg font-bold">{formatMoney(payment.amount, currency)}</td>
          </tr>
        </tfoot>
      </table>
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-600">Amount in words</p>
          <p className="text-xs font-semibold uppercase">{payment.amountInWords}</p>
          <p className="mt-2 text-xs">Method: {payment.method}{payment.reference ? ` · ${payment.reference}` : ''}</p>
          {payment.kind === 'reversal' && <p className="mt-1 text-xs">Reverses {payment.reversesReceiptNumber || 'the original receipt'}. {payment.reversalReason}</p>}
          {reversal && <p className="mt-1 text-xs font-bold">Reversed by {reversal.receiptNumber}. The original receipt is unchanged.</p>}
          <p className="mt-3 text-[10px] italic">{school.footer || (copyType === 'OFFICE COPY' ? 'Computer generated receipt. Signature is optional.' : 'Keep this copy for your records.')}</p>
        </div>
        <div className="w-40 border-t border-black pt-1 text-center text-[10px] font-bold uppercase">Authorized signatory</div>
      </div>
    </section>
  );
}

export function ReceiptPreview({ school, payment, duplicate, showLogo, monochrome, reversal, paper }) {
  return (
    <article className={`mx-auto flex flex-col bg-white p-8 text-black shadow-xl print:border-0 print:shadow-none ${monochrome ? 'grayscale' : ''}`} style={{ width: paper === 'half' ? '140mm' : '210mm', minHeight: paper === 'half' ? '216mm' : '297mm' }}>
      <ReceiptCopy copyType="OFFICE COPY" school={school} payment={payment} duplicate={duplicate} showLogo={showLogo} reversal={reversal} />
      <div className="relative my-10 border-t-2 border-dashed border-black print:hidden">
        <span className="absolute -top-3 right-4 bg-white px-2 text-[10px] font-bold uppercase">Cut here</span>
      </div>
      <div className="mt-auto">
        <ReceiptCopy copyType="STUDENT COPY" school={school} payment={payment} duplicate={duplicate} showLogo={showLogo} reversal={reversal} />
      </div>
    </article>
  );
}
