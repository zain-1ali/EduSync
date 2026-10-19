import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../api/hooks/useAuth';

const inputClass =
  'form-input w-full rounded-lg text-[#0d131b] dark:text-slate-100 border border-[#cfd9e7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-12 px-4 text-base transition-all placeholder:text-[#4c6c9a] dark:placeholder:text-slate-500';

const primaryButtonClass =
  'w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-lg transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900';

function apiErrorMessage(error, fallback) {
  const message = error?.response?.data?.error?.message;
  return typeof message === 'string' && message.trim() ? message : fallback;
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

export function ForgotPasswordPage() {
  const emailId = useId();
  const errorId = useId();
  const successHeadingId = useId();
  const emailRef = useRef(null);
  const errorRef = useRef(null);
  const successHeadingRef = useRef(null);
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutate: requestReset, isPending } = useForgotPassword();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${isSuccess ? 'Check your email' : 'Forgot password'} · EduSync`;
    return () => {
      document.title = previousTitle;
    };
  }, [isSuccess]);

  useEffect(() => {
    if (isSuccess) {
      successHeadingRef.current?.focus();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (errorMessage) {
      errorRef.current?.focus();
    }
  }, [errorMessage]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isPending) return;

    const trimmedEmail = email.trim();
    setEmail(trimmedEmail);
    setErrorMessage('');

    if (!trimmedEmail) {
      setErrorMessage('Enter the email address for your account.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage('Enter a valid email address.');
      return;
    }

    requestReset(
      { email: trimmedEmail },
      {
        onSuccess: () => {
          setSubmittedEmail(trimmedEmail);
          setIsSuccess(true);
        },
        onError: (error) => {
          setErrorMessage(
            apiErrorMessage(error, 'We could not send reset instructions. Please try again.')
          );
        },
      }
    );
  };

  const editEmail = () => {
    setIsSuccess(false);
    setErrorMessage('');
    requestAnimationFrame(() => emailRef.current?.focus());
  };

  if (isSuccess) {
    return (
      <AuthChrome>
        <section
          aria-labelledby={successHeadingId}
          className="bg-white dark:bg-slate-900 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-[#e7ecf3] dark:border-slate-800 p-6 sm:p-8 text-center"
        >
          <div className="size-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">
              mark_email_read
            </span>
          </div>
          <h1
            id={successHeadingId}
            ref={successHeadingRef}
            tabIndex={-1}
            className="text-[#0d131b] dark:text-white text-3xl font-bold tracking-tight mb-3 focus:outline-none"
          >
            Check your email
          </h1>
          <p className="text-[#4c6c9a] dark:text-slate-400 text-base">
            If an account exists for{' '}
            <span className="break-all font-medium text-[#0d131b] dark:text-slate-100">{submittedEmail}</span>
            , password reset instructions are on the way. The message may take a few minutes to arrive.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link to="/login" className={primaryButtonClass}>
              Back to login
            </Link>
            <button
              type="button"
              onClick={editEmail}
              className="w-full h-12 rounded-lg border border-[#cfd9e7] dark:border-slate-700 text-sm font-bold text-[#0d131b] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              Use a different email
            </button>
          </div>
        </section>
      </AuthChrome>
    );
  }

  return (
    <AuthChrome>
      <div className="text-center">
        <h1 className="text-[#0d131b] dark:text-white text-3xl font-bold tracking-tight mb-2">
          Forgot password
        </h1>
        <p className="text-[#4c6c9a] dark:text-slate-400 text-base">
          Enter your account email. If it matches an active account, we will send reset instructions.
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

          <label className="flex flex-col w-full" htmlFor={emailId}>
            <span className="text-[#0d131b] dark:text-slate-200 text-sm font-medium pb-2">Email</span>
            <input
              ref={emailRef}
              id={emailId}
              name="email"
              className={inputClass}
              placeholder="e.g. admin@school.edu"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={254}
              required
              aria-invalid={errorMessage ? true : undefined}
              aria-describedby={errorMessage ? errorId : undefined}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errorMessage) setErrorMessage('');
              }}
            />
          </label>

          <button type="submit" disabled={isPending} aria-busy={isPending} className={primaryButtonClass}>
            {isPending ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]" aria-hidden="true">
                  sync
                </span>
                <span>Sending instructions...</span>
              </>
            ) : (
              <>
                <span>Send reset instructions</span>
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  mail
                </span>
              </>
            )}
          </button>
        </div>
      </form>

      <p className="text-center text-sm text-[#4c6c9a] dark:text-slate-400">
        <Link
          to="/login"
          className="text-primary font-medium hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Back to login
        </Link>
      </p>
    </AuthChrome>
  );
}
