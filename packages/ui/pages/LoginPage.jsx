import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };
const navigate = useNavigate();
  const handleLogin = (e) => {
    e.preventDefault(); // Stop the form from refreshing the page
    // Later, you will check passwords here. For now, just go to the dashboard!
    navigate('/dashboard'); 
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display transition-colors duration-200">
      
      {/* Top Navigation */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-[#e7ecf3] dark:border-slate-800 bg-white dark:bg-background-dark">
        <div className="flex items-center gap-3">
          <div className="text-primary">
            <svg fill="none" height="32" viewBox="0 0 48 48" width="32" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-[#0d131b] dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">EduSync</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:flex items-center gap-2 text-sm text-[#4c6c9a] dark:text-slate-400">
            <span className="material-symbols-outlined text-[18px]">cloud_off</span>
            Offline Mode Ready
          </span>
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-[#e7ecf3] dark:bg-slate-800 text-[#0d131b] dark:text-slate-200">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[440px] flex flex-col gap-8">
          
          {/* Headline Section */}
          <div className="text-center">
            <h1 className="text-[#0d131b] dark:text-white text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
            <p className="text-[#4c6c9a] dark:text-slate-400 text-base">Access your school records and fee management</p>
          </div>

          {/* Login Card */}
          <form onSubmit={handleLogin} className="bg-white dark:bg-slate-900 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-[#e7ecf3] dark:border-slate-800 p-8">
            <div className="flex flex-col gap-6">
              
              {/* Form Fields */}
              <div className="flex flex-col gap-4">
                <label className="flex flex-col w-full">
                  <span className="text-[#0d131b] dark:text-slate-200 text-sm font-medium pb-2">Username or Email</span>
                  <input 
                    className="form-input w-full rounded-lg text-[#0d131b] dark:text-slate-100 border border-[#cfd9e7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-12 px-4 text-base transition-all placeholder:text-[#4c6c9a] dark:placeholder:text-slate-500" 
                    placeholder="e.g. admin@school.edu" 
                    type="text"
                  />
                </label>
                
                <label className="flex flex-col w-full">
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-[#0d131b] dark:text-slate-200 text-sm font-medium">Password</span>
                    <a className="text-primary text-xs font-medium hover:underline" href="#">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <input 
                      className="form-input w-full rounded-lg text-[#0d131b] dark:text-slate-100 border border-[#cfd9e7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-12 px-4 text-base transition-all placeholder:text-[#4c6c9a] dark:placeholder:text-slate-500" 
                      placeholder="Enter your password" 
                      type={showPassword ? "text" : "password"}
                    />
                    <button 
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4c6c9a] dark:text-slate-400 hover:text-primary"
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </label>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input 
                  className="w-4 h-4 text-primary border-slate-300 dark:border-slate-700 rounded focus:ring-primary dark:bg-slate-800" 
                  id="remember" 
                  type="checkbox"
                />
                <label className="text-sm text-[#4c6c9a] dark:text-slate-400 cursor-pointer select-none" htmlFor="remember">
                  Remember this device for 30 days
                </label>
              </div>

              {/* Login Button */}
              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-lg transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                <span>Login to Dashboard</span>
                <span className="material-symbols-outlined text-[20px]">login</span>
              </button>
            </div>
          </form>

          {/* Offline & Security Reassurance */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#e8f2fe] dark:bg-primary/10 rounded-full border border-primary/20">
              <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Local Sync Active</span>
            </div>
            <p className="text-[#4c6c9a] dark:text-slate-400 text-sm max-w-[320px]">
              All data is encrypted and saved locally. You can keep working even if the internet connection is lost.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full p-6 text-center text-[#4c6c9a] dark:text-slate-500 text-xs">
        <p>© 2026 EduSync School Management. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
          <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-primary transition-colors" href="#">Support</a>
        </div>
      </footer>
    </div>
  );
}