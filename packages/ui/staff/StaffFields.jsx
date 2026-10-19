import { useState } from 'react';
import {
  CONTRACT_TYPES,
  STAFF_ROLE_OPTIONS,
  photoFileError,
  staffDisplayName,
} from './staffModel';

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white';

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm font-semibold text-red-600">
      {message}
    </p>
  );
}

function TextInput({ id, label, value, onChange, error, type = 'text', required = false, autoComplete }) {
  return (
    <label className="block space-y-1.5" htmlFor={id}>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
      <FieldError id={`${id}-error`} message={error} />
    </label>
  );
}

async function readPhoto(file) {
  const problem = photoFileError(file);
  if (problem) throw new Error(problem);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('The photo could not be read.'));
    reader.readAsDataURL(file);
  });
}

export function StaffFields({ form, onChange, errors, idPrefix = 'staff' }) {
  const [photoError, setPhotoError] = useState('');
  const photoName = staffDisplayName(form);

  const set = (name) => (value) => onChange(name, value);

  const onPhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      onChange('photoDataUrl', await readPhoto(file));
      setPhotoError('');
    } catch (error) {
      setPhotoError(error.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {form.photoDataUrl ? (
          <img src={form.photoDataUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-slate-400 dark:border-slate-700">
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">
              person
            </span>
          </div>
        )}
        <div className="space-y-2">
          <label className="block text-sm font-semibold" htmlFor={`${idPrefix}-photo`}>
            Photo
          </label>
          <input
            id={`${idPrefix}-photo`}
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={onPhoto}
            aria-describedby={photoError ? `${idPrefix}-photo-error` : `${idPrefix}-photo-hint`}
            className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:font-bold file:text-primary"
          />
          <p id={`${idPrefix}-photo-hint`} className="text-xs text-slate-500">
            JPG, PNG, or GIF. Maximum 2MB. {photoName}
          </p>
          {photoError && (
            <p id={`${idPrefix}-photo-error`} role="alert" className="text-sm font-semibold text-red-600">
              {photoError}
            </p>
          )}
          {form.photoDataUrl && (
            <button type="button" onClick={() => onChange('photoDataUrl', '')} className="text-sm font-bold text-slate-600 underline">
              Remove photo
            </button>
          )}
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="border-b border-slate-200 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:border-slate-800">
          Personal details
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput id={`${idPrefix}-firstName`} label="First name" required value={form.firstName} error={errors.firstName} onChange={set('firstName')} autoComplete="given-name" />
          <TextInput id={`${idPrefix}-lastName`} label="Last name" required value={form.lastName} error={errors.lastName} onChange={set('lastName')} autoComplete="family-name" />
          <TextInput id={`${idPrefix}-employeeId`} label="Employee ID" required value={form.employeeId} error={errors.employeeId} onChange={set('employeeId')} autoComplete="off" />
          <TextInput id={`${idPrefix}-dob`} label="Date of birth" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
        </div>
        <TextInput id={`${idPrefix}-address`} label="Address" value={form.address} onChange={set('address')} autoComplete="street-address" />
      </section>

      <section className="space-y-4">
        <h3 className="border-b border-slate-200 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:border-slate-800">
          Contact
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput id={`${idPrefix}-email`} label="Email" type="email" required value={form.email} error={errors.email} onChange={set('email')} autoComplete="email" />
          <TextInput id={`${idPrefix}-phone`} label="Phone" type="tel" required value={form.phone} error={errors.phone} onChange={set('phone')} autoComplete="tel" />
          <TextInput id={`${idPrefix}-emergency-name`} label="Emergency contact name" value={form.emergencyContactName} onChange={set('emergencyContactName')} />
          <TextInput id={`${idPrefix}-emergency-relationship`} label="Emergency contact relationship" value={form.emergencyContactRelationship} onChange={set('emergencyContactRelationship')} />
          <TextInput id={`${idPrefix}-emergency-phone`} label="Emergency contact phone" type="tel" value={form.emergencyContactPhone} onChange={set('emergencyContactPhone')} />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="border-b border-slate-200 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:border-slate-800">
          Employment
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5" htmlFor={`${idPrefix}-role`}>
            <span className="text-sm font-semibold">HR role <span className="text-red-600">*</span></span>
            <select
              id={`${idPrefix}-role`}
              required
              value={form.role}
              aria-invalid={Boolean(errors.role)}
              aria-describedby={errors.role ? `${idPrefix}-role-error` : `${idPrefix}-role-hint`}
              onChange={(event) => onChange('role', event.target.value)}
              className={inputClass}
            >
              <option value="">Select an HR role</option>
              {STAFF_ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p id={`${idPrefix}-role-hint`} className="text-xs text-slate-500">
              This job role is separate from login permissions.
            </p>
            <FieldError id={`${idPrefix}-role-error`} message={errors.role} />
          </label>
          <label className="block space-y-1.5" htmlFor={`${idPrefix}-contract`}>
            <span className="text-sm font-semibold">Contract type</span>
            <select id={`${idPrefix}-contract`} value={form.contractType} onChange={(event) => onChange('contractType', event.target.value)} className={inputClass}>
              <option value="">Not specified</option>
              {CONTRACT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <TextInput id={`${idPrefix}-joined`} label="Joined on" type="date" value={form.joinedOn} onChange={set('joinedOn')} />
          <TextInput id={`${idPrefix}-campus`} label="Campus" value={form.campus} onChange={set('campus')} />
          <TextInput id={`${idPrefix}-education`} label="Highest education" value={form.highestEducation} onChange={set('highestEducation')} />
        </div>
        <label className="block space-y-1.5" htmlFor={`${idPrefix}-specialization`}>
          <span className="text-sm font-semibold">Specialization</span>
          <textarea
            id={`${idPrefix}-specialization`}
            value={form.specialization}
            onChange={(event) => onChange('specialization', event.target.value)}
            rows={3}
            className={inputClass}
          />
        </label>
      </section>
    </div>
  );
}
