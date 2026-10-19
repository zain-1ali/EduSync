import { ACCESS_LEVELS, MODULES } from '@school/contracts';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useLocalData } from '../data/LocalDataProvider';
import { useLocalCollection } from '../data/useLocalCollection';
import { Layout } from '../Layout';

// Indexed `key` on the existing settings table. Branding stays on that row.
const BRANDING_KEY = 'branding';
const LOGO_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const MAX_LOGO_DATA_URL = 1_500_000;

const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'INR', 'AED', 'SAR', 'CAD', 'AUD', 'BDT', 'NGN', 'ZAR'];
const DATE_FORMATS = [
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
];
const LOCALES = [
  { value: '', label: 'Browser default' },
  { value: 'en-US', label: 'English (United States)' },
  { value: 'en-GB', label: 'English (United Kingdom)' },
  { value: 'ur-PK', label: 'Urdu (Pakistan)' },
  { value: 'hi-IN', label: 'Hindi (India)' },
  { value: 'ar-SA', label: 'Arabic (Saudi Arabia)' },
  { value: 'fr-FR', label: 'French (France)' },
  { value: 'es-ES', label: 'Spanish (Spain)' },
];

const EMPTY_FORM = {
  legalName: '',
  registrationNumber: '',
  logoDataUrl: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  receiptHeader: '',
  receiptFooter: '',
  locale: '',
  timezone: '',
  currency: 'USD',
  dateFormat: 'YYYY-MM-DD',
  academicYearId: '',
};

const SECTIONS = {
  identity: ['legalName', 'registrationNumber', 'logoDataUrl'],
  contact: ['address', 'phone', 'email', 'website'],
  receipt: ['receiptHeader', 'receiptFooter'],
  defaults: ['locale', 'timezone', 'currency', 'dateFormat', 'academicYearId'],
};

const SECTION_LABELS = {
  identity: 'School identity',
  contact: 'Contact information',
  receipt: 'Receipt text',
  defaults: 'School defaults',
  all: 'Settings',
};

function timeZoneOptions() {
  if (typeof Intl.supportedValuesOf === 'function') {
    try {
      return Intl.supportedValuesOf('timeZone');
    } catch {
      return ['UTC'];
    }
  }
  return ['UTC', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Dubai', 'Europe/London', 'America/New_York'];
}

function withCurrent(options, current) {
  if (!current || options.some((option) => option.value === current)) return options;
  return [{ value: current, label: current }, ...options];
}

function readBranding(records) {
  const matches = records.filter((record) => record.key === BRANDING_KEY);
  matches.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  return matches[0] || null;
}

function toForm(record) {
  const form = { ...EMPTY_FORM };
  if (!record) return form;
  for (const key of Object.keys(EMPTY_FORM)) {
    if (record[key] != null) form[key] = String(record[key]);
  }
  if (!form.currency) form.currency = 'USD';
  if (!form.dateFormat) form.dateFormat = 'YYYY-MM-DD';
  return form;
}

function trimForm(form) {
  const next = { ...form };
  for (const key of Object.keys(EMPTY_FORM)) next[key] = String(next[key] ?? '').trim();
  next.currency = next.currency.toUpperCase();
  return next;
}

function pick(source, keys) {
  const result = {};
  for (const key of keys) result[key] = source[key];
  return result;
}

function formsEqual(left, right) {
  return Object.keys(EMPTY_FORM).every((key) => left[key] === right[key]);
}

function sectionDirty(form, saved, keys) {
  return keys.some((key) => form[key] !== saved[key]);
}

function isWebsite(value) {
  if (!value) return true;
  try {
    const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(candidate);
    return url.hostname.includes('.');
  } catch {
    return false;
  }
}

function isLogoValue(value) {
  if (!value) return true;
  return /^data:image\/(png|jpeg|webp);base64,/i.test(value) || /^https?:\/\//i.test(value);
}

function validate(form, keys, yearIds) {
  const errors = {};
  const selected = new Set(keys);
  if (selected.has('legalName') && !form.legalName) errors.legalName = 'Enter the school legal name.';
  else if (selected.has('legalName') && form.legalName.length > 160) errors.legalName = 'Use 160 characters or fewer.';
  if (selected.has('registrationNumber') && form.registrationNumber.length > 80) {
    errors.registrationNumber = 'Use 80 characters or fewer.';
  }
  if (selected.has('logoDataUrl') && !isLogoValue(form.logoDataUrl)) {
    errors.logoDataUrl = 'Logo must be a PNG, JPG, or WebP image.';
  } else if (selected.has('logoDataUrl') && form.logoDataUrl.length > MAX_LOGO_DATA_URL) {
    errors.logoDataUrl = 'Logo is too large to store on this device.';
  }
  if (selected.has('address') && form.address.length > 400) errors.address = 'Use 400 characters or fewer.';
  if (selected.has('phone') && form.phone) {
    const digits = form.phone.replace(/\D/g, '').length;
    if (!/^[\d+\-().\s]+$/.test(form.phone) || digits < 7 || digits > 15) {
      errors.phone = 'Enter a phone number with 7 to 15 digits.';
    }
  }
  if (selected.has('email') && form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (selected.has('email') && form.email.length > 120) errors.email = 'Use 120 characters or fewer.';
  if (selected.has('website') && form.website && !isWebsite(form.website)) {
    errors.website = 'Enter a valid website, with or without https://.';
  }
  if (selected.has('website') && form.website.length > 200) errors.website = 'Use 200 characters or fewer.';
  if (selected.has('receiptHeader') && form.receiptHeader.length > 100) errors.receiptHeader = 'Use 100 characters or fewer.';
  if (selected.has('receiptFooter') && form.receiptFooter.length > 250) errors.receiptFooter = 'Use 250 characters or fewer.';
  if (selected.has('currency') && !/^[A-Z]{3}$/.test(form.currency)) errors.currency = 'Use a 3-letter currency code.';
  if (selected.has('dateFormat') && !DATE_FORMATS.some((item) => item.value === form.dateFormat)) {
    errors.dateFormat = 'Choose a date format.';
  }
  if (selected.has('academicYearId') && form.academicYearId && yearIds && !yearIds.has(form.academicYearId)) {
    errors.academicYearId = 'Choose a valid academic year.';
  }
  return errors;
}

function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '—';
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('');
}

function localDay(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatSchoolDate(day, dateFormat) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(day || ''));
  if (!match) return day || '—';
  const [, year, month, date] = match;
  if (dateFormat === 'DD/MM/YYYY') return `${date}/${month}/${year}`;
  if (dateFormat === 'MM/DD/YYYY') return `${month}/${date}/${year}`;
  return `${year}-${month}-${date}`;
}

function formatMoney(value, currency) {
  const code = /^[A-Z]{3}$/.test(currency || '') ? currency : 'USD';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: code }).format(value);
  } catch {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value);
  }
}

function persistenceMessage({ dirty, record, online }) {
  if (dirty) return 'You have unsaved changes on this form.';
  if (!record) return 'Nothing is saved yet. Saving writes to this device first.';
  if (!online) return 'Saved on this device. This device is offline, so sync stays pending.';
  if (record.syncStatus === 'pending') return 'Saved on this device and waiting to sync.';
  if (record.syncStatus === 'failed') return 'Saved on this device, but the last sync failed.';
  return 'Saved on this device. The latest copy has synced.';
}

function cropLogo(file) {
  return new Promise((resolve, reject) => {
    if (!LOGO_TYPES.has(file.type)) {
      reject(new Error('Logo must be a PNG, JPG, or WebP image.'));
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      reject(new Error('Logo must be 2 MB or smaller.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('That image could not be read.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('That image could not be read.'));
      image.onload = () => {
        if (!image.width || !image.height) {
          reject(new Error('That image could not be read.'));
          return;
        }
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('This browser could not prepare the logo.'));
          return;
        }
        const scale = Math.max(size / image.width, size / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
        const dataUrl = canvas.toDataURL('image/png');
        if (dataUrl.length > MAX_LOGO_DATA_URL) {
          reject(new Error('Logo is still too large after resizing. Use a simpler image.'));
          return;
        }
        resolve(dataUrl);
      };
      image.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

function controlClass(invalid, extra = '') {
  return `w-full rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 border ${invalid ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800 text-base ${extra}`;
}

function FieldError({ id, message }) {
  if (!message) return null;
  return <p id={id} className="text-sm text-red-600">{message}</p>;
}

function TextField({ id, label, value, onChange, error, type = 'text', autoComplete, inputMode, icon, required, hint }) {
  const errorId = `${id}-error`;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [error ? errorId : '', hintId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-slate-900 dark:text-slate-200 text-sm font-bold">
        {label}{required ? <span className="text-red-600"> *</span> : null}
      </label>
      <div className="relative">
        {icon ? <span aria-hidden="true" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">{icon}</span> : null}
        <input
          id={id}
          name={id}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          required={required}
          aria-required={required || undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={controlClass(Boolean(error), `h-12 ${icon ? 'pl-10 pr-4' : 'px-4'}`)}
        />
      </div>
      {hint ? <p id={hintId} className="text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function TextAreaField({ id, label, value, onChange, error, rows = 3, max, hint, autoComplete }) {
  const errorId = `${id}-error`;
  const countId = `${id}-count`;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-3 items-center">
        <label htmlFor={id} className="text-slate-900 dark:text-slate-200 text-sm font-bold">{label}</label>
        <span id={countId} className={`text-xs ${value.length > max ? 'text-red-600 font-bold' : 'text-slate-400'}`}>{value.length}/{max}</span>
      </div>
      <textarea
        id={id}
        name={id}
        rows={rows}
        autoComplete={autoComplete}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${errorId} ${countId}` : countId}
        onChange={(event) => onChange(event.target.value)}
        className={controlClass(Boolean(error), 'p-4 resize-y min-h-24')}
      />
      {hint ? <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function SelectField({ id, label, value, onChange, error, hint, children }) {
  const errorId = `${id}-error`;
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-slate-900 dark:text-slate-200 text-sm font-bold">{label}</label>
      <select
        id={id}
        name={id}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={[error ? errorId : '', hintId].filter(Boolean).join(' ') || undefined}
        onChange={(event) => onChange(event.target.value)}
        className={controlClass(Boolean(error), 'h-12 px-4')}
      >
        {children}
      </select>
      {hint ? <p id={hintId} className="text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export function SettingsPage() {
  const { hasAccess } = useAuth();
  const { status } = useLocalData();
  const settings = useLocalCollection('settings');
  const years = useLocalCollection('academicYears');
  const branding = useMemo(() => readBranding(settings.data), [settings.data]);
  const [acknowledged, setAcknowledged] = useState(null);
  const [draft, setDraft] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const savingRef = useRef(false);
  const previewRef = useRef(null);
  const closePreviewRef = useRef(null);
  const logoInputRef = useRef(null);

  const effectiveRecord = acknowledged && (!branding || String(acknowledged.updatedAt) > String(branding.updatedAt))
    ? acknowledged
    : branding;
  const remoteForm = useMemo(() => toForm(effectiveRecord), [effectiveRecord]);
  const form = draft ?? remoteForm;
  const dirty = draft ? !formsEqual(draft, remoteForm) : false;
  const yearIds = useMemo(() => new Set(years.data.map((year) => year.id)), [years.data]);
  const knownYearIds = years.isLoading || years.error ? null : yearIds;
  const zones = useMemo(() => timeZoneOptions(), []);
  const canAcademics = hasAccess(MODULES.ACADEMICS);
  const allowed = hasAccess(MODULES.SETTINGS, ACCESS_LEVELS.MANAGE);
  const showForm = allowed && (!settings.isLoading || Boolean(effectiveRecord));
  const blockingError = allowed && settings.error && !effectiveRecord && !settings.isLoading;

  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!previewOpen) return undefined;
    const previous = document.activeElement;
    closePreviewRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setPreviewOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !previewRef.current) return;
      const focusable = [...previewRef.current.querySelectorAll('button, [href], input, select, textarea')].filter(
        (node) => !node.hasAttribute('disabled')
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
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
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [previewOpen]);

  const updateField = (name, value) => {
    setDraft((current) => ({ ...(current ?? remoteForm), [name]: value }));
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const persistFields = async (keys, replaceDraft, section) => {
    if (savingRef.current) return;
    if (!settings.repository) {
      setNotice({ tone: 'error', section, text: 'Local storage is not available for this session.' });
      return;
    }
    const candidate = trimForm(form);
    const errors = validate(candidate, keys, knownYearIds);
    setFieldErrors((current) => {
      const next = { ...current };
      for (const key of keys) delete next[key];
      return { ...next, ...errors };
    });
    const invalid = Object.keys(errors);
    if (invalid.length) {
      setNotice({ tone: 'error', section, text: 'Fix the highlighted fields before saving.' });
      document.getElementById(invalid[0])?.focus();
      return;
    }
    const nextSaved = replaceDraft ? candidate : { ...remoteForm, ...pick(candidate, keys) };
    savingRef.current = true;
    setSaving(true);
    try {
      const record = effectiveRecord
        ? await settings.update(effectiveRecord.id, { key: BRANDING_KEY, ...nextSaved })
        : await settings.create({ key: BRANDING_KEY, ...nextSaved });
      setAcknowledged(record);
      setDraft((current) => {
        if (replaceDraft || !current) return null;
        const merged = { ...trimForm(current), ...pick(nextSaved, keys) };
        return formsEqual(merged, nextSaved) ? null : merged;
      });
      const where = status.online ? 'Waiting to sync.' : 'This device is offline, so sync stays pending.';
      setNotice({ tone: 'success', section, text: `${SECTION_LABELS[section]} saved on this device. ${where}` });
    } catch (error) {
      setNotice({ tone: 'error', section, text: error.message || 'The settings could not be saved on this device.' });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const saveAll = (event) => {
    event.preventDefault();
    persistFields(Object.keys(EMPTY_FORM), true, 'all');
  };

  const discard = () => {
    if (!dirty || saving) return;
    if (!window.confirm('Discard unsaved changes?')) return;
    setDraft(null);
    setFieldErrors({});
    setNotice({ tone: 'success', section: 'all', text: 'Unsaved changes were discarded.' });
  };

  const onLogo = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setLogoBusy(true);
    try {
      const dataUrl = await cropLogo(file);
      updateField('logoDataUrl', dataUrl);
      setNotice({ tone: 'success', section: 'identity', text: 'Logo preview is ready. Save school identity to keep it on this device.' });
    } catch (error) {
      setFieldErrors((current) => ({ ...current, logoDataUrl: error.message }));
      document.getElementById('logoDataUrl')?.focus();
    } finally {
      setLogoBusy(false);
    }
  };

  const currencyOptions = withCurrent(CURRENCIES.map((code) => ({ value: code, label: code })), form.currency);
  const localeOptions = withCurrent(LOCALES, form.locale);
  const dateOptions = withCurrent(DATE_FORMATS, form.dateFormat);
  const zoneOptions = form.timezone && !zones.includes(form.timezone) ? [form.timezone, ...zones] : zones;
  const actionsDisabled = !showForm || saving || logoBusy;

  const headerActions = (
    <div className="flex flex-wrap justify-end gap-2 sm:gap-3">
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        disabled={!showForm}
        aria-haspopup="dialog"
        aria-expanded={previewOpen}
        className="inline-flex items-center justify-center rounded-lg h-10 px-3 sm:px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40"
      >
        <span aria-hidden="true" className="material-symbols-outlined mr-2 text-[18px]">visibility</span>
        Preview receipt
      </button>
      <button
        type="submit"
        form="school-settings"
        disabled={actionsDisabled || !dirty}
        className="inline-flex items-center justify-center rounded-lg h-10 px-4 sm:px-6 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-40"
      >
        {saving ? 'Saving…' : 'Save settings'}
      </button>
    </div>
  );

  return (
    <Layout title="School Branding & Identity" headerActions={headerActions}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full flex flex-col gap-6 sm:gap-8">
        <div className="flex flex-col gap-2">
          <p className="text-slate-500 dark:text-slate-400 text-base">
            Manage how your school appears on documents, and the defaults stored for this tenant.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400" role="status">
            {status.online ? 'Online' : 'Offline'}
            {status.pending > 0 ? ` · ${status.pending} local change(s) pending` : ''}
            {effectiveRecord?.syncStatus === 'pending' ? ' · Branding waiting to sync' : ''}
          </p>
        </div>

        {!allowed ? (
          <p className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center" role="status">
            You do not have permission to manage school settings.
          </p>
        ) : null}

        {allowed && settings.isLoading && !effectiveRecord ? (
          <p className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center text-slate-500" role="status" aria-busy="true">
            Loading school settings from this device…
          </p>
        ) : null}

        {blockingError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/10 p-6 text-red-700 dark:text-red-300" role="alert">
            <p className="font-bold">School settings could not be read.</p>
            <p className="mt-1 text-sm">{settings.error.message}</p>
            <button type="button" onClick={() => settings.refresh()} className="mt-4 h-10 px-4 rounded-lg bg-white text-slate-900 font-bold">Try again</button>
          </div>
        ) : null}

        {showForm ? (
          <form id="school-settings" noValidate onSubmit={saveAll} aria-busy={saving} className="flex flex-col gap-6 sm:gap-8">
            {notice ? (
              <p role="status" className={`rounded-lg px-4 py-3 text-sm font-semibold ${notice.tone === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300' : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300'}`}>
                {notice.text}
              </p>
            ) : null}

            {!effectiveRecord && !dirty ? (
              <p className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 px-4 py-3 text-sm text-slate-500">
                No branding has been saved for this school yet. The form starts blank.
              </p>
            ) : null}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <section className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <span aria-hidden="true" className="material-symbols-outlined text-primary">badge</span>
                  <h3 className="text-slate-900 dark:text-white text-xl font-bold">School identity</h3>
                </div>
                <TextField id="legalName" label="School legal name" value={form.legalName} onChange={(value) => updateField('legalName', value)} error={fieldErrors.legalName} autoComplete="organization" required />
                <TextField id="registrationNumber" label="Affiliation / registration number" value={form.registrationNumber} onChange={(value) => updateField('registrationNumber', value)} error={fieldErrors.registrationNumber} />
                <div role="group" aria-labelledby="school-logo-label" aria-describedby={fieldErrors.logoDataUrl ? 'logoDataUrl-error school-logo-hint' : 'school-logo-hint'} className="flex flex-col gap-3">
                  <p id="school-logo-label" className="text-sm font-bold">School logo</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="size-24 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                      {form.logoDataUrl ? (
                        <img src={form.logoDataUrl} alt={`${form.legalName || 'School'} logo`} className="size-full object-cover" />
                      ) : (
                        <span aria-hidden="true" className="text-3xl font-bold text-slate-300">{initials(form.legalName)}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 min-w-0">
                      <p className="text-sm font-bold">Official school crest</p>
                      <p id="school-logo-hint" className="text-xs text-slate-500">PNG, JPG, or WebP. A square center crop is saved at 512×512.</p>
                      <div className="flex flex-wrap gap-3">
                        <button id="logoDataUrl" type="button" onClick={() => logoInputRef.current?.click()} disabled={logoBusy || saving} className="text-primary text-xs font-bold uppercase tracking-wider inline-flex items-center disabled:opacity-40">
                          <span aria-hidden="true" className="material-symbols-outlined text-sm mr-1">upload</span>
                          {logoBusy ? 'Preparing…' : form.logoDataUrl ? 'Change logo' : 'Upload logo'}
                        </button>
                        <button type="button" onClick={() => updateField('logoDataUrl', '')} disabled={!form.logoDataUrl || logoBusy || saving} className="text-red-500 text-xs font-bold uppercase tracking-wider inline-flex items-center disabled:opacity-40">
                          <span aria-hidden="true" className="material-symbols-outlined text-sm mr-1">delete</span>
                          Remove
                        </button>
                      </div>
                      <input ref={logoInputRef} id="school-logo-file" className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Upload school logo" onChange={onLogo} />
                    </div>
                  </div>
                  <FieldError id="logoDataUrl-error" message={fieldErrors.logoDataUrl} />
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => persistFields(SECTIONS.identity, false, 'identity')} disabled={actionsDisabled || !sectionDirty(form, remoteForm, SECTIONS.identity)} className="h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold disabled:opacity-40">Save section</button>
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <span aria-hidden="true" className="material-symbols-outlined text-primary">contact_mail</span>
                  <h3 className="text-slate-900 dark:text-white text-xl font-bold">Contact information</h3>
                </div>
                <TextAreaField id="address" label="Office address" value={form.address} onChange={(value) => updateField('address', value)} error={fieldErrors.address} rows={2} max={400} autoComplete="street-address" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <TextField id="phone" label="Primary phone" type="tel" inputMode="tel" autoComplete="tel" icon="call" value={form.phone} onChange={(value) => updateField('phone', value)} error={fieldErrors.phone} />
                  <TextField id="email" label="Official email" type="text" inputMode="email" autoComplete="email" icon="mail" value={form.email} onChange={(value) => updateField('email', value)} error={fieldErrors.email} />
                </div>
                <TextField id="website" label="Website" type="text" inputMode="url" autoComplete="url" icon="language" value={form.website} onChange={(value) => updateField('website', value)} error={fieldErrors.website} />
                <div className="flex justify-end">
                  <button type="button" onClick={() => persistFields(SECTIONS.contact, false, 'contact')} disabled={actionsDisabled || !sectionDirty(form, remoteForm, SECTIONS.contact)} className="h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold disabled:opacity-40">Save section</button>
                </div>
              </section>
            </div>

            <section className="bg-white dark:bg-slate-900 p-5 sm:p-6 md:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <span aria-hidden="true" className="material-symbols-outlined text-primary">receipt_long</span>
                <h3 className="text-slate-900 dark:text-white text-xl font-bold">Receipt customization</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <TextAreaField id="receiptHeader" label="Receipt header text" value={form.receiptHeader} onChange={(value) => updateField('receiptHeader', value)} error={fieldErrors.receiptHeader} max={100} hint="Appears below the school logo on the receipt preview." />
                <TextAreaField id="receiptFooter" label="Receipt footer text" value={form.receiptFooter} onChange={(value) => updateField('receiptFooter', value)} error={fieldErrors.receiptFooter} max={250} hint="Appears at the bottom of the receipt preview." />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => persistFields(SECTIONS.receipt, false, 'receipt')} disabled={actionsDisabled || !sectionDirty(form, remoteForm, SECTIONS.receipt)} className="h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold disabled:opacity-40">Save section</button>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 p-5 sm:p-6 md:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <span aria-hidden="true" className="material-symbols-outlined text-primary">tune</span>
                <h3 className="text-slate-900 dark:text-white text-xl font-bold">School defaults</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SelectField id="locale" label="Locale" value={form.locale} onChange={(value) => updateField('locale', value)} error={fieldErrors.locale}>
                  {localeOptions.map((option) => <option key={option.value || 'default'} value={option.value}>{option.label}</option>)}
                </SelectField>
                <SelectField id="timezone" label="Time zone" value={form.timezone} onChange={(value) => updateField('timezone', value)} error={fieldErrors.timezone}>
                  <option value="">Browser default</option>
                  {zoneOptions.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
                </SelectField>
                <SelectField id="currency" label="Currency" value={form.currency} onChange={(value) => updateField('currency', value)} error={fieldErrors.currency} hint="Dashboard totals use this code.">
                  {currencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </SelectField>
                <SelectField id="dateFormat" label="Date format" value={form.dateFormat} onChange={(value) => updateField('dateFormat', value)} error={fieldErrors.dateFormat}>
                  {dateOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </SelectField>
                <SelectField id="academicYearId" label="Default academic year" value={form.academicYearId} onChange={(value) => updateField('academicYearId', value)} error={fieldErrors.academicYearId} hint="The dashboard opens on this year until someone changes the filter.">
                  <option value="">{years.isLoading ? 'Loading academic years…' : 'No default'}</option>
                  {form.academicYearId && !years.data.some((year) => year.id === form.academicYearId) ? (
                    <option value={form.academicYearId}>Saved academic year</option>
                  ) : null}
                  {years.data.map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}
                </SelectField>
              </div>
              {years.error ? <p className="text-sm text-red-600" role="status">{years.error.message}</p> : null}
              {!years.isLoading && years.data.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No academic years are stored on this device.
                  {canAcademics ? <> <Link to="/academics" className="text-primary font-bold">Add one in Academics.</Link></> : null}
                </p>
              ) : null}
              <div className="flex justify-end">
                <button type="button" onClick={() => persistFields(SECTIONS.defaults, false, 'defaults')} disabled={actionsDisabled || !sectionDirty(form, remoteForm, SECTIONS.defaults)} className="h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold disabled:opacity-40">Save section</button>
              </div>
            </section>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <div className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span aria-hidden="true" className="material-symbols-outlined text-lg">info</span>
                <span>{persistenceMessage({ dirty, record: effectiveRecord, online: status.online })}</span>
              </div>
              <div className="flex w-full sm:w-auto gap-3">
                <button type="button" onClick={discard} disabled={!dirty || saving || logoBusy} className="flex-1 sm:flex-none min-h-11 px-6 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold disabled:opacity-40">Discard</button>
                <button type="submit" disabled={actionsDisabled || !dirty} className="flex-1 sm:flex-none min-h-11 px-6 sm:px-10 rounded-lg bg-primary text-white text-sm font-bold shadow-lg shadow-primary/30 disabled:opacity-40">
                  {saving ? 'Saving…' : 'Save all settings'}
                </button>
              </div>
            </div>
          </form>
        ) : null}
      </div>

      {previewOpen ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/50" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreviewOpen(false); }}>
          <div ref={previewRef} role="dialog" aria-modal="true" aria-labelledby="receipt-preview-title" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="receipt-preview-title" className="text-xl font-bold">Receipt preview</h3>
                <p className="text-sm text-slate-500 mt-1">This uses the form as it is now, including unsaved edits. It is not a posted payment.</p>
              </div>
              <button ref={closePreviewRef} type="button" onClick={() => setPreviewOpen(false)} className="size-10 rounded-lg border border-slate-200 dark:border-slate-700 font-bold">Close</button>
            </div>
            <article className="mt-5 rounded-xl border border-slate-200 dark:border-slate-700 p-5 bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                  {form.logoDataUrl ? <img src={form.logoDataUrl} alt="" className="size-full object-cover" /> : <span aria-hidden="true" className="font-bold text-slate-400">{initials(form.legalName)}</span>}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-lg break-words">{form.legalName.trim() || 'School name'}</p>
                  {form.registrationNumber.trim() ? <p className="text-xs text-slate-500 break-words">{form.registrationNumber}</p> : null}
                </div>
              </div>
              {form.receiptHeader.trim() ? <p className="mt-4 text-sm whitespace-pre-wrap">{form.receiptHeader}</p> : null}
              <dl className="mt-4 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {form.address.trim() ? <div className="whitespace-pre-wrap">{form.address}</div> : null}
                {form.phone.trim() ? <div>{form.phone}</div> : null}
                {form.email.trim() ? <div className="break-all">{form.email}</div> : null}
                {form.website.trim() ? <div className="break-all">{form.website}</div> : null}
              </dl>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-700 pt-3 text-sm">
                <span>Sample tuition</span>
                <span className="font-bold">{formatMoney(150, form.currency)}</span>
              </div>
              <p className="mt-3 text-xs text-slate-500">Sample date {formatSchoolDate(localDay(), form.dateFormat)} · {form.locale || 'Browser locale'} · {form.timezone || 'Browser time zone'}</p>
              {form.receiptFooter.trim() ? <p className="mt-4 text-xs whitespace-pre-wrap text-slate-600 dark:text-slate-300">{form.receiptFooter}</p> : null}
            </article>
          </div>
        </div>
      ) : null}
    </Layout>
  );
}
