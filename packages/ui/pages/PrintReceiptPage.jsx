import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState, SyncBanners } from '../components/fees/FinanceStates';
import { ReceiptPreview } from '../components/fees/ReceiptPreview';
import {
  amountInWords,
  buildSimplePdf,
  downloadBlob,
  readSchoolProfile,
  receiptPath,
  receiptPlainText,
  safeImageSrc,
} from '../components/fees/ledger';
import { useLocalData } from '../data/LocalDataProvider';
import { useLocalCollection } from '../data/useLocalCollection';

export function PrintReceiptPage() {
  const route = useParams();
  const [params, setParams] = useSearchParams();
  const paymentId = route.paymentId || params.get('paymentId') || params.get('id') || '';
  const duplicate = params.get('duplicate') === '1';
  const local = useLocalData();
  const payments = useLocalCollection('payments');
  const students = useLocalCollection('students');
  const settings = useLocalCollection('settings');
  const [paper, setPaper] = useState('a4');
  const [showLogo, setShowLogo] = useState(true);
  const [monochrome, setMonochrome] = useState(false);
  const [message, setMessage] = useState('');

  const payment = payments.data.find((item) => item.id === paymentId);
  const student = students.data.find((item) => item.id === payment?.studentId);
  const liveSchool = readSchoolProfile(settings.data);
  const school = payment?.schoolSnapshot || liveSchool;
  const reversal = payment
    ? payments.data.find((item) => item.kind === 'reversal' && item.reversesPaymentId === payment.id && item.status !== 'void')
    : null;
  const currency = payment?.currency || school.currency || 'USD';
  const receiptPayment = payment ? {
    ...payment,
    amountInWords: payment.amountInWords || amountInWords(payment.amount, currency),
    studentName: payment.studentName || student?.name || 'Student',
    className: payment.className || student?.className || '',
    sectionName: payment.sectionName || student?.sectionName || '',
    admissionNumber: payment.admissionNumber || student?.admissionNumber || '',
  } : null;

  const setDuplicate = (checked) => {
    const next = new URLSearchParams(params);
    if (checked) next.set('duplicate', '1');
    else next.delete('duplicate');
    setParams(next, { replace: true });
  };

  const downloadPdf = () => {
    try {
      downloadBlob(
        `${receiptPayment.receiptNumber || 'receipt'}.pdf`,
        buildSimplePdf(receiptPlainText({ school, payment: receiptPayment, student, duplicate, reversal: receiptPayment.kind === 'reversal' ? null : reversal })),
        'application/pdf'
      );
      setMessage('PDF downloaded.');
    } catch (error) {
      setMessage(error.message || 'The PDF could not be created.');
    }
  };

  const shareReceipt = async () => {
    const url = new URL(receiptPath(payment.id, { duplicate }), window.location.origin).toString();
    try {
      if (navigator.share) await navigator.share({ title: `Receipt ${receiptPayment.receiptNumber || ''}`.trim(), url });
      else {
        await navigator.clipboard.writeText(url);
        setMessage('Receipt link copied.');
      }
    } catch (error) {
      if (error?.name === 'AbortError') return;
      setMessage(error.message || 'The receipt link could not be shared.');
    }
  };

  let body = null;
  if (!local.repositories) {
    body = <EmptyState title="School account required" body="Receipts are stored with the school ledger on this device." />;
  } else if (!paymentId) {
    body = <EmptyState title="No receipt selected" body="Record a payment, or open this page with a paymentId query parameter." action={<Link to="/fees" className="font-bold text-primary">Back to fees</Link>} />;
  } else if (payments.error && !payment) {
    body = <ErrorState message={payments.error.message} onRetry={payments.refresh} />;
  } else if (!payment && payments.isLoading) {
    body = <LoadingState label="Loading receipt…" />;
  } else if (!payment) {
    body = <EmptyState title="Receipt not found" body="This payment is not on this device. Open it from Fee Management after the payment has been saved locally." action={<Link to="/fees" className="font-bold text-primary">Back to fees</Link>} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 font-display text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3 print:hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-primary">receipt_long</span>
          <div>
            <h1 className="text-lg font-bold">Receipt</h1>
            <p className="text-xs text-slate-500">{paymentId ? 'Opened from the saved payment' : 'Waiting for a payment id'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={payment ? `/fees?studentId=${payment.studentId}` : '/fees'} className="flex h-10 items-center rounded-lg bg-slate-100 px-4 text-sm font-bold dark:bg-slate-800">Back</Link>
          {receiptPayment && (
            <>
              <button type="button" onClick={shareReceipt} className="flex h-10 items-center gap-2 rounded-lg bg-slate-100 px-4 text-sm font-bold dark:bg-slate-800">
                <span className="material-symbols-outlined text-base">share</span>
                Share
              </button>
              <button type="button" onClick={downloadPdf} className="flex h-10 items-center gap-2 rounded-lg bg-slate-100 px-4 text-sm font-bold dark:bg-slate-800">
                <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                Download PDF
              </button>
              <button type="button" onClick={() => window.print()} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white">
                <span className="material-symbols-outlined text-base">print</span>
                Print receipt
              </button>
            </>
          )}
        </div>
      </header>
      <div className="flex flex-1 print:block">
        <aside className="flex w-full flex-col gap-4 border-r border-slate-200 bg-white p-6 print:hidden dark:border-slate-800 dark:bg-slate-900 md:w-72">
          <h2 className="text-xs font-bold uppercase text-slate-400">Print options</h2>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Paper size
            <select value={paper} onChange={(event) => setPaper(event.target.value)} className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800">
              <option value="a4">A4</option>
              <option value="half">Half letter</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showLogo} onChange={(event) => setShowLogo(event.target.checked)} disabled={!safeImageSrc(school.logo)} />
            Include school logo
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={monochrome} onChange={(event) => setMonochrome(event.target.checked)} />
            Black and white
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={duplicate} onChange={(event) => setDuplicate(event.target.checked)} disabled={!receiptPayment} />
            Label as duplicate copy
          </label>
          <SyncBanners status={local.status} />
          {receiptPayment?.syncStatus === 'pending' && <p className="text-xs font-bold uppercase text-amber-600">Saved locally. Sync pending.</p>}
          {!payment?.schoolSnapshot && <p className="text-xs text-slate-500">School name, logo, and footer come from saved school settings when those records exist.</p>}
          {message && <p className="text-sm font-semibold text-primary" role="status">{message}</p>}
        </aside>
        <main className="flex flex-1 justify-center overflow-auto bg-slate-50 p-6 print:bg-white print:p-0 dark:bg-slate-950">
          {body || (
            <ReceiptPreview
              school={school}
              payment={receiptPayment}
              duplicate={duplicate}
              showLogo={showLogo}
              monochrome={monochrome}
              reversal={receiptPayment.kind === 'reversal' ? null : reversal}
              paper={paper}
            />
          )}
        </main>
      </div>
    </div>
  );
}
