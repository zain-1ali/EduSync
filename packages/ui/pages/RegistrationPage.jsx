import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegisterSchool } from '../api/hooks/useSchools'; // Adjust path if necessary
import { getApiError } from '../api/getApiError';

export function RegistrationPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // React Query handles the loading state (isPending) and API execution
  const { mutate: registerSchool, isPending } = useRegisterSchool();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Automatically grab all inputs that have a "name" attribute
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Trigger the API call
    registerSchool(data, {
      onSuccess: () => {
        setIsSubmitted(true);
      },
      onError: (error) => {
        // Display the error message sent from the Express backend
        setErrorMessage(getApiError(error));
      }
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 font-display">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center animate-in zoom-in duration-500">
          <div className="size-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Application Received!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Thank you for choosing EduSync. Our team is reviewing your application. You will receive an email with your admin credentials and trial access shortly.
          </p>
          <Link to="/login" className="flex items-center justify-center w-full h-12 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary/90 transition-colors">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-display bg-white dark:bg-slate-900">
      
      {/* LEFT SIDE: Branding & Value Proposition (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col w-[40%] bg-primary text-white p-12 relative overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-16">
            <svg fill="none" height="36" viewBox="0 0 48 48" width="36" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
            </svg>
            <span className="text-2xl font-bold tracking-tight">EduSync Platform</span>
          </div>

          <div className="mt-auto mb-auto max-w-md">
            <h1 className="text-4xl font-black tracking-tight leading-tight mb-6">
              Modernize your school management today.
            </h1>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <span className="material-symbols-outlined text-blue-200 mt-0.5">cloud_done</span>
                <div>
                  <h3 className="font-bold text-lg">Offline-First Technology</h3>
                  <p className="text-blue-100 text-sm opacity-90 mt-1">Keep managing fees and attendance even when the internet drops. Syncs automatically.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="material-symbols-outlined text-blue-200 mt-0.5">security</span>
                <div>
                  <h3 className="font-bold text-lg">Enterprise Security</h3>
                  <p className="text-blue-100 text-sm opacity-90 mt-1">Your data is isolated in secure, tenant-specific databases.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="material-symbols-outlined text-blue-200 mt-0.5">support_agent</span>
                <div>
                  <h3 className="font-bold text-lg">Priority Support</h3>
                  <p className="text-blue-100 text-sm opacity-90 mt-1">Dedicated onboarding and 24/7 technical assistance for your staff.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-auto border-t border-white/20 pt-6">
            <p className="text-blue-200 text-sm">© 2026 EduSync Systems. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: The Registration Form */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1 max-w-[800px] w-full mx-auto p-8 lg:p-12">
          
          {/* Mobile Header (Only visible on small screens) */}
          <div className="flex lg:hidden items-center gap-3 mb-8 text-primary">
            <svg fill="none" height="32" viewBox="0 0 48 48" width="32" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
            </svg>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">EduSync</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Register Your Institution</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Start your 14-day free trial. No credit card required.</p>
          </div>

          {/* API Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-10">
            
            {/* Section 1: Institution Details */}
            <section className="flex flex-col gap-5">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">Institution Details</h3>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">School/Academy/College Name <span className="text-red-500">*</span></label>
                <input name="schoolName" required className="w-full h-12 px-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white" placeholder="e.g. St. Mary's High School" type="text" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Street Address <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input name="address" className="w-full h-12 px-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white" placeholder="Building, Street, Area" type="text" />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">City <span className="text-red-500">*</span></label>
                  <input name="city" required className="w-full h-12 px-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white" placeholder="e.g. Lahore" type="text" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Estimated No. of Students <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select name="estimatedStudents" required defaultValue="" className="w-full h-12 pl-4 pr-10 appearance-none rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white">
                      <option value="" disabled>Select range</option>
                      <option value="1-100">1 - 100</option>
                      <option value="101-500">101 - 500</option>
                      <option value="501-1000">501 - 1,000</option>
                      <option value="1000+">1,000+</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Website URL <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input name="websiteUrl" className="w-full h-12 px-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white" placeholder="https://www.yourschool.edu" type="url" />
              </div>
            </section>

            {/* Section 2: Applicant Details */}
            <section className="flex flex-col gap-5">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">Your Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name <span className="text-red-500">*</span></label>
                  <input name="applicantName" required className="w-full h-12 px-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white" placeholder="John Doe" type="text" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Designation <span className="text-red-500">*</span></label>
                  <input name="applicantDesignation" required className="w-full h-12 px-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white" placeholder="e.g. Principal, Director, IT Head" type="text" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Official Email <span className="text-red-500">*</span></label>
                  <input name="applicantEmail" required className="w-full h-12 px-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white" placeholder="admin@yourschool.com" type="email" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mobile Number <span className="text-red-500">*</span></label>
                  <input name="applicantMobile" required className="w-full h-12 px-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white" placeholder="+1 (555) 000-0000" type="tel" />
                </div>
              </div>
            </section>

            {/* Section 3: Additional Information */}
            <section className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">More about your Institute <span className="text-slate-400 font-normal">(Optional)</span></label>
              <textarea name="additionalInfo" className="w-full p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white resize-none" placeholder="Tell us about your specific requirements, current software (if any), or any questions you have." rows="4"></textarea>
            </section>

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 text-center sm:text-left max-w-xs">
                By submitting this form, you agree to our <Link to="/legal/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
              
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                    Processing...
                  </>
                ) : (
                  <>
                    Submit Application
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log in here</Link>
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}