import { useEffect, useId, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useResetPassword } from '../api/hooks/useAuth';

const inputClass =
  'form-input w-full rounded-lg text-[#0d131b] dark:text-slate-100 border border-[#cfd9e7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-12 px-4 pr-12 text-base transition-all placeholder:text-[#4c6c9a] dark:placeholder:text-slate-500';

const primaryButtonClass =
  'w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-lg transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900';

const secondaryButtonClass =
  'w-full h-12 rounded-lg border border-[#cfd9e7] dark:border-slate-700 text-sm font-bold text-[#0d131b] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 inline-flex items-center justify-center';

function apiErrorMessage(error, fallback) {
  const message = error?.response?.data?.error?.message;
  return typeof message === 'string' && message.trim() ? message : fallback;
}

function passwordIssue(password) {
  if (password.length < 12) return 'Password must contain at least 12 characters.';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter.';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain a number.';
  return '';
}

function AuthChrome({ children }) {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display transition-colors duration-200">
      <header className="w-full px-4 sm:px-6 py-4 flex items-center border-b border-[#e7ecf3] dark:border-slate-800 bg-white dark:bg-background-dark">
        <Link
          to="/login"
          className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="text-primary" aria-hidden="true">
            <svg fill="none" height="32" viewBox="0 0 48 48" width="32" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
            </svg>
          </span>
          <span className="text-[#0d131b] dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">
            EduSync
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[440px] flex flex-col gap-8">{children}</div>
      </main>

      <footer className="w-full p-6 text-center text-[#4c6c9a] dark:text-slate-500 text-xs">
        <p>© 2026 EduSync School Management. All rights reserved.</p>
      </footer>
    </div>
  );
}

function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  shown,
  onToggle,
  autoComplete,
  describedBy,
  invalid,
  toggleLabel,
}) {
  return (
    <div className="flex flex-col w-full">
      <label htmlFor={id} className="text-[#0d131b] dark:text-slate-200 text-sm font-medium pb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          className={inputClass}
          placeholder="Enter a password"
          type={shown ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          maxLength={128}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={shown}
          aria-label={toggleLabel}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4c6c9a] dark:text-slate-400 hover:text-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            {shown ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = (searchParams.get('token') || '').trim();
  const passwordId = useId();
  const confirmId = useId();
  const errorId = useId();
  const requirementsId = useId();
  const missingHeadingId = useId();
  const successHeadingId = useId();
  const errorRef = useRef(null);
  const missingHeadingRef = useRef(null);
  const successHeadingRef = useRef(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [invalidField, setInvalidField] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutate: resetPassword, isPending } = useResetPassword();

  const view = !token ? 'missing' : isSuccess ? 'success' : 'form';

  useEffect(() => {
    const titles = {
      missing: 'Invalid reset link',
      success: 'Password updated',
      form: 'Reset password',
    };
    const previousTitle = document.title;
    document.title = `${titles[view]} · EduSync`;
    return () => {
      document.title = previousTitle;
    };
  }, [view]);

  useEffect(() => {
    if (view === 'missing') missingHeadingRef.current?.focus();
    if (view === 'success') successHeadingRef.current?.focus();
  }, [view]);

  useEffect(() => {
    if (errorMessage) errorRef.current?.focus();
  }, [errorMessage]);

  const requirements = [
    { id: 'length', label: 'At least 12 characters', met: password.length >= 12 },
    { id: 'lower', label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { id: 'upper', label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { id: 'number', label: 'One number', met: /[0-9]/.test(password) },
  ];

  const clearError = () => {
    if (errorMessage) {
      setErrorMessage('');
      setInvalidField('');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isPending || !token) return;

    setErrorMessage('');
    setInvalidField('');

    const issue = passwordIssue(password);
    if (issue) {
      setErrorMessage(issue);
      setInvalidField('password');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setInvalidField('confirm');
      return;
    }

    resetPassword(
      { token, newPassword: password },
      {
        onSuccess: () => setIsSuccess(true),
        onError: (error) => {
          setErrorMessage(
            apiErrorMessage(
              error,
              'We could not reset your password. The link may be invalid or expired.'
            )
          );
        },
      }
    );
  };

  if (!token) {
    return (
      <AuthChrome>
        <section
          aria-labelledby={missingHeadingId}
          className="bg-white dark:bg-slate-900 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-[#e7ecf3] dark:border-slate-800 p-6 sm:p-8 text-center"
        >
          <div className="size-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">
              link_off
            </span>
          </div>
          <h1
            id={missingHeadingId}
            ref={missingHeadingRef}
            tabIndex={-1}
            className="text-[#0d131b] dark:text-white text-3xl font-bold tracking-tight mb-3 focus:outline-none"
          >
            Reset link is incomplete
          </h1>
          <p className="text-[#4c6c9a] dark:text-slate-400 text-base">
            This page needs the token from your password reset email. Open the full link, or request a new one.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link to="/forgot-password" className={primaryButtonClass}>
              Request a new link
            </Link>
            <Link to="/login" className={secondaryButtonClass}>
              Back to login
            </Link>
          </div>
        </section>
      </AuthChrome>
    );
  }

  if (isSuccess) {
    return (
      <AuthChrome>
        <section
          aria-labelledby={successHeadingId}
          className="bg-white dark:bg-slate-900 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-[#e7ecf3] dark:border-slate-800 p-6 sm:p-8 text-center"
        >
          <div className="size-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">
              check_circle
            </span>
          </div>
          <h1
            id={successHeadingId}
            ref={successHeadingRef}
            tabIndex={-1}
            className="text-[#0d131b] dark:text-white text-3xl font-bold tracking-tight mb-3 focus:outline-none"
          >
            Password updated
          </h1>
          <p className="text-[#4c6c9a] dark:text-slate-400 text-base">
            Your password has been saved. Sign in with the new password.
          </p>
          <div className="mt-8">
            <Link to="/login" className={primaryButtonClass}>
              Go to login
            </Link>
          </div>
        </section>
      </AuthChrome>
    );
  }

  const passwordDescribedBy = [requirementsId, errorMessage ? errorId : null].filter(Boolean).join(' ');

  return (
    <AuthChrome>
      <div className="text-center">
        <h1 className="text-[#0d131b] dark:text-white text-3xl font-bold tracking-tight mb-2">
          Choose a new password
        </h1>
        <p className="text-[#4c6c9a] dark:text-slate-400 text-base">
          Use at least 12 characters, with uppercase and lowercase letters and a number.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white dark:bg-slate-900 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-[#e7ecf3] dark:border-slate-800 p-6 sm:p-8"
      >
        <div className="flex flex-col gap-6">
          {errorMessage && (
            <div
              ref={errorRef}
              id={errorId}
              role="alert"
              tabIndex={-1}
              className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold flex items-start gap-2 focus:outline-none"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                error
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <PasswordField
              id={passwordId}
              name="newPassword"
              label="New password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                clearError();
              }}
              shown={showPassword}
              onToggle={() => setShowPassword((current) => !current)}
              autoComplete="new-password"
              describedBy={passwordDescribedBy}
              invalid={invalidField === 'password'}
              toggleLabel={showPassword ? 'Hide new password' : 'Show new password'}
            />

            <ul id={requirementsId} aria-label="Password requirements" className="space-y-1 text-xs text-[#4c6c9a] dark:text-slate-400">
              {requirements.map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-[16px] ${item.met ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
                    aria-hidden="true"
                  >
                    {item.met ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className={item.met ? 'text-emerald-700 dark:text-emerald-300' : undefined}>
                    {item.label}
                    <span className="sr-only">{item.met ? ' (met)' : ' (not met)'}</span>
                  </span>
                </li>
              ))}
            </ul>

            <PasswordField
              id={confirmId}
              name="confirmPassword"
              label="Confirm new password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                clearError();
              }}
              shown={showConfirm}
              onToggle={() => setShowConfirm((current) => !current)}
              autoComplete="new-password"
              describedBy={invalidField === 'confirm' && errorMessage ? errorId : undefined}
              invalid={invalidField === 'confirm'}
              toggleLabel={showConfirm ? 'Hide password confirmation' : 'Show password confirmation'}
            />
          </div>

          <button type="submit" disabled={isPending} aria-busy={isPending} className={primaryButtonClass}>
            {isPending ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]" aria-hidden="true">
                  sync
                </span>
                <span>Updating password...</span>
              </>
            ) : (
              <>
                <span>Update password</span>
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  check
                </span>
              </>
            )}
          </button>
        </div>
      </form>

      <p className="text-center text-sm text-[#4c6c9a] dark:text-slate-400">
        <Link
          to="/forgot-password"
          className="text-primary font-medium hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Request a new reset link
        </Link>
      </p>
    </AuthChrome>
  );
}
