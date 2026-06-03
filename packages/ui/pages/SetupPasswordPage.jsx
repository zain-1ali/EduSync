import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSetupPassword } from '../api/hooks/useAuth';

export function SetupPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: setupPassword, isPending } = useSetupPassword();

  // If there's no token in the URL at all, show an error immediately
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 font-display">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="size-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Invalid Link</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            This setup link is invalid or missing. Please check your email and try clicking the link again.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (passwords.password !== passwords.confirm) {
      return setErrorMsg('Passwords do not match.');
    }
    if (passwords.password.length < 8) {
      return setErrorMsg('Password must be at least 8 characters long.');
    }

    setupPassword(
      { token, newPassword: passwords.password },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
        onError: (error) => {
          setErrorMsg(error.response?.data?.message || 'Failed to setup password. The link may have expired.');
        }
      }
    );
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 font-display">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center animate-in zoom-in duration-500">
          <div className="size-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">You're All Set!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Your password has been successfully saved. You can now log in to your EduSync administrator dashboard.
          </p>
          <Link to="/login" className="flex items-center justify-center w-full h-12 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary/90 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-display">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="flex items-center justify-center gap-3 text-primary mb-6">
          <svg fill="none" height="36" viewBox="0 0 48 48" width="36" xmlns="http://www.w3.org/2000/svg">
            <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
          </svg>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">EduSync</span>
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Set Your Password</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Welcome! Let's secure your new administrator account.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl shadow-slate-200/50 dark:shadow-none sm:rounded-2xl sm:px-10 border border-slate-200 dark:border-slate-700">
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {errorMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
              <input 
                type="password" 
                required 
                value={passwords.password}
                onChange={(e) => setPasswords({...passwords, password: e.target.value})}
                className="w-full h-12 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
              <input 
                type="password" 
                required 
                value={passwords.confirm}
                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                className="w-full h-12 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 px-8 h-12 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isPending ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                  Saving...
                </>
              ) : (
                <>
                  Set Password & Continue
                  <span className="material-symbols-outlined text-[20px]">check</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}