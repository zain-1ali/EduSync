export function Stepper({ currentStep }) {
  const steps = [
    { num: 1, title: "Personal Details", icon: "person" },
    { num: 2, title: "Academic Info", icon: "school" },
    { num: 3, title: "Parent Details", icon: "family_restroom" }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start justify-between w-full">
      {steps.map((step, index) => {
        const isActive = currentStep === step.num;
        const isPast = currentStep > step.num;

        return (
          <div key={step.num} className="flex flex-1 items-center">
            {/* The Step Icon & Text */}
            <div className={`flex items-center gap-4 ${!isActive && !isPast ? 'opacity-50' : ''}`}>
              <div className="flex flex-col items-center">
                <div className={`size-10 rounded-full flex items-center justify-center ${isActive || isPast ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                  <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <p className={`font-bold text-sm uppercase tracking-wide ${isActive || isPast ? 'text-primary' : 'text-slate-500'}`}>Step {step.num}</p>
                <p className={`font-medium ${isActive || isPast ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{step.title}</p>
              </div>
            </div>

            {/* The Connecting Line (Don't render after the last step) */}
            {index < steps.length - 1 && (
              <div className="flex items-center justify-center flex-1 self-center px-2 sm:px-4">
                <div className={`h-[2px] w-full ${isPast ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}