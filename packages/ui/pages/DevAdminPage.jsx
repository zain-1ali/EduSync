import { useEffect, useId, useRef, useState } from 'react';
import {
  useApproveSchool,
  usePendingSchools,
  useRejectSchool,
  useTenants,
  useUpdateTenantStatus,
} from '../api/hooks/useAdmin';
import { getApiError } from '../api/getApiError';

const TABS = [
  { id: 'pending', label: 'Pending Applications' },
  { id: 'tenants', label: 'School Tenants' },
];

const REJECT_REASON_MIN = 10;
const REJECT_REASON_MAX = 1000;
const TENANT_REASON_MIN = 5;
const TENANT_REASON_MAX = 500;

const secondaryButtonClass =
  'inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

const approveButtonClass =
  'inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500';

const rejectButtonClass =
  'inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-900 text-rose-600 text-xs font-bold rounded-lg border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500';

const suspendButtonClass =
  'inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-lg shadow-sm shadow-amber-500/20 hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500';

const noticeStyles = {
  success:
    'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900',
  warning:
    'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-900',
  error:
    'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900',
};

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
}

function displayText(value) {
  if (value === 0) return '0';
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number') return String(value);
  return '—';
}

function safeHttpUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value);
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.href;
  } catch {
    return '';
  }
  return '';
}

function invitationNotice(schoolName, result) {
  const invitation = result?.data?.invitation;
  const status = invitation?.status;
  const name = schoolName || 'The school';

  if (status === 'failed') {
    return {
      tone: 'warning',
      message: `${name} was approved, but the setup invitation could not be delivered.`,
    };
  }

  return {
    tone: 'success',
    message:
      status && status !== 'sent'
        ? `${name} was approved. Invitation delivery status: ${status}.`
        : `${name} was approved and the setup invitation was sent.`,
    previewUrl: safeHttpUrl(invitation?.previewUrl),
  };
}

function focusableElements(node) {
  if (!node) return [];
  return [...node.querySelectorAll('button, textarea, input, select, a[href]')].filter((element) => {
    return !element.disabled && element.tabIndex !== -1;
  });
}

function LoadingState({ label }) {
  return (
    <div role="status" className="flex justify-center py-20 text-slate-400">
      <span className="material-symbols-outlined animate-spin text-4xl" aria-hidden="true">
        sync
      </span>
      <span className="sr-only">{label}</span>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-200 p-4 rounded-lg border border-red-200 dark:border-red-900"
    >
      <p className="font-bold">{message}</p>
      <button type="button" onClick={onRetry} className={`${secondaryButtonClass} mt-3`}>
        Try again
      </button>
    </div>
  );
}

function EmptyState({ icon, title, message }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center flex flex-col items-center">
      <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4" aria-hidden="true">
        {icon}
      </span>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
      <p className="text-slate-500 mt-1">{message}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    active:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
    suspended:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900',
    closed:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };
  const labels = {
    active: 'Active',
    suspended: 'Suspended',
    closed: 'Closed',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${styles[status] || styles.closed}`}
    >
      {labels[status] || 'Unknown'}
    </span>
  );
}

function DialogFrame({ title, description, onClose, canClose, wide = false, children }) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const canCloseRef = useRef(canClose);

  useEffect(() => {
    onCloseRef.current = onClose;
    canCloseRef.current = canClose;
  }, [onClose, canClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const node = dialogRef.current;
    const initial = node?.querySelector('[data-initial-focus]') || node;
    initial?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (!canCloseRef.current) return;
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !node) return;
      const items = focusableElements(node);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 bg-slate-950/50"
        aria-label="Close dialog"
        disabled={!canClose}
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`relative w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 focus:outline-none`}
      >
        <h2 id={titleId} className="text-lg font-black text-slate-900 dark:text-white tracking-tight break-words">
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {description}
          </p>
        ) : null}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function DetailItem({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white break-words">{children}</dd>
    </div>
  );
}

function ApplicationDetailsDialog({ school, onClose, onApprove, onReject }) {
  const website = safeHttpUrl(school.websiteUrl);
  const address = displayText(school.address);
  const notes = typeof school.additionalInfo === 'string' ? school.additionalInfo.trim() : '';

  return (
    <DialogFrame
      title={displayText(school.schoolName)}
      description="Review the full registration before approving or rejecting it."
      onClose={onClose}
      canClose
      wide
    >
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <DetailItem label="City">{displayText(school.city)}</DetailItem>
        <DetailItem label="Estimated students">{displayText(school.estimatedStudents)}</DetailItem>
        <DetailItem label="Street address">{address === '—' ? 'Not provided' : address}</DetailItem>
        <DetailItem label="Website">
          {website ? (
            <a href={website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
              {website}
            </a>
          ) : (
            'Not provided'
          )}
        </DetailItem>
        <DetailItem label="Applied on">{formatDate(school.createdAt)}</DetailItem>
        <DetailItem label="Status">Pending</DetailItem>
        <DetailItem label="Applicant">{displayText(school.applicantName)}</DetailItem>
        <DetailItem label="Designation">{displayText(school.applicantDesignation)}</DetailItem>
        <DetailItem label="Email">{displayText(school.applicantEmail)}</DetailItem>
        <DetailItem label="Mobile">{displayText(school.applicantMobile)}</DetailItem>
      </dl>
      <div className="mt-5">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">About the institute</h3>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words">
          {notes || 'Not provided'}
        </p>
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onClose} data-initial-focus className={secondaryButtonClass}>
          Close
        </button>
        <button type="button" onClick={onReject} className={rejectButtonClass}>
          Reject
        </button>
        <button type="button" onClick={onApprove} className={approveButtonClass}>
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            check_circle
          </span>
          Approve & Provision
        </button>
      </div>
    </DialogFrame>
  );
}

function ApproveDialog({ school, isPending, error, onConfirm, onClose }) {
  const schoolName = displayText(school.schoolName);

  return (
    <DialogFrame
      title={`Approve ${schoolName}?`}
      description="This provisions a school tenant and sends a setup invitation to the applicant."
      onClose={onClose}
      canClose={!isPending}
    >
      <dl className="grid grid-cols-1 gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 px-4 py-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Applicant</dt>
          <dd className="font-semibold text-slate-900 dark:text-white text-right">
            {displayText(school.applicantName)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Email</dt>
          <dd className="font-semibold text-slate-900 dark:text-white text-right break-all">
            {displayText(school.applicantEmail)}
          </dd>
        </div>
      </dl>
      {error ? (
        <p role="alert" className="mt-4 text-sm font-semibold text-red-600 dark:text-red-300">
          {error}
        </p>
      ) : null}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          data-initial-focus
          className={secondaryButtonClass}
        >
          Cancel
        </button>
        <button type="button" onClick={onConfirm} disabled={isPending} className={approveButtonClass}>
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            check_circle
          </span>
          {isPending ? 'Approving…' : 'Approve & Provision'}
        </button>
      </div>
    </DialogFrame>
  );
}

function ReasonDialog({
  title,
  description,
  reasonLabel,
  reason,
  minLength,
  maxLength,
  error,
  confirmLabel,
  pendingLabel,
  confirmClassName,
  isPending,
  onReasonChange,
  onSubmit,
  onClose,
}) {
  const reasonId = useId();
  const hintId = useId();
  const errorId = useId();
  const reasonRef = useRef(null);
  const trimmedLength = reason.trim().length;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isPending) return;
    if (trimmedLength < minLength) {
      onSubmit({ error: `Enter a reason of at least ${minLength} characters.` });
      reasonRef.current?.focus();
      return;
    }
    onSubmit({ reason: reason.trim() });
  };

  return (
    <DialogFrame title={title} description={description} onClose={onClose} canClose={!isPending}>
      <form onSubmit={handleSubmit} noValidate>
        <label
          htmlFor={reasonId}
          className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2"
        >
          {reasonLabel}
        </label>
        <textarea
          ref={reasonRef}
          id={reasonId}
          data-initial-focus
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          required
          minLength={minLength}
          maxLength={maxLength}
          rows={4}
          autoComplete="off"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${hintId} ${errorId}` : hintId}
          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p id={hintId} className="mt-2 text-xs text-slate-500">
          At least {minLength} characters. {trimmedLength}/{maxLength}.
        </p>
        {error ? (
          <p id={errorId} role="alert" className="mt-2 text-sm font-semibold text-red-600 dark:text-red-300">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isPending} className={secondaryButtonClass}>
            Cancel
          </button>
          <button type="submit" disabled={isPending} className={confirmClassName}>
            {isPending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </form>
    </DialogFrame>
  );
}

function DataTable({ caption, headers, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800 ${header === 'Action' ? 'text-right' : ''}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function DevAdminPage() {
  const baseId = useId();
  const tabRefs = useRef({});
  const [activeTab, setActiveTab] = useState('pending');
  const [notice, setNotice] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [detailsSchoolId, setDetailsSchoolId] = useState(null);

  const {
    data: schoolsData,
    isLoading: schoolsLoading,
    error: schoolsErrorDetail,
    refetch: refetchSchools,
  } = usePendingSchools();
  const {
    data: tenantsData,
    isLoading: tenantsLoading,
    error: tenantsErrorDetail,
    refetch: refetchTenants,
  } = useTenants();
  const { mutate: approveSchool, isPending: isApproving } = useApproveSchool();
  const { mutate: rejectSchool, isPending: isRejecting } = useRejectSchool();
  const { mutate: updateTenantStatus, isPending: isUpdatingTenant } = useUpdateTenantStatus();

  const schools = Array.isArray(schoolsData) ? schoolsData : [];
  const tenants = Array.isArray(tenantsData) ? tenantsData : [];
  const applicationsBusy = isApproving || isRejecting;
  const detailsSchool = schools.find((school) => school._id === detailsSchoolId) || null;

  const openDecision = (type, school) => {
    setDetailsSchoolId(null);
    setDialog(
      type === 'reject'
        ? { type: 'reject', school, reason: '', error: '' }
        : { type: 'approve', school, error: '' }
    );
  };

  const closeDialog = () => {
    if (isApproving || isRejecting || isUpdatingTenant) return;
    setDialog(null);
  };

  const patchDialog = (patch) => {
    setDialog((current) => (current ? { ...current, ...patch } : current));
  };

  const onTabKeyDown = (event) => {
    const currentIndex = TABS.findIndex((tab) => tab.id === activeTab);
    let nextIndex = currentIndex;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % TABS.length;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = TABS.length - 1;
    else return;

    event.preventDefault();
    const nextTab = TABS[nextIndex];
    setActiveTab(nextTab.id);
    tabRefs.current[nextTab.id]?.focus();
  };

  const confirmApprove = () => {
    if (dialog?.type !== 'approve' || isApproving) return;
    const school = dialog.school;
    approveSchool(school._id, {
      onSuccess: (result) => {
        setNotice(invitationNotice(school.schoolName, result));
        setDialog(null);
      },
      onError: (error) => {
        setDialog((current) =>
          current?.type === 'approve' ? { ...current, error: getApiError(error) } : current
        );
      },
    });
  };

  const submitReject = ({ reason, error }) => {
    if (dialog?.type !== 'reject') return;
    if (error) {
      patchDialog({ error });
      return;
    }
    const school = dialog.school;
    rejectSchool(
      { schoolId: school._id, reason },
      {
        onSuccess: () => {
          setNotice({
            tone: 'success',
            message: `${displayText(school.schoolName)} was rejected.`,
          });
          setDialog(null);
        },
        onError: (apiError) => {
          setDialog((current) =>
            current?.type === 'reject' ? { ...current, error: getApiError(apiError) } : current
          );
        },
      }
    );
  };

  const submitTenantStatus = ({ reason, error }) => {
    if (dialog?.type !== 'tenant') return;
    if (error) {
      patchDialog({ error });
      return;
    }
    const { tenant, nextStatus } = dialog;
    updateTenantStatus(
      { tenantId: tenant._id, status: nextStatus, reason },
      {
        onSuccess: () => {
          const name = displayText(tenant.name);
          setNotice({
            tone: 'success',
            message:
              nextStatus === 'suspended' ? `${name} was suspended.` : `${name} was reactivated.`,
          });
          setDialog(null);
        },
        onError: (apiError) => {
          setDialog((current) =>
            current?.type === 'tenant' ? { ...current, error: getApiError(apiError) } : current
          );
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 font-display">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-red-500 font-bold text-sm mb-2 uppercase tracking-widest">
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                warning
              </span>
              Development Mode
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Platform Admin</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Review school applications and manage tenant access.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg shadow-sm flex items-center gap-3 self-start">
            <span className="text-sm font-bold text-slate-500">Pending Requests</span>
            <span className="bg-primary text-white text-xs font-black px-2 py-0.5 rounded-full">
              {Array.isArray(schoolsData) ? schools.length : '—'}
            </span>
          </div>
        </header>

        {notice ? (
          <div
            className={`mb-6 flex items-start justify-between gap-4 rounded-lg border px-4 py-3 ${noticeStyles[notice.tone] || noticeStyles.success}`}
          >
            <div role="status" className="text-sm font-semibold">
              <p>{notice.message}</p>
              {notice.previewUrl ? (
                <a
                  href={notice.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex font-bold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
                >
                  Open setup invitation
                </a>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="shrink-0 text-xs font-bold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
            >
              Dismiss<span className="sr-only"> status message</span>
            </button>
          </div>
        ) : null}

        <div
          role="tablist"
          aria-label="Platform administration"
          className="flex gap-8 border-b border-slate-200 dark:border-slate-800 mb-6"
        >
          {TABS.map((tab) => {
            const selected = activeTab === tab.id;
            const tabId = `${baseId}-${tab.id}-tab`;
            const panelId = `${baseId}-${tab.id}-panel`;
            const count = tab.id === 'pending'
              ? (Array.isArray(schoolsData) ? schools.length : null)
              : (Array.isArray(tenantsData) ? tenants.length : null);

            return (
              <button
                key={tab.id}
                ref={(node) => {
                  tabRefs.current[tab.id] = node;
                }}
                id={tabId}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={onTabKeyDown}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm ${
                  selected
                    ? 'text-primary border-primary'
                    : 'text-slate-500 border-transparent hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
                {typeof count === 'number' ? (
                  <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-black text-slate-600 dark:text-slate-300">
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {activeTab === 'pending' ? (
          <div
            role="tabpanel"
            id={`${baseId}-pending-panel`}
            aria-labelledby={`${baseId}-pending-tab`}
            tabIndex={0}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
          >
            {schoolsLoading ? (
              <LoadingState label="Loading pending applications" />
            ) : !Array.isArray(schoolsData) ? (
              <ErrorState
                message={getApiError(schoolsErrorDetail, 'Failed to load pending schools. Is the backend running?')}
                onRetry={() => refetchSchools()}
              />
            ) : schools.length === 0 ? (
              <EmptyState
                icon="inbox"
                title="All caught up!"
                message="There are no pending school registrations right now."
              />
            ) : (
              <DataTable
                caption="Pending school applications"
                headers={['Institution', 'Applicant', 'Details', 'Applied On', 'Action']}
              >
                {schools.map((school) => (
                  <tr
                    key={school._id}
                    onClick={() => setDetailsSchoolId(school._id)}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => setDetailsSchoolId(school._id)}
                        className="block text-left font-bold text-slate-900 dark:text-white text-sm hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
                      >
                        {displayText(school.schoolName)}
                      </button>
                      <span className="block text-xs text-slate-500 mt-0.5">{displayText(school.city)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block font-bold text-slate-700 dark:text-slate-300 text-sm">
                        {displayText(school.applicantName)}
                      </span>
                      <span className="block text-xs text-slate-500 mt-0.5 break-all">
                        {displayText(school.applicantEmail)}
                      </span>
                      <span className="block text-xs text-slate-500 mt-0.5">
                        {displayText(school.applicantMobile)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Est. Students: {displayText(school.estimatedStudents)}
                      </span>
                      <span className="block text-xs text-slate-500 mt-0.5">
                        Role: {displayText(school.applicantDesignation)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">{formatDate(school.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openDecision('reject', school);
                          }}
                          disabled={applicationsBusy}
                          aria-label={`Reject ${displayText(school.schoolName)}`}
                          className={rejectButtonClass}
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openDecision('approve', school);
                          }}
                          disabled={applicationsBusy}
                          aria-label={`Approve and provision ${displayText(school.schoolName)}`}
                          className={approveButtonClass}
                        >
                          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                            check_circle
                          </span>
                          Approve & Provision
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </DataTable>
            )}
          </div>
        ) : (
          <div
            role="tabpanel"
            id={`${baseId}-tenants-panel`}
            aria-labelledby={`${baseId}-tenants-tab`}
            tabIndex={0}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
          >
            {tenantsLoading ? (
              <LoadingState label="Loading school tenants" />
            ) : !Array.isArray(tenantsData) ? (
              <ErrorState
                message={getApiError(tenantsErrorDetail, 'Failed to load school tenants. Is the backend running?')}
                onRetry={() => refetchTenants()}
              />
            ) : tenants.length === 0 ? (
              <EmptyState
                icon="domain"
                title="No school tenants yet"
                message="Approved schools appear here after they are provisioned."
              />
            ) : (
              <DataTable caption="School tenants" headers={['School', 'Status', 'Approved On', 'Action']}>
                {tenants.map((tenant) => {
                  const isActive = tenant.status === 'active';
                  const name = displayText(tenant.name);
                  return (
                    <tr key={tenant._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="block font-bold text-slate-900 dark:text-white text-sm">{name}</span>
                        <span className="block text-xs text-slate-500 mt-0.5">{displayText(tenant.slug)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={tenant.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                        {formatDate(tenant.approvedAt || tenant.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setDialog({
                              type: 'tenant',
                              tenant,
                              nextStatus: isActive ? 'suspended' : 'active',
                              reason: '',
                              error: '',
                            })
                          }
                          disabled={isUpdatingTenant}
                          aria-label={isActive ? `Suspend ${name}` : `Reactivate ${name}`}
                          className={isActive ? suspendButtonClass : approveButtonClass}
                        >
                          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                            {isActive ? 'pause_circle' : 'play_circle'}
                          </span>
                          {isActive ? 'Suspend' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </DataTable>
            )}
          </div>
        )}
      </div>

      {detailsSchool ? (
        <ApplicationDetailsDialog
          school={detailsSchool}
          onClose={() => setDetailsSchoolId(null)}
          onApprove={() => openDecision('approve', detailsSchool)}
          onReject={() => openDecision('reject', detailsSchool)}
        />
      ) : null}

      {dialog?.type === 'approve' ? (
        <ApproveDialog
          school={dialog.school}
          isPending={isApproving}
          error={dialog.error}
          onConfirm={confirmApprove}
          onClose={closeDialog}
        />
      ) : null}

      {dialog?.type === 'reject' ? (
        <ReasonDialog
          title={`Reject ${displayText(dialog.school.schoolName)}?`}
          description="The applicant stays unprovisioned. The reason is stored with this decision."
          reasonLabel="Rejection reason"
          reason={dialog.reason}
          minLength={REJECT_REASON_MIN}
          maxLength={REJECT_REASON_MAX}
          error={dialog.error}
          confirmLabel="Reject application"
          pendingLabel="Rejecting…"
          confirmClassName={rejectButtonClass}
          isPending={isRejecting}
          onReasonChange={(reason) => patchDialog({ reason, error: '' })}
          onSubmit={submitReject}
          onClose={closeDialog}
        />
      ) : null}

      {dialog?.type === 'tenant' ? (
        <ReasonDialog
          title={
            dialog.nextStatus === 'suspended'
              ? `Suspend ${displayText(dialog.tenant.name)}?`
              : `Reactivate ${displayText(dialog.tenant.name)}?`
          }
          description={
            dialog.nextStatus === 'suspended'
              ? 'People at this school will be unable to sign in until the tenant is reactivated.'
              : 'This school will be able to sign in again.'
          }
          reasonLabel="Reason"
          reason={dialog.reason}
          minLength={TENANT_REASON_MIN}
          maxLength={TENANT_REASON_MAX}
          error={dialog.error}
          confirmLabel={dialog.nextStatus === 'suspended' ? 'Suspend school' : 'Reactivate school'}
          pendingLabel={dialog.nextStatus === 'suspended' ? 'Suspending…' : 'Reactivating…'}
          confirmClassName={dialog.nextStatus === 'suspended' ? suspendButtonClass : approveButtonClass}
          isPending={isUpdatingTenant}
          onReasonChange={(reason) => patchDialog({ reason, error: '' })}
          onSubmit={submitTenantStatus}
          onClose={closeDialog}
        />
      ) : null}
    </div>
  );
}
